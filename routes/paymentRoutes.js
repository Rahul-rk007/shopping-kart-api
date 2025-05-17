// routes/paypalRoutes.js

const express = require('express');
const router = express.Router();
const paypal = require('paypal-rest-sdk');
require('dotenv').config();

// Configure PayPal with your credentials
paypal.configure({
  mode: process.env.PAYPAL_MODE, // 'sandbox' or 'live'
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

// Create a payment
router.post('/createpayment', (req, res) => {
  const { total } = req.body;

  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: 'http://localhost:5173/success', // Adjusted to match your server
      cancel_url: 'http://localhost:5173/cancel',
    },
    transactions: [{
      item_list: {
        items: [{
          name: 'Order',
          sku: 'item',
          price: total,
          currency: 'USD', // Set currency to Indian Rupees
          quantity: 1,
        }],
      },
      amount: {
        currency: 'USD', // Set currency to Indian Rupees
        total: total,
      },
      description: 'This is the payment description.',
    }],
  };

//   paypal.payment.create(create_payment_json, (error, payment) => {
//     if (error) {
//       console.error("PayPal Payment Error:", error);
//       res.status(500).send(error);
//     } else {
//       // Find the approval URL and redirect
//       const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
//       if (approvalUrl) {
//         res.json({ approvalUrl: approvalUrl.href });
//       } else {
//         res.status(400).send("Approval URL not found.");
//       }
//     }
//   });
// });




paypal.payment.create(create_payment_json, (error, payment) => {
  if (error) {
    console.error("PayPal Payment Error:", error);
    res.status(500).send(error);
  } else {
    // for (let i = 0; i < payment.links.length; i++) {
    //   if (payment.links[i].rel === 'approval_url') {
    //     res.json({ approvalUrl: payment.links[i].href }); // Send approval URL back to client
    //   }
    console.log(payment);
       res.json(payment);
    // }
  }
});
});


// Success route
router.get('/success', (req, res) => {
  res.send('Thank you for your purchase. Your payment has been processed successfully!');
});

// Cancel route
router.get('/cancel', (req, res) => {
  res.send('Payment cancelled.');
});

module.exports = router;