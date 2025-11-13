const admin = require('../firebaseAdmin');
const { sendOtpEmail } = require("../services/otpService");

const otps = new Map(); // bạn có thể nâng cấp sau bằng Redis

exports.requestReset = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Thiếu email" });

  try {
    const user = await admin.auth().getUserByEmail(email);
    const otp = Math.floor(100000 + Math.random()*900000).toString();
    otps.set(email, otp);
    setTimeout(() => otps.delete(email), 5 * 60 * 1000); // hết hạn 5 phút

    await sendOtpEmail(email, otp);
    console.log(`OTP cho ${email}: ${otp}`);
    return res.json({ success: true, message: "OTP đã gửi về email" });
  } catch (error) {
    return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản" });
  }
};

exports.verifyReset = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin" });
  }

  const savedOtp = otps.get(email);
  if (savedOtp !== otp) {
    return res.status(400).json({ success: false, message: "OTP sai hoặc hết hạn" });
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { password: newPassword });
    otps.delete(email);
    return res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi đổi mật khẩu" });
  }
};
