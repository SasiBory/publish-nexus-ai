// options.js

document.addEventListener('DOMContentLoaded', () => {
    const optionsForm = document.getElementById('options-form');
    const apiUrlInput = document.getElementById('api-url');
    const apiKeyInput = document.getElementById('api-key');
    const statusMessage = document.getElementById('status-message');
    
    // --- NUEVOS ELEMENTOS ---
    const testConnectionBtn = document.getElementById('test-connection-btn');
    const testStatusMessage = document.getElementById('test-status-message');

    // Cargar las opciones guardadas al iniciar
    function loadOptions() {
        // Usamos chrome.storage.sync para que las opciones se sincronicen en la cuenta de Google del usuario
        chrome.storage.sync.get(['apiUrl', 'apiKey'], (items) => {
            if (items.apiUrl) {
                apiUrlInput.value = items.apiUrl;
            } else {
                // Valor por defecto si no hay nada guardado
                apiUrlInput.value = 'https://publish-nexus-api.vercel.app/api/capture';
            }
            if (items.apiKey) {
                apiKeyInput.value = items.apiKey;
            }
        });
    }

    // Guardar las opciones
    function saveOptions(e) {
        e.preventDefault();
        const apiUrl = apiUrlInput.value;
        const apiKey = apiKeyInput.value;

        chrome.storage.sync.set({
            apiUrl: apiUrl,
            apiKey: apiKey
        }, () => {
            // Mostrar mensaje de éxito
            statusMessage.textContent = '¡Configuración guardada exitosamente!';
            statusMessage.className = 'status-message success';
            statusMessage.style.display = 'block';

            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 3000);
        });
    }

    // --- NUEVA FUNCIÓN ---
    // Probar la conexión a la API
    function testConnection() {
        const apiUrl = apiUrlInput.value;
        const apiKey = apiKeyInput.value;

        testStatusMessage.textContent = 'Probando conexión...';
        testStatusMessage.className = 'status-message info';
        testStatusMessage.style.display = 'block';

        chrome.runtime.sendMessage({
            type: 'TEST_CONNECTION',
            payload: { apiUrl, apiKey }
        }, (response) => {
            if (chrome.runtime.lastError) {
                testStatusMessage.textContent = `Error: ${chrome.runtime.lastError.message}`;
                testStatusMessage.className = 'status-message error';
                return;
            }

            if (response.success) {
                testStatusMessage.textContent = `✅ ${response.message}`;
                testStatusMessage.className = 'status-message success';
            } else {
                testStatusMessage.textContent = `❌ Error: ${response.error}`;
                testStatusMessage.className = 'status-message error';
            }
        });
    }

    optionsForm.addEventListener('submit', saveOptions);
    // --- NUEVO LISTENER ---
    testConnectionBtn.addEventListener('click', testConnection);

    // Carga inicial
    loadOptions();
});
