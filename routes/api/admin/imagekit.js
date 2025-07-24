// backend/routes/api/admin/imagekit.js
const axios = require("axios");
const express = require("express");
const router = express.Router();
const imagekit = require("../../../utils/imagekit");

// 🔹 1. جلب معلومات الاستخدام
router.get("/usage", async (req, res) => {
  try {
    const usage = await imagekit.getUsageAsync(); // ✅ استخدام الدالة الجديدة
    res.json(usage);
  } catch (err) {
    console.error("❌ فشل في جلب الاستخدام:", err);
    res.status(500).json({ error: "فشل في جلب معلومات الاستخدام" });
  }
});


const vercelProjects = {
  tiklamu: process.env.VERCEL_PROJECT_ID_TIKLAMU,
  client: process.env.VERCEL_PROJECT_ID_CLIENT,
  agent: process.env.VERCEL_PROJECT_ID_AGENT,
  admin: process.env.VERCEL_PROJECT_ID_ADMIN,
};

router.get("/vercel/:name", async (req, res) => {
  try {
    const token = process.env.VERCEL_API_TOKEN;
    const projectId = vercelProjects[req.params.name];
    if (!projectId) return res.status(400).json({ error: "مشروع غير معروف" });

    const response = await axios.get(
      `https://api.vercel.com/v6/deployments?projectId=${projectId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "فشل في جلب بيانات Vercel" });
  }
});

// 🔹 3. جلب بيانات Railway

const railwayProjects = {
  railway_api: process.env.RAILWAY_PROJECT_ID_API,
  railway_db: process.env.RAILWAY_PROJECT_ID_DB,
};
router.get("/railway/:name", async (req, res) => {
  try {
    const token = process.env.RAILWAY_TOKEN;
    const projectId = railwayProjects[req.params.name];

    const response = await axios.get(
      `https://backboard.railway.app/project/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("❌ خطأ في Railway:", err.message);
    res.status(500).json({ error: "فشل في جلب بيانات Railway" });
  }
});

module.exports = router;
