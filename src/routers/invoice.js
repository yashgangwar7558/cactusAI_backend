const express = require('express');
const router = express.Router();

const {
    getInvoice,
    getAllInvoice
} = require('../controllers/invoice')

const { isAuth } = require('../middlewares/auth');

router.post('/get-invoice', getInvoice);
router.post('/get-invoices', getAllInvoice);

module.exports = router;