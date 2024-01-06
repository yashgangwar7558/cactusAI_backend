const express = require('express');
const router = express.Router();

const {
    getBillInfo,
    getAllBills
} = require('../controllers/sales')

const { isAuth } = require('../middlewares/auth');

router.post('/get-bill', getBillInfo);
router.post('/get-bills', getAllBills);

module.exports = router;