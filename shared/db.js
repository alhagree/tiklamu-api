//backend\shared\db.js
// ✅ فحص القيم البيئية المطلوبة
const requiredEnvVars = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASS",
  "DB_NAME"
];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error("❌ القيم التالية مفقودة من environment:");
  missingVars.forEach((key) => console.error(`- ${key}`));
  process.exit(1); // إنهاء التطبيق لأن الاتصال سيفشل
} else {
  console.log("✅ جميع متغيرات البيئة موجودة بنجاح:");
  requiredEnvVars.forEach((key) => {
    console.log(`🔹 ${key} = ${process.env[key]}`);
  });
}


const mysql = require("mysql2/promise");
require("dotenv").config(); // لتحميل بيانات env

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
