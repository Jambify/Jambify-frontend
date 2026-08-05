function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const num = parseInt(hex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}
function rgbToHex(r,g,b){
  return '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
}
function luminance([r,g,b]){
  const a = [r,g,b].map((v)=>{
    v = v/255;
    return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4);
  });
  return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];
}
function contrastAgainstWhite(hex){
  const L = luminance(hexToRgb(hex));
  return (1+0.05)/(L+0.05);
}

const start = '#8e88a9';
const target = 4.5;
let rgb = hexToRgb(start);
let factor = 1.0;
let best = start;
for(let i=0;i<100;i++){
  factor -= 0.01; // darken gradually
  const nr = Math.max(0, Math.round(rgb[0]*factor));
  const ng = Math.max(0, Math.round(rgb[1]*factor));
  const nb = Math.max(0, Math.round(rgb[2]*factor));
  const hex = rgbToHex(nr,ng,nb);
  const c = contrastAgainstWhite(hex);
  if(c>=target){
    console.log('found', hex, c.toFixed(2));
    process.exit(0);
  }
}
console.log('not found by simple scaling');
