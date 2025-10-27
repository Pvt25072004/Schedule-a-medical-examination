import React, { useState } from 'react';
import { Mail, Lock, Activity, ChevronLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { PAGES } from '../utils/constants';
import { validateEmail } from '../utils/helpers';

const LoginPage = ({ navigate }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
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
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const userData = {
        email: formData.email,
        fullName: 'Người dùng',
        role: 'patient'
      };
      
      login(userData);
      setIsLoading(false);
      navigate(PAGES.HOME);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button 
          onClick={() => navigate(PAGES.WELCOME)} 
          className="mb-6 text-gray-600 flex items-center hover:text-teal-600 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="ml-1">Quay lại</span>
        </button>
        
        <Card padding="lg">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <Activity className="w-12 h-12 text-teal-600" />
            <span className="text-3xl font-bold text-teal-700 ml-2">STL</span>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-2">Đăng nhập</h2>
          <p className="text-gray-600 text-center mb-8">
            Chào mừng bạn quay trở lại! ✨
          </p>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              name="email"
              placeholder="Nhập email của bạn"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              error={errors.email}
              label="Email"
              required
            />
            
            <Input
              type="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              error={errors.password}
              label="Mật khẩu"
              required
            />
            
            {/* Forgot Password */}
            <div className="text-right">
              <button 
                type="button"
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Quên mật khẩu?
              </button>
            </div>
            
            <Button 
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
          
          {/* Demo Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Demo: Nhập bất kỳ để đăng nhập</p>
                <p className="text-xs">Email: demo@stl.com | Pass: 123456</p>
              </div>
            </div>
          </div>
          
          {/* Register Link */}
          <p className="text-center text-gray-600 mt-6">
            Chưa có tài khoản?{' '}
            <button
              onClick={() => navigate(PAGES.REGISTER)}
              className="text-teal-600 font-semibold hover:text-teal-700"
            >
              Đăng ký ngay
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;