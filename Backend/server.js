const express = require("express");
const cors = require("cors");
require("dotenv").config();
const otpRoutes = require("./src/routes/otpRoutes");

const app = express();  // 💡 app phải được tạo trước khi dùng

app.use(cors());
app.use(express.json());

// ✅ Đăng ký route sau khi có app
app.use("/api/auth", otpRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server chạy tại http://localhost:${PORT}`));
