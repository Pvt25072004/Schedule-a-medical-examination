import React, { useState } from 'react';
import { User, Stethoscope, Building2, Check, ChevronRight } from 'lucide-react';

const RoleSelector = ({ onSelectRole, onContinue }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'patient',
      title: 'Bệnh nhân',
      description: 'Đặt lịch khám, quản lý hồ sơ sức khỏe và tư vấn trực tuyến',
      icon: User,
      color: 'green',
      features: [
        'Đặt lịch khám nhanh chóng',
        'Quản lý hồ sơ bệnh án',
        'Tư vấn sức khỏe trực tuyến',
        'Nhận thông báo nhắc khám',
        'Theo dõi lịch sử khám bệnh'
      ]
    },
    {
      id: 'doctor',
      title: 'Bác sĩ',
      description: 'Quản lý lịch khám, tư vấn bệnh nhân và theo dõi hồ sơ',
      icon: Stethoscope,
      color: 'blue',
      features: [
        'Quản lý lịch khám cá nhân',
        'Tư vấn bệnh nhân trực tuyến',
        'Truy cập hồ sơ bệnh nhân',
        'Cập nhật kết quả khám',
        'Thống kê và báo cáo'
      ]
    },
    {
      id: 'hospital',
      title: 'Cơ sở y tế',
      description: 'Quản lý hệ thống đặt khám, bác sĩ và dữ liệu bệnh nhân',
      icon: Building2,
      color: 'purple',
      features: [
        'Quản lý đội ngũ bác sĩ',
        'Giám sát lịch khám',
        'Phân tích dữ liệu chi tiết',
        'Quản lý cơ sở vật chất',
        'Báo cáo tài chính'
      ]
    }
  ];

  const handleSelectRole = (roleId) => {
    setSelectedRole(roleId);
    onSelectRole?.(roleId);
  };

  const handleContinue = () => {
    if (selectedRole) {
      onContinue?.(selectedRole);
    }
  };

  const getColorClasses = (color, selected) => {
    const colors = {
      green: {
        border: selected ? 'border-green-500' : 'border-gray-200',
        bg: selected ? 'bg-green-50' : 'bg-white',
        icon: 'bg-green-500',
        check: 'bg-green-500',
        hover: 'hover:border-green-300'
      },
      blue: {
        border: selected ? 'border-blue-500' : 'border-gray-200',
        bg: selected ? 'bg-blue-50' : 'bg-white',
        icon: 'bg-blue-500',
        check: 'bg-blue-500',
        hover: 'hover:border-blue-300'
      },
      purple: {
        border: selected ? 'border-purple-500' : 'border-gray-200',
        bg: selected ? 'bg-purple-50' : 'bg-white',
        icon: 'bg-purple-500',
        check: 'bg-purple-500',
        hover: 'hover:border-purple-300'
      }
    };
    return colors[color];
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-5xl mb-4">🏥</div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          Bạn là ai?
        </h1>
        <p className="text-gray-600 text-lg">
          Chọn vai trò phù hợp để chúng tôi tùy chỉnh trải nghiệm tốt nhất cho bạn
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          const colorClasses = getColorClasses(role.color, isSelected);

          return (
            <button
              key={role.id}
              onClick={() => handleSelectRole(role.id)}
              className={`relative border-2 rounded-2xl p-6 transition-all duration-200 text-left ${
                colorClasses.border
              } ${colorClasses.bg} ${colorClasses.hover} ${
                isSelected ? 'shadow-lg scale-105' : 'shadow-sm hover:shadow-md'
              }`}
            >
              {/* Check Mark */}
              {isSelected && (
                <div className={`absolute top-4 right-4 w-8 h-8 ${colorClasses.check} rounded-full flex items-center justify-center`}>
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}

              {/* Icon */}
              <div className={`w-16 h-16 ${colorClasses.icon} rounded-2xl flex items-center justify-center mb-4`}>
                <Icon className="w-8 h-8 text-white" />
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {role.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {role.description}
              </p>

              {/* Features List */}
              <ul className="space-y-2">
                {role.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Continue Button */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
            selectedRole
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Tiếp tục
          <ChevronRight className="w-5 h-5" />
        </button>
        <p className="text-sm text-gray-500">
          Bạn có thể thay đổi vai trò sau trong phần cài đặt
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="text-2xl mb-2">🔒</div>
          <h4 className="font-semibold text-gray-800 mb-1">Bảo mật cao</h4>
          <p className="text-sm text-gray-600">
            Thông tin của bạn được mã hóa và bảo vệ tuyệt đối
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="text-2xl mb-2">⚡</div>
          <h4 className="font-semibold text-gray-800 mb-1">Nhanh chóng</h4>
          <p className="text-sm text-gray-600">
            Đặt lịch khám chỉ trong vài giây với giao diện thân thiện
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="text-2xl mb-2">🏆</div>
          <h4 className="font-semibold text-gray-800 mb-1">Đáng tin cậy</h4>
          <p className="text-sm text-gray-600">
            Hợp tác với 100+ bệnh viện và 1000+ bác sĩ uy tín
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;