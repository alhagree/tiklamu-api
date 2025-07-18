//backend\index.js
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const path = require("path");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ كل شيء يمر عبر الراوتر المركزي
app.use("/api", require("./routes/api"));

app.get("/", (req, res) => {
  res.send("✅ Backend is working!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

console.log("⏳ Starting app...");
console.log("📦 PORT:", process.env.PORT);
