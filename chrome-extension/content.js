if (typeof window.hasRun === 'undefined') {
    window.hasRun = true;

    class AmazonDataExtractor {
      constructor() {
        this.init();
      }

      init() {
        if (this.isRelevantPage()) {
          this.setupUI();
          this.setupMessageListener();
        }
      }

      isRelevantPage() {
        const url = window.location.href;
        return url.includes('/dp/') || 
               url.includes('/gp/product/') ||
               url.includes('/kindle-dbs/');
      }

      setupUI() {
        const existing = document.getElementById('pn-capture-btn');
        if (existing) existing.remove();

        const captureButton = document.createElement('div');
        captureButton.id = 'pn-capture-btn';
        captureButton.className = 'pn-capture-button';
        captureButton.innerHTML = '🚀 Capturar con Nexus AI';
        
        captureButton.addEventListener('click', () => this.captureData());
        document.body.appendChild(captureButton);
      }

      setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
          if (request.type === 'TRIGGER_CAPTURE') {
            this.captureData();
            sendResponse({ success: true });
          }
        });
        
        window.addEventListener('message', (event) => {
          if (event.data.type === 'TRIGGER_CAPTURE') {
            this.captureData();
          }
        });
      }

      async captureData() {
        try {
          const button = document.getElementById('pn-capture-btn');
          if (button) {
            button.innerHTML = '⏳ Capturando TODO...';
            button.style.background = 'linear-gradient(135deg, #FF6D4D 0%, #e55a2b 100%)';
          }

          const data = await this.extractPageData();
          const apiData = this.formatForAPI(data);

          chrome.runtime.sendMessage({ type: 'CAPTURE_DATA', data: apiData }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error al enviar mensaje:', chrome.runtime.lastError);
              this.showErrorMessage();
              return;
            }

            if (response.success) {
              console.log('✅ Datos enviados a la API exitosamente');
              this.showSuccessMessage(data, true);
            } else {
              console.warn('⚠️ API no disponible, guardado solo localmente');
              this.showSuccessMessage(data, false);
            }
          });
          
        } catch (error) {
          console.error('Error detallado en captura:', error.message, '\nStack:', error.stack);
          this.showErrorMessage();
        }
      }

      formatForAPI(data) {
        return {
          asin: data.asin || 'N/A',
          title: data.title || 'Sin título',
          author: data.author || 'Desconocido',
          coverUrl: data.coverImage || data.images?.[0] || '',
          bsr: data.bsr?.rank || 0,
          bsrCategory: data.bsr?.category || '',
          price: data.price || 0,
          currency: data.currency || '$',
          reviews: data.reviewCount || 0,
          rating: data.rating || 0,
          pageCount: data.pageCount || 0,
          publicationDate: data.publicationDate || '',
          publisher: data.publisher || '',
          language: data.language || '',
          isbn: data.isbn || '',
          format: data.format || '',
          categories: data.categories || [],
          description: data.description || '',
          bullets: data.bullets || [],
          capturedAt: new Date().toISOString(),
          url: data.url
        };
      }

      async extractPageData() {
        const data = {
          url: window.location.href,
          timestamp: new Date().toISOString(),
          asin: this.extractASIN(),
          pageType: 'product',
          title: this.safeExtract(() => this.extractTitle()),
          subtitle: this.safeExtract(() => this.extractSubtitle()),
          author: this.safeExtract(() => this.extractAuthor()),
          publisher: this.safeExtract(() => this.extractPublisher()),
          price: this.safeExtract(() => this.extractPrice()),
          priceStrike: this.safeExtract(() => this.extractStrikePrice()),
          currency: this.safeExtract(() => this.extractCurrency()),
          rating: this.safeExtract(() => this.extractRating()),
          reviewCount: this.safeExtract(() => this.extractReviewCount()),
          ratingsBreakdown: this.safeExtract(() => this.extractRatingsBreakdown()),
          bsr: this.safeExtract(() => this.extractBSR()),
          category: this.safeExtract(() => this.extractCategory()),
          categories: this.safeExtract(() => this.extractAllCategories()),
          publicationDate: this.safeExtract(() => this.extractPublicationDate()),
          pageCount: this.safeExtract(() => this.extractPageCount()),
          language: this.safeExtract(() => this.extractLanguage()),
          dimensions: this.safeExtract(() => this.extractDimensions()),
          isbn: this.safeExtract(() => this.extractISBN()),
          format: this.safeExtract(() => this.extractFormat()),
          kindle: this.safeExtract(() => this.extractKindleInfo()),
          availability: this.safeExtract(() => this.extractAvailability()),
          images: this.safeExtract(() => this.extractImages()),
          coverImage: this.safeExtract(() => this.extractMainImage()),
          description: this.safeExtract(() => this.extractDescription()),
          bullets: this.safeExtract(() => this.extractBulletPoints()),
          series: this.safeExtract(() => this.extractSeries()),
          edition: this.safeExtract(() => this.extractEdition())
        };

        return data;
      }

      safeExtract(extractor) {
        try {
          return extractor();
        } catch (error) {
          console.warn('Error en una función de extracción:', error);
          return null;
        }
      }

      extractASIN() {
        const url = window.location.href;
        const match = url.match(/\/dp\/([A-Z0-9]{10})/);
        return match ? match[1] : null;
      }

      extractTitle() {
        const selectors = ['#productTitle', '[data-automation-id="title"]', '.product-title', 'h1 span[id="productTitle"]'];
        return this.extractWithSelectors(selectors);
      }

      extractSubtitle() {
        const selectors = ['#productSubtitle', '.a-size-large.a-color-secondary'];
        return this.extractWithSelectors(selectors);
      }

      extractAuthor() {
        const selectors = ['.author .a-link-normal', '[data-automation-id="author"]', '.contributorNameID', 'span.author a', '.a-section .a-spacing-none span.a-size-medium'];
        return this.extractWithSelectors(selectors);
      }

      extractPublisher() {
        const text = document.body.innerText;
        const match = text.match(/Publisher[:\s]+([^;(]+)/i);
        return match ? match[1].trim() : null;
      }

      extractPrice() {
        const selectors = ['.a-price-whole', '.a-price .a-offscreen', '.kindle-price', '[data-automation-id="price"]', '.a-color-price', '.a-price.a-text-price.a-size-medium.a-color-base .a-offscreen'];
        const priceText = this.extractWithSelectors(selectors);
        if (priceText) {
          const match = priceText.match(/[\d,]+\.?\d*/);
          return match ? parseFloat(match[0].replace(',', '')) : null;
        }
        return null;
      }

      extractStrikePrice() {
        const selectors = ['.a-price.a-text-price .a-offscreen', '.a-price-was-string + .a-price .a-offscreen'];
        const priceText = this.extractWithSelectors(selectors);
        if (priceText) {
          const match = priceText.match(/[\d,]+\.?\d*/);
          return match ? parseFloat(match[0].replace(',', '')) : null;
        }
        return null;
      }

      extractCurrency() {
        const priceElement = document.querySelector('.a-price .a-price-symbol');
        return priceElement ? priceElement.textContent.trim() : '$';
      }

      extractRating() {
        const selectors = ['.a-icon-alt', '[data-hook="average-star-rating"]', '.reviewCountTextLinkedHistogram .a-link-normal'];
        const ratingText = this.extractWithSelectors(selectors);
        if (ratingText) {
          const match = ratingText.match(/(\d\.?\d*) out of/);
          return match ? parseFloat(match[1]) : null;
        }
        return null;
      }

      extractReviewCount() {
        const selectors = ['#acrCustomerReviewText', '[data-hook="total-review-count"]', '.reviewCountTextLinkedHistogram .a-link-normal', 'span[data-hook="total-review-count"]'];
        const reviewText = this.extractWithSelectors(selectors);
        if (reviewText) {
          const match = reviewText.match(/([\d,]+) rating/);
          return match ? parseInt(match[1].replace(',', '')) : null;
        }
        return null;
      }

      extractRatingsBreakdown() {
        const breakdown = {};
        for (let i = 5; i >= 1; i--) {
          const element = document.querySelector(`[data-hook="reviews-histogram-${i}-star-count-percent"]`);
          if (element) {
            breakdown[`${i}_star`] = element.textContent.trim();
          }
        }
        return Object.keys(breakdown).length > 0 ? breakdown : null;
      }

      extractBSR() {
        const text = document.body.innerText;
        const bsrMatch = text.match(/#([\d,]+) in ([^(]+)/);
        if (bsrMatch) {
          return {
            rank: parseInt(bsrMatch[1].replace(/,/g, '')),
            category: bsrMatch[2].trim()
          };
        }
        return null;
      }

      extractCategory() {
        const selectors = ['.a-color-secondary .a-link-normal', '[data-automation-id="breadcrumb"]', '.nav-breadcrumb'];
        return this.extractWithSelectors(selectors);
      }

      extractAllCategories() {
        const categories = [];
        const breadcrumbs = document.querySelectorAll('.a-breadcrumb .a-link-normal');
        breadcrumbs.forEach(link => {
          const text = link.textContent.trim();
          if (text && !text.includes('Back to results')) {
            categories.push(text);
          }
        });
        return categories.length > 0 ? categories : null;
      }

      extractPublicationDate() {
        const text = document.body.innerText;
        const match = text.match(/Publication date[:\s]+([^;(]+)/i) || text.match(/Published[:\s]+([^;(]+)/i);
        return match ? match[1].trim() : null;
      }

      extractPageCount() {
        const text = document.body.innerText;
        const match = text.match(/(\d+) pages/i) || text.match(/Print length[:\s]+(\d+) pages/i);
        return match ? parseInt(match[1]) : null;
      }

      extractLanguage() {
        const text = document.body.innerText;
        const match = text.match(/Language[:\s]+([^;(]+)/i);
        return match ? match[1].trim() : null;
      }

      extractDimensions() {
        const text = document.body.innerText;
        const match = text.match(/Dimensions[:\s]+([^;(]+)/i);
        return match ? match[1].trim() : null;
      }

      extractISBN() {
        const text = document.body.innerText;
        const match = text.match(/ISBN-13[:\s]+([\d-]+)/i) || text.match(/ISBN-10[:\s]+([\d-]+)/i);
        return match ? match[1] : null;
      }

      extractFormat() {
        const formatElement = document.querySelector('.a-button-selected .a-button-text');
        return formatElement ? formatElement.textContent.trim() : 'Paperback';
      }

      extractKindleInfo() {
        const kindlePrice = document.querySelector('.kindle-price');
        const kindleSize = document.body.innerText.match(/File size[:\s]+([\d.]+ [A-Z]+)/i);
        return {
          available: !!kindlePrice,
          price: kindlePrice ? kindlePrice.textContent.trim() : null,
          fileSize: kindleSize ? kindleSize[1] : null
        };
      }

      extractAvailability() {
        const selectors = ['#availability span', '[data-automation-id="availability"]', '.a-color-success', '.a-color-price'];
        return this.extractWithSelectors(selectors);
      }

      extractImages() {
        const images = [];
        const imageElements = document.querySelectorAll('#landingImage, .a-dynamic-image, [data-automation-id="hero-image"]');
        imageElements.forEach(img => {
          if (img.src && !img.src.includes('data:')) {
            images.push(img.src);
          }
        });
        return images;
      }

      extractMainImage() {
        const mainImg = document.querySelector('#landingImage, .a-dynamic-image');
        return mainImg ? mainImg.src : null;
      }

      extractDescription() {
        const selectors = ['[data-feature-name="bookDescription"]', '#feature-bullets ul', '.a-spacing-small .a-size-base'];
        return this.extractWithSelectors(selectors);
      }

      extractBulletPoints() {
        const bullets = [];
        const bulletElements = document.querySelectorAll('[data-feature-name="featurebullets"] ul li, .a-unordered-list li');
        bulletElements.forEach(li => {
          const text = li.textContent.trim();
          if (text && text.length > 10 && !text.includes('Make sure')) {
            bullets.push(text);
          }
        });
        return bullets.length > 0 ? bullets : null;
      }

      extractSeries() {
        const text = document.body.innerText;
        const match = text.match(/Book (\d+) of (\d+)[:\s]*([^(]+)/i);
        if (match) {
          return {
            book_number: parseInt(match[1]),
            total_books: parseInt(match[2]),
            series_name: match[3].trim()
          };
        }
        return null;
      }

      extractEdition() {
        const text = document.body.innerText;
        const match = text.match(/(Spanish|English|French|German|Italian) Edition/i) || text.match(/(\d+)(?:st|nd|rd|th) Edition/i);
        return match ? match[1] : null;
      }

      extractWithSelectors(selectors) {
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            return element.textContent.trim();
          }
        }
        return null;
      }

      showSuccessMessage(data, apiSuccess = false) {
        const button = document.getElementById('pn-capture-btn');
        if (button) {
          button.innerHTML = apiSuccess ? '✅ ¡Enviado a la API!' : '✅ ¡Guardado localmente!';
          button.style.background = 'linear-gradient(135deg, #2ADF5F 0%, #25c454 100%)';
          
          setTimeout(() => {
            button.innerHTML = '🚀 Capturar con Nexus AI';
            button.style.background = 'linear-gradient(135deg, #FF6D4D 0%, #e55a2b 100%)';
          }, 3000);
        }

        this.showDataPreview(data, apiSuccess);
      }

      showDataPreview(data, apiSuccess) {
        const preview = document.createElement('div');
        preview.className = 'pn-preview';
        preview.innerHTML = `
          <h4 style="margin: 0 0 8px 0; color: #2A3B5C; display: flex; align-items: center;">
            <span style="background: linear-gradient(135deg, #2A3B5C 0%, #1e2a3a 100%); color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px; font-size: 10px;">PN</span>
            🎯 Datos Capturados ${apiSuccess ? '+ Enviados a API' : '(Solo local)'}
          </h4>
          <div style="color: #2A3B5C; font-size: 11px; line-height: 1.3;">
            <strong>📚 Título:</strong> ${data.title ? data.title.substring(0, 40) + '...' : 'N/A'}<br>
            <strong>👤 Autor:</strong> ${data.author || 'N/A'}<br>
            <strong>💰 Precio:</strong> ${data.currency}${data.price || 'N/A'}<br>
            <strong>⭐ Rating:</strong> ${data.rating || 'N/A'} (${data.reviewCount || 0} reviews)<br>
            <strong>📊 BSR:</strong> #${data.bsr?.rank || 'N/A'}<br>
            <strong>📖 Páginas:</strong> ${data.pageCount || 'N/A'}<br>
            <strong>🗓️ Publicado:</strong> ${data.publicationDate || 'N/A'}<br>
            <strong>🏷️ ASIN:</strong> ${data.asin || 'N/A'}
          </div>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #EDEDED; color: #666; font-size: 10px;">
            ${apiSuccess ? 
              '⚡ Guardado local ✅ | Enviado a API ✅ | Sincronizado con dashboard' :
              '⚡ Guardado local ✅ | API no disponible ⚠️ | Se enviará cuando esté disponible'
            }
          </div>
        `;
        
        document.body.appendChild(preview);
        
        setTimeout(() => {
          if (document.body.contains(preview)) {
            document.body.removeChild(preview);
          }
        }, 8000);
      }

      showErrorMessage() {
        const button = document.getElementById('pn-capture-btn');
        if (button) {
          button.innerHTML = '❌ Error';
          button.style.background = 'linear-gradient(135deg, #E63946 0%, #d32f2f 100%)';
          
          setTimeout(() => {
            button.innerHTML = '🚀 Capturar con Nexus AI';
            button.style.background = 'linear-gradient(135deg, #FF6D4D 0%, #e55a2b 100%)';
          }, 3000);
        }
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        new AmazonDataExtractor();
      });
    } else {
      new AmazonDataExtractor();
    }
}