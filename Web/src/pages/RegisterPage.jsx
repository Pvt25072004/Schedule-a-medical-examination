import React, { useState } from 'react';
import { Mail, Lock, User, Calendar, MapPin, Phone, FileText, ArrowLeft, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { PAGES, USER_ROLES, AREAS } from '../utils/constants';
import { validateEmail, validatePhone, validatePassword } from '../utils/helpers';

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
    area: '',
    address: '',
    conditions: '',
    role: USER_ROLES.PATIENT
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      if (!formData.fullName) {
        newErrors.fullName = 'Vui lòng nhập họ tên';
      } else if (formData.fullName.length < 2) {
        newErrors.fullName = 'Họ tên quá ngắn';
      }

      if (!formData.email) {
        newErrors.email = 'Vui lòng nhập email';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Email không hợp lệ';
      }

      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.message;
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu không khớp';
      }

      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';
      }

      if (!formData.gender) {
        newErrors.gender = 'Vui lòng chọn giới tính';
      }
    }

    if (currentStep === 3) {
      if (formData.phone && !validatePhone(formData.phone)) {
        newErrors.phone = 'Số điện thoại không hợp lệ';
      }
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
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      await register(formData);
      setTimeout(() => {
        navigate(PAGES.HOME);
      }, 1000);
    } catch (error) {
      setErrors({ general: 'Đăng ký thất bại. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Vai trò', icon: User },
    { number: 2, title: 'Thông tin', icon: FileText },
    { number: 3, title: 'Địa chỉ', icon: MapPin },
    { number: 4, title: 'Hoàn tất', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => step > 1 ? setStep(step - 1) : navigate(PAGES.WELCOME)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{step > 1 ? 'Quay lại' : 'Trang chủ'}</span>
        </button>

        {/* Progress Steps */}
        <Card className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                      step >= s.number
                        ? 'bg-blue-600 text-white scale-110 shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s.number ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <s.icon className="w-6 h-6" />
                    )}
                  </div>
                  <p className={`text-sm mt-2 font-medium ${step >= s.number ? 'text-blue-600' : 'text-gray-500'}`}>
                    {s.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                    step > s.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </Card>

        <Card className="shadow-xl">
          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Chọn vai trò của bạn</h2>
                <p className="text-gray-600">Bạn muốn đăng ký với vai trò nào?</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card
                  hover
                  onClick={() => handleChange({ target: { name: 'role', value: USER_ROLES.PATIENT } })}
                  className={`cursor-pointer border-2 transition-all ${
                    formData.role === USER_ROLES.PATIENT
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="text-center p-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Bệnh nhân</h3>
                    <p className="text-gray-600 mb-4">Đặt lịch khám, quản lý sức khỏe cá nhân</p>
                    <ul className="text-sm text-gray-600 space-y-2 text-left">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Đặt lịch khám online
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Quản lý hồ sơ bệnh án
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Tư vấn trực tuyến
                      </li>
                    </ul>
                  </div>
                </Card>

                <Card
                  hover
                  onClick={() => handleChange({ target: { name: 'role', value: USER_ROLES.DOCTOR } })}
                  className={`cursor-pointer border-2 transition-all ${
                    formData.role === USER_ROLES.DOCTOR
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="text-center p-6">
                    <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Bác sĩ</h3>
                    <p className="text-gray-600 mb-4">Quản lý lịch làm việc, tư vấn bệnh nhân</p>
                    <ul className="text-sm text-gray-600 space-y-2 text-left">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Quản lý lịch khám
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Hồ sơ chuyên môn
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Tư vấn online
                      </li>
                    </ul>
                  </div>
                </Card>
              </div>

              {errors.role && (
                <p className="text-red-600 text-sm text-center">{errors.role}</p>
              )}
            </div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h2>
                <p className="text-gray-600">Vui lòng điền đầy đủ thông tin</p>
              </div>

              <Input
                type="text"
                name="fullName"
                label="Họ và tên"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                icon={User}
                required
              />

              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={Mail}
                required
              />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    label="Mật khẩu"
                    placeholder="Tối thiểu 6 ký tự"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    icon={Lock}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    icon={Lock}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  type="date"
                  name="dateOfBirth"
                  label="Ngày sinh"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  error={errors.dateOfBirth}
                  icon={Calendar}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.gender
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                  {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Address */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Thông tin liên hệ</h2>
                <p className="text-gray-600">Địa chỉ và số điện thoại</p>
              </div>

              <Input
                type="tel"
                name="phone"
                label="Số điện thoại"
                placeholder="0123456789"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                icon={Phone}
                helperText="Số điện thoại 10-11 chữ số"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.city
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {CITIES.map(city => (
                    <option key={city.value} value={city.value}>{city.label}</option>
                  ))}
                </select>
                {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
              </div>

              <Input
                type="text"
                name="address"
                label="Địa chỉ chi tiết"
                placeholder="Số nhà, đường, phường/xã"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
                icon={MapPin}
                required
              />
            </div>
          )}

          {/* Step 4: Health Info */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Thông tin sức khỏe</h2>
                <p className="text-gray-600">Giúp bác sĩ hiểu rõ hơn về tình trạng của bạn</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bệnh nền hoặc tiền sử bệnh (nếu có)
                </label>
                <textarea
                  name="conditions"
                  placeholder="Ví dụ: Tiểu đường, cao huyết áp, dị ứng thuốc..."
                  value={formData.conditions}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200 resize-none transition-all"
                  rows="5"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Thông tin này sẽ giúp bác sĩ đưa ra phương án điều trị phù hợp
                </p>
              </div>

              {/* Summary */}
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                <h3 className="font-bold text-gray-900 mb-4">Tóm tắt thông tin đăng ký:</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Họ tên:</span>
                    <span className="font-medium text-gray-900 ml-2">{formData.fullName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900 ml-2">{formData.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Vai trò:</span>
                    <span className="font-medium text-gray-900 ml-2">
                      {formData.role === USER_ROLES.PATIENT ? 'Bệnh nhân' : 'Bác sĩ'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Địa chỉ:</span>
                    <span className="font-medium text-gray-900 ml-2">
                      {CITIES.find(c => c.value === formData.city)?.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(step - 1)}
                icon={ArrowLeft}
                className="flex-1"
              >
                Quay lại
              </Button>
            )}
            <Button
              variant="primary"
              size="lg"
              onClick={handleNext}
              loading={isLoading}
              disabled={isLoading}
              icon={step === 4 ? CheckCircle : ArrowRight}
              iconPosition="right"
              className="flex-1"
            >
              {step === 4 ? 'Hoàn tất đăng ký' : 'Tiếp tục'}
            </Button>
          </div>

          {/* Login Link */}
          {step === 1 && (
            <p className="text-center text-gray-600 mt-6">
              Đã có tài khoản?{' '}
              <button
                onClick={() => navigate(PAGES.LOGIN)}
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                Đăng nhập ngay
              </button>
            </p>
          )}
        </Card>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;