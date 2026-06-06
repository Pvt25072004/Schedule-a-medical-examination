import React from "react";
import { Shield, Lock, FileCheck } from "lucide-react";
import Footer from "../components/common/Footer";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pt-10">
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-50 text-[#48a1f3] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#143250] mb-4">
              Chính sách bảo mật
            </h1>
            <p className="text-gray-500">Cập nhật lần cuối: Tháng 6, 2026</p>
          </div>

          <div className="prose prose-blue max-w-none text-gray-600">
            <h2 className="text-xl font-bold text-[#143250] flex items-center gap-2 mt-8 mb-4">
              <Lock className="w-5 h-5 text-[#48a1f3]" /> 1. Thu thập thông tin
            </h2>
            <p className="mb-4">
              STL Clinic cam kết bảo vệ sự riêng tư và thông tin cá nhân của bạn. Khi bạn sử dụng dịch vụ của chúng tôi, chúng tôi có thể thu thập các thông tin sau:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Thông tin định danh: Họ tên, ngày sinh, giới tính.</li>
              <li>Thông tin liên lạc: Số điện thoại, địa chỉ email, địa chỉ nơi ở.</li>
              <li>Thông tin y tế: Hồ sơ bệnh án, triệu chứng, kết quả khám (chỉ được lưu trữ khi bạn đồng ý và dùng cho mục đích khám chữa bệnh).</li>
            </ul>

            <h2 className="text-xl font-bold text-[#143250] flex items-center gap-2 mt-8 mb-4">
              <FileCheck className="w-5 h-5 text-[#48a1f3]" /> 2. Sử dụng thông tin
            </h2>
            <p className="mb-4">Thông tin của bạn được sử dụng vào các mục đích:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Cung cấp dịch vụ đặt lịch khám và tư vấn y tế.</li>
              <li>Gửi thông báo xác nhận, nhắc hẹn và các thông tin liên quan đến dịch vụ.</li>
              <li>Cải thiện chất lượng nền tảng và trải nghiệm người dùng.</li>
              <li>Tuân thủ các yêu cầu pháp lý của cơ quan nhà nước có thẩm quyền.</li>
            </ul>

            <h2 className="text-xl font-bold text-[#143250] mt-8 mb-4">
              3. Bảo mật dữ liệu
            </h2>
            <p className="mb-4">
              Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức nghiêm ngặt (như mã hóa SSL, tường lửa) để bảo vệ thông tin của bạn khỏi việc truy cập, thay đổi, hoặc phá hoại trái phép.
            </p>
            
            <h2 className="text-xl font-bold text-[#143250] mt-8 mb-4">
              4. Chia sẻ thông tin
            </h2>
            <p className="mb-4">
              STL Clinic tuyệt đối không bán hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba. Thông tin chỉ được chia sẻ cho các bác sĩ/cơ sở y tế mà bạn đặt lịch khám để phục vụ mục đích chuyên môn.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
