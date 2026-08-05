function luminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v = v / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(hex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function contrast(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const L1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
  const L2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
  const bright = Math.max(L1, L2);
  const dark = Math.min(L1, L2);
  return (bright + 0.05) / (dark + 0.05);
}

const pairs = [
  { name: 'Light: textMain (#1d1730) on bgCard (#ffffff)', a: '#1d1730', b: '#ffffff' },
  { name: 'Light: textMuted (#665f82) on bgCard (#ffffff)', a: '#665f82', b: '#ffffff' },
  { name: 'Light: textDim (#8e88a9) on bgCard (#ffffff)', a: '#8e88a9', b: '#ffffff' },
  { name: 'Dark: textMain (#f6f4ff) on bgCard (#191a3e)', a: '#f6f4ff', b: '#191a3e' },
  { name: 'Dark: textMuted (#b8b4d1) on bgCard (#191a3e)', a: '#b8b4d1', b: '#191a3e' },
  { name: 'Dark: textDim (#8b89a7) on bgCard (#191a3e)', a: '#8b89a7', b: '#191a3e' },
];

pairs.forEach((p) => {
  const c = contrast(p.a, p.b);
  console.log(p.name + ': ' + c.toFixed(2));
});
