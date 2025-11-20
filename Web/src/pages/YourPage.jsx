import React, { useState } from 'react';
import { 
  User, Calendar, FileText, Heart, Star, MapPin, Phone, Mail, 
  Clock, Activity, Award, TrendingUp, Settings, Edit2, Camera,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const YourPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { icon: Calendar, label: 'Lịch hẹn', value: '12', color: 'bg-green-500', change: '+2 tháng này' },
    { icon: FileText, label: 'Hồ sơ khám', value: '45', color: 'bg-blue-500', change: 'Tất cả' },
    { icon: Heart, label: 'Yêu thích', value: '8', color: 'bg-red-500', change: 'Cơ sở y tế' },
    { icon: Award, label: 'Điểm thưởng', value: '2,450', color: 'bg-yellow-500', change: '+150 điểm' }
  ];

  const appointments = [
    {
      id: 1,
      doctor: 'BS. Nguyễn Văn An',
      specialty: 'Tim mạch',
      hospital: 'Bệnh viện Đa khoa Quốc tế',
      date: '15/11/2025',
      time: '09:00',
      status: 'confirmed',
      avatar: '👨‍⚕️'
    },
    {
      id: 2,
      doctor: 'BS. Trần Thị Bình',
      specialty: 'Nội khoa',
      hospital: 'Phòng khám Đa khoa Medpro',
      date: '18/11/2025',
      time: '14:30',
      status: 'pending',
      avatar: '👩‍⚕️'
    },
    {
      id: 3,
      doctor: 'BS. Lê Hoàng Cường',
      specialty: 'Nha khoa',
      hospital: 'Nha khoa Paris',
      date: '12/11/2025',
      time: '10:00',
      status: 'completed',
      avatar: '👨‍⚕️'
    }
  ];

  const medicalRecords = [
    {
      id: 1,
      date: '10/11/2025',
      diagnosis: 'Kiểm tra sức khỏe định kỳ',
      doctor: 'BS. Nguyễn Văn An',
      hospital: 'BV Đa khoa Quốc tế',
      result: 'Bình thường'
    },
    {
      id: 2,
      date: '05/10/2025',
      diagnosis: 'Tư vấn dinh dưỡng',
      doctor: 'BS. Phạm Thu Hà',
      hospital: 'Phòng khám Dinh dưỡng',
      result: 'Đã hoàn thành'
    },
    {
      id: 3,
      date: '20/09/2025',
      diagnosis: 'Khám tai mũi họng',
      doctor: 'BS. Đặng Minh Tuấn',
      hospital: 'Phòng khám Tai Mũi Họng',
      result: 'Điều trị thành công'
    }
  ];

  const favoriteHospitals = [
    {
      id: 1,
      name: 'Bệnh viện Đa khoa Quốc tế',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      rating: 4.8,
      reviews: 1250,
      image: '🏥'
    },
    {
      id: 2,
      name: 'Phòng khám Đa khoa Medpro',
      address: '456 Đường XYZ, Quận 3, TP.HCM',
      rating: 4.9,
      reviews: 890,
      image: '🏥'
    }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Đã xác nhận' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle, label: 'Chờ xác nhận' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle, label: 'Hoàn thành' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Đã hủy' }
    };
    const style = styles[status];
    const Icon = style.icon;
    return (
      <span className={`inline-flex items-center gap-1 ${style.bg} ${style.text} px-3 py-1 rounded-full text-xs font-medium`}>
        <Icon className="w-3 h-3" />
        {style.label}
      </span>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-xs text-green-600 font-medium">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Activity className="w-6 h-6 text-green-500" />
              Hoạt động gần đây
            </h2>
            <button className="text-green-600 hover:text-green-700 font-medium text-sm">
              Xem tất cả
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { action: 'Đã đặt lịch khám', time: '2 giờ trước', icon: Calendar, color: 'text-green-500' },
            { action: 'Đã thêm bệnh viện yêu thích', time: '1 ngày trước', icon: Heart, color: 'text-red-500' },
            { action: 'Đã hoàn thành khám bệnh', time: '3 ngày trước', icon: CheckCircle, color: 'text-blue-500' }
          ].map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <Icon className={`w-5 h-5 ${activity.color}`} />
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Lịch hẹn của bạn</h2>
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{apt.avatar}</div>
                  <div>
                    <h3 className="font-bold text-gray-800">{apt.doctor}</h3>
                    <p className="text-sm text-gray-600">{apt.specialty}</p>
                  </div>
                </div>
                {getStatusBadge(apt.status)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-green-500" />
                  {apt.hospital}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-green-500" />
                  {apt.date}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-green-500" />
                  {apt.time}
                </div>
              </div>
              {apt.status === 'confirmed' && (
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition-colors">
                    Xem chi tiết
                  </button>
                  <button className="px-4 border border-red-500 text-red-600 hover:bg-red-50 font-medium py-2 rounded-lg transition-colors">
                    Hủy lịch
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMedicalRecords = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Hồ sơ khám bệnh</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày khám</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chẩn đoán</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bác sĩ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cơ sở y tế</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kết quả</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {medicalRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">{record.date}</td>
                <td className="px-6 py-4 text-sm text-gray-800 font-medium">{record.diagnosis}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.doctor}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.hospital}</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                    {record.result}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Cơ sở y tế yêu thích</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoriteHospitals.map((hospital) => (
            <div key={hospital.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{hospital.image}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1">{hospital.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" />
                    {hospital.address}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-800">{hospital.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({hospital.reviews} đánh giá)</span>
                  </div>
                </div>
                <button className="text-red-500 hover:text-red-600">
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>
              <button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition-colors">
                Đặt lịch khám
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: Activity },
    { id: 'appointments', label: 'Lịch hẹn', icon: Calendar },
    { id: 'records', label: 'Hồ sơ', icon: FileText },
    { id: 'favorites', label: 'Yêu thích', icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-6xl shadow-lg">
                👤
              </div>
              <button className="absolute bottom-0 right-0 bg-white text-green-600 rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <h1 className="text-3xl font-bold">Nguyễn Văn A</h1>
                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-4 text-green-50 justify-center md:justify-start">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  nguyenvana@email.com
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  0123 456 789
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  TP. Hồ Chí Minh
                </span>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              <Settings className="w-5 h-5" />
              Cài đặt
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-green-600 border-b-2 border-green-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'records' && renderMedicalRecords()}
        {activeTab === 'favorites' && renderFavorites()}
      </div>
    </div>
  );
};

export default YourPage;