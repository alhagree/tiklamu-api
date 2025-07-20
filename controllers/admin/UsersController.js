const db = require("../../shared/db");

exports.getByClientId = async (req, res) => {
  const clientId = req.params.id;

  try {
    const [results] = await db.query(
      'SELECT us_username, us_password, us_link_code FROM us_users WHERE us_client_id = ?',
      [clientId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'لا توجد بيانات دخول لهذا العميل' });
    }

    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
