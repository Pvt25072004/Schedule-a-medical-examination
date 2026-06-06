import React from "react";
import { UserPlus, Search, CalendarCheck, CreditCard, Stethoscope, CheckCircle2 } from "lucide-react";
import Footer from "../components/common/Footer";

const steps = [
  {
    icon: <UserPlus className="w-8 h-8" />,
    title: "Bước 1: Đăng nhập / Đăng ký",
    description: "Tạo tài khoản mới hoặc đăng nhập vào hệ thống bằng số điện thoại/email để bắt đầu sử dụng dịch vụ.",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: <Search className="w-8 h-8" />,
    title: "Bước 2: Tìm kiếm bác sĩ",
    description: "Sử dụng thanh tìm kiếm hoặc lọc theo chuyên khoa, triệu chứng để tìm bác sĩ phù hợp nhất với nhu cầu của bạn.",
    color: "bg-orange-100 text-orange-600"
  },
  {
    icon: <CalendarCheck className="w-8 h-8" />,
    title: "Bước 3: Chọn lịch khám",
    description: "Xem lịch trống của bác sĩ và chọn ngày, giờ khám phù hợp với lịch trình của bạn. Điền thông tin hồ sơ y tế.",
    color: "bg-green-100 text-green-600"
  },
  {
    icon: <CreditCard className="w-8 h-8" />,
    title: "Bước 4: Thanh toán (nếu có)",
    description: "Thanh toán phí khám bệnh thông qua các cổng thanh toán an toàn như VNPAY hoặc mã QR để giữ chỗ.",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: <Stethoscope className="w-8 h-8" />,
    title: "Bước 5: Khám bệnh",
    description: "Đến cơ sở y tế theo thời gian đã hẹn hoặc tham gia phòng khám trực tuyến nếu bạn chọn hình thức khám Online.",
    color: "bg-red-100 text-red-600"
  }
];

const BookingGuidePage = ({ navigate }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#f8fbff] to-white pt-20 pb-16 relative border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#143250]">
            Hướng dẫn đặt lịch khám
          </h1>
          <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto">
            Chỉ với 5 bước đơn giản, bạn có thể dễ dàng đặt lịch khám với các bác sĩ hàng đầu tại hệ thống STL Clinic.
          </p>
        </div>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-20 pb-20">
        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-10 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-blue-100 before:via-blue-300 before:to-blue-100">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className={`flex items-center justify-center w-20 h-20 rounded-full border-4 border-white shadow-lg shrink-0 ${step.color} z-10 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                  {step.icon}
                </div>
                
                <div className="w-[calc(100%-6rem)] md:w-[calc(50%-4rem)] p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <h3 className="font-bold text-xl text-[#143250]">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <button 
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-[#48a1f3] to-[#3da3f5] text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:-translate-y-1 transition-all shadow-blue-500/30"
          >
            Bắt đầu đặt lịch ngay
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingGuidePage;
