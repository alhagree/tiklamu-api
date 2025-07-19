//backend\controllers\agent\SettingsController.js
const db = require("../../shared/db");
const imagekit = require("../../utils/imagekit");
const path = require("path");

exports.getFullSettingsWithSubscription = async (req, res) => {
  const clientId = req.user.id;

  try {
    // الإعدادات
    const [settingsRows] = await db.query(
      `SELECT * FROM settings WHERE st_cl_id = ? LIMIT 1`,
      [clientId]
    );
    const settings = settingsRows[0] || {};

    // معلومات العميل
    const [clientRows] = await db.query(
      `SELECT cl_name, cl_phone FROM clients WHERE cl_id = ?`,
      [clientId]
    );
    const client = clientRows[0] || {};

    // الاشتراك الأحدث
    const [subRows] = await db.query(
      `SELECT * FROM subscriptions WHERE su_client_id = ? ORDER BY su_end_date DESC LIMIT 1`,
      [clientId]
    );
    const subscription = subRows[0] || {};

    // حساب المدة المتبقية
    let days_remaining = null;
    if (subscription.su_end_date) {
      const end = new Date(subscription.su_end_date);
      const today = new Date();
      days_remaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    }

    res.json({
      ...settings,
      ...client,
      ...subscription,
      days_remaining,
    });
  } catch (err) {
    console.error("Full Settings Error:", err);
    res.status(500).json({ error: "خطأ أثناء جلب البيانات" });
  }
};


// ✅ جلب الإعدادات
exports.getSettings = async (req, res) => {
  try {
    const clientId = req.user.id;

    const [rows] = await db.query(
      `SELECT * FROM settings WHERE st_cl_id = ? LIMIT 1`,
      [clientId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "لا توجد إعدادات لهذا العميل" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Get Settings Error:", err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
};

// ✅ تحديث الإعدادات
exports.updateSettings = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { name, phone } = req.body;
    const link_code = req.user?.link_code;

    let logo = null;
    let background = null;

    // تحقق من وجود إعدادات مسبقة
    const [existingRows] = await db.query(
      "SELECT * FROM settings WHERE st_cl_id = ? LIMIT 1",
      [clientId]
    );

    const existing = existingRows[0];

    if (req.files?.logo?.[0]) {
      const logoUpload = await imagekit.upload({
        file: req.files.logo[0].buffer,
        fileName: Date.now() + path.extname(req.files.logo[0].originalname),
        folder: `/menu_project/settings/${link_code}`
      });
      logo = logoUpload.url;
    } else {
      logo = existing?.st_logo || null;
    }

    if (req.files?.background?.[0]) {
      const bgUpload = await imagekit.upload({
        file: req.files.background[0].buffer,
        fileName: Date.now() + path.extname(req.files.background[0].originalname),
        folder: `/menu_project/settings/${link_code}`
      });
      background = bgUpload.url;
    } else {
      background = existing?.st_background || null;
    }

    if (existing) {
      // تحديث الإعدادات
      await db.query(
        `UPDATE settings 
         SET st_name = ?, st_phone = ?, st_logo = ?, st_background = ?
         WHERE st_cl_id = ?`,
        [name, phone, logo, background, clientId]
      );
    } else {
      // إنشاء جديد
      await db.query(
        `INSERT INTO settings (st_name, st_phone, st_logo, st_background, st_cl_id)
         VALUES (?, ?, ?, ?, ?)`,
        [name, phone, logo, background, clientId]
      );
    }

    res.json({ success: true, message: "تم تحديث الإعدادات بنجاح" });
  } catch (err) {
    console.error("Update Settings Error:", err);
    res.status(500).json({ error: "فشل في تحديث الإعدادات" });
  }
};
