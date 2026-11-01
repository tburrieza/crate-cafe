// Reemplaza los enlaces por defecto por los que están en Mongo (vía /api/links, cacheado 5 min en Vercel).
// Si falla la red, quedan los enlaces del HTML.

(async () => {
  const nav = document.getElementById('links');
  try {
    const res = await fetch('/api/links', { headers: { accept: 'application/json' } });
    if (!res.ok) return;
    const { links } = await res.json();
    if (!Array.isArray(links) || !links.length) return;

    const items = links.map(({ label, url }) => {
      const a = document.createElement('a');
      a.textContent = label;
      a.href = url;
      if (/^https?:\/\//.test(url) && !url.startsWith(location.origin)) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      return a;
    });
    nav.replaceChildren(...items);
  } catch {
    // sin red: se quedan los enlaces del HTML
  }
})();
