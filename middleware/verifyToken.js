const jwt = require("jsonwebtoken");
const SECRET_KEY = "bareedy2025";

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "توكن غير مرسل" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(401).json({ error: "توكن غير موثوق أو منتهي" });
    }

    /*************
    console.log("🔐 التوكن المرسل:", token);
    console.log("🔍 معلومات المستخدم:", user);
    console.log("🌐 المسار:", req.originalUrl);
    /*************/

    // ✅ استخدام تطابق أكثر دقة
    const path = req.originalUrl;
    const isAdminRoute = path.startsWith("/api/admin/");
    const isClientRoute = path.startsWith("/api/client/");

    if (isAdminRoute && user.type !== "admin") {
      console.log("🚫 عميلًا ليس المستخدم");
      return res.status(403).json({ error: "غير مصرح لك بالدخول لمسارات الإدارة" });
    }

    if (isClientRoute && user.type !== "client") {
      console.log("🚫 مديرًا ليس المستخدم");
      return res.status(403).json({ error: "غير مصرح لك بالدخول كعميل" });
    }

    req.user = user;
    if (user.type === "client") {
      req.client_id = user.id;
    }

    next();
  });
};