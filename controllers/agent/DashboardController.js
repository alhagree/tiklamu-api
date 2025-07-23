const db = require("../../shared/db");

exports.getDashboardData = async (req, res) => {
  try {
    const client_id = req.user.id;

    // جلب اسم العميل
    const [sectionClient] = await db.query(
      "SELECT * FROM `clients` WHERE `cl_id` = ?",
      [client_id]
    );

    // عدد الأقسام
    const [sectionRes] = await db.query(
      "SELECT COUNT(*) AS count FROM sections WHERE se_client_id = ?",
      [client_id]
    );

    // عدد الأصناف
    const [itemRes] = await db.query(
      `SELECT COUNT(*) AS count 
       FROM items 
       WHERE it_se_id IN (
         SELECT se_id FROM sections WHERE se_client_id = ?
       )`,
      [client_id]
    );

    // الاشتراك (حتى لو منتهي)
const [subscriptionRes] = await db.query(
  `SELECT 
     su_end_date,
     l.la_name AS level_name,
     l.la_section_limit AS section_limit,
     l.la_item_limit AS item_limit,
     l.la_has_dashboard AS has_dashboard,
     l.la_has_logo AS has_logo
   FROM subscriptions s
   JOIN levels l ON s.su_level_id = l.la_id
   WHERE s.su_client_id = ?
   ORDER BY s.su_end_date DESC
   LIMIT 1`,
  [client_id]
);

const subscription = subscriptionRes[0] || {};
const endDate = subscription?.su_end_date || null;
const today = new Date();
const end = endDate ? new Date(endDate) : null;
const isExpired = end && end < today;

let daysLeft = null;
if (end) {
  const diff = end - today;
  daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const result = {
  username: sectionClient[0]?.cl_name || "",
  sectionCount: sectionRes[0]?.count || 0,
  itemCount: itemRes[0]?.count || 0,
  subscriptionEnd: endDate,
  subscriptionExpired: isExpired,
  daysLeft,

  // ✅ بيانات الباقة
  level: {
    name: subscription?.level_name || "غير محددة",
    sectionLimit: subscription?.section_limit ?? 0,
    itemLimit: subscription?.item_limit ?? 0,
    hasDashboard: subscription?.has_dashboard == 1,
    hasLogo: subscription?.has_logo == 1,
  },
};

return res.json(result);

  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ error: "حدث خطأ أثناء تحميل البيانات" });
  }
};
