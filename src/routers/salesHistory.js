const express = require('express');
const router = express.Router();

const {
    getRecipeSalesInfo,
    getSalesHistory
} = require('../controllers/salesHistory')

const { isAuth } = require('../middlewares/auth');

router.post('/get-recipe-sales-info', getRecipeSalesInfo);
router.post('/get-sales-history', getSalesHistory);

module.exports = router;