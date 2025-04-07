const mongoose = require('mongoose');
require('dotenv').config();

let db;
let gridFSBucket;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');

    db = mongoose.connection;
    gridFSBucket = new mongoose.mongo.GridFSBucket(db.db, {
      bucketName: 'images',
    });
    
    return db;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = { 
  connectDB, 
  getDB: () => db,
  getGridFsBucket: () => gridFSBucket,
};