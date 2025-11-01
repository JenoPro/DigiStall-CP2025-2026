import mysql from 'mysql2/promise'
import process from 'process'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'naga_stall',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

console.log('🔧 Database Config:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  passwordSet: !!dbConfig.password,
})

export const createConnection = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig)
    return connection
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    throw error
  }
}

export const createPool = () => {
  try {
    const pool = mysql.createPool(dbConfig)
    console.log('✅ Database pool created successfully')
    return pool
  } catch (error) {
    console.error('❌ Database pool creation failed:', error.message)
    throw error
  }
}

export default {
  createConnection,
  createPool,
}