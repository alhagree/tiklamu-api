const db = require("../../shared/db");
const imagekit = require("../../utils/imagekit");
const path = require("path");

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

    let logoFilename = null;
    let backgroundFilename = null;

    if (req.files?.logo?.[0]) {
      const ext = path.extname(req.files.logo[0].originalname);
      const now = new Date();
      const formatted =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0") +
        String(now.getHours()).padStart(2, "0") +
        String(now.getMinutes()).padStart(2, "0") +
        String(now.getSeconds()).padStart(2, "0");

      const fileName = `logo-${formatted}${ext}`;

      const upload = await imagekit.upload({
        file: req.files.logo[0].buffer,
        fileName: fileName,
        folder: `/menu_project/clients/${link_code}/settings`,
        useUniqueFileName: true,
      });

      logoFilename = path.basename(upload.filePath);
    }

    if (req.files?.background?.[0]) {
      const ext = path.extname(req.files.background[0].originalname);
      const now = new Date();
      const formatted =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0") +
        String(now.getHours()).padStart(2, "0") +
        String(now.getMinutes()).padStart(2, "0") +
        String(now.getSeconds()).padStart(2, "0");

      const fileName = `background-${formatted}${ext}`;

      const upload = await imagekit.upload({
        file: req.files.background[0].buffer,
        fileName: fileName,
        folder: `/menu_project/clients/${link_code}/settings`,
        useUniqueFileName: true,
      });

      backgroundFilename = path.basename(upload.filePath);
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
    if (logoFilename) {
      updateSettingsSql += `st_logo = ?, `;
      settingsParams.push(logoFilename);
    }
    if (backgroundFilename) {
      updateSettingsSql += `st_background = ?, `;
      settingsParams.push(backgroundFilename);
    }

    if (settingsParams.length > 0) {
      updateSettingsSql = updateSettingsSql.slice(0, -2);
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
