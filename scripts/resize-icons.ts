import sharp from 'sharp';
import { resolve } from 'path';

const STATIC_DIR = resolve('static');
const INPUT = resolve(STATIC_DIR, 'logo.png');
const SIZES = [16, 32, 48, 128];

async function main(): Promise<void> {
  for (const size of SIZES) {
    const output = resolve(STATIC_DIR, `icon-${size}.png`);
    await sharp(INPUT).resize(size, size).png().toFile(output);
    console.log(`generated icon-${size}.png`);
  }
}

main();
