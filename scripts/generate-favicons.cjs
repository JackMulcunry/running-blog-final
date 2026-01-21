const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, '../public/6AMKICK.png');
const outputDir = path.join(__dirname, '../public');

async function generateFavicons() {
  console.log('Generating favicons from', inputPath);

  // Generate PNG favicons at different sizes
  const sizes = [
    { size: 32, name: 'favicon-32x32.png' },
    { size: 192, name: 'favicon-192.png' },
    { size: 512, name: 'favicon-512.png' },
    { size: 180, name: 'apple-touch-icon.png' }
  ];

  for (const { size, name } of sizes) {
    await sharp(inputPath)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(outputDir, name));
    console.log(`Created ${name} (${size}x${size})`);
  }

  // Generate favicon.ico (16x16, 32x32, 48x48 embedded)
  // Since sharp doesn't directly support ICO, we'll create a 32x32 PNG
  // and use it as the primary favicon with the .ico extension
  // Most modern browsers support PNG favicons, but for true ICO support
  // we'll create multiple size PNGs and note that browsers will use the PNG links

  // Create a 48x48 version for ICO-like usage
  await sharp(inputPath)
    .resize(48, 48, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(outputDir, 'favicon-48x48.png'));
  console.log('Created favicon-48x48.png (48x48)');

  // Create 16x16 version
  await sharp(inputPath)
    .resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(outputDir, 'favicon-16x16.png'));
  console.log('Created favicon-16x16.png (16x16)');

  // For favicon.ico, we'll create a proper ICO file using the PNG data
  // ICO format: header + directory entries + image data
  const ico16 = await sharp(inputPath)
    .resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const ico32 = await sharp(inputPath)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const ico48 = await sharp(inputPath)
    .resize(48, 48, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  // Create ICO file manually
  const icoBuffer = createIco([
    { width: 16, height: 16, data: ico16.data },
    { width: 32, height: 32, data: ico32.data },
    { width: 48, height: 48, data: ico48.data }
  ]);

  fs.writeFileSync(path.join(outputDir, 'favicon.ico'), icoBuffer);
  console.log('Created favicon.ico (16x16, 32x32, 48x48)');

  console.log('\nAll favicons generated successfully!');
}

// Create ICO file from raw RGBA data
function createIco(images) {
  const numImages = images.length;

  // ICO Header: 6 bytes
  // Directory entries: 16 bytes each
  // Image data follows

  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * numImages;

  // Calculate BMP sizes for each image
  const bmpInfos = images.map(img => {
    const { width, height, data } = img;
    // BMP header is 40 bytes (BITMAPINFOHEADER)
    // Pixel data: width * height * 4 (BGRA)
    // AND mask: ((width + 31) >> 5) * 4 * height bytes
    const rowSize = width * 4;
    const andMaskRowSize = Math.ceil(width / 8);
    const andMaskPaddedRowSize = Math.ceil(andMaskRowSize / 4) * 4;
    const andMaskSize = andMaskPaddedRowSize * height;
    const bmpSize = 40 + rowSize * height + andMaskSize;
    return { width, height, data, bmpSize, andMaskSize, andMaskPaddedRowSize };
  });

  // Calculate offsets
  let offset = headerSize + dirSize;
  const offsets = bmpInfos.map(info => {
    const currentOffset = offset;
    offset += info.bmpSize;
    return currentOffset;
  });

  const totalSize = offset;
  const buffer = Buffer.alloc(totalSize);

  // Write ICO header
  buffer.writeUInt16LE(0, 0);      // Reserved
  buffer.writeUInt16LE(1, 2);      // Type: 1 = ICO
  buffer.writeUInt16LE(numImages, 4); // Number of images

  // Write directory entries
  for (let i = 0; i < numImages; i++) {
    const info = bmpInfos[i];
    const entryOffset = headerSize + i * dirEntrySize;

    buffer.writeUInt8(info.width === 256 ? 0 : info.width, entryOffset);      // Width
    buffer.writeUInt8(info.height === 256 ? 0 : info.height, entryOffset + 1); // Height
    buffer.writeUInt8(0, entryOffset + 2);   // Color palette
    buffer.writeUInt8(0, entryOffset + 3);   // Reserved
    buffer.writeUInt16LE(1, entryOffset + 4); // Color planes
    buffer.writeUInt16LE(32, entryOffset + 6); // Bits per pixel
    buffer.writeUInt32LE(info.bmpSize, entryOffset + 8); // Size of image data
    buffer.writeUInt32LE(offsets[i], entryOffset + 12);  // Offset to image data
  }

  // Write image data (BMP format)
  for (let i = 0; i < numImages; i++) {
    const info = bmpInfos[i];
    const imgOffset = offsets[i];
    const { width, height, data } = info;

    // BITMAPINFOHEADER (40 bytes)
    buffer.writeUInt32LE(40, imgOffset);           // Header size
    buffer.writeInt32LE(width, imgOffset + 4);     // Width
    buffer.writeInt32LE(height * 2, imgOffset + 8); // Height (doubled for XOR + AND masks)
    buffer.writeUInt16LE(1, imgOffset + 12);       // Planes
    buffer.writeUInt16LE(32, imgOffset + 14);      // Bits per pixel
    buffer.writeUInt32LE(0, imgOffset + 16);       // Compression
    buffer.writeUInt32LE(0, imgOffset + 20);       // Image size (can be 0 for uncompressed)
    buffer.writeInt32LE(0, imgOffset + 24);        // X pixels per meter
    buffer.writeInt32LE(0, imgOffset + 28);        // Y pixels per meter
    buffer.writeUInt32LE(0, imgOffset + 32);       // Colors used
    buffer.writeUInt32LE(0, imgOffset + 36);       // Important colors

    // Pixel data (BGRA, bottom-up)
    const pixelOffset = imgOffset + 40;
    for (let y = height - 1; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const dstIdx = pixelOffset + ((height - 1 - y) * width + x) * 4;

        // RGBA to BGRA
        buffer.writeUInt8(data[srcIdx + 2], dstIdx);     // B
        buffer.writeUInt8(data[srcIdx + 1], dstIdx + 1); // G
        buffer.writeUInt8(data[srcIdx], dstIdx + 2);     // R
        buffer.writeUInt8(data[srcIdx + 3], dstIdx + 3); // A
      }
    }

    // AND mask (all zeros for fully opaque, based on alpha)
    const andMaskOffset = pixelOffset + width * height * 4;
    for (let y = height - 1; y >= 0; y--) {
      for (let byteX = 0; byteX < info.andMaskPaddedRowSize; byteX++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          const x = byteX * 8 + bit;
          if (x < width) {
            const srcIdx = (y * width + x) * 4 + 3; // Alpha channel
            if (data[srcIdx] < 128) {
              byte |= (0x80 >> bit); // Transparent pixel
            }
          }
        }
        const dstIdx = andMaskOffset + (height - 1 - y) * info.andMaskPaddedRowSize + byteX;
        buffer.writeUInt8(byte, dstIdx);
      }
    }
  }

  return buffer;
}

generateFavicons().catch(console.error);
