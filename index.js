const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");

// إعداد CORS للسماح بطلبات من الواجهة فقط
const allowedOrigins = ["https://menu-agent.vercel.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      // السماح بطلبات Postman أو الطلبات بدون Origin
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // ← إن كنت ترسل كوكيز أو Authorization
  })
);

// Body Parser
app.use(express.json());

// الصور الثابتة
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// الراوتر الأساسي
app.use("/api", require("./routes/api"));

// اختبار مباشر
app.get("/", (req, res) => {
  res.send("✅ Backend is working!");
});

// التشغيل
app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
