const mongoose = require('mongoose');
require('dotenv').config();

let db;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('MongoDB connected successfully');
    
    db = mongoose.connection.useDb('tpeo_new_fellow_project');
    
    return db;
  } 
  catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = { connectDB, getDB: () => db };