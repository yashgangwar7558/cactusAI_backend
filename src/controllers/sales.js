const mongoose = require('mongoose');
const User = require('../models/user');
const Recipe = require('../models/recipeBook');
const Ingredient = require('../models/ingredients');
const Sales = require('../models/sales');
const salesHistory = require('../models/salesHistory');
const {formatDate} = require('../controllers/helper');
const { log } = require('console');

exports.getBillInfo = async (req, res) => {
    try {
        const { billingId } = req.body;

        const bill = await Sales.findById(billingId);

        if (!bill) {
            return res.json({
                success: false,
                message: 'Bill not found!',
            });
        }

        bill.uploadDate = formatDate(bill.uploadDate);

        res.json({ success: true, bill });
    } catch (error) {
        console.error('Error fetching bill:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getAllBills = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: 'User not found!',
            });
        }

        const bills = await Sales.find({ userId: user._id });

        const formattedDateBills = bills.map((bill) => {
            return {
                ...bill._doc,
                uploadDate: formatDate(bill.uploadDate),
            };
        });

        res.json({ success: true, bills: formattedDateBills });
    } catch (error) {
        console.error('Error fetching bills:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};