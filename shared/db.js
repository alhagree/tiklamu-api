const mysql = require("mysql2/promise");

// ❗️ القيم مأخوذة من صفحة المتغيرات في Railway
const config = {
  host: "ballast.proxy.rlwy.net",
  port: 23945,
  user: "root",
  password: "piOsVWzPpFmzRWMHSGdAMiUwcSCQBoYA",
  database: "railway"
};

// ✅ طباعة القيم للتأكيد
console.log("🔧 Using manual DB config:");
console.log("🌐 HOST:", config.host);
console.log("🔢 PORT:", config.port);
console.log("👤 USER:", config.user);
console.log("🔐 PASSWORD:", config.password ? "(hidden)" : "(not set)");
console.log("📂 DATABASE:", config.database);

// ✅ إنشاء الاتصال
const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;