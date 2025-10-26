const axios = require("axios");

const serviceId = process.env.EMAILJS_SERVICE_ID;
const templateId = process.env.EMAILJS_TEMPLATE_ID;
const publicKey = process.env.EMAILJS_PUBLIC_KEY;

exports.sendOtpEmail = async (email, otp) => {
  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      to_email: email,
      otp: otp,
      name: "STL - Clinic Booking"
    }
  };

  try {
    await axios.post(
      "https://api.emailjs.com/api/v1.0/email/send",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "origin": "http://localhost"
        }
      }
    );
  } catch (error) {
    console.error(error.response?.data);
    throw new Error("Gửi OTP thất bại");
  }
};
