import React, { useState } from 'react';
import { Calendar, MessageCircle, Settings, User, LogOut, Clock, MapPin, Heart, Activity, Users, ChevronLeft, Phone, Mail, Globe, AlertCircle } from 'lucide-react';

const STLClinicWebsite = () => {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [userRole, setUserRole] = useState(null);
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    dateOfBirth: '',
    address: '',
    city: '',
    conditions: '',
    phone: '',
    gender: ''
  });
  const [appointments, setAppointments] = useState([
    { id: 1, date: '25/10/2025 - 10:00', type: 'Khám tim mạch định kỳ', status: 'confirmed' },
    { id: 2, date: '26/10/2025 - 14:00', type: 'Tái khám nhi khoa', status: 'pending' }
  ]);
  const [chatMessages, setChatMessages] = useState([
    { text: 'Xin chào! Tôi là trợ lý ảo của STL Clinic. Bạn cần hỗ trợ gì hôm nay?', sender: 'bot' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setCurrentPage('home');
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, 
        { text: newMessage, sender: 'user' },
        { text: 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.', sender: 'bot' }
      ]);
      setNewMessage('');
    }
  };

  // Welcome Page
  const WelcomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Activity className="w-12 h-12 text-teal-600" />
            <Heart className="w-8 h-8 text-red-500 -ml-2" />
          </div>
          <h1 className="text-3xl font-bold text-teal-800 mb-2">STL Clinic</h1>
          <p className="text-gray-600">Chăm sóc sức khỏe toàn diện</p>
        </div>
        
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-16">
          <div className="flex justify-center items-center space-x-6">
            <User className="w-16 h-16 text-teal-600" />
            <Calendar className="w-12 h-12 text-blue-500" />
            <Activity className="w-14 h-14 text-green-500" />
            <MessageCircle className="w-12 h-12 text-purple-500" />
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={() => setCurrentPage('login')}
              className="w-full bg-white border-2 border-teal-500 text-teal-700 py-4 rounded-full font-semibold hover:bg-teal-50 transition"
            >
              Login
            </button>
            <button 
              onClick={() => setCurrentPage('register')}
              className="w-full bg-white border-2 border-teal-500 text-teal-700 py-4 rounded-full font-semibold hover:bg-teal-50 transition"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Login Page
  const LoginPage = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button onClick={() => setCurrentPage('welcome')} className="mb-4 text-gray-600 flex items-center">
          <ChevronLeft className="w-5 h-5" /> Quay lại
        </button>
        
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-6">
            <Activity className="w-10 h-10 text-teal-600" />
            <span className="text-2xl font-bold text-teal-700 ml-2">STL</span>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-8">Đăng nhập ✨</h2>
          
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-teal-600" />
              <input
                type="email"
                placeholder="Nhập email"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                name="email"
                onChange={handleInputChange}
              />
            </div>
            
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-teal-600" />
              <input
                type="password"
                placeholder="Mật khẩu"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                name="password"
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <button 
            onClick={() => setCurrentPage('home')}
            className="w-full bg-teal-500 text-white py-4 rounded-xl font-semibold hover:bg-teal-600 transition mb-4"
          >
            Đăng nhập ngay
          </button>
          
          <p className="text-center text-gray-600">
            Đã có tài khoản? <span className="text-teal-600 cursor-pointer font-semibold">Đăng nhập</span>
          </p>
        </div>
      </div>
    </div>
  );

  // Register Page - Step 1: Role Selection
  const RegisterStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Chọn vai trò</h3>
      
      <div 
        onClick={() => { setUserRole('patient'); setStep(2); }}
        className="border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition"
      >
        <div className="flex items-start space-x-4">
          <User className="w-8 h-8 text-teal-600 mt-1" />
          <div>
            <h4 className="font-bold text-lg mb-1">Tôi là Bệnh nhân</h4>
            <p className="text-gray-600 text-sm">Đặt lịch khám, quản lý hồ sơ sức khỏe của nhân</p>
          </div>
        </div>
      </div>
      
      <div 
        onClick={() => { setUserRole('doctor'); setStep(2); }}
        className="border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition"
      >
        <div className="flex items-start space-x-4">
          <Users className="w-8 h-8 text-blue-600 mt-1" />
          <div>
            <h4 className="font-bold text-lg mb-1">Tôi là Bác sĩ/Chuyên gia</h4>
            <p className="text-gray-600 text-sm">Quản lý lịch làm việc, hồ sơ chuyên môn</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Register Step 2: Basic Info
  const RegisterStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Hồ sơ cơ bản</h3>
      
      <input
        type="text"
        placeholder="Tên hiển thị"
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
        name="fullName"
        value={userData.fullName}
        onChange={handleInputChange}
      />
      
      <input
        type="date"
        placeholder="Chọn ngày sinh"
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
        name="dateOfBirth"
        value={userData.dateOfBirth}
        onChange={handleInputChange}
      />
      
      <button 
        onClick={handleRegisterSubmit}
        className="w-full bg-teal-500 text-white py-4 rounded-xl font-semibold hover:bg-teal-600 transition"
      >
        Tiếp tục
      </button>
    </div>
  );

  // Register Step 3: Address
  const RegisterStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Thông tin địa chỉ</h3>
      
      <select 
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
        name="city"
        value={userData.city}
        onChange={handleInputChange}
      >
        <option value="">Tỉnh/Thành phố</option>
        <option value="hcm">TP. Hồ Chí Minh</option>
        <option value="hn">Hà Nội</option>
        <option value="dn">Đà Nẵng</option>
      </select>
      
      <input
        type="text"
        placeholder="Đường/Phố/Số nhà"
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
        name="address"
        value={userData.address}
        onChange={handleInputChange}
      />
      
      <button 
        onClick={handleRegisterSubmit}
        className="w-full bg-teal-500 text-white py-4 rounded-xl font-semibold hover:bg-teal-600 transition"
      >
        Tiếp tục
      </button>
    </div>
  );

  // Register Step 4: Health Info
  const RegisterStep4 = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Thông tin bệnh nền</h3>
      <p className="text-sm text-gray-600 mb-4">Nhập các bệnh nền hoặc tình trạng sức khỏe đặc biệt (nếu có)</p>
      
      <textarea
        placeholder="Nhập bệnh nền..."
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none h-32"
        name="conditions"
        value={userData.conditions}
        onChange={handleInputChange}
      />
      
      <button 
        onClick={handleRegisterSubmit}
        className="w-full bg-teal-500 text-white py-4 rounded-xl font-semibold hover:bg-teal-600 transition"
      >
        Hoàn tất
      </button>
    </div>
  );

  // Register Page
  const RegisterPage = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button onClick={() => step > 1 ? setStep(step - 1) : setCurrentPage('welcome')} className="mb-4 text-gray-600 flex items-center">
          <ChevronLeft className="w-5 h-5" /> Bước {step}/4
        </button>
        
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {step === 1 && <RegisterStep1 />}
          {step === 2 && <RegisterStep2 />}
          {step === 3 && <RegisterStep3 />}
          {step === 4 && <RegisterStep4 />}
        </div>
      </div>
    </div>
  );

  // Home Page
  const HomePage = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-teal-500 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Trang chủ</h1>
            <button onClick={() => setCurrentPage('settings')} className="p-2 hover:bg-teal-600 rounded-full">
              <Settings className="w-6 h-6" />
            </button>
          </div>
          <p className="text-teal-100">Chào mừng đến với STL Clinic</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => setCurrentPage('booking')}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col items-center"
          >
            <Calendar className="w-12 h-12 text-teal-600 mb-3" />
            <span className="font-semibold text-gray-800">Đặt lịch khám</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage('appointments')}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col items-center"
          >
            <Clock className="w-12 h-12 text-blue-600 mb-3" />
            <span className="font-semibold text-gray-800">Lịch hẹn</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage('chat')}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col items-center"
          >
            <MessageCircle className="w-12 h-12 text-purple-600 mb-3" />
            <span className="font-semibold text-gray-800">Trợ lý ảo</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage('settings')}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col items-center"
          >
            <User className="w-12 h-12 text-green-600 mb-3" />
            <span className="font-semibold text-gray-800">Hồ sơ</span>
          </button>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Clock className="w-6 h-6 text-teal-600 mr-2" />
            Lịch hẹn sắp tới
          </h2>
          {appointments.slice(0, 2).map(apt => (
            <div key={apt.id} className="border-l-4 border-teal-500 pl-4 py-3 mb-3 bg-teal-50 rounded-r-lg">
              <p className="font-semibold text-gray-800">{apt.date}</p>
              <p className="text-gray-600 text-sm">{apt.type}</p>
            </div>
          ))}
        </div>

        {/* Health Tips */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-md p-6 text-white">
          <h2 className="text-xl font-bold mb-3">💡 Mẹo sức khỏe hôm nay</h2>
          <p>Uống đủ 2 lít nước mỗi ngày giúp cơ thể luôn khỏe mạnh và tràn đầy năng lượng!</p>
        </div>
      </div>
    </div>
  );

  // Booking Page
  const BookingPage = () => {
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-teal-500 text-white p-6 rounded-b-3xl shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center">
            <button onClick={() => setCurrentPage('home')} className="mr-4">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Đặt lịch khám</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
            {/* Doctor Selection */}
            <div>
              <label className="block font-semibold mb-2">Chọn bác sĩ</label>
              <select 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
              >
                <option value="">Bác sĩ/Khoa</option>
                <option value="dr1">BS. Nguyễn Văn A - Tim mạch</option>
                <option value="dr2">BS. Trần Thị B - Nhi khoa</option>
                <option value="dr3">BS. Lê Văn C - Da liễu</option>
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block font-semibold mb-2">Chọn ngày khám</label>
              <input
                type="date"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Time Selection */}
            <div>
              <label className="block font-semibold mb-2">Chọn khung giờ</label>
              <div className="grid grid-cols-3 gap-3">
                {['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '14:00 - 15:00', '15:00 - 16:00'].map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 rounded-xl border-2 transition ${
                      selectedTime === time 
                        ? 'bg-teal-500 text-white border-teal-500' 
                        : 'border-gray-200 hover:border-teal-500'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                setAppointments([...appointments, {
                  id: appointments.length + 1,
                  date: `${selectedDate} - ${selectedTime}`,
                  type: 'Khám tổng quát',
                  status: 'pending'
                }]);
                setCurrentPage('appointments');
              }}
              className="w-full bg-teal-500 text-white py-4 rounded-xl font-semibold hover:bg-teal-600 transition"
            >
              Xác nhận đặt lịch
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Appointments Page
  const AppointmentsPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-teal-500 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center">
          <button onClick={() => setCurrentPage('home')} className="mr-4">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Lịch hẹn</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {appointments.map(apt => (
          <div key={apt.id} className="bg-white rounded-2xl shadow-md p-6 mb-4 flex items-center justify-between">
            <div className="flex items-start space-x-4">
              <Clock className="w-6 h-6 text-teal-600 mt-1" />
              <div>
                <p className="font-semibold text-lg">{apt.date}</p>
                <p className="text-gray-600">{apt.type}</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              apt.status === 'confirmed' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-orange-100 text-orange-700'
            }`}>
              {apt.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // Chat Page
  const ChatPage = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-teal-500 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center">
          <button onClick={() => setCurrentPage('home')} className="mr-4">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Trợ lý ảo</h1>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-6 overflow-y-auto">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
              msg.sender === 'user' 
                ? 'bg-teal-500 text-white' 
                : 'bg-white text-gray-800 shadow-md'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto flex space-x-3">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:border-teal-500 focus:outline-none"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            onClick={handleSendMessage}
            className="bg-teal-500 text-white p-3 rounded-full hover:bg-teal-600 transition"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );

  // Settings Page
  const SettingsPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-teal-500 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center">
          <button onClick={() => setCurrentPage('home')} className="mr-4">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Cài đặt</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                Q
              </div>
              <div>
                <h3 className="font-bold text-lg">Quốc Sang Trần Nguyễn</h3>
                <p className="text-gray-600">Bệnh nhân</p>
              </div>
            </div>
            <button onClick={() => setShowProfile(!showProfile)}>
              <ChevronLeft className={`w-6 h-6 transform ${showProfile ? 'rotate-90' : '-rotate-90'}`} />
            </button>
          </div>

          {showProfile && (
            <div className="border-t pt-4 space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <span>N/A</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <span>trannguyenquocsang2504@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span>TP. Hồ Chí Minh, Quận 3, úc</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span>2025-10-24T00:00:00.000</span>
              </div>
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-gray-500" />
                <span>yếu</span>
              </div>
            </div>
          )}
        </div>

        {/* Settings Options */}
        <div className="bg-white rounded-2xl shadow-md divide-y">
          <button className="w-full p-5 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <span className="font-semibold">Quyền riêng tư</span>
            </div>
            <ChevronLeft className="w-5 h-5 transform -rotate-90 text-gray-400" />
          </button>

          <button className="w-full p-5 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <span className="font-semibold">Ngôn ngữ</span>
            </div>
            <span className="text-gray-500">Tiếng Việt</span>
          </button>
        </div>

        {/* Logout Button */}
        <button 
          onClick={() => setCurrentPage('welcome')}
          className="w-full mt-6 bg-white border-2 border-red-500 text-red-600 py-4 rounded-xl font-semibold hover:bg-red-50 transition flex items-center justify-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );

  // Main Render
  return (
    <div className="font-sans">
      {currentPage === 'welcome' && <WelcomePage />}
      {currentPage === 'login' && <LoginPage />}
      {currentPage === 'register' && <RegisterPage />}
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'booking' && <BookingPage />}
      {currentPage === 'appointments' && <AppointmentsPage />}
      {currentPage === 'chat' && <ChatPage />}
      {currentPage === 'settings' && <SettingsPage />}
    </div>
  );
};

export default STLClinicWebsite;
