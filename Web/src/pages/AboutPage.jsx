import React from "react";
import { Info, Users, Heart, Target, Star, Shield, ArrowRight } from "lucide-react";
import Footer from "../components/common/Footer";

const AboutPage = ({ navigate }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#143250] to-[#1a446d] text-white pt-20 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#48a1f3]/20 to-transparent rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#f99b1c]/20 to-transparent rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold items-center gap-2 mb-6 border border-white/20">
            <Info className="w-4 h-4 text-[#48a1f3]" />
            Về STL Clinic
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-tight">
            Chăm sóc sức khoẻ của bạn <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#48a1f3] to-[#f99b1c]">bằng cả trái tim</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed">
            STL Clinic là nền tảng y tế số tiên phong tại Việt Nam, mang đến giải pháp chăm sóc sức khỏe toàn diện, tiện lợi và an toàn cho mọi người dân.
          </p>
        </div>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-20">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#143250] mb-6">Sứ mệnh của chúng tôi</h2>
              <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                Chúng tôi tin rằng mọi người đều có quyền được tiếp cận dịch vụ y tế chất lượng cao một cách nhanh chóng và dễ dàng. Sứ mệnh của STL Clinic là phá vỡ mọi rào cản về không gian và thời gian trong việc khám chữa bệnh.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                Bằng việc ứng dụng công nghệ tiên tiến, chúng tôi kết nối bệnh nhân với những bác sĩ chuyên khoa hàng đầu, giúp quá trình chăm sóc sức khỏe trở nên chủ động và hiệu quả hơn bao giờ hết.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#48a1f3] to-[#f99b1c] rounded-3xl transform rotate-3 scale-105 opacity-20"></div>
              <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80" alt="Sứ mệnh" className="rounded-3xl relative z-10 w-full h-[300px] object-cover shadow-lg" />
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-[#143250] mb-12">Giá trị cốt lõi</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#143250] mb-3">Tận tâm</h3>
              <p className="text-gray-600">Luôn đặt người bệnh làm trung tâm, phục vụ với thái độ ân cần, chu đáo và thấu cảm.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#143250] mb-3">Chuyên nghiệp</h3>
              <p className="text-gray-600">Đội ngũ bác sĩ giỏi chuyên môn, giàu kinh nghiệm, không ngừng nâng cao tay nghề.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#143250] mb-3">An toàn</h3>
              <p className="text-gray-600">Đảm bảo quy trình khám chữa bệnh chuẩn mực, bảo mật thông tin tuyệt đối.</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#48a1f3] to-[#3da3f5] rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-[50px]"></div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Bạn đã sẵn sàng trải nghiệm?</h2>
          <p className="text-xl text-blue-50 mb-10 max-w-2xl mx-auto relative z-10">Tham gia cùng hàng ngàn khách hàng đã tin tưởng và lựa chọn STL Clinic để chăm sóc sức khỏe mỗi ngày.</p>
          <button onClick={() => navigate("/")} className="bg-white text-[#48a1f3] px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2 mx-auto relative z-10">
            Trang chủ <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
