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

app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
