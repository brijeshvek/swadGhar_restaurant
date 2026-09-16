const mongoose = require('mongoose');
const Category = require('../models/Category');
const Food = require('../models/Food');
const mockStore = require('../utils/mockStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
const getAllCategories = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        count: mockStore.categories.length,
        data: mockStore.categories,
      });
    }

    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ sortOrder: 1, createdAt: 1 });

    if (!categories || categories.length === 0) {
      return res.status(200).json({
        success: true,
        count: mockStore.categories.length,
        data: mockStore.categories,
      });
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    // Graceful memory fallback
    res.status(200).json({
      success: true,
      count: mockStore.categories.length,
      data: mockStore.categories,
    });
  }
};

// @desc    Get single category by ID or slug
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      const cat = mockStore.categories.find(c => c._id === id || c.slug === id);
      if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
      return res.status(200).json({ success: true, data: cat });
    }

    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(id);
    } else {
      category = await Category.findOne({ slug: id });
    }

    if (!category) {
      const fallback = mockStore.categories.find(c => c._id === id || c.slug === id);
      if (fallback) return res.status(200).json({ success: true, data: fallback });
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, isActive, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    if (!isDbConnected()) {
      const newCat = {
        _id: `cat_${Date.now()}`,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        sortOrder: Number(sortOrder) || mockStore.categories.length + 1,
        isActive: isActive !== undefined ? isActive : true,
      };
      mockStore.categories.push(newCat);
      return res.status(201).json({ success: true, message: 'Category created successfully', data: newCat });
    }

    const category = await Category.create({
      name,
      description,
      image,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const idx = mockStore.categories.findIndex(c => c._id === req.params.id);
      if (idx > -1) {
        mockStore.categories[idx] = { ...mockStore.categories[idx], ...req.body };
        return res.status(200).json({ success: true, message: 'Category updated', data: mockStore.categories[idx] });
      }
    }

    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      mockStore.categories = mockStore.categories.filter(c => c._id !== req.params.id);
      return res.status(200).json({ success: true, message: 'Category deleted successfully' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
