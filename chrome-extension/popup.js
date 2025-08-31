// popup.js - Lógica del popup de Publish Nexus AI

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Publish Nexus AI Popup iniciado');
    
    // Elementos del DOM - con verificación de existencia
    const captureBtn = document.getElementById('capture-btn');
    const capturesList = document.getElementById('captures-list');
    const pageStatus = document.getElementById('page-status');
    const pageType = document.getElementById('page-type');
    const capturesToday = document.getElementById('captures-today');
    const configBtn = document.getElementById('config-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    
    // Verificar que los elementos existan
    if (!captureBtn || !capturesList || !pageStatus || !pageType || !capturesToday) {
        console.error('❌ No se encontraron todos los elementos del DOM necesarios');
        return;
    }
    
    // Estado
    let isOnAmazon = false;
    let currentTab = null;
    
    // Verificar página actual
    async function checkCurrentPage() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            currentTab = tabs[0];
            
            if (currentTab && currentTab.url) {
                isOnAmazon = currentTab.url.includes('amazon.');
                const isProductPage = currentTab.url.includes('/dp/') || 
                                     currentTab.url.includes('/gp/product/');
                
                // Actualizar UI según el estado
                if (isOnAmazon && isProductPage) {
                    pageStatus.classList.remove('status-inactive');
                    pageStatus.classList.add('status-active');
                    pageType.textContent = 'Producto detectado ✅';
                    captureBtn.disabled = false;
                    
                    const btnText = captureBtn.querySelector('.btn-text');
                    if (btnText) btnText.textContent = 'Capturar con Nexus AI';
                } else if (isOnAmazon) {
                    pageStatus.classList.remove('status-inactive');
                    pageStatus.classList.add('status-active');
                    pageType.textContent = 'En Amazon';
                    captureBtn.disabled = true;
                    
                    const btnText = captureBtn.querySelector('.btn-text');
                    if (btnText) btnText.textContent = 'Navega a un producto';
                } else {
                    pageStatus.classList.add('status-inactive');
                    pageStatus.classList.remove('status-active');
                    pageType.textContent = 'No en Amazon';
                    captureBtn.disabled = true;
                    
                    const btnText = captureBtn.querySelector('.btn-text');
                    if (btnText) btnText.textContent = 'Ve a Amazon primero';
                }
            }
        } catch (error) {
            console.error('Error verificando página:', error);
        }
    }
    
    // Cargar capturas recientes
    async function loadRecentCaptures() {
        try {
            // Obtener capturas del storage
            chrome.runtime.sendMessage({ type: 'GET_CAPTURES' }, response => {
                if (chrome.runtime.lastError) {
                    console.error('Error en runtime:', chrome.runtime.lastError);
                    return;
                }
                
                if (response && response.captures) {
                    displayCaptures(response.captures);
                    updateTodayCount(response.captures);
                }
            });
        } catch (error) {
            console.error('Error cargando capturas:', error);
        }
    }
    
    // Mostrar capturas en la lista
    function displayCaptures(captures) {
        if (!capturesList) return;
        
        if (!captures || captures.length === 0) {
            capturesList.innerHTML = `
                <div class="empty-state">
                    No hay capturas todavía.<br>
                    Navega a un producto de Amazon para empezar.
                </div>
            `;
            return;
        }
        
        // Mostrar solo las últimas 5 capturas
        const recentCaptures = captures.slice(-5).reverse();
        
        capturesList.innerHTML = recentCaptures.map(capture => {
            const title = capture.title ? capture.title.substring(0, 50) + '...' : 'Sin título';
            const price = capture.price ? `$${capture.price}` : 'N/A';
            const bsr = capture.bsr?.rank ? `#${capture.bsr.rank.toLocaleString()}` : 'N/A';
            const rating = capture.rating ? `⭐ ${capture.rating}` : '';
            
            return `
                <div class="capture-item">
                    <div class="capture-title">${title}</div>
                    <div class="capture-meta">
                        <span class="pill success">${price}</span>
                        <span>${bsr}</span>
                        <span>${rating}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Actualizar contador de capturas de hoy
    function updateTodayCount(captures) {
        if (!capturesToday) return;
        
        const today = new Date().toDateString();
        const todayCaptures = captures.filter(c => {
            const captureDate = new Date(c.timestamp).toDateString();
            return captureDate === today;
        });
        
        capturesToday.textContent = todayCaptures.length;
    }
    
    // Manejar click en capturar - SOLO si el botón existe
    if (captureBtn) {
        captureBtn.addEventListener('click', async () => {
            if (captureBtn.disabled) return;
            
            try {
                // Cambiar estado del botón
                captureBtn.disabled = true;
                captureBtn.classList.add('loading');
                
                const btnIcon = captureBtn.querySelector('.btn-icon');
                const btnText = captureBtn.querySelector('.btn-text');
                
                if (btnIcon) btnIcon.innerHTML = '<span class="loading"></span>';
                if (btnText) btnText.textContent = 'Capturando...';
                
                // Verificar que tenemos una pestaña válida
                if (!currentTab || !currentTab.id) {
                    throw new Error('No hay pestaña activa');
                }
                
                // Enviar mensaje al content script
                chrome.tabs.sendMessage(currentTab.id, { 
                    type: 'TRIGGER_CAPTURE' 
                }, response => {
                    if (chrome.runtime.lastError) {
                        console.error('Error detallado:', chrome.runtime.lastError.message); // Mensaje de error mejorado
                    }
                });
                
                // Simular proceso (el content script manejará la captura real)
                setTimeout(() => {
                    // Mostrar éxito
                    captureBtn.classList.remove('loading');
                    captureBtn.classList.add('success');
                    
                    if (btnIcon) btnIcon.textContent = '✅';
                    if (btnText) btnText.textContent = '¡Capturado!';
                    
                    // Recargar capturas
                    loadRecentCaptures();
                    
                    // Restaurar botón después de 2 segundos
                    setTimeout(() => {
                        captureBtn.disabled = false;
                        captureBtn.classList.remove('success');
                        
                        if (btnIcon) btnIcon.textContent = '🚀';
                        if (btnText) btnText.textContent = 'Capturar con Nexus AI';
                    }, 2000);
                }, 1500);
                
            } catch (error) {
                console.error('Error al capturar:', error);
                
                // Mostrar error
                captureBtn.classList.remove('loading');
                
                const btnIcon = captureBtn.querySelector('.btn-icon');
                const btnText = captureBtn.querySelector('.btn-text');
                
                if (btnIcon) btnIcon.textContent = '❌';
                if (btnText) btnText.textContent = 'Error al capturar';
                
                setTimeout(() => {
                    captureBtn.disabled = false;
                    
                    if (btnIcon) btnIcon.textContent = '🚀';
                    if (btnText) btnText.textContent = 'Capturar con Nexus AI';
                }, 2000);
            }
        });
    }
    
    // Manejar click en configuración - SOLO si existe
    if (configBtn) {
        configBtn.addEventListener('click', () => {
            // Por ahora, mostrar alerta ya que no hay página de opciones
            alert('⚙️ Configuración\n\nLas opciones de configuración estarán disponibles pronto.');
            
            // Si quieres abrir la página de opciones cuando la crees:
            // chrome.runtime.openOptionsPage();
        });
    }
    
    // Manejar click en dashboard - SOLO si existe
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Verificar si el archivo existe antes de abrirlo
            const dashboardUrl = chrome.runtime.getURL('dashboard.html');
            
            // Intentar abrir el dashboard
            fetch(dashboardUrl)
                .then(() => {
                    // Si existe, abrirlo
                    chrome.tabs.create({ url: dashboardUrl });
                })
                .catch(() => {
                    // Si no existe, abrir el index.html de public o mostrar mensaje
                    const publicUrl = chrome.runtime.getURL('public/index.html');
                    chrome.tabs.create({ url: publicUrl });
                });
        });
    }
    
    // Inicializar
    await checkCurrentPage();
    await loadRecentCaptures();
    
    // Actualizar cada 2 segundos si el popup está abierto
    const updateInterval = setInterval(() => {
        checkCurrentPage();
        loadRecentCaptures();
    }, 2000);
    
    // Limpiar el intervalo cuando se cierre el popup
    window.addEventListener('unload', () => {
        clearInterval(updateInterval);
    });
});

// Escuchar mensajes del background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Mensaje recibido en popup:', request.type);
    
    if (request.type === 'CAPTURE_COMPLETE') {
        // Recargar las capturas cuando se complete una nueva
        const capturesList = document.getElementById('captures-list');
        if (capturesList) {
            loadRecentCaptures();
        }
    }
    
    // Importante: devolver true si la respuesta es asíncrona
    return true;
});