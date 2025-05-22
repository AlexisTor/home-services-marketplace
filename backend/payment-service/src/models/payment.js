// backend/payment-service/src/models/payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true
  },
  clientId: {
    type: String,
    required: true
  },
  professionalId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['mercadopago', 'credit_card', 'bank_transfer']
  },
  externalPaymentId: String,
  externalPaymentUrl: String,
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
