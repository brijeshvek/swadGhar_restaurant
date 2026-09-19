require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

async function fixCategories() {
  try {
    console.log('[Fix Categories] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Fix Categories] Connected.');

    const Category = require('../models/Category');
    const Food = require('../models/Food');

    const categories = await Category.find().lean();
    console.log(`[Fix Categories] Found ${categories.length} total categories.`);

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const slug = cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const sortOrder = cat.sortOrder !== undefined && cat.sortOrder > 0 ? cat.sortOrder : i + 1;
      
      await Category.findByIdAndUpdate(cat._id, {
        slug: slug,
        sortOrder: sortOrder,
        isActive: true,
      });
    }

    console.log('[Fix Categories] All category slugs, sortOrders, and isActive flags updated successfully.');

    // Verify
    const updated = await Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    console.log(`[Fix Categories] Verified active categories count: ${updated.length}`);
    console.log('[Fix Categories] Sample:', updated.slice(0, 5).map(c => ({ name: c.name, slug: c.slug, id: c._id })));

    // Test Foods
    const totalFoods = await Food.countDocuments();
    console.log(`[Fix Categories] Total Foods: ${totalFoods}`);

    await mongoose.disconnect();
    console.log('[Fix Categories] Done!');
  } catch (err) {
    console.error('[Fix Categories Error]:', err);
  }
}

fixCategories();
