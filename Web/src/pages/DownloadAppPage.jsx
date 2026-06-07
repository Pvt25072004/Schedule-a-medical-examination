import React from "react";
import QRCode from "react-qr-code";
import { Download, Smartphone, CheckCircle, Shield, Zap, QrCode } from "lucide-react";
import Footer from "../components/common/Footer";

const DownloadAppPage = () => {
  // Generate the current URL to be encoded in the QR Code
  // On production, it will be something like https://domain.com/download-app
  const currentUrl = window.location.href;
  
  // Link to the built APK file
  const apkDownloadUrl = "/stl-clinic-app.apk";

  const features = [
    { icon: <Zap className="w-5 h-5 text-[#f99b1c]" />, text: "Đặt lịch khám siêu tốc" },
    { icon: <Shield className="w-5 h-5 text-green-500" />, text: "Bảo mật hồ sơ bệnh án" },
    { icon: <QrCode className="w-5 h-5 text-[#48a1f3]" />, text: "Quét mã QR Check-in tự động" },
    { icon: <CheckCircle className="w-5 h-5 text-purple-500" />, text: "Nhận thông báo lịch khám (FCM)" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fbff] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#48a1f3]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#f99b1c]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
        
        {/* Left Side: Info & Features */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <Smartphone className="w-5 h-5 text-[#48a1f3]" />
            <span className="text-sm font-bold text-[#48a1f3]">Ứng dụng STL Clinic</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black text-[#143250] leading-tight mb-6">
            Quản lý sức khỏe <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#48a1f3] to-[#f99b1c]">Ngay trong tầm tay</span>
          </h1>
          
          <p className="text-lg text-gray-500 mb-8 max-w-lg">
            Tải ngay ứng dụng STL Clinic để đặt lịch khám dễ dàng, quản lý hồ sơ bệnh án và nhận thông báo nhắc nhở 24/7.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 w-full max-w-lg">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
                <div className="p-2 bg-gray-50 rounded-xl">
                  {feature.icon}
                </div>
                <span className="font-semibold text-[#143250] text-sm">{feature.text}</span>
              </div>
            ))}
          </div>

          <a 
            href={apkDownloadUrl}
            download="STL_Clinic_App.apk"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#143250] to-[#1e4a75] text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <Download className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Tải File APK Trực Tiếp</span>
          </a>
          <p className="mt-4 text-sm text-gray-400 font-medium">Phiên bản dành cho điện thoại Android</p>
        </div>

        {/* Right Side: QR Code Scanner */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <div className="relative bg-white p-8 rounded-[2.5rem] shadow-[0_20px_60px_rgb(0,0,0,0.08)] border border-gray-100 max-w-md w-full text-center group">
            {/* Corner decorations for QR scanner look */}
            <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-[#48a1f3] rounded-tl-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-[#48a1f3] rounded-tr-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-[#48a1f3] rounded-bl-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-[#48a1f3] rounded-br-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-[#143250] mb-2">Tải ứng dụng</h3>
              <p className="text-gray-500 text-sm">Dùng Camera điện thoại quét mã QR này để tải trực tiếp trên điện thoại</p>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-inner inline-block border-2 border-gray-50 relative">
              <div className="absolute inset-0 bg-[#48a1f3]/5 animate-pulse rounded-2xl"></div>
              <QRCode 
                value={currentUrl} 
                size={220} 
                fgColor="#143250"
                bgColor="#ffffff"
                level="H"
              />
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-gray-400 bg-gray-50 py-2 px-4 rounded-full w-fit mx-auto">
              <Shield className="w-4 h-4 text-green-500" />
              100% An toàn & Bảo mật
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default DownloadAppPage;
