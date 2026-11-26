/**
 * MongoDB Database Connection Configuration
 * 
 * TECHNOLOGY: Mongoose ODM (Object Data Modeling)
 * WHY: Mongoose provides schema validation, middleware hooks, and type safety for MongoDB
 * - Automatic schema validation ensures data consistency
 * - Middleware (pre/post hooks) for lifecycle management
 * - Model-based approach simplifies querying and data manipulation
 * 
 * NEXORA ARCHITECTURE FIT:
 * - Central connection point for all database operations
 * - Initializes MongoDB Atlas connection with error handling
 * - Connection reuse across application via module export
 * - Supports role-based access by enabling query filtering and aggregation
 */

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
