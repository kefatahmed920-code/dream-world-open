const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 calculation table for PNG chunks
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function generatePng(width, height, isMaskable = false) {
  const bytesPerPixel = 4;
  const rawScanlineLength = width * bytesPerPixel + 1; // 1 byte filter type
  const rawBuffer = Buffer.alloc(rawScanlineLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const r = width / 2;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rawScanlineLength;
    rawBuffer[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default deep emerald/slate background
      let red = 2;
      let green = 44;
      let blue = 34;
      let alpha = 255;

      // Inner circular gradient
      if (dist < r * 0.95) {
        const factor = dist / (r * 0.95);
        red = Math.floor(6 + factor * 10);
        green = Math.floor(78 - factor * 30);
        blue = Math.floor(59 - factor * 25);
      }

      // Outer gold ring
      if (Math.abs(dist - r * 0.82) < (width > 200 ? 5 : 2)) {
        red = 245;
        green = 158;
        blue = 11;
      }

      // Center mountain triangle / stylized emblem
      const mtnBaseY = cy + r * 0.35;
      const mtnTopY = cy - r * 0.35;
      const mtnHalfW = r * 0.45;
      if (y >= mtnTopY && y <= mtnBaseY) {
        const progress = (y - mtnTopY) / (mtnBaseY - mtnTopY);
        const curHalfW = progress * mtnHalfW;
        if (Math.abs(dx) <= curHalfW) {
          // Emerald mountain with river cut
          red = 16;
          green = 185;
          blue = 129;

          // Inner river slice
          if (Math.abs(dx - Math.sin(progress * Math.PI) * 15) < curHalfW * 0.3) {
            red = 2;
            green = 132;
            blue = 199;
          }
        }
      }

      // Red Sun / Jewel in center
      const sunDist = Math.sqrt(dx * dx + (dy - (cy - r * 0.45)) * (dy - (cy - r * 0.45)));
      if (sunDist < r * 0.12) {
        red = 225;
        green = 29;
        blue = 72;
      }

      // Safe zone maskable styling if requested
      if (isMaskable) {
        // Maskable icon must have solid background bleed all the way to border
        // which we already have!
      }

      rawBuffer[pxOffset] = red;
      rawBuffer[pxOffset + 1] = green;
      rawBuffer[pxOffset + 2] = blue;
      rawBuffer[pxOffset + 3] = alpha;
    }
  }

  const deflated = zlib.deflateSync(rawBuffer);

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. pwa-192x192.png
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePng(192, 192));
console.log('Generated pwa-192x192.png');

// 2. pwa-512x512.png
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePng(512, 512));
console.log('Generated pwa-512x512.png');

// 3. pwa-maskable-512x512.png
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePng(512, 512, true));
console.log('Generated pwa-maskable-512x512.png');

// 4. apple-touch-icon.png (180x180)
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePng(180, 180));
console.log('Generated apple-touch-icon.png');

// 5. favicon.ico (64x64)
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generatePng(64, 64));
console.log('Generated favicon.ico');
