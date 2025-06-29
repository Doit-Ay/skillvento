// Content script for Skillvento extension
class SkillventoCertificateScanner {
  constructor() {
    this.isScanning = false;
    this.foundCertificates = [];
    this.overlay = null;
    
    this.init();
  }

  init() {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'scanCertificates') {
        this.scanForCertificates().then(sendResponse);
        return true; // Keep message channel open for async response
      } else if (request.action === 'highlightCertificates') {
        this.highlightCertificates();
        sendResponse({ success: true });
      } else if (request.action === 'startManualCapture') {
        this.startManualCapture();
        sendResponse({ success: true });
      }
    });

    // Auto-scan when page loads (optional)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.autoScan(), 1000);
      });
    } else {
      setTimeout(() => this.autoScan(), 1000);
    }
  }

  async autoScan() {
    // Only auto-scan on certain domains that commonly have certificates
    const certificateDomains = [
      'coursera.org',
      'udemy.com',
      'edx.org',
      'linkedin.com',
      'credly.com',
      'badgelist.com',
      'accredible.com',
      'canvas.instructure.com',
      'certificates.google.com',
      'aws.amazon.com',
      'microsoft.com',
      'adobe.com'
    ];

    const currentDomain = window.location.hostname.toLowerCase();
    const shouldAutoScan = certificateDomains.some(domain => 
      currentDomain.includes(domain)
    );

    if (shouldAutoScan) {
      await this.scanForCertificates();
      if (this.foundCertificates.length > 0) {
        this.showCertificateNotification();
      }
    }
  }

  async scanForCertificates() {
    if (this.isScanning) return this.foundCertificates;
    
    this.isScanning = true;
    this.foundCertificates = [];
    
    try {
      // Scan for certificate images
      await this.scanImages();
      
      // Scan for PDF certificates
      await this.scanPDFs();
      
      // Scan for certificate text patterns
      await this.scanTextPatterns();
      
      // Remove duplicates and sort by confidence
      this.foundCertificates = this.deduplicateAndSort(this.foundCertificates);
      
    } catch (error) {
      console.error('Certificate scan failed:', error);
    } finally {
      this.isScanning = false;
    }
    
    return this.foundCertificates;
  }

  async scanImages() {
    const images = document.querySelectorAll('img');
    const certificateKeywords = [
      'certificate', 'certification', 'diploma', 'award', 'achievement',
      'completion', 'course', 'training', 'skill', 'badge', 'credential',
      'license', 'qualification', 'competency'
    ];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      
      // Skip if image is too small or not loaded
      if (img.naturalWidth < 200 || img.naturalHeight < 150) continue;
      
      const alt = (img.alt || '').toLowerCase();
      const src = (img.src || '').toLowerCase();
      const title = (img.title || '').toLowerCase();
      const className = (img.className || '').toLowerCase();
      const parentText = (img.parentElement?.textContent || '').toLowerCase();
      
      // Check for certificate keywords
      const hasKeywords = certificateKeywords.some(keyword => 
        alt.includes(keyword) || src.includes(keyword) || 
        title.includes(keyword) || className.includes(keyword) ||
        parentText.includes(keyword)
      );
      
      // Check image characteristics
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const isLandscape = aspectRatio > 1.2 && aspectRatio < 3;
      const isReasonableSize = img.naturalWidth > 300 && img.naturalHeight > 200;
      
      // Calculate confidence score
      let confidence = 0;
      if (hasKeywords) confidence += 60;
      if (isLandscape) confidence += 20;
      if (isReasonableSize) confidence += 10;
      if (img.naturalWidth > 600) confidence += 10;
      
      // Additional checks for common certificate patterns
      if (src.includes('certificate') || src.includes('diploma')) confidence += 30;
      if (alt.includes('certificate') || alt.includes('diploma')) confidence += 30;
      
      if (confidence >= 40) {
        this.foundCertificates.push({
          id: `img_${i}`,
          type: 'image',
          url: img.src,
          title: this.extractTitle(img),
          source: 'Image on page',
          element: img,
          confidence: this.getConfidenceLevel(confidence),
          score: confidence,
          metadata: {
            alt: img.alt,
            width: img.naturalWidth,
            height: img.naturalHeight,
            aspectRatio: aspectRatio
          }
        });
      }
    }
  }

  async scanPDFs() {
    // Scan for PDF links
    const pdfLinks = document.querySelectorAll('a[href*=".pdf"]');
    const certificateKeywords = ['certificate', 'diploma', 'completion', 'achievement'];
    
    pdfLinks.forEach((link, index) => {
      const href = link.href;
      const text = (link.textContent || '').trim().toLowerCase();
      const title = (link.title || '').toLowerCase();
      
      let confidence = 20; // Base confidence for PDF
      
      if (certificateKeywords.some(keyword => 
        text.includes(keyword) || title.includes(keyword) || href.toLowerCase().includes(keyword)
      )) {
        confidence += 50;
      }
      
      if (confidence >= 40) {
        this.foundCertificates.push({
          id: `pdf_${index}`,
          type: 'pdf',
          url: href,
          title: link.textContent?.trim() || `Certificate PDF`,
          source: 'PDF Link',
          element: link,
          confidence: this.getConfidenceLevel(confidence),
          score: confidence
        });
      }
    });
    
    // Scan for embedded PDFs
    const embeds = document.querySelectorAll('embed[src*=".pdf"], object[data*=".pdf"], iframe[src*=".pdf"]');
    embeds.forEach((embed, index) => {
      const src = embed.src || embed.data;
      if (src) {
        this.foundCertificates.push({
          id: `embed_${index}`,
          type: 'pdf',
          url: src,
          title: `Embedded Certificate`,
          source: 'Embedded PDF',
          element: embed,
          confidence: 'medium',
          score: 60
        });
      }
    });
  }

  async scanTextPatterns() {
    // Look for text patterns that indicate certificates
    const certificatePatterns = [
      /certificate\s+of\s+(completion|achievement|participation)/gi,
      /diploma\s+in\s+/gi,
      /certified\s+in\s+/gi,
      /successfully\s+completed/gi,
      /has\s+earned\s+the\s+certificate/gi
    ];
    
    const textNodes = this.getTextNodes(document.body);
    
    textNodes.forEach((node, index) => {
      const text = node.textContent;
      
      for (const pattern of certificatePatterns) {
        if (pattern.test(text)) {
          // Find nearby images or links that might be the actual certificate
          const nearbyElements = this.findNearbyElements(node, ['img', 'a[href*=".pdf"]']);
          
          nearbyElements.forEach((element, elemIndex) => {
            if (element.tagName === 'IMG') {
              this.foundCertificates.push({
                id: `text_img_${index}_${elemIndex}`,
                type: 'image',
                url: element.src,
                title: this.extractTitle(element, text),
                source: 'Text pattern match',
                element: element,
                confidence: 'high',
                score: 80
              });
            } else if (element.tagName === 'A') {
              this.foundCertificates.push({
                id: `text_pdf_${index}_${elemIndex}`,
                type: 'pdf',
                url: element.href,
                title: element.textContent?.trim() || 'Certificate PDF',
                source: 'Text pattern match',
                element: element,
                confidence: 'high',
                score: 80
              });
            }
          });
          break;
        }
      }
    });
  }

  getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.trim().length > 20) {
        textNodes.push(node);
      }
    }
    
    return textNodes;
  }

  findNearbyElements(textNode, selectors) {
    const elements = [];
    let parent = textNode.parentElement;
    
    // Search up to 3 levels up and down
    for (let level = 0; level < 3 && parent; level++) {
      selectors.forEach(selector => {
        const found = parent.querySelectorAll(selector);
        elements.push(...Array.from(found));
      });
      parent = parent.parentElement;
    }
    
    return elements;
  }

  extractTitle(element, contextText = '') {
    // Try to extract a meaningful title for the certificate
    const alt = element.alt || '';
    const title = element.title || '';
    const filename = element.src ? element.src.split('/').pop().split('.')[0] : '';
    const parentText = element.parentElement?.textContent || '';
    
    // Clean up and prioritize sources
    const candidates = [
      alt,
      title,
      filename.replace(/[-_]/g, ' '),
      parentText.substring(0, 100),
      contextText.substring(0, 100)
    ].filter(text => text && text.trim().length > 0);
    
    for (const candidate of candidates) {
      const cleaned = candidate.trim();
      if (cleaned.length > 5 && cleaned.length < 100) {
        return cleaned;
      }
    }
    
    return 'Certificate';
  }

  getConfidenceLevel(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  deduplicateAndSort(certificates) {
    // Remove duplicates based on URL
    const seen = new Set();
    const unique = certificates.filter(cert => {
      if (seen.has(cert.url)) return false;
      seen.add(cert.url);
      return true;
    });
    
    // Sort by confidence score (highest first)
    return unique.sort((a, b) => b.score - a.score);
  }

  highlightCertificates() {
    // Remove existing highlights
    this.removeHighlights();
    
    // Add highlights to found certificates
    this.foundCertificates.forEach(cert => {
      if (cert.element && cert.element.parentNode) {
        const highlight = document.createElement('div');
        highlight.className = 'skillvento-certificate-highlight';
        highlight.style.cssText = `
          position: absolute;
          border: 3px solid #3b82f6;
          border-radius: 8px;
          background: rgba(59, 130, 246, 0.1);
          pointer-events: none;
          z-index: 10000;
          animation: skillvento-pulse 2s infinite;
        `;
        
        const rect = cert.element.getBoundingClientRect();
        highlight.style.left = (rect.left + window.scrollX - 3) + 'px';
        highlight.style.top = (rect.top + window.scrollY - 3) + 'px';
        highlight.style.width = (rect.width + 6) + 'px';
        highlight.style.height = (rect.height + 6) + 'px';
        
        document.body.appendChild(highlight);
      }
    });
    
    // Add animation styles
    if (!document.getElementById('skillvento-highlight-styles')) {
      const styles = document.createElement('style');
      styles.id = 'skillvento-highlight-styles';
      styles.textContent = `
        @keyframes skillvento-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `;
      document.head.appendChild(styles);
    }
  }

  removeHighlights() {
    const highlights = document.querySelectorAll('.skillvento-certificate-highlight');
    highlights.forEach(highlight => highlight.remove());
  }

  showCertificateNotification() {
    // Show a subtle notification that certificates were found
    if (document.getElementById('skillvento-notification')) return;
    
    const notification = document.createElement('div');
    notification.id = 'skillvento-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        <span>Found ${this.foundCertificates.length} certificate${this.foundCertificates.length !== 1 ? 's' : ''}</span>
      </div>
    `;
    
    // Add animation styles
    const styles = document.createElement('style');
    styles.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(styles);
    
    notification.addEventListener('click', () => {
      // Open extension popup or highlight certificates
      this.highlightCertificates();
      setTimeout(() => this.removeHighlights(), 5000);
    });
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  startManualCapture() {
    // Create overlay for manual selection
    this.createCaptureOverlay();
  }

  createCaptureOverlay() {
    if (this.overlay) return;
    
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10002;
      cursor: crosshair;
    `;
    
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    instructions.innerHTML = `
      <h3 style="margin: 0 0 10px 0;">Manual Certificate Capture</h3>
      <p style="margin: 0 0 15px 0; color: #666;">Click on any certificate image or PDF link to capture it</p>
      <button id="cancel-capture" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Cancel</button>
    `;
    
    this.overlay.appendChild(instructions);
    document.body.appendChild(this.overlay);
    
    // Add event listeners
    document.getElementById('cancel-capture').addEventListener('click', () => {
      this.removeCaptureOverlay();
    });
    
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.removeCaptureOverlay();
      }
    });
    
    // Add click handlers to all images and PDF links
    this.addCaptureHandlers();
  }

  addCaptureHandlers() {
    const elements = document.querySelectorAll('img, a[href*=".pdf"]');
    
    elements.forEach(element => {
      element.addEventListener('click', this.handleManualCapture.bind(this), { once: true });
      element.style.outline = '2px dashed #3b82f6';
    });
  }

  handleManualCapture(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const element = event.target;
    const certificate = {
      id: `manual_${Date.now()}`,
      type: element.tagName === 'IMG' ? 'image' : 'pdf',
      url: element.src || element.href,
      title: this.extractTitle(element),
      source: 'Manual selection',
      element: element,
      confidence: 'high',
      score: 100
    };
    
    // Add to found certificates and remove overlay
    this.foundCertificates.unshift(certificate);
    this.removeCaptureOverlay();
    
    // Notify popup that a certificate was manually selected
    chrome.runtime.sendMessage({
      action: 'certificateManuallySelected',
      certificate: certificate
    });
  }

  removeCaptureOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    
    // Remove outlines from elements
    const elements = document.querySelectorAll('img, a[href*=".pdf"]');
    elements.forEach(element => {
      element.style.outline = '';
    });
  }
}

// Initialize content script
new SkillventoCertificateScanner();