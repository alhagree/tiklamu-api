const crypto = require("crypto");
const db = require("../../shared/db");

// جلب كل الاشتراكات
exports.getAll = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT subscriptions.*, clients.cl_name, clients.cl_phone 
      FROM subscriptions 
      JOIN clients ON subscriptions.su_client_id = clients.cl_id
    `);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// جلب اشتراك واحد
exports.getById = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT subscriptions.*, clients.cl_name, clients.cl_phone 
      FROM subscriptions 
      JOIN clients ON subscriptions.su_client_id = clients.cl_id 
      WHERE subscriptions.su_id = ?
    `, [req.params.id]);

    if (results.length === 0)
      return res.status(404).json({ error: 'غير موجود' });

    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// إضافة اشتراك
exports.add = async (req, res) => {
  const { su_client_id, su_start_date, su_end_date, su_status, su_type, su_duration } = req.body;

  if (!su_client_id || !su_start_date || !su_end_date)
    return res.status(400).json({ message: "❌ بيانات ناقصة" });

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

    if (actualType === 'first' || actualType === 'trial') {
      const [existingUsers] = await db.query('SELECT * FROM us_users WHERE us_client_id = ?', [su_client_id]);
      if (existingUsers.length === 0) {
        const username = "user_" + su_client_id;
        const password = crypto.randomBytes(4).toString("hex");
        const linkCode = crypto.randomBytes(12).toString("hex");

        await db.query(
          'INSERT INTO us_users (us_client_id, us_username, us_password, us_link_code) VALUES (?, ?, ?, ?)',
          [su_client_id, username, password, linkCode]
        );
      }
    }

    const [insertResult] = await db.query(
      'INSERT INTO subscriptions (su_client_id, su_start_date, su_end_date, su_status, su_type, su_duration) VALUES (?, ?, ?, ?, ?, ?)',
      [
        su_client_id,
        su_start_date,
        su_end_date,
        su_status || "active",
        actualType,
        actualType === 'trial' ? null : su_duration || null
      ]
    );

    res.json({ message: "✅ تمت الإضافة", id: insertResult.insertId });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// تحديث اشتراك
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { su_start_date, su_end_date, su_status, su_type, su_duration } = req.body;

    await db.query(
      'UPDATE subscriptions SET su_start_date = ?, su_end_date = ?, su_status = ?, su_type = ?, su_duration = ? WHERE su_id = ?',
      [su_start_date, su_end_date, su_status, su_type || "renew", su_duration || null, id]
    );

    res.json({ message: "✅ تم التحديث" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// حذف اشتراك
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
      res.json({ message: "✅ تم الحذف مع بيانات الدخول" });
    } else {
      res.json({ message: "✅ تم الحذف" });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
};