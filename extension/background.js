// Background script for Skillvento extension
class SkillventoBackground {
  constructor() {
    this.init();
  }

  init() {
    // Handle extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        this.handleFirstInstall();
      } else if (details.reason === 'update') {
        this.handleUpdate(details.previousVersion);
      }
    });

    // Handle messages from content scripts and popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Handle tab updates to detect certificate pages
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.checkForCertificatePage(tab);
      }
    });

    // Set up context menus
    this.setupContextMenus();
  }

  handleFirstInstall() {
    // Open welcome page
    chrome.tabs.create({
      url: 'https://skillvento.com/extension/welcome'
    });

    // Set default settings
    chrome.storage.local.set({
      skillvento_settings: {
        autoScan: true,
        showNotifications: true,
        highlightCertificates: true,
        scanSensitivity: 'medium'
      }
    });
  }

  handleUpdate(previousVersion) {
    // Handle extension updates
    console.log(`Updated from version ${previousVersion}`);
    
    // Show update notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Skillvento Extension Updated',
      message: 'New features and improvements are now available!'
    });
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'scanCurrentPage':
          await this.scanCurrentPage(sender.tab.id);
          sendResponse({ success: true });
          break;

        case 'uploadCertificate':
          const result = await this.uploadCertificate(request.certificate);
          sendResponse(result);
          break;

        case 'checkAuthStatus':
          const authStatus = await this.checkAuthStatus();
          sendResponse(authStatus);
          break;

        case 'certificateManuallySelected':
          await this.handleManualSelection(request.certificate);
          sendResponse({ success: true });
          break;

        case 'getSettings':
          const settings = await this.getSettings();
          sendResponse(settings);
          break;

        case 'updateSettings':
          await this.updateSettings(request.settings);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ error: error.message });
    }
  }

  async scanCurrentPage(tabId) {
    try {
      // Inject content script if not already present
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });

      // Send scan message to content script
      const response = await chrome.tabs.sendMessage(tabId, {
        action: 'scanCertificates'
      });

      return response;
    } catch (error) {
      console.error('Failed to scan page:', error);
      throw error;
    }
  }

  async uploadCertificate(certificate) {
    try {
      // Get auth token
      const authData = await chrome.storage.local.get(['skillvento_token', 'skillvento_user']);
      
      if (!authData.skillvento_token || !authData.skillvento_user) {
        throw new Error('User not authenticated');
      }

      // Download certificate file
      const fileBlob = await this.downloadFile(certificate.url);
      
      // Upload to Skillvento backend
      const uploadResult = await this.uploadToSkillvento(fileBlob, certificate, authData.skillvento_token);
      
      return { success: true, result: uploadResult };
    } catch (error) {
      console.error('Upload failed:', error);
      return { success: false, error: error.message };
    }
  }

  async downloadFile(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('File download failed:', error);
      throw error;
    }
  }

  async uploadToSkillvento(fileBlob, certificate, token) {
    // This would integrate with your actual Skillvento API
    const formData = new FormData();
    formData.append('file', fileBlob, `certificate.${certificate.type === 'pdf' ? 'pdf' : 'jpg'}`);
    formData.append('title', certificate.title);
    formData.append('source', certificate.source);
    formData.append('confidence', certificate.confidence);

    const response = await fetch('https://skillvento.com/api/certificates/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async checkAuthStatus() {
    try {
      const authData = await chrome.storage.local.get(['skillvento_token', 'skillvento_user']);
      
      if (authData.skillvento_token && authData.skillvento_user) {
        // Verify token is still valid
        const response = await fetch('https://skillvento.com/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${authData.skillvento_token}`
          }
        });

        if (response.ok) {
          return {
            isAuthenticated: true,
            user: authData.skillvento_user
          };
        } else {
          // Token expired, clear storage
          await chrome.storage.local.remove(['skillvento_token', 'skillvento_user']);
        }
      }

      return { isAuthenticated: false };
    } catch (error) {
      console.error('Auth check failed:', error);
      return { isAuthenticated: false };
    }
  }

  async handleManualSelection(certificate) {
    // Store manually selected certificate
    const stored = await chrome.storage.local.get(['manual_certificates']);
    const manualCerts = stored.manual_certificates || [];
    
    manualCerts.push({
      ...certificate,
      timestamp: Date.now()
    });

    await chrome.storage.local.set({
      manual_certificates: manualCerts
    });

    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Certificate Selected',
      message: `"${certificate.title}" has been selected for upload.`
    });
  }

  async checkForCertificatePage(tab) {
    // Check if the current page might contain certificates
    const certificateDomains = [
      'coursera.org',
      'udemy.com',
      'edx.org',
      'linkedin.com',
      'credly.com',
      'badgelist.com',
      'accredible.com'
    ];

    const url = new URL(tab.url);
    const domain = url.hostname.toLowerCase();

    if (certificateDomains.some(certDomain => domain.includes(certDomain))) {
      // Update badge to indicate potential certificates
      chrome.action.setBadgeText({
        tabId: tab.id,
        text: '?'
      });

      chrome.action.setBadgeBackgroundColor({
        tabId: tab.id,
        color: '#3b82f6'
      });

      // Auto-scan if enabled
      const settings = await this.getSettings();
      if (settings.autoScan) {
        setTimeout(() => {
          this.scanCurrentPage(tab.id).catch(console.error);
        }, 2000);
      }
    } else {
      // Clear badge
      chrome.action.setBadgeText({
        tabId: tab.id,
        text: ''
      });
    }
  }

  setupContextMenus() {
    chrome.contextMenus.create({
      id: 'skillvento-capture-image',
      title: 'Capture as Certificate',
      contexts: ['image']
    });

    chrome.contextMenus.create({
      id: 'skillvento-capture-link',
      title: 'Capture Certificate',
      contexts: ['link']
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'skillvento-capture-image') {
        this.captureFromContextMenu(info.srcUrl, 'image', tab.id);
      } else if (info.menuItemId === 'skillvento-capture-link') {
        this.captureFromContextMenu(info.linkUrl, 'link', tab.id);
      }
    });
  }

  async captureFromContextMenu(url, type, tabId) {
    const certificate = {
      id: `context_${Date.now()}`,
      type: type === 'image' ? 'image' : 'pdf',
      url: url,
      title: 'Certificate from context menu',
      source: 'Context menu',
      confidence: 'high',
      score: 100
    };

    // Store for popup to access
    await chrome.storage.local.set({
      context_certificate: certificate
    });

    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Certificate Captured',
      message: 'Click the extension icon to upload this certificate.'
    });

    // Update badge
    chrome.action.setBadgeText({
      tabId: tabId,
      text: '1'
    });

    chrome.action.setBadgeBackgroundColor({
      tabId: tabId,
      color: '#10b981'
    });
  }

  async getSettings() {
    const result = await chrome.storage.local.get(['skillvento_settings']);
    return result.skillvento_settings || {
      autoScan: true,
      showNotifications: true,
      highlightCertificates: true,
      scanSensitivity: 'medium'
    };
  }

  async updateSettings(settings) {
    await chrome.storage.local.set({
      skillvento_settings: settings
    });
  }
}

// Initialize background script
new SkillventoBackground();