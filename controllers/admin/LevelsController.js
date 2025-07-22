// LevelsController.js
const db = require("../../shared/db");

// جلب كل الخطط
exports.getAll = async (req, res) => {
  try {
    const [levels] = await db.query("SELECT * FROM levels");
    res.json(levels);
  } catch (err) {
    console.error("❌ Error fetching levels:", err);
    res.status(500).json({ error: err });
  }
};
