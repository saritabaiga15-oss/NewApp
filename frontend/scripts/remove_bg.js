// Script to remove black background from logo image using jimp v1
const { Jimp } = require('jimp');

const SRC = 'C:/Users/admin/.gemini/antigravity/brain/e62ef96b-0945-4ef6-baa4-684d10c50c45/.user_uploaded/media_1793868532974_5d402875.png';

const DEST_FILES = [
  'D:/ReactNativeProjects/MyNewApp/assets/images/logo_transparent.png',
  'D:/ReactNativeProjects/MyNewApp/assets/images/logo.png',
  'D:/ReactNativeProjects/MyNewApp/assets/images/logo_clean.png',
  'D:/ReactNativeProjects/MyNewApp/assets/images/login-logo.png',
  'D:/ReactNativeProjects/MyNewApp/assets/images/login-logo-clean.png',
];

const THRESHOLD = 50;
const EDGE_THRESHOLD = 85;

(async () => {
  try {
    const img = await Jimp.read(SRC);
    console.log('Image loaded:', img.width, 'x', img.height);

    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const hex = img.getPixelColor(x, y);
        const r = (hex >>> 24) & 0xff;
        const g = (hex >>> 16) & 0xff;
        const b = (hex >>> 8) & 0xff;

        if (r < THRESHOLD && g < THRESHOLD && b < THRESHOLD) {
          img.setPixelColor(0x00000000, x, y);
        } else if (r < EDGE_THRESHOLD && g < EDGE_THRESHOLD && b < EDGE_THRESHOLD) {
          const darkness = Math.max(r, g, b);
          const alpha = Math.round((darkness / EDGE_THRESHOLD) * 255);
          const newHex = ((r << 24) | (g << 16) | (b << 8) | alpha) >>> 0;
          img.setPixelColor(newHex, x, y);
        }
      }
    }

    for (const dest of DEST_FILES) {
      await img.write(dest);
      console.log('Saved:', dest);
    }
    console.log('\n✅ Background removed successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
  }
})();
