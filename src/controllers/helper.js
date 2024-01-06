exports.formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
};

exports.inventoryCheck = async (ingredients, AllIngredients, UnitMaps) => {
    const allIngredientsPresent = await Promise.all(ingredients.map(async (ingredient) => {

        const matchingIngredient = AllIngredients.find(
            (allIngredient) => allIngredient._id.toString() === ingredient.ingredient_id.toString()
        );

        if (!matchingIngredient) {
            return false;
        }

        const unitMap = UnitMaps.find(
            (unitMap) => unitMap.ingredient_id.toString() === ingredient.ingredient_id.toString()
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

exports.costEstimation = async (ingredients, AllIngredients, UnitMaps) => {
    let totalCost = 0;

    for (const ingredient of ingredients) {

        const matchingIngredient = AllIngredients.find(
            (allIngredient) => allIngredient._id.toString() === ingredient.ingredient_id.toString()
        );

        if (matchingIngredient) {
            const unitMap = UnitMaps.find(
                (unitMap) => unitMap.ingredient_id.toString() === ingredient.ingredient_id.toString()
            );
            const toUnit = unitMap ? unitMap.toUnit : ingredient.unit;
            const convertedQuantity = ingredient.quantity * getConversionFactor(ingredient.unit, toUnit, unitMap.fromUnit);
            const costPerUnit = matchingIngredient.avgCost / getConversionFactor(matchingIngredient.invUnit, toUnit, unitMap.fromUnit) || 0;
            totalCost += costPerUnit * convertedQuantity;
        }
    }

    return totalCost;
}

getConversionFactor = (fromUnit, toUnit, fromUnitArray) => {
    const conversionObject = fromUnitArray.find((unit) => unit.unit === fromUnit);
    return conversionObject ? conversionObject.conversion : 1;
};