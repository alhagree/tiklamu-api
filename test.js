const path = require("path");

try {
  const s = require("./routes/api/agent/sections");
  console.log("✅ تم العثور على الموديل بنجاح");
} catch (err) {
  console.error("❌ خطأ في الاستدعاء:", err.message);
  console.log("المسار:", path.resolve("./routes/api/agent/sections"));
}
