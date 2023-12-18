const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user');
const Recipe = require('../models/recipeBook');
const Ingredient = require('../models/ingredients');

exports.createIngredient = async (req, res) => {
    try {
        const { userId, name, category, inventory, invUnit, avgCost, note, shelfLife, slUnit } = req.body;

        // Check for missing fields
        if (!userId || !name || !category || !inventory || !invUnit || !avgCost || !note || !shelfLife || !slUnit) {
            return res.json({
                success: false,
                message: 'Some fields are missing!',
            });
        }

        // func for ingredients unit conversion to grams

        // func to calculating avgCost

        // Create a new ingredient
        const ingredient = await Ingredient.create({
            userId,
            name,
            category,
            inventory,
            invUnit,
            avgCost,
            note,
            shelfLife,
            slUnit,
        });

        res.json({ success: true, ingredient });
    } catch (error) {
        console.error('Error creating ingredient:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getIngredient = async (req, res) => {
    try {
        const { ingredientId } = req.body;

        // Find an ingredient by ID
        const ingredient = await Ingredient.findById(ingredientId);

        if (!ingredient) {
            return res.json({
                success: false,
                message: 'Ingredient not found!',
            });
        }

        res.json({ success: true, ingredient });
    } catch (error) {
        console.error('Error fetching ingredient:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getAllIngredient = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: 'User not found!',
            });
        }

        // Find all ingredients with the specified user ID
        const ingredients = await Ingredient.find({ userId: user._id });

        res.json({ success: true, ingredients });
    } catch (error) {
        console.error('Error fetching ingredients:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// inventory edit and updates will also update recipe inventory status and cost of recipe 
