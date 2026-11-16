require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const QRCode = require('qrcode');
const User = require('./models/User');
const ContactMessage = require('./models/ContactMessage');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sweetify';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sweetify API is running' });
});

app.post('/api/orders', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      address,
      city,
      pincode,
      paymentMethod,
      items,
    } = req.body;
    const isUpiPayment = paymentMethod === 'Pay via UPI';

    const requiredStrings = [customerName, phone, email, address, city, pincode];
    if (
      requiredStrings.some((value) => typeof value !== 'string' || !value.trim()) ||
      !/^[0-9]{10}$/.test(phone) ||
      !/^[0-9]{6}$/.test(pincode) ||
      !['Pay via WhatsApp', 'Pay via UPI'].includes(paymentMethod) ||
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 50
    ) {
      return res.status(400).json({ message: 'Please provide valid order and customer details.' });
    }

    const upiId = (process.env.UPI_ID || '').trim();
    if (isUpiPayment && !/^[A-Za-z0-9._-]{2,256}@[A-Za-z0-9.-]{2,64}$/.test(upiId)) {
      return res.status(503).json({ message: 'UPI payments are not configured. Set UPI_ID in .env.' });
    }

    const orderItems = [];
    for (const item of items) {
      if (
        !item ||
        typeof item.name !== 'string' ||
        !item.name.trim() ||
        !Number.isFinite(item.weight) ||
        item.weight < 1 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        !Number.isFinite(item.unitPrice) ||
        item.unitPrice < 0
      ) {
        return res.status(400).json({ message: 'The cart contains an invalid item.' });
      }

      orderItems.push({
        name: item.name.trim(),
        weight: item.weight,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        image: typeof item.image === 'string' ? item.image : '',
      });
    }

    const totalAmount = orderItems.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0
    );
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ message: 'The order total must be greater than zero.' });
    }

    const orderId = `SW${Date.now().toString().slice(-8)}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    let upiPayment;
    if (isUpiPayment) {
      const paymentUri = `upi://pay?${new URLSearchParams({
        pa: upiId,
        pn: process.env.UPI_MERCHANT_NAME || 'Sweetify',
        am: totalAmount.toFixed(2),
        cu: 'INR',
        tn: `Sweetify order ${orderId}`,
      }).toString()}`;
      const qrCodeDataUrl = await QRCode.toDataURL(paymentUri, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 280,
      });
      upiPayment = { upiId, amount: totalAmount, paymentUri, qrCodeDataUrl };
    }

    const order = await Order.create({
      orderId,
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      paymentMethod,
      items: orderItems,
      totalAmount,
      paymentStatus: 'Pending',
    });

    const response = {
      order: {
        orderId: order.orderId,
        customerName: order.customerName,
        phone: order.phone,
        email: order.email,
        address: order.address,
        city: order.city,
        pincode: order.pincode,
        paymentMethod: order.paymentMethod,
        items: order.items,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        orderDate: order.orderDate,
      },
      whatsappPhoneNumber: process.env.WHATSAPP_PHONE_NUMBER || '',
    };
    if (upiPayment) {
      response.upiPayment = upiPayment;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Error saving online payment order:', error);
    res.status(500).json({ message: 'Failed to save your order. Please try again.' });
  }
});

app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .select('orderId totalAmount paymentStatus paymentMethod transactionReference orderDate')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Error retrieving order:', error);
    res.status(500).json({ message: 'Unable to retrieve this order.' });
  }
});

app.post('/api/orders/:orderId/transaction-reference', async (req, res) => {
  const { transactionReference } = req.body;
  if (
    typeof transactionReference !== 'string' ||
    transactionReference.trim().length < 4 ||
    transactionReference.trim().length > 100
  ) {
    return res.status(400).json({ message: 'Enter a valid UPI transaction reference.' });
  }

  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId, paymentMethod: 'Pay via UPI', paymentStatus: 'Pending' },
      { $set: { transactionReference: transactionReference.trim() } },
      { new: true, runValidators: true }
    ).select('orderId paymentStatus transactionReference');

    if (!order) {
      const existingOrder = await Order.findOne({ orderId: req.params.orderId })
        .select('paymentStatus paymentMethod')
        .lean();
      if (!existingOrder) {
        return res.status(404).json({ message: 'Order not found.' });
      }
      return res.status(409).json({ message: 'This order cannot accept a transaction reference.' });
    }

    res.json({
      message: 'Transaction reference saved. Payment remains pending verification.',
      order,
    });
  } catch (error) {
    console.error('Error saving transaction reference:', error);
    res.status(500).json({ message: 'Unable to save the transaction reference.' });
  }
});

app.post('/api/orders/:orderId/verify-payment', async (req, res) => {
  const verificationKey = process.env.PAYMENT_VERIFICATION_KEY;
  const suppliedKey = req.get('x-payment-verification-key');

  if (!verificationKey) {
    return res.status(503).json({ message: 'Payment verification is not configured.' });
  }

  const expectedBuffer = Buffer.from(verificationKey);
  const suppliedBuffer = Buffer.from(typeof suppliedKey === 'string' ? suppliedKey : '');
  if (
    expectedBuffer.length !== suppliedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)
  ) {
    return res.status(401).json({ message: 'Payment verification is not authorized.' });
  }

  try {
    const existingOrder = await Order.findOne({ orderId: req.params.orderId });
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    if (existingOrder.paymentStatus !== 'Pending') {
      return res.status(409).json({ message: 'This order is not awaiting payment verification.' });
    }

    const { transactionReference } = req.body;
    if (
      transactionReference !== undefined &&
      (typeof transactionReference !== 'string' ||
        transactionReference.trim().length < 4 ||
        transactionReference.trim().length > 100)
    ) {
      return res.status(400).json({ message: 'Enter a valid transaction reference.' });
    }
    if (
      existingOrder.paymentMethod === 'Pay via UPI' &&
      !(transactionReference || existingOrder.transactionReference).trim()
    ) {
      return res.status(400).json({ message: 'A transaction reference is required before verifying UPI payment.' });
    }

    const updates = {
      paymentStatus: 'Paid',
      paymentVerifiedAt: new Date(),
    };
    if (typeof transactionReference === 'string') {
      updates.transactionReference = transactionReference.trim();
    }

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId, paymentStatus: 'Pending' },
      { $set: updates },
      { new: true, runValidators: true }
    ).select('orderId paymentMethod totalAmount paymentStatus transactionReference paymentVerifiedAt');
    if (!order) {
      return res.status(409).json({ message: 'This order is not awaiting payment verification.' });
    }

    return res.json({ message: 'Payment marked as verified.', order });
  } catch (error) {
    console.error('Error verifying order payment:', error);
    res.status(500).json({ message: 'Unable to update payment status.' });
  }
});

app.post('/api/users/create-user', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      message: 'User created successfully.',
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user.' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      message: 'Sign in successful.',
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error signing in:', error);
    res.status(500).json({ message: 'Failed to sign in.' });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if ([name, email, phone, message].some((value) => typeof value !== 'string' || !value.trim())) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      message: message.trim(),
    });

    res.status(201).json({ message: 'Your message has been saved successfully.' });
  } catch (error) {
    console.error('Error saving contact form:', error);
    res.status(500).json({ message: 'Unable to save your message.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully.');

    app.listen(PORT, () => {
      console.log(`Sweetify server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.log('Please make sure MongoDB is running and update MONGODB_URI in .env');
    process.exit(1);
  }
};

startServer();
