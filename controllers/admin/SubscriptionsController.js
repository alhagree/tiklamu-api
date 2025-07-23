// SubscriptionsController.js
const crypto = require("crypto");
const db = require("../../shared/db");
const QRCode = require("qrcode");
const imagekit = require("../../utils/imagekit"); // ✅ استخدام ImageKit
const path = require("path");
const fs = require("fs");

exports.getAll = async (req, res) => {
  try {
    const [subscriptions] = await db.query(`
      SELECT 
        s.*, 
        c.cl_name, 
        c.cl_phone,
        l.la_name
      FROM subscriptions s
      JOIN clients c ON s.su_client_id = c.cl_id
      LEFT JOIN levels l ON s.su_level_id = l.la_id
      ORDER BY s.su_start_date DESC
    `);
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.getById = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT subscriptions.*, clients.cl_name, clients.cl_phone, settings.st_barcode
      FROM subscriptions 
      JOIN clients ON subscriptions.su_client_id = clients.cl_id 
      LEFT JOIN settings ON clients.cl_id = settings.st_cl_id
      LEFT JOIN levels ON subscriptions.su_level_id = levels.la_id
      WHERE subscriptions.su_id = ?
    `, [req.params.id]);

    if (results.length === 0)
      return res.status(404).json({ error: 'غير موجود' });

    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.add = async (req, res) => {
  const {
    su_client_id,
    su_start_date,
    su_end_date,
    su_status,
    su_type,
    su_duration,
    su_level_id,
  } = req.body;

  if (!su_client_id || !su_start_date || !su_end_date)
    return res.status(400).json({ message: "❌ بيانات ناقصة" });

  if (!su_level_id)
  return res.status(400).json({ message: "❌ يجب اختيار باقة الاشتراك" });

  try {
    const [clientResult] = await db.query('SELECT * FROM clients WHERE cl_id = ?', [su_client_id]);
    if (clientResult.length === 0)
      return res.status(400).json({ message: "❌ العميل غير موجود" });

    const [activeSubs] = await db.query(`
      SELECT * FROM subscriptions 
      WHERE su_client_id = ? AND su_status = 'active' 
      AND NOT (su_end_date < ? OR su_start_date > ?)
    `, [su_client_id, su_start_date, su_end_date]);

    if (activeSubs.length > 0)
      return res.status(400).json({ message: "❌ يوجد اشتراك فعال لهذا العميل في نفس الفترة" });

    const [countResult] = await db.query(
      'SELECT COUNT(*) AS count FROM subscriptions WHERE su_client_id = ?',
      [su_client_id]
    );

    let actualType = 'renew';
    if (su_type === 'trial') actualType = 'trial';
    else if (countResult[0].count === 0) actualType = 'first';

    let linkCode = null;

    if (actualType === 'first' || actualType === 'trial') {
      const [existingUsers] = await db.query(
        'SELECT * FROM us_users WHERE us_client_id = ?',
        [su_client_id]
      );

      if (existingUsers.length === 0) {
        const username = "user_" + su_client_id;
        const password = crypto.randomBytes(4).toString("hex");
        linkCode = crypto.randomBytes(12).toString("hex");

        await db.query(
          'INSERT INTO us_users (us_client_id, us_username, us_password, us_link_code) VALUES (?, ?, ?, ?)',
          [su_client_id, username, password, linkCode]
        );

        // توليد الباركود كـ Buffer
        const clientUrl = `https://menu.tiklamu.com/?link_code=${linkCode}`;
        const qrBuffer = await QRCode.toBuffer(clientUrl, {
          width: 300,
          margin: 2,
          color: { dark: "#000", light: "#fff" }
        });

        // رفع الباركود إلى ImageKit
        const imageName = `barcode_${linkCode}.png`;
        const uploadResponse = await imagekit.upload({
          file: qrBuffer,
          fileName: imageName,
          folder: `/menu_project/settings/${linkCode}`,
          overwriteFile: true
        });

        // حفظ رابط الباركود في settings
        await db.query(`
          INSERT INTO settings (st_cl_id, st_barcode) 
          VALUES (?, ?) 
          ON DUPLICATE KEY UPDATE st_barcode = ?
        `, [su_client_id, uploadResponse.url, uploadResponse.url]);
      }
    }

const [insertResult] = await db.query(
  `INSERT INTO subscriptions 
    (su_client_id, su_start_date, su_end_date, su_status, su_type, su_duration, su_level_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [
    su_client_id,
    su_start_date,
    su_end_date,
    su_status || "active",
    actualType,
    actualType === 'trial' ? null : su_duration || null,
    su_level_id // ✅ جديد
  ]
);


    res.json({ message: "✅ تمت الإضافة", id: insertResult.insertId });
  } catch (err) {
    console.error("❌ Error in add subscription:", err);
    res.status(500).json({ error: err });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { su_start_date, su_end_date, su_status, su_type, su_duration, su_level_id  } = req.body;

    if (!su_level_id) {
  return res.status(400).json({ message: "❌ يجب اختيار باقة الاشتراك" });
}


    await db.query(
  `UPDATE subscriptions 
   SET su_start_date = ?, su_end_date = ?, su_status = ?, su_type = ?, su_duration = ?, su_level_id = ?
   WHERE su_id = ?`,
  [
    su_start_date,
    su_end_date,
    su_status,
    su_type || "renew",
    su_duration || null,
    su_level_id, // ✅ جديد
    id
  ]
);


    res.json({ message: "✅ تم التحديث" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const [subResult] = await db.query('SELECT su_client_id FROM subscriptions WHERE su_id = ?', [id]);
    if (subResult.length === 0)
      return res.status(404).json({ error: 'الاشتراك غير موجود' });

    const clientId = subResult[0].su_client_id;
    await db.query('DELETE FROM subscriptions WHERE su_id = ?', [id]);

    const [countRes] = await db.query('SELECT COUNT(*) AS count FROM subscriptions WHERE su_client_id = ?', [clientId]);

    if (countRes[0].count === 0) {
      await db.query('DELETE FROM us_users WHERE us_client_id = ?', [clientId]);
      await db.query('DELETE FROM settings WHERE st_cl_id = ?', [clientId]);
      res.json({ message: "✅ تم الحذف مع بيانات الدخول والباركود" });
    } else {
      res.json({ message: "✅ تم الحذف" });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
