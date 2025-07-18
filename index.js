const mysql = require("mysql2/promise");
require("dotenv").config(); // لتحميل متغيرات .env في بيئة التطوير

// ✅ طباعة المتغيرات لاختبار الاتصال
console.log("🔍 Trying to connect with the following DB config:");
console.log("🌐 HOST:", process.env.MYSQLHOST);
console.log("🔢 PORT:", process.env.MYSQLPORT);
console.log("👤 USER:", process.env.MYSQLUSER);
console.log("🔐 PASSWORD:", process.env.MYSQLPASSWORD ? "(hidden)" : "(not set)");
console.log("📂 DATABASE:", process.env.MYSQLDATABASE);

// ✅ إنشاء الاتصال
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;