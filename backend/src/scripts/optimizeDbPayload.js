require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const sharp = require('sharp');

const Category = require('../models/Category');
const Food = require('../models/Food');

async function optimizeBase64(base64Str, maxWidth = 400, quality = 75) {
  if (!base64Str || !base64Str.startsWith('data:image')) return base64Str;
  const matches = base64Str.match(/^data:image\/([a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return base64Str;

  try {
    const buffer = Buffer.from(matches[2], 'base64');
    const optimizedBuffer = await sharp(buffer)
      .resize({ width: maxWidth, withoutEnlargement: true, fit: 'inside' })
      .webp({ quality, effort: 4 })
      .toBuffer();
    return `data:image/webp;base64,${optimizedBuffer.toString('base64')}`;
  } catch (err) {
    console.error('Error optimizing base64:', err.message);
    return base64Str;
  }
}

async function runOptimization() {
  console.log('--- STARTING HIGH PERFORMANCE DATABASE OPTIMIZATION ---');
  await mongoose.connect(process.env.MONGODB_URI);

  // 1. Optimize Categories
  const categories = await Category.find();
  console.log(`Optimizing ${categories.length} Categories...`);
  for (const cat of categories) {
    if (cat.image && cat.image.startsWith('data:image')) {
      const oldLen = cat.image.length;
      const newImg = await optimizeBase64(cat.image, 400, 75);
      await Category.updateOne({ _id: cat._id }, { $set: { image: newImg } });
      console.log(`Cat: "${cat.name}" | Old: ${(oldLen/1024).toFixed(1)} KB -> New: ${(newImg.length/1024).toFixed(1)} KB`);
    }
  }

  // 2. Optimize Foods
  const foods = await Food.find();
  console.log(`\nOptimizing ${foods.length} Foods...`);
  let updatedFoods = 0;
  for (const f of foods) {
    if (f.image && f.image.startsWith('data:image')) {
      const oldLen = f.image.length;
      const newImg = await optimizeBase64(f.image, 400, 75);
      await Food.updateOne({ _id: f._id }, { $set: { image: newImg } });
      updatedFoods++;
      if (oldLen > 100000) {
        console.log(`Food: "${f.name}" | Old: ${(oldLen/1024).toFixed(1)} KB -> New: ${(newImg.length/1024).toFixed(1)} KB`);
      }
    }
  }
  console.log(`Updated ${updatedFoods} foods with ultra-compact WebP images.`);

  // Verify total payload size
  const allFoods = await Food.find().populate('category', 'name slug').lean();
  const totalKB = (JSON.stringify(allFoods).length / 1024).toFixed(2);
  console.log(`\n✅ Final Complete Foods Dataset Size: ${totalKB} KB (Was 42,599 KB!)`);

  await mongoose.disconnect();
}

runOptimization();
