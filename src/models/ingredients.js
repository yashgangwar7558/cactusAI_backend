const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  category: { type: String },
  inventory: { type: Number, default: 0 },
  invUnit: { type: String },
  avgCost: { type: Number },
  note: { type: String },
  shelfLife: { type: Number },
  slUnit: { type: String },
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient;
