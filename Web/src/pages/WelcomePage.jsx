import React from 'react';
import { Calendar, MessageCircle, Users, Shield, Clock, MapPin, Phone, Mail } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { PAGES, DOCTORS, SPECIALTIES } from '../utils/constants';

const WelcomePage = ({ navigate }) => {
  const features = [
    {
      icon: Calendar,
      title: 'Đặt lịch Online',
      description: 'Đặt lịch khám bệnh nhanh chóng, tiện lợi 24/7',
      color: 'blue'
    },
    {
      icon: Users,
      title: 'Đội ngũ Bác sĩ',
      description: 'Bác sĩ giàu kinh nghiệm, tận tâm chuyên nghiệp',
      color: 'green'
    },
    {
      icon: Shield,
      title: 'An toàn - Bảo mật',
      description: 'Thông tin bệnh nhân được bảo mật tuyệt đối',
      color: 'purple'
    },
    {
      icon: MessageCircle,
      title: 'Tư vấn Online',
      description: 'Tư vấn sức khỏe từ xa qua video call',
      color: 'orange'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Bệnh nhân tin tưởng' },
    { number: '100+', label: 'Bác sĩ chuyên khoa' },
    { number: '20+', label: 'Chuyên khoa' },
    { number: '4.8/5', label: 'Đánh giá trung bình' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">STL Clinic</h1>
                <p className="text-xs text-gray-500">Chăm sóc sức khỏe toàn diện</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition">Tính năng</a>
              <a href="#doctors" className="text-gray-700 hover:text-blue-600 font-medium transition">Bác sĩ</a>
              <a href="#specialties" className="text-gray-700 hover:text-blue-600 font-medium transition">Chuyên khoa</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition">Liên hệ</a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(PAGES.LOGIN)}
              >
                Đăng nhập
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(PAGES.REGISTER)}
              >
                Đăng ký
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - MedPro Style */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                Nền tảng đặt khám trực tuyến #1 Việt Nam
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Đặt lịch khám
                <span className="text-blue-600"> nhanh chóng</span>
                <br />
                với bác sĩ giỏi
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Kết nối bạn với các bác sĩ chuyên khoa hàng đầu. 
                Đặt lịch online, khám bệnh dễ dàng, tiết kiệm thời gian.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate(PAGES.REGISTER)}
                  icon={Calendar}
                  className="text-lg"
                >
                  Đặt lịch ngay
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(PAGES.LOGIN)}
                  className="text-lg"
                >
                  Tìm hiểu thêm
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-8 pt-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Image/Illustration */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=80"
                  alt="Doctor"
                  className="rounded-2xl shadow-2xl w-full"
                />
                
                {/* Floating Cards */}
                <div className="absolute -left-6 top-20 animate-float">
                  <Card className="p-4 bg-white shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">An toàn</div>
                        <div className="text-sm text-gray-500">100% bảo mật</div>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="absolute -right-6 bottom-20 animate-float" style={{ animationDelay: '1s' }}>
                  <Card className="p-4 bg-white shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">Nhanh chóng</div>
                        <div className="text-sm text-gray-500">Chỉ 30 giây</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Background Decoration */}
              <div className="absolute -z-10 top-10 right-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -z-10 bottom-10 left-10 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn STL Clinic?
            </h2>
            <p className="text-xl text-gray-600">
              Chúng tôi cam kết mang đến trải nghiệm khám chữa bệnh tốt nhất
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                hover
                className="text-center group"
              >
                <div className={`w-16 h-16 bg-${feature.color}-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Đội ngũ Bác sĩ
            </h2>
            <p className="text-xl text-gray-600">
              Bác sĩ giàu kinh nghiệm, tận tâm với nghề
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DOCTORS.slice(0, 6).map((doctor) => (
              <Card
                key={doctor.id}
                hover
                className="group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {doctor.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {doctor.name}
                    </h3>
                    <p className="text-blue-600 font-medium text-sm mb-2">
                      {doctor.specialty}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        ⭐ {doctor.rating}
                      </span>
                      <span>{doctor.experience} năm KN</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="mt-4"
                  onClick={() => navigate(PAGES.BOOKING)}
                >
                  Đặt lịch khám
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(PAGES.REGISTER)}
            >
              Xem tất cả bác sĩ
            </Button>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section id="specialties" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Chuyên khoa
            </h2>
            <p className="text-xl text-gray-600">
              Đa dạng các chuyên khoa phục vụ nhu cầu khám chữa bệnh
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {SPECIALTIES.map((specialty) => (
              <Card
                key={specialty.id}
                hover
                className="text-center cursor-pointer group"
                onClick={() => navigate(PAGES.BOOKING)}
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                  {specialty.icon}
                </div>
                <h3 className="font-semibold text-gray-900">
                  {specialty.name}
                </h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Đặt lịch khám ngay hôm nay để nhận được sự chăm sóc tốt nhất
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(PAGES.REGISTER)}
              className="bg-white text-blue-600 hover:bg-gray-50"
            >
              Đăng ký miễn phí
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate(PAGES.LOGIN)}
              className="text-white border-2 border-white hover:bg-white/10"
            >
              Đăng nhập ngay
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">STL Clinic</h3>
              <p className="text-gray-400 text-sm">
                Nền tảng đặt khám trực tuyến hàng đầu Việt Nam
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Liên kết</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-white transition">Bác sĩ</a></li>
                <li><a href="#" className="hover:text-white transition">Chuyên khoa</a></li>
                <li><a href="#" className="hover:text-white transition">Tin tức</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Câu hỏi thường gặp</a></li>
                <li><a href="#" className="hover:text-white transition">Hướng dẫn đặt lịch</a></li>
                <li><a href="#" className="hover:text-white transition">Chính sách bảo mật</a></li>
                <li><a href="#" className="hover:text-white transition">Điều khoản sử dụng</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>1900-xxxx</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>support@stlclinic.com</span>
                </li>
                <li className="flex items-start gap-2 text-gray-400">
                  <MapPin className="w-4 h-4 mt-1" />
                  <span>123 Đường ABC, Q.1, TP.HCM</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 STL Clinic. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate(PAGES.CHAT)}
          icon={MessageCircle}
          className="rounded-full shadow-2xl w-14 h-14 p-0"
        />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;