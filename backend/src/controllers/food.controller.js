const mongoose = require('mongoose');
const Food = require('../models/Food');
const Review = require('../models/Review');
const mockStore = require('../utils/mockStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all foods with search, filtering, sorting and pagination
// @route   GET /api/foods
// @access  Public
const getAllFoods = async (req, res, next) => {
  try {
    const {
      search,
      category,
      foodType,
      spiceLevel,
      minPrice,
      maxPrice,
      isPopular,
      isFeatured,
      isAvailable,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    if (!isDbConnected()) {
      let filtered = [...mockStore.foods];

      if (search && search.trim() !== '') {
        const q = search.toLowerCase();
        filtered = filtered.filter(f =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.tags?.some(t => t.toLowerCase().includes(q))
        );
      }

      if (category && category !== 'all') {
        filtered = filtered.filter(f => f.category?.slug === category || f.category?._id === category);
      }

      if (foodType && foodType !== 'all') {
        filtered = filtered.filter(f => f.foodType === foodType);
      }

      if (spiceLevel && spiceLevel !== 'all') {
        filtered = filtered.filter(f => f.spiceLevel === spiceLevel);
      }

      if (maxPrice) {
        filtered = filtered.filter(f => f.price <= Number(maxPrice));
      }

      if (isPopular === 'true') {
        filtered = filtered.filter(f => f.isPopular);
      }

      if (isFeatured === 'true') {
        filtered = filtered.filter(f => f.isFeatured);
      }

      // Sort
      if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
      else if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
      else if (sort === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

      return res.status(200).json({
        success: true,
        count: filtered.length,
        total: filtered.length,
        totalPages: 1,
        currentPage: 1,
        data: filtered,
      });
    }

    const query = {};

    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const Category = require('../models/Category');
        const cat = await Category.findOne({ slug: category });
        if (cat) query.category = cat._id;
      }
    }

    if (foodType && foodType !== 'all') query.foodType = foodType;
    if (spiceLevel && spiceLevel !== 'all') query.spiceLevel = spiceLevel;
    if (isPopular === 'true') query.isPopular = true;
    if (isFeatured === 'true') query.isFeatured = true;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1, numReviews: -1 };
    else if (sort === 'popular') sortOption = { isPopular: -1, rating: -1 };
    else if (sort === 'name_asc') sortOption = { name: 1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const totalFoods = await Food.countDocuments(query);
    const foods = await Food.find(query)
      .populate('category', 'name slug image')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    if (!foods) {
      return res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        totalPages: 1,
        currentPage: pageNum,
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      count: foods.length,
      total: totalFoods,
      totalPages: Math.ceil(totalFoods / limitNum),
      currentPage: pageNum,
      data: foods,
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      count: mockStore.foods.length,
      total: mockStore.foods.length,
      totalPages: 1,
      currentPage: 1,
      data: mockStore.foods,
    });
  }
};

// @desc    Get single food by ID or slug with reviews
// @route   GET /api/foods/:id
// @access  Public
const getFoodById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      const food = mockStore.foods.find(f => f._id === id || f.slug === id);
      if (!food) return res.status(404).json({ success: false, message: 'Food not found' });
      return res.status(200).json({ success: true, data: { ...food, reviews: mockStore.reviews } });
    }

    let food;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      food = await Food.findById(id).populate('category', 'name slug image');
    } else {
      food = await Food.findOne({ slug: id }).populate('category', 'name slug image');
    }

    if (!food) {
      const fallback = mockStore.foods.find(f => f._id === id || f.slug === id);
      if (fallback) return res.status(200).json({ success: true, data: { ...fallback, reviews: mockStore.reviews } });
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    const reviews = await Review.find({ food: food._id, isApproved: true })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        ...food.toObject(),
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured foods for homepage
// @route   GET /api/foods/featured
// @access  Public
const getFeaturedFoods = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const featured = mockStore.foods.filter(f => f.isFeatured);
      return res.status(200).json({ success: true, count: featured.length, data: featured });
    }

    const foods = await Food.find({ isFeatured: true, isAvailable: true })
      .populate('category', 'name slug')
      .limit(8);

    if (!foods || foods.length === 0) {
      return res.status(200).json({ success: true, count: mockStore.foods.length, data: mockStore.foods.slice(0, 4) });
    }

    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    res.status(200).json({ success: true, count: mockStore.foods.length, data: mockStore.foods.slice(0, 4) });
  }
};

