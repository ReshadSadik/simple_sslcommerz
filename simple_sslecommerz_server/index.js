const express = require('express');
const app = express();
var cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const SSLCommerzPayment = require('sslcommerz');

// mongoDb configuration

const uri =
  'mongodb+srv://genius-mechanic:0H0nmrf72fiHLTFr@cluster0.2ffsd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const orderCollection = client.db('sslcommerz_test').collection('orders');
  console.log('connected');
  // perform actions on the collection object
  // client.close();

  // initializing payment
  app.post('/init', async (req, res) => {
    const data = {
      total_amount: req.body.total_amount,
      currency: 'BDT',
      tran_id: uuidv4(), // use unique tran_id for each api call
      success_url: 'http://localhost:5000/success',
      fail_url: 'http://localhost:5000/fail',
      cancel_url: 'http://localhost:5000/cancel',
      ipn_url: 'http://localhost:5000/ipn',
      shipping_method: 'Courier',
      paymentStatus: 'pending',
      product_name: req.body.product_name,
      product_image: req.body.product_image,
      product_category: 'Electronic',
      product_profile: req.body.product_profile,
      cus_name: req.body.cus_name,
      cus_email: req.body.cus_email,
      cus_add1: 'Dhaka',
      cus_add2: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: '01711111111',
      cus_fax: '01711111111',
      ship_name: 'Customer Name',
      ship_add1: 'Dhaka',
      ship_add2: 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: 1000,
      ship_country: 'Bangladesh',
    };
    const sslcz = new SSLCommerzPayment(
      process.env.STORE_ID,
      process.env.STORE_PASSWORD,
      false
    );

    // insert order data into database

    const order = await orderCollection.insertOne(data);

    sslcz.init(data).then((data) => {
      // Redirect the user to payment gateway
      let GatewayPageURL = data.GatewayPageURL;
      if (GatewayPageURL) {
        res.json(GatewayPageURL);
      } else {
        return res.status(400).json({
          message: 'payment session failed',
        });
      }
      // console.log('Redirecting to: ', GatewayPageURL);
    });
  });

  app.post('/success', async (req, res) => {
    const order = await orderCollection.updateOne(
      { tran_id: req.body.tran_id },
      {
        $set: {
          val_id: req.body.val_id,
        },
      }
    );
    res
      .status(200)
      .redirect(`http://localhost:3000/success/${req.body.tran_id}`);
  });
  app.post('/fail', async (req, res) => {
    const order = await orderCollection.deleteOne({
      tran_id: req.body.tran_id,
    });
    res.status(400).redirect('http://localhost:3000');
  });
  app.post('/cancel', async (req, res) => {
    const order = await orderCollection.deleteOne({
      tran_id: req.body.tran_id,
    });
    res.status(200).redirect('http://localhost:3000');
  });

  app.get('/orders/:id', async (req, res) => {
    const order = await orderCollection.findOne({ tran_id: req.params.id });
    res.json(order);
  });
  app.post('/validate', async (req, res) => {
    const order = await orderCollection.findOne({ tran_id: req.body.tran_id });
    console.log(req.body);
    if (order.val_id === req.body.val_id) {
      const update = await orderCollection.updateOne(
        {
          tran_id: req.body.tran_id,
        },
        {
          $set: {
            paymentStatus: 'successful',
          },
        }
      );
      res.send(update.modifiedCount > 0);
    } else {
      res.send('payment not  confirmed. Order Discarded');
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
