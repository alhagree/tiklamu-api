// backend/routes/api/admin/imagekit.js
const axios = require("axios");
const express = require("express");
const router = express.Router();
const imagekit = require("../../../utils/imagekit");

// ===========================
// 🔹 1. استهلاك ImageKit (ملفات فقط حالياً)
// ===========================
router.get("/files", async (req, res) => {
  try {
    const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!IMAGEKIT_PRIVATE_KEY) {
      return res.status(500).json({ error: "مفتاح ImageKit غير متوفر" });
    }

    const base64 = Buffer.from(`${IMAGEKIT_PRIVATE_KEY}:`).toString("base64");

    const response = await axios.get("https://api.imagekit.io/v1/files", {
      headers: {
        Authorization: `Basic ${base64}`
      }
    });

    res.json(response.data);
  } catch (err) {
    console.error("❌ فشل في جلب الملفات:", err.response?.data || err.message);
    res.status(500).json({ error: "فشل في جلب الملفات", details: err.response?.data || err.message });
  }
});


// ===========================
// 🔹 2. استهلاك Vercel لكل مشروع
// ===========================

const vercelProjects = {
  tiklamu: process.env.VERCEL_PROJECT_ID_TIKLAMU,
  client: process.env.VERCEL_PROJECT_ID_CLIENT,
  agent: process.env.VERCEL_PROJECT_ID_AGENT,
  admin: process.env.VERCEL_PROJECT_ID_ADMIN,
};

router.get("/vercel/usage/:name", async (req, res) => {
  try {
    const token = process.env.VERCEL_API_TOKEN;
    const projectId = vercelProjects[req.params.name];

    if (!token) return res.status(500).json({ error: "رمز Vercel مفقود" });
    if (!projectId) return res.status(400).json({ error: "مشروع غير معروف" });

    const response = await axios.get("https://api.vercel.com/v2/usage", {
      headers: { Authorization: `Bearer ${token}` }
    });

    // أعد فقط ما يهمنا:
    const data = response.data;
    res.json({
      bandwidth: {
        used: data.bandwidth.used,
        allowed: data.bandwidth.allowed
      },
      requests: {
        used: data.requests.used,
        allowed: data.requests.allowed
      }
    });
  } catch (err) {
    console.error("❌ خطأ في Vercel:", err.response?.data || err.message);
    res.status(500).json({ error: "فشل في جلب استهلاك Vercel", details: err.response?.data || err.message });
  }
});


// ===========================
// 🔹 3. استهلاك Railway لكل مشروع
// ===========================

const railwayProjects = {
  railway_api: process.env.RAILWAY_PROJECT_ID_API,
  railway_db: process.env.RAILWAY_PROJECT_ID_DB,
};

router.get("/railway/usage/:name", async (req, res) => {
  try {
    const token = process.env.RAILWAY_TOKEN;
    const projectId = railwayProjects[req.params.name];

    if (!token) return res.status(500).json({ error: "رمز Railway مفقود" });
    if (!projectId) return res.status(400).json({ error: "مشروع غير معروف" });

    const response = await axios.get(
      `https://backboard.railway.app/project/${projectId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const usage = response.data.metrics?.usage;
    if (!usage) return res.status(404).json({ error: "لا توجد بيانات استخدام متاحة" });

    res.json(usage); // يتضمن CPU و Storage وغيرها
  } catch (err) {
    console.error("❌ خطأ في Railway:", err.response?.data || err.message);
    res.status(500).json({ error: "فشل في جلب استهلاك Railway", details: err.response?.data || err.message });
  }
});

module.exports = router;
