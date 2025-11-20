import React, { useState } from 'react';
import { Settings, User, Bell, Lock, Globe, Moon, CreditCard, LogOut, ChevronRight, Check } from 'lucide-react';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('account');
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      appointments: true,
      promotions: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: true
    },
    language: 'vi',
    theme: 'light'
  });

  const menuItems = [
    { id: 'account', icon: User, label: 'Tài khoản', desc: 'Quản lý thông tin cá nhân' },
    { id: 'notifications', icon: Bell, label: 'Thông báo', desc: 'Cài đặt thông báo' },
    { id: 'security', icon: Lock, label: 'Bảo mật', desc: 'Mật khẩu và xác thực' },
    { id: 'privacy', icon: Globe, label: 'Quyền riêng tư', desc: 'Kiểm soát dữ liệu' },
    { id: 'appearance', icon: Moon, label: 'Giao diện', desc: 'Chủ đề và ngôn ngữ' },
    { id: 'billing', icon: CreditCard, label: 'Thanh toán', desc: 'Phương thức thanh toán' }
  ];

  const toggleNotification = (key) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const renderAccountSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cá nhân</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
            <input
              type="text"
              defaultValue="Nguyễn Văn A"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue="nguyenvana@email.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
            <input
              type="tel"
              defaultValue="0123456789"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg transition-colors">
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Kênh nhận thông báo</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-800">Email</p>
              <p className="text-sm text-gray-500">Nhận thông báo qua email</p>
            </div>
            <ToggleSwitch
              enabled={settings.notifications.email}
              onChange={() => toggleNotification('email')}
            />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-800">Push notification</p>
              <p className="text-sm text-gray-500">Thông báo trên thiết bị</p>
            </div>
            <ToggleSwitch
              enabled={settings.notifications.push}
              onChange={() => toggleNotification('push')}
            />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-800">SMS</p>
              <p className="text-sm text-gray-500">Nhận tin nhắn SMS</p>
            </div>
            <ToggleSwitch
              enabled={settings.notifications.sms}
              onChange={() => toggleNotification('sms')}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Loại thông báo</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-800">Lịch khám</p>
              <p className="text-sm text-gray-500">Nhắc nhở về lịch hẹn</p>
            </div>
            <ToggleSwitch
              enabled={settings.notifications.appointments}
              onChange={() => toggleNotification('appointments')}
            />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-800">Khuyến mãi</p>
              <p className="text-sm text-gray-500">Ưu đãi và chương trình</p>
            </div>
            <ToggleSwitch
              enabled={settings.notifications.promotions}
              onChange={() => toggleNotification('promotions')}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Đổi mật khẩu</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg transition-colors">
            Cập nhật mật khẩu
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Xác thực hai yếu tố</h3>
        <p className="text-gray-600 mb-4">Tăng cường bảo mật tài khoản của bạn</p>
        <button className="w-full border-2 border-green-500 text-green-600 hover:bg-green-50 font-medium py-2.5 rounded-lg transition-colors">
          Kích hoạt 2FA
        </button>
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quyền riêng tư</h3>
        <div className="space-y-4">
          <div className="py-3 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Hiển thị hồ sơ</label>
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                privacy: { ...prev.privacy, profileVisibility: e.target.value }
              }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="public">Công khai</option>
              <option value="private">Riêng tư</option>
              <option value="friends">Bạn bè</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-800">Hiển thị email</p>
              <p className="text-sm text-gray-500">Cho phép người khác xem email</p>
            </div>
            <ToggleSwitch
              enabled={settings.privacy.showEmail}
              onChange={() => setSettings(prev => ({
                ...prev,
                privacy: { ...prev.privacy, showEmail: !prev.privacy.showEmail }
              }))}
            />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-800">Hiển thị số điện thoại</p>
              <p className="text-sm text-gray-500">Cho phép người khác xem SĐT</p>
            </div>
            <ToggleSwitch
              enabled={settings.privacy.showPhone}
              onChange={() => setSettings(prev => ({
                ...prev,
                privacy: { ...prev.privacy, showPhone: !prev.privacy.showPhone }
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ngôn ngữ</h3>
        <select
          value={settings.language}
          onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Chủ đề</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSettings(prev => ({ ...prev, theme: 'light' }))}
            className={`p-4 border-2 rounded-lg transition-all ${
              settings.theme === 'light'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-full h-20 bg-white rounded mb-2 border border-gray-200"></div>
            <p className="font-medium text-gray-800">Sáng</p>
            {settings.theme === 'light' && (
              <Check className="w-5 h-5 text-green-500 mx-auto mt-2" />
            )}
          </button>
          <button
            onClick={() => setSettings(prev => ({ ...prev, theme: 'dark' }))}
            className={`p-4 border-2 rounded-lg transition-all ${
              settings.theme === 'dark'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-full h-20 bg-gray-800 rounded mb-2"></div>
            <p className="font-medium text-gray-800">Tối</p>
            {settings.theme === 'dark' && (
              <Check className="w-5 h-5 text-green-500 mx-auto mt-2" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderBillingSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Phương thức thanh toán</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-500 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                VISA
              </div>
              <div>
                <p className="font-medium text-gray-800">•••• 4242</p>
                <p className="text-sm text-gray-500">Hết hạn 12/25</p>
              </div>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">Mặc định</span>
          </div>
        </div>
        <button className="w-full mt-4 border-2 border-green-500 text-green-600 hover:bg-green-50 font-medium py-2.5 rounded-lg transition-colors">
          Thêm thẻ mới
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'account': return renderAccountSection();
      case 'notifications': return renderNotificationsSection();
      case 'security': return renderSecuritySection();
      case 'privacy': return renderPrivacySection();
      case 'appearance': return renderAppearanceSection();
      case 'billing': return renderBillingSection();
      default: return renderAccountSection();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Cài đặt</h1>
          </div>
          <p className="text-green-50">Quản lý tài khoản và tùy chỉnh trải nghiệm</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-all ${
                      activeSection === item.id
                        ? 'bg-green-50 border-l-4 border-green-500 text-green-700'
                        : 'hover:bg-gray-50 text-gray-700 border-l-4 border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                );
              })}
              
              <button className="w-full flex items-center gap-3 px-4 py-4 text-left text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;