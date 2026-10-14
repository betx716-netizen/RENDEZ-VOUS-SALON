const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Encode a pure PNG file in Node without external dependencies
function createPng(width, height, drawFn) {
  // RGBA buffer with filter byte per scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crcData = buf.subarray(4, 8 + len);
  const crc = crc32(crcData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// CRC32 implementation
const crcTable = new Uint32Array(256);
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

// Drawing function for RDV Salon Monogram R
function drawIcon(x, y, w, h, isMaskable) {
  // Background: #BE185D (190, 24, 93)
  const bg = [190, 24, 93, 255];
  const white = [255, 255, 255, 255];
  const gold = [212, 162, 76, 255];

  // Coordinate normalization to [-1, 1]
  const scale = isMaskable ? 0.6 : 0.75;
  const cx = w / 2;
  const cy = h / 2;
  const nx = ((x - cx) / (w / 2)) / scale;
  const ny = ((y - cy) / (h / 2)) / scale;

  // Draw Monogram "R"
  // 1. Vertical stem: nx in [-0.55, -0.32], ny in [-0.65, 0.65]
  if (nx >= -0.52 && nx <= -0.32 && ny >= -0.65 && ny <= 0.65) {
    return white;
  }

  // 2. Rounded loop: center around (-0.05, -0.2), outer radius ~0.45, inner radius ~0.26
  const loopDist = Math.hypot(nx - (-0.32), ny - (-0.2));
  if (nx >= -0.32 && loopDist >= 0.22 && loopDist <= 0.44 && ny <= 0.25) {
    return white;
  }

  // Top bar connecting to stem
  if (nx >= -0.35 && nx <= 0.1 && ny >= -0.65 && ny <= -0.44) {
    return white;
  }
  // Middle bar connecting to stem
  if (nx >= -0.35 && nx <= 0.1 && ny >= -0.05 && ny <= 0.16) {
    return white;
  }

  // 3. Diagonal scissor leg: from (-0.1, 0.05) to (0.45, 0.65)
  // Distance to line segment from (-0.1, 0.05) to (0.45, 0.65)
  const lx1 = -0.1, ly1 = 0.05, lx2 = 0.45, ly2 = 0.65;
  const dx = lx2 - lx1, dy = ly2 - ly1;
  const t = Math.max(0, Math.min(1, ((nx - lx1) * dx + (ny - ly1) * dy) / (dx * dx + dy * dy)));
  const projX = lx1 + t * dx;
  const projY = ly1 + t * dy;
  const legDist = Math.hypot(nx - projX, ny - projY);
  if (legDist <= 0.11) {
    return white;
  }

  // 4. Gold pivot dot: center at (-0.05, 0.05), radius 0.08
  const pivotDist = Math.hypot(nx - (-0.05), ny - 0.05);
  if (pivotDist <= 0.08) {
    return gold;
  }

  return bg;
}

const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate files
const icon192 = createPng(192, 192, (x, y, w, h) => drawIcon(x, y, w, h, false));
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), icon192);

const icon512 = createPng(512, 512, (x, y, w, h) => drawIcon(x, y, w, h, false));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), icon512);

const icon512Maskable = createPng(512, 512, (x, y, w, h) => drawIcon(x, y, w, h, true));
fs.writeFileSync(path.join(iconsDir, 'icon-512-maskable.png'), icon512Maskable);

const apple180 = createPng(180, 180, (x, y, w, h) => drawIcon(x, y, w, h, false));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon-180.png'), apple180);
fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.png'), apple180);

console.log('Successfully generated all PWA PNG icons!');
