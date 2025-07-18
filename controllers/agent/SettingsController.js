// backend/controllers/agent/SettingsController.js

const db = require("../../shared/db");
const fs = require("fs");
const path = require("path");

exports.getSubscriptionDetails = async (req, res) => {
  try {
    const client_id = req.user.id;

const [subscription] = await db.query(
  `SELECT 
     s.su_type, s.su_start_date, s.su_end_date, s.su_status,
     DATEDIFF(s.su_end_date, CURRENT_DATE()) AS days_remaining,
     c.cl_name, c.cl_phone,
     st.st_logo, st.st_background
   FROM subscriptions s
   JOIN clients c ON s.su_client_id = c.cl_id
   JOIN us_users u ON u.us_client_id = c.cl_id
   LEFT JOIN settings st ON st.st_cl_id = c.cl_id
   WHERE c.cl_id = ?
   ORDER BY s.su_start_date DESC
   LIMIT 1`,
  [client_id]
);


    if (!subscription) {
      return res.status(404).json({ message: "لا يوجد اشتراك فعال حالياً" });
    }
    res.json(subscription[0]);
  } catch (err) {
    console.error("getSubscriptionDetails error:", err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
};

// ✅ رفع صور الخلفية والشعار وتحديث قاعدة البيانات
exports.uploadSettingsImages = async (req, res) => {
  try {
    const client_id = req.user.id;
    const link_code = req.user.link_code;

    const logoFile = req.files?.logo?.[0];
    const bgFile = req.files?.background?.[0];

    if (!logoFile && !bgFile) {
      return res.status(400).json({ error: "لم يتم إرسال أي صورة" });
    }

    // استعلام التحقق من وجود السجل
    const [existingRows] = await db.query(
      "SELECT * FROM settings WHERE st_cl_id = ?",
      [client_id]
    );
    const existing = existingRows[0];

    let newLogo = existing?.st_logo;
    let newBackground = existing?.st_background;

    if (logoFile) newLogo = logoFile.filename;
    if (bgFile) newBackground = bgFile.filename;

    if (existing) {
      // تحديث السجل
      await db.query(
        `UPDATE settings SET st_logo = ?, st_background = ? WHERE st_cl_id = ?`,
        [newLogo, newBackground, client_id]
      );
    } else {
      // إدخال سجل جديد
      await db.query(
        `INSERT INTO settings (st_cl_id, st_logo, st_background) VALUES (?, ?, ?)`,
        [client_id, newLogo, newBackground]
      );
    }

    res.json({
      message: "تم حفظ الصور بنجاح",
      logo: newLogo,
      background: newBackground,
    });
  } catch (err) {
    console.error("❌ خطأ أثناء حفظ الصور:", err);
    res.status(500).json({ error: "فشل في حفظ الصور" });
  }
};

exports.updateClientInfo = async (req, res) => {
  try {
    const client_id = req.user.id;
    const { cl_name, cl_phone } = req.body;

    await db.query(
      "UPDATE clients SET cl_name = ?, cl_phone = ? WHERE cl_id = ?",
      [cl_name, cl_phone, client_id]
    );

    res.json({ message: "تم تحديث البيانات بنجاح" });
  } catch (err) {
    console.error("updateClientInfo error:", err);
    res.status(500).json({ message: "فشل في تحديث البيانات" });
  }
};