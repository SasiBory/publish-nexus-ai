// background.js - Service Worker para Publish Nexus AI
console.log('🚀 Publish Nexus AI - Background Service Worker iniciado');

// Listener para cuando se instala la extensión
chrome.runtime.onInstalled.addListener((details) => {
  console.log('✅ Publish Nexus AI instalado:', details.reason);
  
  // Configurar badge inicial
  chrome.action.setBadgeText({ text: '' });
  chrome.action.setBadgeBackgroundColor({ color: '#FF6D4D' });
  
  // Abrir página de bienvenida solo en instalación nueva
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: 'popup.html'
    });
  }
});

// Listener para mensajes desde content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Mensaje recibido:', request.type);
  
  switch(request.type) {
    case 'TEST_CONNECTION':
      testApiConnection(request.payload).then(response => {
        sendResponse(response);
      });
      return true; // Respuesta asíncrona

    case 'CAPTURE_DATA':
      handleDataCapture(request.data, sender.tab).then(apiResult => {
        sendResponse(apiResult);
      });
      return true; // Indica que la respuesta será asíncrona
      
    case 'GET_CAPTURES':
      getStoredCaptures().then(captures => {
        sendResponse({ captures });
      });
      return true; // Indica que la respuesta será asíncrona
      
    case 'CLEAR_CAPTURES':
      chrome.storage.local.clear(() => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'OPEN_DASHBOARD':
      chrome.tabs.create({
        url: chrome.runtime.getURL('dashboard.html')
      });
      sendResponse({ success: true });
      break;
      
    case 'CHECK_STATUS':
      sendResponse({ 
        status: 'active',
        version: chrome.runtime.getManifest().version
      });
      break;
      
    default:
      console.warn('Tipo de mensaje no reconocido:', request.type);
      sendResponse({ error: 'Unknown message type' });
  }
});

// Manejar captura de datos
async function handleDataCapture(data, tab) {
  try {
    // Guardar en storage local
    const timestamp = Date.now();
    const captureKey = `capture_${timestamp}`;
    
    const captureData = {
      id: captureKey,
      tabId: tab.id,
      tabUrl: tab.url,
      timestamp: new Date(timestamp).toISOString(),
      ...data
    };
    
    // Obtener capturas existentes
    const result = await chrome.storage.local.get(['captures']);
    const captures = result.captures || [];
    
    // Agregar nueva captura
    captures.push(captureData);
    
    // Guardar (limitando a las últimas 100 capturas)
    if (captures.length > 100) {
      captures.shift(); // Eliminar la más antigua
    }
    
    await chrome.storage.local.set({ captures });
    
    // Actualizar badge con contador
    updateBadgeCount(captures.length);
    
    console.log('✅ Datos guardados:', captureKey);

    // Enviar a la API
    const apiResult = await sendToAPI(data);
    return apiResult;
    
  } catch (error) {
    console.error('❌ Error guardando datos:', error);
    return { success: false, error: error.message };
  }
}

// Obtener capturas almacenadas
async function getStoredCaptures() {
  try {
    const result = await chrome.storage.local.get(['captures']);
    return result.captures || [];
  } catch (error) {
    console.error('Error obteniendo capturas:', error);
    return [];
  }
}

// Actualizar contador en el badge
function updateBadgeCount(count) {
  if (count > 0) {
    chrome.action.setBadgeText({ 
      text: count > 99 ? '99+' : count.toString() 
    });
    chrome.action.setBadgeBackgroundColor({ 
      color: '#2ADF5F' 
    });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Función para inyectar y ejecutar captura
function triggerCapture() {
  // Enviar mensaje al content script para capturar
  window.postMessage({ type: 'TRIGGER_CAPTURE' }, '*');
}

// Listener para cuando se activa una pestaña
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    
    // Cambiar color del badge si estamos en Amazon
    if (tab.url && tab.url.includes('amazon')) {
      chrome.action.setBadgeBackgroundColor({ 
        color: '#FF6D4D' 
      });
    } else {
      chrome.action.setBadgeBackgroundColor({ 
        color: '#999999' 
      });
    }
  } catch (error) {
    console.log('Error checking active tab:', error);
  }
});

// Listener para comandos de teclado - Verificar si existe primero
if (chrome.commands && chrome.commands.onCommand) {
  chrome.commands.onCommand.addListener((command) => {
    console.log('Comando recibido:', command);
    
    if (command === 'capture-data') {
      // Obtener pestaña activa y ejecutar captura
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url.includes('amazon')) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: triggerCapture
          });
        }
      });
    }
  });
}

// Mantener el service worker activo (para Manifest V3)
const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();

// Log inicial con información de la extensión
console.log('📦 Publish Nexus AI v' + chrome.runtime.getManifest().version);
console.log('🔧 Service Worker listo y escuchando eventos');

// Inicializar el contador del badge al arrancar
getStoredCaptures().then(captures => updateBadgeCount(captures.length));

// Función para enviar datos a la API
async function sendToAPI(data) {
  console.log('📦 Preparando para enviar a la API:', data);

  try {
    // 1. Obtener configuración guardada por el usuario
    const settings = await chrome.storage.sync.get(['apiUrl', 'apiKey']);
    
    // 2. Usar la URL de la configuración, o una por defecto si no existe
    const apiEndpoint = settings.apiUrl || 'https://publish-nexus-api.vercel.app/api/capture';
    const apiKey = settings.apiKey || null;

    const headers = {
      'Content-Type': 'application/json',
    };

    // 3. Añadir la cabecera de autorización solo si existe una API Key
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });

    // Verificar si la respuesta de la red fue exitosa
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Error del servidor: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const result = await response.json();
    console.log('✅ API respondió:', result);
    
    return { success: true, data: result };

  } catch (error) {
    console.error('❌ Error al enviar datos a la API:', error);
    return { success: false, error: error.message };
  }
}

// Función para probar la conexión con la API
async function testApiConnection({ apiUrl, apiKey }) {
  console.log('🧪 Probando conexión con API:', apiUrl);
  
  if (!apiUrl) {
    return { success: false, error: 'La URL de la API no puede estar vacía.' };
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ test: 'connection' }) // Cuerpo de prueba
    });

    if (response.ok) {
      return { success: true, message: `Conexión exitosa (Estado ${response.status})` };
    } else {
      if (response.status === 401 || response.status === 403) {
         return { success: false, error: `Error de autenticación (Estado ${response.status}). Verifica tu API Key.` };
      }
      return { success: false, error: `El servidor respondió con un error (Estado ${response.status})` };
    }
  } catch (error) {
    console.error('❌ Error en la prueba de conexión:', error);
    if (error instanceof TypeError) {
        return { success: false, error: 'Error de red o CORS. Verifica la URL y la configuración del servidor.' };
    }
    return { success: false, error: error.message };
  }
}
