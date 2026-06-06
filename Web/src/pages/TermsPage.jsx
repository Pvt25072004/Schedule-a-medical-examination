import React from "react";
import { FileText, CheckCircle } from "lucide-react";
import Footer from "../components/common/Footer";

const TermsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pt-10">
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-orange-50 text-[#f99b1c] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#143250] mb-4">
              Điều khoản sử dụng
            </h1>
            <p className="text-gray-500">Cập nhật lần cuối: Tháng 6, 2026</p>
          </div>

          <div className="prose prose-blue max-w-none text-gray-600">
            <p className="mb-6 font-medium">
              Chào mừng bạn đến với STL Clinic. Bằng việc truy cập và sử dụng nền tảng của chúng tôi, bạn đồng ý tuân thủ các điều khoản sau đây:
            </p>

            <h2 className="text-xl font-bold text-[#143250] flex items-center gap-2 mt-8 mb-4">
              <CheckCircle className="w-5 h-5 text-[#f99b1c]" /> 1. Về dịch vụ của chúng tôi
            </h2>
            <p className="mb-4">
              STL Clinic là nền tảng công nghệ kết nối bệnh nhân với các bác sĩ và cơ sở y tế. Chúng tôi cung cấp công cụ để đặt lịch, thanh toán và tư vấn trực tuyến. STL Clinic <strong>không phải là cơ sở khám chữa bệnh</strong> và không trực tiếp cung cấp dịch vụ y tế.
            </p>

            <h2 className="text-xl font-bold text-[#143250] flex items-center gap-2 mt-8 mb-4">
              <CheckCircle className="w-5 h-5 text-[#f99b1c]" /> 2. Trách nhiệm của người dùng
            </h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Cung cấp thông tin cá nhân và tình trạng sức khỏe trung thực, chính xác.</li>
              <li>Tự bảo mật tài khoản và mật khẩu của mình.</li>
              <li>Tuân thủ thời gian khám bệnh đã đặt. Nếu không thể tham gia, vui lòng hủy lịch theo quy định.</li>
              <li>Thanh toán đầy đủ các khoản phí dịch vụ (nếu có) khi đặt lịch.</li>
            </ul>

            <h2 className="text-xl font-bold text-[#143250] flex items-center gap-2 mt-8 mb-4">
              <CheckCircle className="w-5 h-5 text-[#f99b1c]" /> 3. Chính sách hủy lịch và hoàn tiền
            </h2>
            <p className="mb-4">
              Người dùng có quyền hủy lịch khám. Chính sách hoàn tiền (áp dụng cho các thanh toán trước) sẽ phụ thuộc vào quy định cụ thể của từng cơ sở y tế và thời điểm hủy lịch.
            </p>
            
            <h2 className="text-xl font-bold text-[#143250] flex items-center gap-2 mt-8 mb-4">
              <CheckCircle className="w-5 h-5 text-[#f99b1c]" /> 4. Giới hạn trách nhiệm
            </h2>
            <p className="mb-4">
              STL Clinic không chịu trách nhiệm đối với các rủi ro phát sinh từ tư vấn chuyên môn của bác sĩ. Mọi khiếu nại về chất lượng khám chữa bệnh sẽ được giải quyết trực tiếp với cơ sở y tế/bác sĩ tương ứng.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;
