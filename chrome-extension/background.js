// background.js (manifest v3 service worker)
const DAILY_LIMIT = 150; // tu tope por día (ajustable)
const API_SEND_URL = 'https://api.publishnexus.ai/v1/capture'; // ajustar

/* ----- Helpers storage (promises) ----- */
function storageGet(keys) {
  return new Promise(resolve => chrome.storage.sync.get(keys, res => resolve(res || {})));
}
function storageSet(obj) {
  return new Promise(resolve => chrome.storage.sync.set(obj, () => resolve()));
}

/* ----- Fetch with timeout + retries ----- */
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    return await resp.json();
  } finally {
    clearTimeout(id);
  }
}

async function postWithRetries(url, body, attempts = 2) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }, 10000);
    } catch (e) {
      lastErr = e;
      // backoff simple
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastErr;
}

/* ----- Rate limiting local por día ----- */
async function canCapture() {
  const now = new Date();
  const today = now.toISOString().slice(0,10); // YYYY-MM-DD
  const store = await storageGet(['captures_day', 'captures_date']);
  let { captures_day = 0, captures_date = null } = store;
  if (captures_date !== today) {
    // reset diario
    captures_day = 0;
    captures_date = today;
    await storageSet({ captures_day, captures_date });
  }
  return { allowed: captures_day < DAILY_LIMIT, captures_day, captures_date };
}
async function incrCaptureCount() {
  const store = await storageGet(['captures_day', 'captures_date']);
  const today = new Date().toISOString().slice(0,10);
  let { captures_day = 0, captures_date = today } = store;
  if (captures_date !== today) { captures_day = 0; captures_date = today; }
  captures_day++;
  await storageSet({ captures_day, captures_date });
}

/* ----- Capture flow: llamado por click (user-initiated) ----- */
chrome.action.onClicked.addListener(async (tab) => {
  try {
    const { consent } = await storageGet(['consent']);
    if (!consent) {
      chrome.notifications.create({ type: 'basic', iconUrl: 'icons/48.png', title: 'Publish Nexus', message: 'Primero debés aceptar la política de privacidad en las opciones.' });
      return;
    }

    const rl = await canCapture();
    if (!rl.allowed) {
      chrome.notifications.create({ type: 'basic', iconUrl: 'icons/48.png', title: 'Límite alcanzado', message: `Has alcanzado el límite diario (${DAILY_LIMIT}) de capturas.` });
      return;
    }

    // Ejecutar script de captura en la pestaña activa (solo con user click)
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const get = sel => document.querySelector(sel)?.innerText?.trim() || '';
        // intentar varios selectores comunes
        const title = get('#productTitle') || get('.product-title') || get('h1');
        const asinMatch = location.pathname.match(/\/dp\/([^/]+)/) || location.search.match(/ASIN=([^&]+)/);
        const asin = asinMatch ? asinMatch[1] : '';
        const price = get('#priceblock_ourprice') || get('#priceblock_dealprice') || get('.price');
        const rating = get('#acrPopover') || get('.averageStarRating');
        const reviews = get('#acrCustomerReviewText') || get('.reviewsCount');
        // devolver un objeto con los datos que quieras
        return { title, asin, price, rating, reviews, url: location.href };
      }
    });

    const data = results?.[0]?.result || {};
    if (!data || !data.asin) {
      chrome.notifications.create({ type: 'basic', iconUrl: 'icons/48.png', title: 'No se detectó producto', message: 'No se pudo extraer datos del producto en esta página.' });
      return;
    }

    // opcional: añadir metadata local (usuario, timestamp)
    data.captured_at = new Date().toISOString();

    // enviar al servidor
    try {
      await postWithRetries(API_SEND_URL, data, 2);
      await incrCaptureCount();
      chrome.notifications.create({ type: 'basic', iconUrl: 'icons/48.png', title: 'Captura enviada', message: 'Datos enviados correctamente a Publish Nexus AI.' });
    } catch (err) {
      console.error('Error al enviar', err);
      chrome.notifications.create({ type: 'basic', iconUrl: 'icons/48.png', title: 'Error al enviar', message: 'No se pudo enviar al servidor. Intentá de nuevo.' });
    }
  } catch (e) {
    console.error('Error captura', e);
  }
});