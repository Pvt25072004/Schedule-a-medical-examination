import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Youtube } from 'lucide-react';

const Layout = ({ children, showFooter = true }) => {
  
  const footerLinks = {
    company: [
      { label: 'Giới thiệu', href: '/about' },
      { label: 'Liên hệ', href: '/contact' },
      { label: 'Tuyển dụng', href: '/careers' },
      { label: 'Tin tức', href: '/news' }
    ],
    services: [
      { label: 'Đặt lịch khám', href: '/booking' },
      { label: 'Tư vấn trực tuyến', href: '/consultation' },
      { label: 'Xét nghiệm', href: '/lab-tests' },
      { label: 'Gói khám sức khỏe', href: '/health-packages' }
    ],
    support: [
      { label: 'Câu hỏi thường gặp', href: '/faq' },
      { label: 'Hướng dẫn sử dụng', href: '/guide' },
      { label: 'Chính sách bảo mật', href: '/privacy' },
      { label: 'Điều khoản sử dụng', href: '/terms' }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: '#', color: 'hover:text-blue-600' },
    { icon: Instagram, href: '#', color: 'hover:text-pink-600' },
    { icon: Twitter, href: '#', color: 'hover:text-blue-400' },
    { icon: Youtube, href: '#', color: 'hover:text-red-600' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      {showFooter && (
        <footer className="bg-white border-t border-gray-200 mt-auto">
          {/* Main Footer */}
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {/* Company Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-3xl">🏥</div>
                  <h3 className="text-2xl font-bold text-green-600">MedPro</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Nền tảng đặt khám trực tuyến hàng đầu Việt Nam. 
                  Kết nối bạn với hơn 100+ bệnh viện và 1000+ bác sĩ uy tín.
                </p>
                
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-green-500" />
                    <span className="text-sm">1900 xxxx</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-green-500" />
                    <span className="text-sm">support@medpro.vn</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span className="text-sm">TP. Hồ Chí Minh, Việt Nam</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-3 mt-4">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        className={`w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 ${social.color} transition-colors`}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Company Links */}
              <div>
                <h4 className="font-bold text-gray-800 mb-4">Công ty</h4>
                <ul className="space-y-2">
                  {footerLinks.company.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-gray-600 hover:text-green-600 transition-colors text-sm">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services Links */}
              <div>
                <h4 className="font-bold text-gray-800 mb-4">Dịch vụ</h4>
                <ul className="space-y-2">
                  {footerLinks.services.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-gray-600 hover:text-green-600 transition-colors text-sm">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support Links */}
              <div>
                <h4 className="font-bold text-gray-800 mb-4">Hỗ trợ</h4>
                <ul className="space-y-2">
                  {footerLinks.support.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-gray-600 hover:text-green-600 transition-colors text-sm">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* App Download Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Tải ứng dụng MedPro</h4>
                  <p className="text-sm text-gray-600">Đặt khám nhanh, tiện lợi mọi lúc mọi nơi</p>
                </div>
                <div className="flex gap-3">
                  <a href="#" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs">Download on</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs">Get it on</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-600 text-center md:text-left">
                  © 2025 MedPro. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                  <a href="/privacy" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                    Chính sách bảo mật
                  </a>
                  <a href="/terms" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                    Điều khoản sử dụng
                  </a>
                  <a href="/cookies" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                    Cookies
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;