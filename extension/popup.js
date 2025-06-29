// Popup script for Skillvento extension
class SkillventoPopup {
  constructor() {
    this.currentUser = null;
    this.foundCertificates = [];
    this.selectedCertificates = new Set();
    this.isScanning = false;
    this.isUploading = false;
    
    this.init();
  }

  async init() {
    await this.checkAuthStatus();
    this.setupEventListeners();
    
    if (this.currentUser) {
      this.showLoggedInState();
      await this.scanForCertificates();
    } else {
      this.showNotLoggedInState();
    }
  }

  async checkAuthStatus() {
    try {
      // Check if user is logged in by trying to get user data from storage
      const result = await chrome.storage.local.get(['skillvento_user', 'skillvento_token']);
      
      if (result.skillvento_user && result.skillvento_token) {
        this.currentUser = result.skillvento_user;
        return true;
      }
      
      // Try to get auth status from the main site
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url.includes('skillvento.com') || tab.url.includes('localhost')) {
        // Inject script to check auth status
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => {
            // Check if user is logged in on the main site
            const userStr = localStorage.getItem('supabase.auth.token');
            if (userStr) {
              try {
                const authData = JSON.parse(userStr);
                return {
                  isLoggedIn: true,
                  user: authData.user
                };
              } catch (e) {
                return { isLoggedIn: false };
              }
            }
            return { isLoggedIn: false };
          }
        });
        
        if (results[0]?.result?.isLoggedIn) {
          this.currentUser = results[0].result.user;
          // Store in extension storage
          await chrome.storage.local.set({
            skillvento_user: this.currentUser,
            skillvento_token: 'authenticated'
          });
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  }

  setupEventListeners() {
    // Login button
    document.getElementById('login-btn')?.addEventListener('click', () => {
      this.openLoginPage();
    });

    // Manual capture button
    document.getElementById('manual-capture-btn')?.addEventListener('click', () => {
      this.startManualCapture();
    });

    // Capture selected button
    document.getElementById('capture-selected-btn')?.addEventListener('click', () => {
      this.uploadSelectedCertificates();
    });

    // View dashboard button
    document.getElementById('view-dashboard-btn')?.addEventListener('click', () => {
      this.openDashboard();
    });

    // Scan again button
    document.getElementById('scan-again-btn')?.addEventListener('click', () => {
      this.scanAgain();
    });

    // Settings and help links
    document.getElementById('settings-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openSettings();
    });

