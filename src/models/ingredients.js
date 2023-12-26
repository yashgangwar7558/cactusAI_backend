const mongoose = require('mongoose');
const { updateRelatedRecipes } = require('../models/recipeBook')

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

ingredientSchema.pre('save', async function (next) {
  if (this.isModified('invUnit') || this.isModified('quantity') || this.isModified('avgCost')) {
    await updateRelatedRecipes(this._id, this.userId);
  }
  next();
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient;
