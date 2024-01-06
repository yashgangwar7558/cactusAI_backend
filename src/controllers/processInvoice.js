const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const User = require('../models/user');
const Recipe = require('../models/recipeBook');
const Ingredient = require('../models/ingredients');
const unitMapping = require('../models/unitmapping');
const Invoice = require('../models/invoice');
const purchaseHistory = require('../models/purchaseHistory');
const { log } = require('console');

exports.processInvoice = async (req, res) => {
    try {
        const { userId, invoiceNumber, vendor, invoiceDate, ingredients, payment, status, total } = req.body;
        const AllIngredients = await Ingredient.find({ userId });
        const UnitMaps = await unitMapping.find({ userId });

        // Process 1 - Ingredients Update
        for (const ingredient of ingredients) {
            const matchingIngredient = AllIngredients.find(
                (allIngredient) => allIngredient.name === ingredient.name
            );

            if (matchingIngredient) {
                const unitMap = UnitMaps.find(
                    (unitMap) => unitMap.ingredient_id.toString() === matchingIngredient._id.toString()
                );

                if (!unitMap) {
                    throw new Error(`Unit map not found for ingredient ${ingredient.name}, maybe its a new ingredient`);
                }

                const toUnit = unitMap ? unitMap.toUnit : ingredient.unit;
                const convertedPrevQty = matchingIngredient.inventory * getConversionFactor(matchingIngredient.invUnit, toUnit, unitMap.fromUnit);
                const convertedPrevAvgCost = matchingIngredient.avgCost / getConversionFactor(matchingIngredient.invUnit, toUnit, unitMap.fromUnit);
                const convertedNewQty = ingredient.quantity * getConversionFactor(ingredient.unit, toUnit, unitMap.fromUnit);
                const convertedNewCost = ingredient.unitPrice / getConversionFactor(ingredient.unit, toUnit, unitMap.fromUnit);

                const newAvgCost = (((convertedPrevAvgCost * convertedPrevQty) + (convertedNewCost * convertedNewQty)) / (convertedPrevQty + convertedNewQty)) * getConversionFactor(matchingIngredient.invUnit, toUnit, unitMap.fromUnit);
                const newInventoryQty = (convertedPrevQty + convertedNewQty) / getConversionFactor(matchingIngredient.invUnit, toUnit, unitMap.fromUnit);

                const updatedIngredient = await Ingredient.findById(matchingIngredient._id);
                updatedIngredient.avgCost = newAvgCost;
                updatedIngredient.inventory = newInventoryQty;
                await updatedIngredient.save();

            } else {
                const newIngredient = await Ingredient.create({
                    userId,
                    name: ingredient.name,
                    inventory: ingredient.quantity,
                    invUnit: ingredient.unit,
                    avgCost: ingredient.unitPrice,
                });
            }
        }

        // Process 2 - Invoice Table Entry
        const invoice = await Invoice.create({
            userId,
            invoiceNumber,
            vendor,
            invoiceDate,
            ingredients,
            payment,
            status,
            total
        });

        // Process 3 - Ingredient Purchase History Update
        const AllUpdatedIngredients = await Ingredient.find({ userId });
        for (const ingredient of ingredients) {
            const matchingIngredient = AllUpdatedIngredients.find(
                (allIngredient) => allIngredient.name === ingredient.name
            );

            const ingredientPurchaseHistory = await purchaseHistory.create({
                userId,
                ingredientId: matchingIngredient._id,
                ingredientName: matchingIngredient.name,
                invoiceId: invoice._id,
                invoiceNumber,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
                unitPrice: ingredient.unitPrice,
                total: ingredient.total
            })
        }

        return res.json({
            success: true,
            message: 'Invoice processed successfully',
        });

    } catch (error) {
        console.error('Error processing invoice:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const getConversionFactor = (fromUnit, toUnit, fromUnitArray) => {
    const conversionObject = fromUnitArray.find((unit) => unit.unit === fromUnit);
    return conversionObject ? conversionObject.conversion : 1;
};