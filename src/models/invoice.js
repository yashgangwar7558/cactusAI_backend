const mongoose = require('mongoose');

const ingredientsBoughtSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number },
    unit: { type: String },
    unitPrice: { type: Number },
    total: { type: String }
});

const invoiceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    uploadDate: { type: Date, default: Date.now },
    invoiceNumber: { type: String, required: true },
    vendor: { type: String, required: true },
    invoiceDate: { type: String },
    ingredients: [ingredientsBoughtSchema],
    payment: { type: String },
    status: { type: String, default: 'Pending' },
    total: { type: String, required: true },
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;