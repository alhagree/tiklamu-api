// backend/routes/api/admin/imagekit.js
const axios = require("axios");
const express = require("express");
const router = express.Router();
const imagekit = require("../../../utils/imagekit");

// 🔹 1. جلب معلومات الاستخدام من ImageKit
router.get("/usage", async (req, res) => {
  try {
    const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;

    if (!IMAGEKIT_PRIVATE_KEY) {
      console.error("❌ IMAGEKIT_PRIVATE_KEY غير متوفر في البيئة");
      return res.status(500).json({ error: "مفتاح ImageKit غير متوفر" });
    }

    const base64 = Buffer.from(`${IMAGEKIT_PRIVATE_KEY}:`).toString("base64");

    const response = await axios.get("https://api.imagekit.io/v1/api-usage", {
      headers: {
        Authorization: `Basic ${base64}`,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error("❌ فشل في جلب الاستخدام:", err.message);
    res.status(500).json({ error: "فشل في جلب معلومات الاستخدام" });
  }
});

// 🔹 2. جلب بيانات Vercel
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

    if (!token) return res.status(500).json({ error: "رمز Vercel مفقود" });
    if (!projectId) return res.status(400).json({ error: "مشروع غير معروف" });

    const response = await axios.get(
      `https://api.vercel.com/v6/deployments?projectId=${projectId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json(response.data);
  } catch (err) {
    console.error("❌ خطأ في Vercel:", err.message);
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

    if (!token) return res.status(500).json({ error: "رمز Railway مفقود" });
    if (!projectId) return res.status(400).json({ error: "مشروع غير معروف" });

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
