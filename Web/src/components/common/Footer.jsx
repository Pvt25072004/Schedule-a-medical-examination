import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PAGES } from "../../utils/constants";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer
      id="contact"
      className="bg-gray-900 text-white py-12 relative z-10 mt-auto"
    >
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
              <li>
                <a
                  className="hover:text-white transition cursor-pointer"
                  onClick={() => navigate(PAGES.ABOUT)}
                >
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a
                  className="hover:text-white transition cursor-pointer"
                  onClick={() => navigate(PAGES.DOCTORS)}
                >
                  Bác sĩ
                </a>
              </li>
              <li>
                <a
                  className="hover:text-white transition cursor-pointer"
                  onClick={() => navigate(PAGES.SPECIALTIES)}
                >
                  Chuyên khoa
                </a>
              </li>
              <li>
                <a
                  className="hover:text-white transition cursor-pointer"
                  onClick={() => navigate(PAGES.NEWS)}
                >
                  Tin tức
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a
                  className="hover:text-white transition cursor-pointer"
                  onClick={() => navigate(PAGES.FAQ)}
                >
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a
                  className="hover:text-white transition cursor-pointer"
                  onClick={() => navigate(PAGES.BOOKING_GUIDE)}
                >
                  Hướng dẫn đặt lịch
                </a>
              </li>
              <li>
                <a
                  className="hover:text-white transition cursor-pointer"
                  onClick={() => navigate(PAGES.PRIVACY_POLICY)}
                >
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a
                  className="hover:text-white transition cursor-pointer"
                  onClick={() => navigate(PAGES.TERMS)}
                >
                  Điều khoản sử dụng
                </a>
              </li>
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
                <span>Xô Viết Nghệ Tĩnh, Hải Châu, TP.Đà Nẵng</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2026 STL Clinic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
