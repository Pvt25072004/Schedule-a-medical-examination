import React from 'react';
import { Activity, Heart, User, Calendar, MessageCircle } from 'lucide-react';
import Button from '../components/common/Button';
import { PAGES } from '../utils/constants';

const WelcomePage = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Activity className="w-16 h-16 text-teal-600 animate-pulse" />
              <Heart className="w-10 h-10 text-red-500 absolute -bottom-2 -right-2 animate-bounce" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-teal-800 mb-3">STL Clinic</h1>
          <p className="text-gray-600 text-lg">Chăm sóc sức khỏe toàn diện</p>
          <p className="text-gray-500 text-sm mt-2">Đặt lịch nhanh - Khám bệnh dễ dàng</p>
        </div>
        
        {/* Features Preview */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-8 mb-8">
          {/* Icon Showcase */}
          <div className="flex justify-center items-center gap-6">
            <div className="transform hover:scale-110 transition-transform">
              <div className="bg-teal-100 p-4 rounded-2xl">
                <User className="w-10 h-10 text-teal-600" />
              </div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="bg-blue-100 p-4 rounded-2xl">
                <Calendar className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="bg-green-100 p-4 rounded-2xl">
                <Activity className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="bg-purple-100 p-4 rounded-2xl">
                <MessageCircle className="w-10 h-10 text-purple-600" />
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => navigate(PAGES.LOGIN)}
            >
              Đăng nhập
            </Button>
            <Button 
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate(PAGES.REGISTER)}
            >
              Đăng ký ngay
            </Button>
          </div>
          
          {/* Features List */}
          <div className="border-t pt-6 space-y-3">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span className="text-sm">Đặt lịch khám online 24/7</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span className="text-sm">Tư vấn sức khỏe với AI</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span className="text-sm">Quản lý hồ sơ bệnh án điện tử</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <p className="text-center text-gray-500 text-sm">
          © 2025 STL Clinic. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;