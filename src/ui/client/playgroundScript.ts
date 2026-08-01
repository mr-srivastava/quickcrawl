/** Inline browser script for the crawl playground (injected via HomePage). */
export const PLAYGROUND_SCRIPT = `
(function () {
  const form = document.getElementById('playground-form');
  const urlInput = document.getElementById('url-input');
  const submitBtn = document.getElementById('crawl-btn');
  const statusEl = document.getElementById('playground-status');
  const loadingEl = document.getElementById('playground-loading');
  const errorEl = document.getElementById('playground-error');
  const resultsEl = document.getElementById('playground-results');
  const chips = document.querySelectorAll('[data-example-url]');

  if (!form || !urlInput || !submitBtn) return;

  let activeTab = 'preview';
  const idleButtonLabel = submitBtn.innerHTML;

  function showPanel(tab) {
    document.querySelectorAll('[data-tab]').forEach(function (b) {
      const isActive = b.getAttribute('data-tab') === tab;
      b.classList.toggle('tab-active', isActive);
      b.setAttribute('aria-selected', isActive ? 'true' : 'false');
      b.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    document.querySelectorAll('[data-panel]').forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-panel') !== tab;
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      const url = chip.getAttribute('data-example-url');
      if (url) {
        urlInput.value = url;
        urlInput.focus();
      }
    });
  });

  document.querySelectorAll('[data-tab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const tab = btn.getAttribute('data-tab');
      if (!tab) return;
      activeTab = tab;
      showPanel(tab);
    });
    btn.addEventListener('keydown', function (event) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const tabs = Array.from(document.querySelectorAll('[data-tab]'));
      const currentIndex = tabs.indexOf(btn);
      let nextIndex = currentIndex;
      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      const nextTab = tabs[nextIndex];
      const tab = nextTab && nextTab.getAttribute('data-tab');
      if (!tab) return;
      event.preventDefault();
      activeTab = tab;
      showPanel(tab);
      nextTab.focus();
    });
  });

  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = btn.getAttribute('data-copy');
      const el = targetId ? document.getElementById(targetId) : null;
      if (!el) return;
      const text = el.textContent || '';
      navigator.clipboard.writeText(text).then(
        function () {
          const label = btn.innerHTML;
          btn.innerHTML = 'Copied';
          btn.setAttribute('aria-live', 'polite');
          setTimeout(function () {
            btn.innerHTML = label;
            btn.removeAttribute('aria-live');
          }, 1500);
        },
        function () { /* clipboard unavailable */ },
      );
    });
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    errorEl.hidden = true;
    errorEl.textContent = '';
    resultsEl.hidden = true;
    resultsEl.classList.remove('results-reveal');
    if (loadingEl) loadingEl.hidden = false;
    statusEl.hidden = true;
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.textContent = 'Extracting…';

    try {
      const res = await fetch('/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const retryAfter = res.headers.get('Retry-After');
      let body;
      try {
        body = await res.json();
      } catch (_) {
        throw new Error('Invalid response from server');
      }

      if (res.status === 429) {
        const secs = retryAfter ? parseInt(retryAfter, 10) : 60;
        throw new Error('Rate limit exceeded. Try again in ' + secs + ' seconds.');
      }

      if (res.status === 422) {
        const details = body.error?.details;
        const issues = details ? JSON.stringify(details, null, 2) : body.error?.message || 'Invalid URL';
        throw new Error('Validation failed: ' + issues);
      }

      if (!res.ok || body.success === false) {
        const msg = body.error?.message || body.error || 'Crawl failed';
        throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      const data = body.data;
      document.getElementById('result-title').textContent = data.title || '(no title)';

      const md = data.markdown || '';
      document.getElementById('markdown-raw').textContent = md;
      document.getElementById('json-raw').textContent = JSON.stringify(body, null, 2);

      const metaEl = document.getElementById('metadata-body');
      metaEl.innerHTML = '';
      if (data.metadata && typeof data.metadata === 'object') {
        Object.entries(data.metadata).forEach(function (entry) {
          const row = document.createElement('tr');
          const k = document.createElement('th');
          k.textContent = entry[0];
          const v = document.createElement('td');
          v.textContent = String(entry[1] ?? '');
          row.appendChild(k);
          row.appendChild(v);
          metaEl.appendChild(row);
        });
      } else {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 2;
        cell.textContent = 'No metadata extracted';
        row.appendChild(cell);
        metaEl.appendChild(row);
      }

      const previewEl = document.getElementById('markdown-preview');
      if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
        const raw = marked.parse(md, { async: false });
        previewEl.innerHTML = DOMPurify.sanitize(raw);
      } else {
        previewEl.textContent = md;
      }

      if (loadingEl) loadingEl.hidden = true;
      resultsEl.hidden = false;
      resultsEl.classList.add('results-reveal');
      showPanel(activeTab);
      statusEl.textContent = 'Extraction complete. Result views are ready below.';
      statusEl.hidden = false;
      resultsEl.focus({ preventScroll: true });
    } catch (err) {
      if (loadingEl) loadingEl.hidden = true;
      errorEl.hidden = false;
      errorEl.textContent = err instanceof Error ? err.message : String(err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      submitBtn.innerHTML = idleButtonLabel;
    }
  });
})();
`.trim();
