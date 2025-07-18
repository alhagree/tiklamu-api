// route LoginController
const db = require("../../shared/db");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(
      `SELECT * FROM us_users WHERE us_username = ? AND us_password = ? AND us_is_active = 1`,
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    }

    const user = rows[0];
    //console.log("📥 من: الدخول تسجيل طلب استلمنا :", user.us_link_code);

    // ✅ توليد التوكن هنا وتعريفه بشكل صحيح
    const token = jwt.sign(
      { id: user.us_client_id, type: "client", link_code :  user.us_link_code },
      "bareedy2025",
      { expiresIn: "2d" }
    );

    res.json({
      token,
      link_code: user.us_link_code,
      name: user.us_username,
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
};