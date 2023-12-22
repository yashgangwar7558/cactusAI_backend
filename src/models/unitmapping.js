const mongoose = require('mongoose');

const fromUnitSchema = new mongoose.Schema({
    unit: { type: String },
    conversion: { type: Number, required: true },
});

const unitmappingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    ingredient_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Ingredient' },
    name: { type: String, required: true },
    fromUnit: [fromUnitSchema],
    toUnit: { type: String, required: true },
    description: { type: String, required: true}
});

const unitMapping = mongoose.model('unitMapping', unitmappingSchema);

module.exports = unitMapping;