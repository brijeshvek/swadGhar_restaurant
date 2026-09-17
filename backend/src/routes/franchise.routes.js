const express = require('express');
const router = express.Router();
const {
  getAllFranchises,
  getFranchiseById,
  submitFranchiseInquiry,
} = require('../controllers/franchise.controller');

router.get('/', getAllFranchises);
router.get('/:id', getFranchiseById);
router.post('/inquiry', submitFranchiseInquiry);

module.exports = router;
