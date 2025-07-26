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
     s.su_end_date,
     l.la_id AS level_id,
     l.la_name AS level_name,
     l.la_description as level_description,
     l.la_code as level_code
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

// ✅ جلب مزايا الخطة من جدول level_features
let featuresMap = {
  max_items: 0,
  max_sections: 0,
  has_dashboard: false,
  can_customize_logo: false,
};

if (subscription?.level_id) {
  const [features] = await db.query(
    `SELECT lf_key, lf_value FROM level_features WHERE lf_level_id = ?`,
    [subscription.level_id]
  );

  for (let feature of features) {
    const key = feature.lf_key;
    let val = feature.lf_value;

    // تحويل القيم الرقمية والمنطقية
    if (val === "unlimited") {
      featuresMap[key] = "غير محدود";
    } else if (val === "0" || val === "1") {
      featuresMap[key] = val === "1";
    } else if (!isNaN(val)) {
      featuresMap[key] = parseInt(val);
    } else {
      featuresMap[key] = val;
    }
  }
}

const result = {
  username: sectionClient[0]?.cl_name || "",
  fullname : sectionClient[0]?.cl_fullname || "",
  sectionCount: sectionRes[0]?.count || 0,
  itemCount: itemRes[0]?.count || 0,
  subscriptionEnd: endDate,
  subscriptionExpired: isExpired,
  daysLeft,

  // ✅ معلومات الباقة ومزاياها
  level: {
    name: subscription?.level_name || "غير محددة",
    sectionLimit: featuresMap.max_sections,
    description:subscription?.level_description,
    code:subscription?.level_code,
    itemLimit: featuresMap.max_items,
    hasDashboard: featuresMap.has_dashboard,
    hasLogo: featuresMap.can_customize_logo,
  },
};

return res.json(result);


  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ error: "حدث خطأ أثناء تحميل البيانات" });
  }
};
