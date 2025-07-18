//backend\shared\db.js
const mysql = require("mysql2/promise");

// يمكنك تغيير الإعدادات حسب قاعدة بياناتك
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Medo@1990",      // أو كلمة المرور إن وجدت
  database: "menu_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
