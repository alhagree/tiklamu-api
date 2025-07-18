const mysql = require("mysql2");
const fs = require("fs");

// قراءة الملف وتقسيمه إلى أوامر SQL فردية
let sql = fs.readFileSync("menu_db.sql", "utf8");

let statements = sql
  .split(/;\s*[\r\n]/)
  .map(s => s.trim())
  .filter(s =>
    s &&
    !s.startsWith("--") &&
    !s.startsWith("/*") &&
    !s.startsWith("/*!") &&
    !s.toUpperCase().startsWith("SET")
  );

const connection = mysql.createConnection({
  host: "ballast.proxy.rlwy.net",
  port: 23945,
  user: "root",
  password: "piOsVWzPpFmzRWMHSGdAMiUwcSCQBoYA",
  database: "railway", // استبدلها بالاسم الصحيح من MYSQLDATABASE إن وُجد
  multipleStatements: true
});

connection.connect((err) => {
  if (err) {
    console.error("❌ فشل الاتصال:", err.message);
    return;
  }

  console.log("✅ تم الاتصال — جاري تنفيذ SQL");

  let i = 0;
  const runNext = () => {
    if (i >= statements.length) {
      console.log("🎉 تم تنفيذ جميع الأوامر");
      return connection.end();
    }

    const stmt = statements[i++];
    console.log(`🔸 أمر ${i}: ${stmt.slice(0, 100)}...`);

    connection.query(stmt, (err) => {
      if (err) {
        console.error(`❌ خطأ في أمر ${i}:\n${stmt}\n👉 ${err.message}`);
      } else {
        console.log(`✅ أمر ${i} تم`);
      }
      runNext();
    });
  };

  runNext();
});
