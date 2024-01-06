const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const User = require('../models/user');
const Recipe = require('../models/recipeBook');
const Ingredient = require('../models/ingredients');
const Sales = require('../models/sales');
const salesHistory = require('../models/salesHistory');
const { log } = require('console');

exports.processBill = async (req, res) => {
    try {
        const { userId, billNumber, customerName, billingDate, itemsOrdered, total } = req.body;

        // Process 1 - Sales table bill entry
        const bill = await Sales.create({
            userId,
            billNumber,
            customerName,
            billingDate,
            itemsOrdered,
            total
        });

        // Process 2 - Menu Item purchase history update
        const itemsOrderedNames = itemsOrdered.map(itemOrdered => itemOrdered.name);
        const AllMenuItems = await Recipe.find({ userId, name: { $in: itemsOrderedNames } });
        for (const itemOrdered of itemsOrdered) {
            const matchingRecipe = AllMenuItems.find(
                (menuItem) => menuItem.name === itemOrdered.name
            );

            const recipeSalesHistory = await salesHistory.create({
                userId,
                recipeId: matchingRecipe._id,
                recipeName: matchingRecipe.name,
                billingId: bill._id,
                billNumber,
                quantity: itemOrdered.quantity,
                menuCost: itemOrdered.menuCost,
                total: itemOrdered.total
            })
        }

        return res.json({
            success: true,
            message: 'Bill processed successfully',
        });
    } catch (error) {
        console.error('Error processing bill:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}