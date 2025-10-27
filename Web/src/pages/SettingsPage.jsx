import React, { useState } from 'react';
import { 
  User, LogOut, ChevronRight, Mail, Phone, MapPin, 
  Calendar, AlertCircle, Shield, Globe, Bell, Moon, Edit2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/common/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { PAGES } from '../utils/constants';
import { getInitials, formatDate } from '../utils/helpers';

const SettingsPage = ({ navigate }) => {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      logout();
      navigate(PAGES.WELCOME);
    }
  };

  const settingSections = [
    {
      title: 'Tài khoản',
      items: [
        { icon: User, label: 'Chỉnh sửa hồ sơ', action: () => alert('Tính năng đang phát triển') },
        { icon: Shield, label: 'Đổi mật khẩu', action: () => alert('Tính năng đang phát triển') },
        { icon: Bell, label: 'Thông báo', action: () => alert('Tính năng đang phát triển') }
      ]
    },
    {
      title: 'Cài đặt',
      items: [
        { icon: Globe, label: 'Ngôn ngữ', value: 'Tiếng Việt', action: () => alert('Tính năng đang phát triển') },
        { icon: Moon, label: 'Chế độ tối', value: 'Tắt', action: () => alert('Tính năng đang phát triển') }
      ]
    },
    {
      title: 'Hỗ trợ',
      items: [
        { icon: AlertCircle, label: 'Trung tâm trợ giúp', action: () => alert('Liên hệ: 1900-xxxx') },
        { icon: Shield, label: 'Chính sách bảo mật', action: () => alert('Đang mở...') },
        { icon: AlertCircle, label: 'Điều khoản sử dụng', action: () => alert('Đang mở...') }
      ]
    }
  ];

  return (
    <Layout
      title="Cài đặt"
      subtitle="Quản lý tài khoản và ứng dụng"
      showBack
      onBack={() => navigate(PAGES.HOME)}
      maxWidth="4xl"
    >
      {/* Profile Card */}
      <Card padding="lg" className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {getInitials(user?.fullName || 'User')}
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-800">{user?.fullName || 'Người dùng'}</h3>
              <p className="text-gray-600">{user?.role === 'patient' ? 'Bệnh nhân' : 'Bác sĩ'}</p>
              <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="p-3 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronRight className={`w-6 h-6 text-gray-600 transform transition ${showProfile ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Extended Profile Info */}
        {showProfile && (
          <div className="mt-6 pt-6 border-t space-y-4">
            {user?.phone && (
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-gray-500" />
                <span>{user.phone}</span>
              </div>
            )}
            {user?.email && (
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-5 h-5 text-gray-500" />
                <span>{user.email}</span>
              </div>
            )}
            {user?.address && (
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span>{user.address}</span>
              </div>
            )}
            {user?.dateOfBirth && (
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span>Ngày sinh: {formatDate(user.dateOfBirth)}</span>
              </div>
            )}
            {user?.conditions && (
              <div className="flex items-start gap-3 text-gray-700">
                <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm mb-1">Bệnh nền:</p>
                  <p className="text-sm">{user.conditions}</p>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="md"
              fullWidth
              icon={Edit2}
              onClick={() => alert('Tính năng đang phát triển')}
            >
              Chỉnh sửa hồ sơ
            </Button>
          </div>
        )}
      </Card>

      {/* Settings Sections */}
      {settingSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 px-2">
            {section.title}
          </h3>
          <Card padding="none">
            {section.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                onClick={item.action}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition first:rounded-t-2xl last:rounded-b-2xl border-b last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="font-medium text-gray-800">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && (
                    <span className="text-gray-500 text-sm">{item.value}</span>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            ))}
          </Card>
        </div>
      ))}

      {/* App Info */}
      <Card padding="md" className="text-center mb-6">
        <p className="text-sm text-gray-600">STL Clinic App</p>
        <p className="text-xs text-gray-500 mt-1">Version 1.0.0</p>
      </Card>

      {/* Logout Button */}
      <Button
        variant="danger"
        size="lg"
        fullWidth
        icon={LogOut}
        onClick={handleLogout}
      >
        Đăng xuất
      </Button>
    </Layout>
  );
};

export default SettingsPage;