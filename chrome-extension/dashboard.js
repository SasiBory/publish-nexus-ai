// dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const capturesTbody = document.getElementById('captures-tbody');
    const emptyState = document.getElementById('empty-state');
    const totalCapturesEl = document.getElementById('total-captures');
    const todayCapturesEl = document.getElementById('today-captures');
    const mainCategoryEl = document.getElementById('main-category');
    const clearDataBtn = document.getElementById('clear-data-btn');

    function renderTable(captures) {
        if (!captures || captures.length === 0) {
            emptyState.style.display = 'block';
            capturesTbody.innerHTML = '';
            return;
        }

        emptyState.style.display = 'none';
        capturesTbody.innerHTML = captures.map(capture => {
            const title = capture.title ? capture.title.substring(0, 60) + (capture.title.length > 60 ? '...' : '') : 'Sin título';
            const price = capture.price ? `${capture.currency || '$'}${capture.price}` : 'N/A';
            const bsr = capture.bsr?.rank ? `#${capture.bsr.rank.toLocaleString()}` : 'N/A';
            const rating = capture.rating ? `⭐ ${capture.rating} (${capture.reviewCount || 0})` : 'N/A';
            const date = new Date(capture.timestamp).toLocaleDateString('es-ES');

            return `
                <tr>
                    <td title="${capture.title || ''}">${title}</td>
                    <td>${capture.asin || 'N/A'}</td>
                    <td>${price}</td>
                    <td title="${capture.bsr?.category || ''}">${bsr}</td>
                    <td>${rating}</td>
                    <td>${date}</td>
                    <td>
                        <a href="${capture.url}" target="_blank" class="btn-action view">Ver</a>
                        <button class="btn-action delete" data-id="${capture.id}">Borrar</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function updateStats(captures) {
        totalCapturesEl.textContent = captures.length;

        const today = new Date().toDateString();
        const todayCapturesCount = captures.filter(c => new Date(c.timestamp).toDateString() === today).length;
        todayCapturesEl.textContent = todayCapturesCount;

        if (captures.length > 0) {
            const categories = captures.map(c => c.bsr?.category).filter(Boolean);
            const categoryCounts = categories.reduce((acc, cat) => {
                acc[cat] = (acc[cat] || 0) + 1;
                return acc;
            }, {});
            const mainCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];
            mainCategoryEl.textContent = mainCategory || 'N/A';
        } else {
            mainCategoryEl.textContent = 'N/A';
        }
    }

    function loadCaptures() {
        chrome.runtime.sendMessage({ type: 'GET_CAPTURES' }, response => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
            if (response && response.captures) {
                const sortedCaptures = response.captures.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                renderTable(sortedCaptures);
                updateStats(sortedCaptures);
            } else {
                renderTable([]);
                updateStats([]);
            }
        });
    }

    function handleDelete(e) {
        if (e.target.classList.contains('delete')) {
            const captureId = e.target.dataset.id;
            if (confirm(`¿Estás seguro de que quieres borrar la captura ${captureId}?`)) {
                chrome.runtime.sendMessage({ type: 'GET_CAPTURES' }, response => {
                    if (response && response.captures) {
                        const updatedCaptures = response.captures.filter(c => c.id !== captureId);
                        chrome.storage.local.set({ captures: updatedCaptures }, () => {
                            console.log(`Captura ${captureId} eliminada.`);
                            loadCaptures();
                        });
                    }
                });
            }
        }
    }

    clearDataBtn.addEventListener('click', () => {
        if (confirm('¡ATENCIÓN!\n¿Estás seguro de que quieres borrar TODAS las capturas de forma permanente?')) {
            chrome.runtime.sendMessage({ type: 'CLEAR_CAPTURES' }, response => {
                if (response.success) {
                    console.log('Todas las capturas han sido eliminadas.');
                    loadCaptures();
                }
            });
        }
    });

    capturesTbody.addEventListener('click', handleDelete);

    // Carga inicial
    loadCaptures();
});
