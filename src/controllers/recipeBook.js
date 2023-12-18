const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const User = require('../models/user');
const Recipe = require('../models/recipeBook');
const Ingredient = require('../models/ingredients');

const inventoryCheck = async (ingredients, AllIngredients) => {
    const allIngredientsPresent = ingredients.every(async (ingredient) => {
        const matchingIngredient = await AllIngredients.find(
            (allIngredient) => allIngredient._id.toString() === ingredient.ingredient_id
        );

        if (!matchingIngredient || ingredient.quantity > matchingIngredient.inventory) {
            return false;
        }

        return true;
    });

    return allIngredientsPresent;
}

const costEstimation = async (ingredients, AllIngredients) => {
    let totalCost = 0;

    for (const ingredient of ingredients) {
        const matchingIngredient = await AllIngredients.find(
            (allIngredient) => allIngredient._id.toString() === ingredient.ingredient_id
        );

        if (matchingIngredient) {
            const costPerUnit = matchingIngredient.avgCost || 0;
            const requiredQuantity = ingredient.quantity || 0;
            totalCost += costPerUnit * requiredQuantity;
        }
    }

    return totalCost;
}

exports.createRecipe = async (req, res) => {
    try {
        const { userId, name, category, methodPrep, menuPrice, menuType } = req.body;
        const ingredients = JSON.parse(req.body.ingredients)
        const yields = JSON.parse(req.body.yields)
        console.log(req.body);

        if (!userId || !name || !category || !yields || !methodPrep || !ingredients || !menuPrice || !menuType) {
            return res.json({
                success: false,
                message: 'Some fields are missing!',
            });
        }

        // func for ingredients unit conversion to grams

        // Calculate cost and inventory as per ingredients table and stock
        const AllIngredients = await Ingredient.find({ userId });
        const inventory = await inventoryCheck(ingredients, AllIngredients);
        let cost;
        if (inventory) {
            cost = await costEstimation(ingredients, AllIngredients);
        } else {
            cost = 0;
        }

        // const inventory = true;
        // const cost = 30;

        if (req.file) {
            const { buffer } = req.file;
            const photoName = `${name}_${Date.now()}`;

            const photo = {
                name: photoName,
                img: {
                    data: buffer.toString('base64'),
                    contentType: req.file.mimetype,
                },
            };

            const recipe = await Recipe.create({
                userId,
                name,
                category,
                yields,
                photo,
                methodPrep,
                ingredients,
                cost,
                menuPrice,
                menuType,
                inventory,
            });

            res.json({ success: true, recipe });
        } else {
            return res.json({
                success: false,
                message: 'Recipe photo not provided!',
            });
        }
    } catch (error) {
        console.error('Error creating recipe:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getRecipe = async (req, res) => {
    try {
        const { recipeId } = req.body;

        // Find a recipe by ID
        const recipe = await Recipe.findById(recipeId);

        if (!recipe) {
            return res.json({
                success: false,
                message: 'Recipe not found!',
            });
        }

        res.json({ success: true, recipe });
    } catch (error) {
        console.error('Error fetching recipe:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getAllRecipe = async (req, res) => {
    try {
        const { userId } = req.body;

        // Find a user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: 'User not found!',
            });
        }

        // Find all recipes with the specified user ID
        const recipes = await Recipe.find({ userId: user._id });

        res.json({ success: true, recipes });
    } catch (error) {
        console.error('Error fetching recipes:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
