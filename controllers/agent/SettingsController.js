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
  const clientId = req.user.id;
  const link_code = req.user.link_code;

  try {
    const { cl_name, cl_phone } = req.body;

    let logoUrl = null;
    let backgroundUrl = null;

    if (req.files?.logo?.[0]) {
      const uploadedLogo = await imagekit.upload({
        file: req.files.logo[0].buffer,
        fileName: `${Date.now()}-${req.files.logo[0].originalname}`,
        folder: `/menu_project/settings/${link_code}`,
      });
      logoUrl = uploadedLogo.url;
    }

    if (req.files?.background?.[0]) {
      const uploadedBackground = await imagekit.upload({
        file: req.files.background[0].buffer,
        fileName: `${Date.now()}-${req.files.background[0].originalname}`,
        folder: `/menu_project/settings/${link_code}`,
      });
      backgroundUrl = uploadedBackground.url;
    }

    // تحديث جدول clients
    const updateClientSql = `
      UPDATE clients
      SET cl_name = ?, cl_phone = ?
      WHERE cl_id = ?
    `;
    await db.query(updateClientSql, [cl_name, cl_phone, clientId]);

    // تحديث جدول settings
    let updateSettingsSql = `UPDATE settings SET `;
    const settingsParams = [];
    if (logoUrl) {
      updateSettingsSql += `st_logo = ?, `;
      settingsParams.push(logoUrl);
    }
    if (backgroundUrl) {
      updateSettingsSql += `st_background = ?, `;
      settingsParams.push(backgroundUrl);
    }

    // فقط إذا وُجدت صور نُحدث جدول الإعدادات
    if (settingsParams.length > 0) {
      updateSettingsSql = updateSettingsSql.slice(0, -2); // إزالة الفاصلة الأخيرة
      updateSettingsSql += ` WHERE st_cl_id = ?`;
      settingsParams.push(clientId);
      await db.query(updateSettingsSql, settingsParams);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Update Settings Error:", err.message);
    res.status(500).json({ error: "فشل في تحديث البيانات" });
  }
};