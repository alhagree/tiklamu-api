const jwt = require("jsonwebtoken");
const db = require("../../shared/db");

const SECRET_KEY = "bareedy2025"; // استخدم env في الإنتاج

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM admin WHERE us_username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "اسم المستخدم غير صحيح" });
    }

    const user = rows[0];

    if (user.us_password !== password) {
      return res.status(401).json({ error: "كلمة المرور غير صحيحة" });
    }

    // ✅ تضمين النوع "admin"
    const token = jwt.sign(
      {
        id: user.us_id,
        username: user.us_username,
        type: "admin"
      },
      SECRET_KEY,
      { expiresIn: "2h" },      
    );
    //console.log("✅ Admin Token:", token);

    return res.json({ token });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
};
