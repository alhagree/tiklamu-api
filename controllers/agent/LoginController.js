// route LoginController
const db = require("../../shared/db");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. جلب معلومات المستخدم + العميل
    const [rows] = await db.query(
      `
      SELECT 
        us.*, 
        cl.cl_is_active AS client_active,
        cl.cl_name,
        cl.cl_id
      FROM us_users us
      JOIN clients cl ON cl.cl_id = us.us_client_id
      WHERE us.us_username = ? AND us.us_password = ?
      `,
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: "اسم المستخدم أو كلمة المرور غير صحيحة",
        error_code: "invalid_credentials"
      });
    }

    const user = rows[0];

    // 2. تحقق من تفعيل الحساب والعميل
    if (user.us_is_active == 0 || user.client_active == 0) {
      return res.status(403).json({
        error: "تم تعطيل الحساب، يرجى التواصل مع الإدارة لتفعيله",
        error_code: "account_inactive"
      });
    }

    // 3. تحقق من الاشتراك الفعال
    const [subs] = await db.query(
      `SELECT su_end_date FROM subscriptions 
       WHERE su_client_id = ? AND su_status = 'active'
       ORDER BY su_start_date DESC
       LIMIT 1`,
      [user.cl_id]
    );

    if (subs.length === 0) {
      return res.status(403).json({
        error: "لا يوجد اشتراك مفعل، يرجى التواصل مع الإدارة لتفعيله",
        error_code: "subscription_inactive"
      });
    }

    // ✅ نسمح بالدخول حتى لو منتهي
    const subscription = subs[0];
    const endDateStr = subscription.su_end_date.toString('utf8');
    const today = new Date().toISOString().split("T")[0];

    const isExpired = endDateStr < today;


    // 4. ✅ إصدار التوكن والرد
    const token = jwt.sign(
      { id: user.us_client_id, type: "client", link_code: user.us_link_code },
      "bareedy2025",
      { expiresIn: "2d" }
    );

    res.json({
      token,
      link_code: user.us_link_code,
      name: user.us_username,
      subscription_expired: isExpired  // ✅ نرسله إلى الفرونت
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "حدث خطأ في الخادم", error_code: "server_error" });
  }
};
