const mongoose = require('mongoose');



const OrderSchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  createdAt: { 
    type: Date, 
    required: true 
  },
  customer: {
    name: String,
    email: String
  },
  totalPrice: Number,
  currency: String,
  lineItems: [
    {
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  status: String,
  rawData: Object,
  sentToSAP: { type: Boolean, default: false }
});

// Forzamos el nombre exacto de la colección: 'dataShopify'
module.exports = mongoose.model('Orden', OrderSchema, 'dataShopify');
