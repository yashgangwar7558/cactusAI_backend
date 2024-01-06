const express = require('express');
const router = express.Router();

const {
    processInvoice,
} = require('../controllers/processInvoice')

const { isAuth } = require('../middlewares/auth');

router.post('/process-invoice', processInvoice);

module.exports = router;