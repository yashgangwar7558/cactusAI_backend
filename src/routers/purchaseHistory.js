const express = require('express');
const router = express.Router();

const {
    getIngredientWisePurchaseHistory,
    getAllPurchaseHistory
} = require('../controllers/purchaseHistory')

const { isAuth } = require('../middlewares/auth');

router.post('/get-ingredient-purchase-history', getIngredientWisePurchaseHistory);
router.post('/get-purchase-history', getAllPurchaseHistory);

module.exports = router;