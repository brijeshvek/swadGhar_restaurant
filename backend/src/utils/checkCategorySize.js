require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Category = require('../models/Category');
  
  // Test without sort
  const catsNoSort = await Category.find({}).lean();
  console.log('Category.find({}) without sort count:', catsNoSort.length);

  let totalSize = 0;
  catsNoSort.forEach(c => {
    const imgLen = c.image ? c.image.length : 0;
    const isBase64 = c.image && c.image.startsWith('data:');
    totalSize += imgLen;
    if (imgLen > 1000) {
      console.log(`Large Category: "${c.name}", imgLen: ${imgLen}, isBase64: ${isBase64}`);
    }
  });

  console.log(`Total image size across categories: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  await mongoose.disconnect();
}

check();
