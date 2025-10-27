import React from 'react';
import { Calendar, Clock, MessageCircle, User, Activity, Heart, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppointments } from '../contexts/AppointmentContext';
import Layout from '../components/common/Layout';
import Card from '../components/common/Card';
import { PAGES, HEALTH_TIPS } from '../utils/constants';
import { formatDate, getInitials } from '../utils/helpers';

const HomePage = ({ navigate }) => {
  const { user } = useAuth();
  const { getUpcomingAppointments } = useAppointments();
  const upcomingAppointments = getUpcomingAppointments().slice(0, 2);
  const randomTip = HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)];

  const quickActions = [
    {
      icon: Calendar,
      label: 'Đặt lịch khám',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      page: PAGES.BOOKING
    },
    {
      icon: Clock,
      label: 'Lịch hẹn',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      page: PAGES.APPOINTMENTS
    },
    {
      icon: MessageCircle,
      label: 'Trợ lý ảo',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      page: PAGES.CHAT
    },
    {
      icon: User,
      label: 'Hồ sơ',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      page: PAGES.SETTINGS
    }
  ];

  const healthStats = [
    { label: 'Lịch hẹn', value: upcomingAppointments.length, icon: Calendar, color: 'teal' },
    { label: 'Hoàn thành', value: '12', icon: Activity, color: 'green' },
    { label: 'Điểm sức khỏe', value: '85', icon: Heart, color: 'red' }
  ];

  return (
    <Layout
      title="Trang chủ"
      subtitle={`Chào mừng, ${user?.fullName || 'Bạn'}!`}
      showSettings
      onSettings={() => navigate(PAGES.SETTINGS)}
    >
      {/* Welcome Banner */}
      <div className="mb-6">
        <Card className="bg-gradient-to-r from-teal-500 to-blue-500 text-white" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Xin chào! 👋</h2>
              <p className="text-teal-50">Hôm nay bạn cảm thấy thế nào?</p>
            </div>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-teal-600 text-2xl font-bold">
              {getInitials(user?.fullName || 'U')}
            </div>
          </div>
        </Card>
      </div>

      {/* Health Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {healthStats.map((stat, index) => (
          <Card key={index} padding="md" className="text-center">
            <div className={`w-12 h-12 bg-${stat.color}-100 rounded-full flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-600">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 text-teal-600 mr-2" />
          Thao tác nhanh
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              hover
              onClick={() => navigate(action.page)}
              className="text-center"
              padding="lg"
            >
              <div className={`${action.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                <action.icon className={`w-8 h-8 ${action.color}`} />
              </div>
              <span className="font-semibold text-gray-800 text-sm">{action.label}</span>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center">
            <Clock className="w-5 h-5 text-teal-600 mr-2" />
            Lịch hẹn sắp tới
          </h3>
          <button
            onClick={() => navigate(PAGES.APPOINTMENTS)}
            className="text-teal-600 text-sm font-medium hover:text-teal-700"
          >
            Xem tất cả
          </button>
        </div>
        
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-3">
            {upcomingAppointments.map(apt => (
              <Card key={apt.id} padding="md" hover onClick={() => navigate(PAGES.APPOINTMENTS)}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{apt.doctorName}</p>
                    <p className="text-sm text-gray-600">{apt.specialty}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(apt.date)} • {apt.time}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {apt.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card padding="lg" className="text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">Bạn chưa có lịch hẹn nào</p>
            <button
              onClick={() => navigate(PAGES.BOOKING)}
              className="text-teal-600 font-medium hover:text-teal-700"
            >
              Đặt lịch ngay
            </button>
          </Card>
        )}
      </div>

      {/* Health Tips */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white" padding="lg">
        <h3 className="text-xl font-bold mb-3 flex items-center">
          💡 Mẹo sức khỏe hôm nay
        </h3>
        <p className="leading-relaxed">{randomTip}</p>
      </Card>
    </Layout>
  );
};

export default HomePage;