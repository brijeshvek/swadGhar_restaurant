require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { convertBase64ToWebp, optimizeUnsplashUrl } = require('../utils/imageOptimizer');

const Category = require('../models/Category');
const Food = require('../models/Food');
const User = require('../models/User');
const Franchise = require('../models/Franchise');
const RestaurantSettings = require('../models/RestaurantSettings');

async function migrateImagesToWebp() {
  console.log('======================================================');
  console.log('[WebP Migration] Starting Database WebP Conversion...');
  console.log('======================================================');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[WebP Migration] Connected to MongoDB');

    // 1. Migrate Categories
    const categories = await Category.find();
    console.log(`\n[WebP Migration] Found ${categories.length} Categories...`);
    let catConverted = 0;

    for (const cat of categories) {
      if (!cat.image) continue;
      const oldImg = cat.image;
      let newImg = oldImg;

      if (oldImg.startsWith('data:image')) {
        console.log(`Converting Base64 image for Category: "${cat.name}" (Length: ${oldImg.length})...`);
        newImg = await convertBase64ToWebp(oldImg, { maxWidth: 800, quality: 80 });
        console.log(`  -> Converted to WebP Base64 (New Length: ${newImg.length}, Saved: ${Math.round((1 - newImg.length / oldImg.length) * 100)}%)`);
      } else if (oldImg.includes('images.unsplash.com')) {
        newImg = optimizeUnsplashUrl(oldImg);
      }

      if (newImg !== oldImg) {
        await Category.updateOne({ _id: cat._id }, { $set: { image: newImg } });
        catConverted++;
      }
    }
    console.log(`[WebP Migration] Completed Categories: ${catConverted}/${categories.length} updated to WebP.`);

    // 2. Migrate Foods
    const foods = await Food.find();
    console.log(`\n[WebP Migration] Found ${foods.length} Dishes/Foods...`);
    let foodConverted = 0;

    for (const food of foods) {
      if (!food.image) continue;
      const oldImg = food.image;
      let newImg = oldImg;

      if (oldImg.startsWith('data:image')) {
        console.log(`Converting Base64 image for Food: "${food.name}" (Length: ${oldImg.length})...`);
        newImg = await convertBase64ToWebp(oldImg, { maxWidth: 800, quality: 80 });
        console.log(`  -> Converted to WebP Base64 (New Length: ${newImg.length})`);
      } else if (oldImg.includes('images.unsplash.com')) {
        newImg = optimizeUnsplashUrl(oldImg);
      }

      if (newImg !== oldImg) {
        await Food.updateOne({ _id: food._id }, { $set: { image: newImg } });
        foodConverted++;
      }
    }
    console.log(`[WebP Migration] Completed Foods: ${foodConverted}/${foods.length} updated to WebP.`);

    // 3. Migrate Users (Avatars)
    const users = await User.find();
    console.log(`\n[WebP Migration] Found ${users.length} Users...`);
    let userConverted = 0;
    for (const user of users) {
      if (!user.avatar) continue;
      let newAvatar = user.avatar;
      if (user.avatar.startsWith('data:image')) {
        newAvatar = await convertBase64ToWebp(user.avatar, { maxWidth: 400, quality: 80 });
      } else if (user.avatar.includes('images.unsplash.com')) {
        newAvatar = optimizeUnsplashUrl(user.avatar);
      }

      if (newAvatar !== user.avatar) {
        await User.updateOne({ _id: user._id }, { $set: { avatar: newAvatar } });
        userConverted++;
      }
    }
    console.log(`[WebP Migration] Completed Users: ${userConverted}/${users.length} updated to WebP.`);

    // 4. Migrate Franchises
    const franchises = await Franchise.find();
    console.log(`\n[WebP Migration] Found ${franchises.length} Franchises...`);
    let franConverted = 0;
    for (const f of franchises) {
      let modified = false;
      let img = f.image;
      if (img && img.includes('images.unsplash.com')) {
        img = optimizeUnsplashUrl(img);
        modified = true;
      }
      let staff = f.staff || [];
      staff = staff.map(s => {
        if (s.avatar && s.avatar.includes('images.unsplash.com')) {
          return { ...s, avatar: optimizeUnsplashUrl(s.avatar) };
        }
        return s;
      });

      if (modified) {
        await Franchise.updateOne({ _id: f._id }, { $set: { image: img, staff } });
        franConverted++;
      }
    }
    console.log(`[WebP Migration] Completed Franchises: ${franConverted}/${franchises.length} updated to WebP.`);

    console.log('\n======================================================');
    console.log('[WebP Migration] All Database Images Converted to WebP Successfully!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('[WebP Migration Error]:', err);
  } finally {
    await mongoose.disconnect();
    console.log('[WebP Migration] Disconnected from MongoDB.');
  }
}

migrateImagesToWebp();