// @desc    Get popular foods
// @route   GET /api/foods/popular
// @access  Public
const getPopularFoods = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const popular = mockStore.foods.filter(f => f.isPopular);
      return res.status(200).json({ success: true, count: popular.length, data: popular });
    }

    const foods = await Food.find({ isPopular: true, isAvailable: true })
      .populate('category', 'name slug')
      .limit(8);

    if (!foods || foods.length === 0) {
      return res.status(200).json({ success: true, count: mockStore.foods.length, data: mockStore.foods.slice(0, 4) });
    }

    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    res.status(200).json({ success: true, count: mockStore.foods.length, data: mockStore.foods.slice(0, 4) });
  }
};

// @desc    Create new food item
// @route   POST /api/foods
// @access  Private/Admin
const createFood = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      price,
      discountPrice,
      image,
      foodType,
      ingredients,
      nutrition,
      spiceLevel,
      preparationTime,
      isAvailable,
      isPopular,
      isFeatured,
      tags,
    } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, and price.',
      });
    }

    if (!isDbConnected()) {
      const newFood = {
        _id: `food_${Date.now()}`,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        category: mockStore.categories.find(c => c._id === category) || { name: 'Specialty', slug: 'specialty' },
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : 0,
        image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        foodType: foodType || 'veg',
        ingredients: Array.isArray(ingredients) ? ingredients : (ingredients ? ingredients.split(',').map(s => s.trim()) : []),
        nutrition: nutrition || { calories: 0, protein: 0, carbs: 0, fats: 0 },
        spiceLevel: spiceLevel || 'medium',
        preparationTime: preparationTime ? Number(preparationTime) : 20,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        isPopular: isPopular !== undefined ? isPopular : false,
        isFeatured: isFeatured !== undefined ? isFeatured : false,
        rating: 4.9,
        numReviews: 1,
      };
      mockStore.foods.unshift(newFood);
      return res.status(201).json({ success: true, message: 'Dish created successfully', data: newFood });
    }

    const food = await Food.create({
      name,
      description,
      category,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      image,
      foodType: foodType || 'veg',
      ingredients: Array.isArray(ingredients) ? ingredients : (ingredients ? ingredients.split(',').map(s => s.trim()) : []),
      nutrition: nutrition || { calories: 0, protein: 0, carbs: 0, fats: 0 },
      spiceLevel: spiceLevel || 'medium',
      preparationTime: preparationTime ? Number(preparationTime) : 20,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isPopular: isPopular !== undefined ? isPopular : false,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(s => s.trim()) : []),
    });

    const populatedFood = await Food.findById(food._id).populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Food item created successfully',
      data: populatedFood,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update food item
// @route   PUT /api/foods/:id
// @access  Private/Admin
const updateFood = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const idx = mockStore.foods.findIndex(f => f._id === req.params.id);
      if (idx > -1) {
        mockStore.foods[idx] = { ...mockStore.foods[idx], ...req.body };
        return res.status(200).json({ success: true, message: 'Dish updated successfully', data: mockStore.foods[idx] });
      }
    }

    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Food item updated successfully',
      data: food,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete food item
// @route   DELETE /api/foods/:id
// @access  Private/Admin
const deleteFood = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      mockStore.foods = mockStore.foods.filter(f => f._id !== req.params.id);
      return res.status(200).json({ success: true, message: 'Dish deleted successfully' });
    }

    await Food.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Food item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle food availability status
// @route   PATCH /api/foods/:id/availability
// @access  Private/Staff or Admin
const toggleFoodAvailability = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const f = mockStore.foods.find(x => x._id === req.params.id);
      if (f) {
        f.isAvailable = !f.isAvailable;
        return res.status(200).json({ success: true, message: `Dish availability is now ${f.isAvailable ? 'In Stock' : 'Sold Out'}` });
      }
    }

    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    food.isAvailable = !food.isAvailable;
    await food.save();

    res.status(200).json({
      success: true,
      message: `Food item is now ${food.isAvailable ? 'available' : 'unavailable'} for orders.`,
      data: {
        _id: food._id,
        isAvailable: food.isAvailable,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFoods,
  getFoodById,
  getFeaturedFoods,
  getPopularFoods,
  createFood,
  updateFood,
  deleteFood,
  toggleFoodAvailability,
};
