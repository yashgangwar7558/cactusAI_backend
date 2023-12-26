const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const User = require('../models/user');
const Recipe = require('../models/recipeBook');
const Ingredient = require('../models/ingredients');
const unitMapping = require('../models/unitmapping');

const inventoryCheck = async (ingredients, AllIngredients, UnitMaps) => {
    const allIngredientsPresent = await Promise.all(ingredients.map(async (ingredient) => {

        const matchingIngredient = AllIngredients.find(
            (allIngredient) => allIngredient._id.toString() === ingredient.ingredient_id
        );

        if (!matchingIngredient) {
            return false;
        }

        const unitMap = UnitMaps.find(
            (unitMap) => unitMap.ingredient_id.toString() === ingredient.ingredient_id
        );

        const toUnit = unitMap ? unitMap.toUnit : ingredient.unit;
        const convertedQuantity = ingredient.quantity * getConversionFactor(ingredient.unit, toUnit, unitMap.fromUnit);
        const convertedInventory = matchingIngredient.inventory * getConversionFactor(matchingIngredient.invUnit, toUnit, unitMap.fromUnit);

        if (convertedQuantity > convertedInventory) {
            return false;
        }
        return true;
    }));
    return allIngredientsPresent.every((present) => present);
}

const costEstimation = async (ingredients, AllIngredients, UnitMaps) => {
    let totalCost = 0;

    for (const ingredient of ingredients) {

        const matchingIngredient = AllIngredients.find(
            (allIngredient) => allIngredient._id.toString() === ingredient.ingredient_id
        );

        if (matchingIngredient) {
            const unitMap = UnitMaps.find(
                (unitMap) => unitMap.ingredient_id.toString() === ingredient.ingredient_id
            );
            const toUnit = unitMap ? unitMap.toUnit : ingredient.unit;
            const convertedQuantity = ingredient.quantity * getConversionFactor(ingredient.unit, toUnit, unitMap.fromUnit);
            const costPerUnit = matchingIngredient.avgCost / getConversionFactor(matchingIngredient.invUnit, toUnit, unitMap.fromUnit) || 0;
            totalCost += costPerUnit * convertedQuantity;
        }
    }

    return totalCost;
}

const getConversionFactor = (fromUnit, toUnit, fromUnitArray) => {
    const conversionObject = fromUnitArray.find((unit) => unit.unit === fromUnit);
    return conversionObject ? conversionObject.conversion : 1;
};

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

        // Calculate cost and inventory as per ingredients table and stock
        const AllIngredients = await Ingredient.find({ userId });
        const UnitMaps = await unitMapping.find({ userId });
        const inventory = await inventoryCheck(ingredients, AllIngredients, UnitMaps);
        const cost = await costEstimation(ingredients, AllIngredients, UnitMaps);

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

exports.updateRelatedRecipes = async (ingredientId, userId) => {
    try {
        const recipesToUpdate = await Recipe.find({ 'ingredients.ingredient_id': ingredientId, userId: userId });

        const AllIngredients = await Ingredient.find({ userId });
        const UnitMaps = await unitMapping.find({ userId });

        await Promise.all(recipesToUpdate.map(async (recipe) => {
            recipe.inventory = await inventoryCheck(recipe.ingredients, AllIngredients, UnitMaps);
            recipe.cost = await costEstimation(recipe.ingredients, AllIngredients, UnitMaps);
            await recipe.save();
        }));

    } catch (error) {
        console.error(`Error updating related recipes: ${error}`);
    }
};

exports.getRecipe = async (req, res) => {
    try {
        const { recipeId } = req.body;

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

        const user = await User.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: 'User not found!',
            });
        }

        const recipes = await Recipe.find({ userId: user._id });

        res.json({ success: true, recipes });
    } catch (error) {
        console.error('Error fetching recipes:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.deleteRecipe = async (req, res) => {
    try {
        const { recipeId } = req.body;

        if (!recipeId) {
            return res.json({
                success: false,
                message: 'RecipeId not found!',
            });
        }

        const result = await Recipe.deleteOne({ _id: recipeId });

        res.json({ success: true, message: 'Recipe deleted!' });
    } catch (error) {
        console.error('Error deleting recipe:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
