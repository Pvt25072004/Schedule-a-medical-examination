import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle } from "lucide-react";
import Footer from "../components/common/Footer";

const faqs = [
  {
    question: "Làm thế nào để đặt lịch khám?",
    answer: "Bạn có thể đặt lịch khám bằng cách đăng nhập vào tài khoản, chọn mục 'Đặt lịch khám' hoặc tìm kiếm bác sĩ/chuyên khoa mong muốn và chọn thời gian phù hợp."
  },
  {
    question: "Tôi có thể thanh toán qua các hình thức nào?",
    answer: "Chúng tôi hiện hỗ trợ thanh toán qua VNPAY, mã QR (VietQR) và thanh toán bằng tiền mặt tại cơ sở y tế (nếu được hỗ trợ)."
  },
  {
    question: "Tôi có thể hủy lịch khám không?",
    answer: "Có. Bạn có thể hủy lịch khám trước thời gian hẹn ít nhất 4 tiếng. Tiền sẽ được hoàn lại (nếu có) theo chính sách hoàn tiền của hệ thống."
  },
  {
    question: "Làm sao để biết lịch khám của tôi đã được xác nhận?",
    answer: "Sau khi đặt lịch thành công, hệ thống sẽ hiển thị trạng thái 'Chờ duyệt' hoặc 'Đã xác nhận' trong phần Lịch sử khám. Bạn cũng sẽ nhận được thông báo trên ứng dụng."
  },
  {
    question: "Tôi có thể đặt lịch khám cho người thân không?",
    answer: "Hoàn toàn được. Trong quá trình đặt lịch, bạn có thể chọn hồ sơ bệnh nhân là người thân và điền thông tin của họ."
  }
];

const FAQPage = ({ navigate }) => {
  const [openIndex, setOpenIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#143250] to-[#1a446d] text-white pt-20 pb-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold items-center gap-2 mb-6 border border-white/20">
            <HelpCircle className="w-4 h-4 text-[#48a1f3]" />
            Hỗ trợ khách hàng
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
            Câu hỏi thường gặp
          </h1>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Tìm câu trả lời nhanh chóng cho các thắc mắc của bạn về việc sử dụng nền tảng STL Clinic.
          </p>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Nhập từ khóa tìm kiếm..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all text-lg"
            />
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-20">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-gray-100">
          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === index ? 'border-[#48a1f3] shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <button 
                    onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                    className="w-full text-left px-6 py-5 flex justify-between items-center bg-white"
                  >
                    <span className="font-bold text-[#143250] text-lg pr-4">{faq.question}</span>
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-[#48a1f3] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
              <p className="text-gray-500">Vui lòng thử lại với từ khóa khác.</p>
            </div>
          )}
        </div>

        <div className="mt-12 text-center bg-blue-50 rounded-3xl p-8 border border-blue-100">
          <MessageCircle className="w-12 h-12 text-[#48a1f3] mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-[#143250] mb-2">Bạn vẫn còn câu hỏi?</h3>
          <p className="text-gray-600 mb-6">Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn 24/7.</p>
          <button className="bg-[#143250] text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
            Liên hệ hỗ trợ
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;
