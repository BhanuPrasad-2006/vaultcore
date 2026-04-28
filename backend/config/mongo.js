name=backend/config/mongo.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/vaultcore';

async function initMongo() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('[DB] MongoDB connected successfully');
    return mongoose;
  } catch (error) {
    console.error('[DB] MongoDB connection error:', error);
    throw error;
  }
}

module.exports = { initMongo };