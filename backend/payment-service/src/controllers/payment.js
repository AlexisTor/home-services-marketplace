// backend/payment-service/src/controllers/payment.js
const Payment = require('../models/payment');
const mercadopago = require('mercadopago');
const axios = require('axios');

// Configure MercadoPago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

exports.createPayment = async (req, res) => {
  try {
    const { jobId, professionalId, amount, paymentMethod } = req.body;
    
    // Get job details to verify
    let jobDetails;
    try {
      const response = await axios.get(`${process.env.JOB_SERVICE_URL}/jobs/${jobId}`, {
        headers: { Authorization: req.headers.authorization }
      });
      jobDetails = response.data.job;
    } catch (error) {
      return res.status(404).json({ message: req.__('job_not_found') });
    }
    
    // Verify client is the one who created the job
    if (jobDetails.clientId !== req.userData.userId) {
      return res.status(403).json({ message: req.__('not_authorized') });
    }
    
    // Create payment record
    const payment = new Payment({
      jobId,
      clientId: req.userData.userId,
      professionalId,
      amount,
      paymentMethod
    });
    
    // Process payment based on method
    if (paymentMethod === 'mercadopago') {
      // Create MercadoPago preference
      const preference = {
        items: [
          {
            title: `Payment for job #${jobId}`,
            unit_price: amount,
            quantity: 1,
          }
        ],
        back_urls: {
          success: `${process.env.FRONTEND_URL}/payments/success`,
          failure: `${process.env.FRONTEND_URL}/payments/failure`,
          pending: `${process.env.FRONTEND_URL}/payments/pending`
        },
        auto_return: 'approved',
        external_reference: payment._id.toString(),
        notification_url: `${process.env.PAYMENT_SERVICE_URL}/payments/webhook/mercadopago`
      };
      
      const response = await mercadopago.preferences.create(preference);
      
      payment.externalPaymentId = response.body.id;
      payment.externalPaymentUrl = response.body.init_point;
      payment.status = 'processing';
    }
    
    await payment.save();
    
    res.status(201).json({
      message: req.__('payment_created'),
      payment: {
        id: payment._id,
        status: payment.status,
        paymentUrl: payment.externalPaymentUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: req.__('server_error'), error: error.message });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findById(id);
    
    if (!payment) {
      return res.status(404).json({ message: req.__('payment_not_found') });
    }
    
    // Check if user is authorized to view this payment
    if (payment.clientId !== req.userData.userId && payment.professionalId !== req.userData.userId) {
      return res.status(403).json({ message: req.__('not_authorized') });
    }
    
    res.status(200).json({ payment });
  } catch (error) {
    res.status(500).json({ message: req.__('server_error'), error: error.message });
  }
};

exports.mercadopagoWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (type === 'payment') {
      const paymentId = data.id;
      
      // Get payment details from MercadoPago
      const mpPayment = await mercadopago.payment.get(paymentId);
      const externalReference = mpPayment.body.external_reference;
      
      // Update our payment record
      const payment = await Payment.findById(externalReference);
      
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      
      // Update payment status based on MercadoPago status
      switch (mpPayment.body.status) {
        case 'approved':
          payment.status = 'completed';
          break;
        case 'pending':
        case 'in_process':
          payment.status = 'processing';
          break;
        case 'rejected':
          payment.status = 'failed';
          break;
        default:
          payment.status = 'failed';
      }
      
      payment.paymentDetails = mpPayment.body;
      payment.updatedAt = Date.now();
      
      await payment.save();
      
      // If payment completed, notify professional
      if (payment.status === 'completed') {
        try {
          await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notifications/payment-received`, {
            paymentId: payment._id,
            jobId: payment.jobId,
            clientId: payment.clientId,
            professionalId: payment.professionalId,
            amount: payment.amount
          });
        } catch (error) {
          console.error('Failed to send payment notification:', error);
        }
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};
