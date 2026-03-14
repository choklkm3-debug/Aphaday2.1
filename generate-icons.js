// Gera os ícones PWA em canvas e salva como PNG no cache
(function generateIcons() {
  const sizes = [192, 512];
  sizes.forEach(size => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Fundo
    ctx.fillStyle = '#1a1a1a';
    roundRect(ctx, 0, 0, size, size, size * 0.18);
    ctx.fill();

    // Letra "d"
    ctx.fillStyle = '#f7f7f5';
    ctx.font = `bold ${size * 0.52}px 'Inter', 'Segoe UI', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('d', size / 2, size / 2 + size * 0.04);

    canvas.toBlob(blob => {
      if (!blob) return;
      const url = `icons/icon-${size}.png`;
      caches.open('diario-v1').then(cache => {
        cache.put(new Request(url), new Response(blob, { headers: { 'Content-Type': 'image/png' } }));
      });
    }, 'image/png');
  });

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
})();
