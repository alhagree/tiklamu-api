const db = require("../../shared/db");

exports.getDashboardData = async (req, res) => {
  try {
    const client_id = req.user.id; // ← من التوكن    

    // 🔢 معلومات العميل
    const [sectionClient] = await db.query(
      "SELECT * FROM `clients` WHERE `cl_id` = ?",
      [client_id]
    );

    // 🔢 عدد الأقسام الخاصة بهذا العميل
    const [sectionRes] = await db.query(
      "SELECT COUNT(*) AS count FROM sections WHERE se_client_id = ?",
      [client_id]
    );

    // 🍽️ عدد الأصناف المرتبطة بأقسام هذا العميل
    const [itemRes] = await db.query(
      `SELECT COUNT(*) AS count 
       FROM items 
       WHERE it_se_id IN (
         SELECT se_id FROM sections WHERE se_client_id = ?
       )`,
      [client_id]
    );

    // 📆 الاشتراك الفعّال الحالي للعميل
    const [subscriptionRes] = await db.query(
      `SELECT su_end_date FROM subscriptions 
       WHERE su_client_id = ? AND su_end_date >= CURDATE()
       ORDER BY su_end_date DESC LIMIT 1`,
      [client_id]
    );

    const result = {
      username: sectionClient[0]?.cl_name || "",
      sectionCount: sectionRes[0]?.count || 0,
      itemCount: itemRes[0]?.count || 0,
      subscriptionEnd: subscriptionRes[0]?.su_end_date || null,      
    };  

    return res.json(result);

  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ error: "حدث خطأ أثناء تحميل البيانات" });
  }
};