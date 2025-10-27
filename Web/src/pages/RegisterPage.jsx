import React, { useState } from 'react';
import { Mail, Lock, User, Calendar, MapPin, FileText, ChevronLeft, Users, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { PAGES, USER_ROLES, CITIES } from '../utils/constants';
import { validateEmail } from '../utils/helpers';

const RegisterPage = ({ navigate }) => {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    city: '',
    address: '',
    conditions: '',
    role: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.role) newErrors.role = 'Vui lòng chọn vai trò';
    }

    if (currentStep === 2) {
      if (!formData.email) {
        newErrors.email = 'Vui lòng nhập email';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Email không hợp lệ';
      }
      if (!formData.password) {
        newErrors.password = 'Vui lòng nhập mật khẩu';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu không khớp';
      }
      if (!formData.fullName) newErrors.fullName = 'Vui lòng nhập họ tên';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';
    }

    if (currentStep === 3) {
      if (!formData.city) newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
      if (!formData.address) newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    return newErrors;
  };

  const handleNext = () => {
    const newErrors = validateStep(step);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    register(formData);
    navigate(PAGES.HOME);
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
              step >= s ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {s}
            </div>
            {s < 4 && (
              <div className={`flex-1 h-1 mx-2 transition ${
                step > s ? 'bg-teal-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          Bước {step}/4: {
            step === 1 ? 'Chọn vai trò' :
            step === 2 ? 'Thông tin cơ bản' :
            step === 3 ? 'Địa chỉ' : 'Thông tin sức khỏe'
          }
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate(PAGES.WELCOME)} 
          className="mb-6 text-gray-600 flex items-center hover:text-teal-600 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="ml-1">{step > 1 ? 'Quay lại' : 'Trang chủ'}</span>
        </button>

        <Card padding="lg">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <Activity className="w-10 h-10 text-teal-600" />
            <span className="text-2xl font-bold text-teal-700 ml-2">STL</span>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">Đăng ký tài khoản</h2>
          <p className="text-gray-600 text-center mb-8">
            Tạo tài khoản mới để sử dụng dịch vụ
          </p>

          {renderProgressBar()}

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4">Bạn là ai?</h3>
              
              <Card
                padding="md"
                hover
                onClick={() => handleChange({ target: { name: 'role', value: USER_ROLES.PATIENT } })}
                className={`cursor-pointer border-2 transition ${
                  formData.role === USER_ROLES.PATIENT
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">Tôi là Bệnh nhân</h4>
                    <p className="text-gray-600 text-sm">Đặt lịch khám, quản lý hồ sơ sức khỏe cá nhân</p>
                  </div>
                  {formData.role === USER_ROLES.PATIENT && (
                    <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </Card>

              <Card
                padding="md"
                hover
                onClick={() => handleChange({ target: { name: 'role', value: USER_ROLES.DOCTOR } })}
                className={`cursor-pointer border-2 transition ${
                  formData.role === USER_ROLES.DOCTOR
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">Tôi là Bác sĩ/Chuyên gia</h4>
                    <p className="text-gray-600 text-sm">Quản lý lịch làm việc, hồ sơ chuyên môn</p>
                  </div>
                  {formData.role === USER_ROLES.DOCTOR && (
                    <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </Card>

              {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
            </div>
          )}

          {/* Step 2: Basic Info */}
          {step === 2 && (
            <div className="space-y-4">
              <Input
                type="text"
                name="fullName"
                label="Họ và tên"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleChange}
                icon={User}
                error={errors.fullName}
                required
              />

              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
                error={errors.email}
                required
              />

              <Input
                type="password"
                name="password"
                label="Mật khẩu"
                placeholder="Tối thiểu 6 ký tự"
                value={formData.password}
                onChange={handleChange}
                icon={Lock}
                error={errors.password}
                required
              />

              <Input
                type="password"
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={Lock}
                error={errors.confirmPassword}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  name="dateOfBirth"
                  label="Ngày sinh"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  icon={Calendar}
                  error={errors.dateOfBirth}
                  required
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                  >
                    <option value="">Chọn</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Address */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:border-teal-500 focus:outline-none ${
                    errors.city ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {CITIES.map(city => (
                    <option key={city.value} value={city.value}>{city.label}</option>
                  ))}
                </select>
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <Input
                type="text"
                name="address"
                label="Địa chỉ chi tiết"
                placeholder="Số nhà, đường, phường/xã"
                value={formData.address}
                onChange={handleChange}
                icon={MapPin}
                error={errors.address}
                required
              />

              <Input
                type="tel"
                name="phone"
                label="Số điện thoại"
                placeholder="0123456789"
                value={formData.phone}
                onChange={handleChange}
                icon={User}
              />
            </div>
          )}

          {/* Step 4: Health Info */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Thông tin bệnh nền (tùy chọn)
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Nhập các bệnh nền hoặc tình trạng sức khỏe đặc biệt nếu có
                </p>
                <textarea
                  name="conditions"
                  placeholder="Ví dụ: Đau dạ dày, tiểu đường, tim mạch..."
                  value={formData.conditions}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none resize-none"
                  rows="5"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800">
                  ℹ️ Thông tin này sẽ giúp bác sĩ hiểu rõ hơn về tình trạng sức khỏe của bạn và đưa ra phương án điều trị phù hợp.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Quay lại
              </Button>
            )}
            <Button
              variant="primary"
              size="lg"
              onClick={handleNext}
              className="flex-1"
            >
              {step === 4 ? 'Hoàn tất' : 'Tiếp tục'}
            </Button>
          </div>

          {/* Login Link */}
          {step === 1 && (
            <p className="text-center text-gray-600 mt-6">
              Đã có tài khoản?{' '}
              <button
                onClick={() => navigate(PAGES.LOGIN)}
                className="text-teal-600 font-semibold hover:text-teal-700"
              >
                Đăng nhập
              </button>
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;