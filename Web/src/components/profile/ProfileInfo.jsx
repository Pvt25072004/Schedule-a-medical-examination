import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase, 
  Heart, Activity, FileText, Award, Edit2, Save, X,
  Camera, Shield, Clock, Globe, ChevronRight
} from 'lucide-react';

const ProfileInfo = ({ 
  userData = {
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0123 456 789",
    birthday: "15/05/1990",
    gender: "Nam",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    occupation: "Kỹ sư phần mềm",
    bloodType: "O+",
    height: "175 cm",
    weight: "70 kg",
    allergies: "Không có",
    chronicDiseases: "Không có",
    emergencyContact: {
      name: "Nguyễn Thị B",
      relationship: "Vợ/Chồng",
      phone: "0987 654 321"
    },
    insurance: {
      provider: "Bảo hiểm Y tế Quốc gia",
      number: "VN123456789",
      expiry: "31/12/2025"
    }
  }
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [formData, setFormData] = useState(userData);

  const sections = [
    { id: 'personal', label: 'Thông tin cá nhân', icon: User },
    { id: 'medical', label: 'Thông tin y tế', icon: Activity },
    { id: 'emergency', label: 'Liên hệ khẩn cấp', icon: Phone },
    { id: 'insurance', label: 'Bảo hiểm', icon: Shield }
  ];

  const handleSave = () => {
    // Save logic here
    console.log('Saving:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
  };

  const InfoRow = ({ icon: Icon, label, value, editable = false, field, type = "text" }) => (
    <div className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg flex-shrink-0">
        <Icon className="w-5 h-5 text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        {isEditing && editable ? (
          type === "textarea" ? (
            <textarea
              value={formData[field] || value}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows="2"
            />
          ) : (
            <input
              type={type}
              value={formData[field] || value}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          )
        ) : (
          <p className="font-medium text-gray-800 break-words">{value || "Chưa cập nhật"}</p>
        )}
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-1">
      <InfoRow icon={User} label="Họ và tên" value={formData.name} editable field="name" />
      <InfoRow icon={Mail} label="Email" value={formData.email} editable field="email" type="email" />
      <InfoRow icon={Phone} label="Số điện thoại" value={formData.phone} editable field="phone" type="tel" />
      <InfoRow icon={Calendar} label="Ngày sinh" value={formData.birthday} editable field="birthday" />
      <InfoRow icon={User} label="Giới tính" value={formData.gender} editable field="gender" />
      <InfoRow icon={MapPin} label="Địa chỉ" value={formData.address} editable field="address" type="textarea" />
      <InfoRow icon={Briefcase} label="Nghề nghiệp" value={formData.occupation} editable field="occupation" />
    </div>
  );

  const renderMedicalInfo = () => (
    <div className="space-y-1">
      <InfoRow icon={Activity} label="Nhóm máu" value={formData.bloodType} editable field="bloodType" />
      <InfoRow icon={Activity} label="Chiều cao" value={formData.height} editable field="height" />
      <InfoRow icon={Activity} label="Cân nặng" value={formData.weight} editable field="weight" />
      <InfoRow icon={Heart} label="Dị ứng" value={formData.allergies} editable field="allergies" type="textarea" />
      <InfoRow icon={FileText} label="Bệnh mãn tính" value={formData.chronicDiseases} editable field="chronicDiseases" type="textarea" />
    </div>
  );

  const renderEmergencyContact = () => (
    <div className="space-y-1">
      <InfoRow 
        icon={User} 
        label="Tên người liên hệ" 
        value={formData.emergencyContact.name} 
        editable 
        field="emergencyContact.name" 
      />
      <InfoRow 
        icon={Heart} 
        label="Mối quan hệ" 
        value={formData.emergencyContact.relationship} 
        editable 
        field="emergencyContact.relationship" 
      />
      <InfoRow 
        icon={Phone} 
        label="Số điện thoại" 
        value={formData.emergencyContact.phone} 
        editable 
        field="emergencyContact.phone" 
        type="tel" 
      />
    </div>
  );

  const renderInsurance = () => (
    <div className="space-y-1">
      <InfoRow 
        icon={Shield} 
        label="Nhà cung cấp" 
        value={formData.insurance.provider} 
        editable 
        field="insurance.provider" 
      />
      <InfoRow 
        icon={FileText} 
        label="Số thẻ bảo hiểm" 
        value={formData.insurance.number} 
        editable 
        field="insurance.number" 
      />
      <InfoRow 
        icon={Clock} 
        label="Ngày hết hạn" 
        value={formData.insurance.expiry} 
        editable 
        field="insurance.expiry" 
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-green-500 to-green-600 relative">
          <div className="absolute -bottom-16 left-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-6xl shadow-lg">
                👤
              </div>
              <button className="absolute bottom-2 right-2 bg-green-500 hover:bg-green-600 text-white rounded-full p-2 shadow-lg transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="pt-20 pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{formData.name}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                Tài khoản đã xác thực
              </p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Edit2 className="w-5 h-5" />
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Lưu
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <X className="w-5 h-5" />
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="flex overflow-x-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap border-b-2 ${
                  activeSection === section.id
                    ? 'text-green-600 border-green-600 bg-green-50'
                    : 'text-gray-600 border-transparent hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {activeSection === 'personal' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin cá nhân</h2>
            {renderPersonalInfo()}
          </div>
        )}
        
        {activeSection === 'medical' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin y tế</h2>
            {renderMedicalInfo()}
          </div>
        )}
        
        {activeSection === 'emergency' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Liên hệ khẩn cấp</h2>
            {renderEmergencyContact()}
          </div>
        )}
        
        {activeSection === 'insurance' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin bảo hiểm</h2>
            {renderInsurance()}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">12</p>
              <p className="text-sm text-gray-600">Lịch hẹn</p>
            </div>
          </div>
          <div className="text-xs text-green-600 font-medium">+2 tháng này</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">45</p>
              <p className="text-sm text-gray-600">Hồ sơ khám</p>
            </div>
          </div>
          <div className="text-xs text-blue-600 font-medium">Tất cả</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">2,450</p>
              <p className="text-sm text-gray-600">Điểm thưởng</p>
            </div>
          </div>
          <div className="text-xs text-yellow-600 font-medium">+150 điểm</div>
        </div>
      </div>
    </div>
  );
};

// Demo wrapper
const ProfileInfoDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <ProfileInfo />
    </div>
  );
};

export default ProfileInfoDemo;