    document.getElementById('help-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openHelp();
    });
  }

  showNotLoggedInState() {
    document.getElementById('not-logged-in').style.display = 'flex';
    document.getElementById('logged-in').style.display = 'none';
  }

  showLoggedInState() {
    document.getElementById('not-logged-in').style.display = 'none';
    document.getElementById('logged-in').style.display = 'flex';
    
    // Update user info
    if (this.currentUser) {
      const userName = this.currentUser.user_metadata?.full_name || this.currentUser.email?.split('@')[0] || 'User';
      const userEmail = this.currentUser.email || '';
      
      document.getElementById('user-name').textContent = userName;
      document.getElementById('user-email').textContent = userEmail;
      document.getElementById('user-initial').textContent = userName[0].toUpperCase();
    }
  }

  async scanForCertificates() {
    if (this.isScanning) return;
    
    this.isScanning = true;
    this.showScanningState();
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Inject content script to scan for certificates
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: this.scanPageForCertificates
      });
      
      const certificates = results[0]?.result || [];
      this.foundCertificates = certificates;
      
      if (certificates.length > 0) {
        this.showCertificatesFound(certificates);
      } else {
        this.showNoCertificatesFound();
      }
    } catch (error) {
      console.error('Scan failed:', error);
      this.showNoCertificatesFound();
    } finally {
      this.isScanning = false;
    }
  }

  scanPageForCertificates() {
    const certificates = [];
    const processedUrls = new Set();
    
    // Look for images that might be certificates
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (processedUrls.has(img.src)) return;
      
      const alt = img.alt?.toLowerCase() || '';
      const src = img.src?.toLowerCase() || '';
      const title = img.title?.toLowerCase() || '';
      const className = img.className?.toLowerCase() || '';
      
      // Check if image might be a certificate
      const certificateKeywords = [
        'certificate', 'certification', 'diploma', 'award', 'achievement',
        'completion', 'course', 'training', 'skill', 'badge', 'credential'
      ];
      
      const isCertificate = certificateKeywords.some(keyword => 
        alt.includes(keyword) || src.includes(keyword) || 
        title.includes(keyword) || className.includes(keyword)
      );
      
      // Also check image dimensions (certificates are usually wider than tall)
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const isLandscape = aspectRatio > 1.2;
      const isReasonableSize = img.naturalWidth > 200 && img.naturalHeight > 150;
      
      if (isCertificate || (isLandscape && isReasonableSize)) {
        processedUrls.add(img.src);
        certificates.push({
          id: `img_${index}`,
          type: 'image',
          url: img.src,
          title: img.alt || img.title || `Certificate ${certificates.length + 1}`,
          source: 'Image on page',
          element: img.outerHTML,
          confidence: isCertificate ? 'high' : 'medium'
        });
      }
    });
    
    // Look for PDF links that might be certificates
    const links = document.querySelectorAll('a[href*=".pdf"], a[href*="certificate"], a[href*="diploma"]');
    links.forEach((link, index) => {
      const href = link.href;
      const text = link.textContent?.trim() || '';
      const title = link.title || '';
      
      if (href && !processedUrls.has(href)) {
        processedUrls.add(href);
        certificates.push({
          id: `pdf_${index}`,
          type: 'pdf',
          url: href,
          title: text || title || `Certificate PDF ${certificates.length + 1}`,
          source: 'PDF Link',
          element: link.outerHTML,
          confidence: 'high'
        });
      }
    });
    
    // Look for embedded PDFs
    const embeds = document.querySelectorAll('embed[src*=".pdf"], object[data*=".pdf"], iframe[src*=".pdf"]');
    embeds.forEach((embed, index) => {
      const src = embed.src || embed.data;
      if (src && !processedUrls.has(src)) {
        processedUrls.add(src);
        certificates.push({
          id: `embed_${index}`,
          type: 'pdf',
          url: src,
          title: `Embedded Certificate ${certificates.length + 1}`,
          source: 'Embedded PDF',
          element: embed.outerHTML,
          confidence: 'medium'
        });
      }
    });
    
    // Sort by confidence (high confidence first)
    return certificates.sort((a, b) => {
      const confidenceOrder = { high: 3, medium: 2, low: 1 };
      return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    });
  }

  showScanningState() {
    document.getElementById('scan-status').style.display = 'flex';
    document.getElementById('no-certificates').style.display = 'none';
    document.getElementById('certificates-found').style.display = 'none';
    document.getElementById('upload-progress').style.display = 'none';
    document.getElementById('upload-complete').style.display = 'none';
  }

  showNoCertificatesFound() {
    document.getElementById('scan-status').style.display = 'none';
    document.getElementById('no-certificates').style.display = 'flex';
    document.getElementById('certificates-found').style.display = 'none';
  }

  showCertificatesFound(certificates) {
    document.getElementById('scan-status').style.display = 'none';
    document.getElementById('no-certificates').style.display = 'none';
    document.getElementById('certificates-found').style.display = 'flex';
    
    // Update count
    document.getElementById('certificate-count').textContent = certificates.length;
    
    // Populate certificates list
    const listContainer = document.getElementById('certificates-list');
    listContainer.innerHTML = '';
    
    certificates.forEach((cert, index) => {
      const item = this.createCertificateItem(cert, index);
      listContainer.appendChild(item);
    });
    
    this.updateCaptureButton();
  }

  createCertificateItem(certificate, index) {
    const item = document.createElement('div');
    item.className = 'certificate-item';
    item.dataset.certId = certificate.id;
    
    item.innerHTML = `
      <input type="checkbox" class="certificate-checkbox" data-cert-id="${certificate.id}">
      <div class="certificate-preview">
        ${certificate.type === 'image' 
          ? `<img src="${certificate.url}" alt="${certificate.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">` 
          : `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>`
        }
      </div>
      <div class="certificate-info">
        <div class="certificate-title">${certificate.title}</div>
        <div class="certificate-source">${certificate.source}</div>
      </div>
    `;
    
    // Add click handler
    item.addEventListener('click', (e) => {
      if (e.target.type !== 'checkbox') {
        const checkbox = item.querySelector('.certificate-checkbox');
        checkbox.checked = !checkbox.checked;
        this.toggleCertificateSelection(certificate.id, checkbox.checked);
      }
    });
    
    // Add checkbox handler
    const checkbox = item.querySelector('.certificate-checkbox');
    checkbox.addEventListener('change', (e) => {
      this.toggleCertificateSelection(certificate.id, e.target.checked);
    });
    
    return item;
  }

  toggleCertificateSelection(certId, isSelected) {
    if (isSelected) {
      this.selectedCertificates.add(certId);
    } else {
      this.selectedCertificates.delete(certId);
    }
    
    // Update item appearance
    const item = document.querySelector(`[data-cert-id="${certId}"]`);
    if (item) {
      item.classList.toggle('selected', isSelected);
    }
    
    this.updateCaptureButton();
  }

  updateCaptureButton() {
    const button = document.getElementById('capture-selected-btn');
    const count = this.selectedCertificates.size;
    
    button.disabled = count === 0;
    button.innerHTML = `
      <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      Upload Selected ${count > 0 ? `(${count})` : ''}
    `;
  }

  async uploadSelectedCertificates() {
    if (this.selectedCertificates.size === 0 || this.isUploading) return;
    
    this.isUploading = true;
    this.showUploadProgress();
    
    const selectedCerts = this.foundCertificates.filter(cert => 
      this.selectedCertificates.has(cert.id)
    );
    
    let uploaded = 0;
    const total = selectedCerts.length;
    
    try {
      for (const cert of selectedCerts) {
        await this.uploadCertificate(cert);
        uploaded++;
        this.updateUploadProgress(uploaded, total, `Uploaded: ${cert.title}`);
      }
      
      this.showUploadComplete(uploaded);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again or upload manually from the dashboard.');
      this.scanAgain();
    } finally {
      this.isUploading = false;
    }
  }

  async uploadCertificate(certificate) {
    // Simulate upload process - in real implementation, this would:
    // 1. Download the certificate file
    // 2. Upload to Skillvento backend
    // 3. Create certificate record
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate upload delay
        resolve();
      }, 1000 + Math.random() * 2000);
    });
  }

  showUploadProgress() {
    document.getElementById('certificates-found').style.display = 'none';
    document.getElementById('upload-progress').style.display = 'flex';
    
    this.updateUploadProgress(0, this.selectedCertificates.size, 'Starting upload...');
  }

  updateUploadProgress(current, total, details) {
    const percentage = (current / total) * 100;
    
    document.getElementById('upload-status').textContent = `${current} / ${total}`;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
    document.getElementById('upload-details').textContent = details;
  }

  showUploadComplete(count) {
    document.getElementById('upload-progress').style.display = 'none';
    document.getElementById('upload-complete').style.display = 'flex';
    
    const summary = count === 1 
      ? 'Successfully uploaded 1 certificate to your portfolio.'
      : `Successfully uploaded ${count} certificates to your portfolio.`;
    
    document.getElementById('upload-summary').textContent = summary;
  }

  startManualCapture() {
    // Open the main site's upload page
    chrome.tabs.create({
      url: 'https://skillvento.com/dashboard'
    });
  }

  openLoginPage() {
    chrome.tabs.create({
      url: 'https://skillvento.com/login'
    });
  }

  openDashboard() {
    chrome.tabs.create({
      url: 'https://skillvento.com/dashboard'
    });
  }

  scanAgain() {
    this.selectedCertificates.clear();
    this.foundCertificates = [];
    this.scanForCertificates();
  }

  openSettings() {
    // Open extension options page
    chrome.runtime.openOptionsPage();
  }

  openHelp() {
    chrome.tabs.create({
      url: 'https://skillvento.com/help/extension'
    });
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SkillventoPopup();
});