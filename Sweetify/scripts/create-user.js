const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const readline = require('readline');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (question) =>
  new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });

async function createUser() {
  try {
    const argValues = {
      email: process.argv.find((arg) => arg.startsWith('--email='))?.split('=')[1],
      password: process.argv.find((arg) => arg.startsWith('--password='))?.split('=')[1],
    };

    if (process.argv.includes('--help') || process.argv.includes('-h')) {
      console.log('Usage: npm run create-user -- --email=user@example.com --password=yourPassword');
      console.log('Or simply run: npm run create-user');
      rl.close();
      return process.exit(0);
    }

    const email = argValues.email || process.argv[2] || (await askQuestion('Email: '));
    const password = argValues.password || process.argv[3] || (await askQuestion('Password: '));

    if (!email || !password) {
      console.log('Both email and password are required.');
      rl.close();
      process.exit(1);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sweetify';

    await mongoose.connect(mongoUri);

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      console.log(`User already exists with email: ${normalizedEmail}`);
      rl.close();
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
    });

    console.log('User created successfully.');
    console.log(`Email: ${user.email}`);
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to create user:', error.message);
    rl.close();
    process.exit(1);
  }
}

createUser();
