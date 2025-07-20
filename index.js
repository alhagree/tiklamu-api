//backend\index.js
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");

// ✅ السماح لواجهتي العميل والزبون
const allowedOrigins = [
  "https://menu-agent.vercel.app",
  "https://menu-client-puce.vercel.app",
  "https://menu-admin-nu.vercel.app",
  "https://menu.tiklamu.com",
  "https://agent.tiklamu.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
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
