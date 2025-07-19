const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// 🔒 قائمة الدومينات المسموح بها (Vercel + Localhost للتطوير)
const allowedOrigins = [
  "https://menu-agent.vercel.app", // ← واجهة العميل المستضافة على Vercel
  "http://localhost:5173"          // ← لتجربة محلية إن وجدت
];

// ⚙️ إعداد CORS بتحديد origin والسماح بإرسال الكوكيز/التوكن
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("❌ Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// 🧠 دعم JSON في الطلبات
app.use(express.json());

// 🖼️ توفير الوصول للصور
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 📦 الراوتر المركزي
app.use("/api", require("./routes/api"));

// 🧪 اختبار مباشر
app.get("/", (req, res) => {
  res.send("✅ Backend is working!");
});

// 🚀 تشغيل السيرفر
app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
