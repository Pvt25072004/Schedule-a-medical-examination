import React, { useState } from 'react';
import { 
  Calendar, Filter, Search, ChevronDown, 
  SlidersHorizontal, Download, CheckCircle,
  AlertCircle, XCircle, Clock
} from 'lucide-react';

const AppointmentList = ({ 
  appointments = [
    {
      id: 1,
      doctor: {
        name: "BS. Nguyễn Văn An",
        avatar: "👨‍⚕️",
        specialty: "Tim mạch",
        phone: "0123 456 789"
      },
      hospital: {
        name: "Bệnh viện Đa khoa Quốc tế",
        address: "123 Đường ABC, Quận 1, TP.HCM"
      },
      date: "15/11/2025",
      time: "09:00 - 09:30",
      status: "confirmed",
      type: "in-person",
      reason: "Kiểm tra sức khỏe định kỳ",
      bookingCode: "MD123456"
    },
    {
      id: 2,
      doctor: {
        name: "BS. Trần Thị Bình",
        avatar: "👩‍⚕️",
        specialty: "Nội khoa",
        phone: "0987 654 321"
      },
      hospital: {
        name: "Phòng khám Đa khoa Medpro",
        address: "456 Đường XYZ, Quận 3, TP.HCM"
      },
      date: "18/11/2025",
      time: "14:30 - 15:00",
      status: "pending",
      type: "video",
      reason: "Tư vấn dinh dưỡng",
      bookingCode: "MD123457"
    },
    {
      id: 3,
      doctor: {
        name: "BS. Lê Hoàng Cường",
        avatar: "👨‍⚕️",
        specialty: "Nha khoa",
        phone: "0912 345 678"
      },
      hospital: {
        name: "Nha khoa Paris",
        address: "789 Đường DEF, Quận 5, TP.HCM"
      },
      date: "12/11/2025",
      time: "10:00 - 10:30",
      status: "completed",
      type: "in-person",
      reason: "Điều trị răng sâu",
      bookingCode: "MD123455"
    }
  ],
  onViewDetails,
  onCancel,
  onReschedule
}) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'Tất cả', count: appointments.length, icon: Calendar },
    { value: 'confirmed', label: 'Đã xác nhận', count: 1, icon: CheckCircle, color: 'text-green-600' },
    { value: 'pending', label: 'Chờ xác nhận', count: 1, icon: AlertCircle, color: 'text-yellow-600' },
    { value: 'completed', label: 'Hoàn thành', count: 1, icon: CheckCircle, color: 'text-blue-600' },
    { value: 'cancelled', label: 'Đã hủy', count: 0, icon: XCircle, color: 'text-red-600' }
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

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    const matchesSearch = apt.doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.hospital.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-500" />
            Lịch hẹn của bạn
          </h1>
          <p className="text-gray-600 mt-1">Quản lý và theo dõi các lịch khám bệnh</p>
        </div>
        <button className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors">
          <Download className="w-5 h-5" />
          Xuất danh sách
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusOptions.slice(1).map((option) => {
          const Icon = option.icon;
          return (
            <div key={option.value} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-6 h-6 ${option.color}`} />
                <span className="text-2xl font-bold text-gray-800">{option.count}</span>
              </div>
              <p className="text-sm text-gray-600">{option.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo bác sĩ, bệnh viện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Bộ lọc
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.count})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="date">Ngày khám</option>
                  <option value="doctor">Bác sĩ</option>
                  <option value="status">Trạng thái</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại khám</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="all">Tất cả</option>
                  <option value="in-person">Tại cơ sở</option>
                  <option value="video">Qua video</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => setFilterStatus(option.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filterStatus === option.value
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-green-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              {option.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filterStatus === option.value
                  ? 'bg-white bg-opacity-20'
                  : 'bg-gray-100'
              }`}>
                {option.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Không có lịch hẹn</h3>
          <p className="text-gray-600 mb-6">Bạn chưa có lịch khám nào trong mục này</p>
          <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Đặt lịch khám ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Left: Doctor Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{appointment.doctor.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{appointment.doctor.name}</h3>
                          <p className="text-sm text-green-600 font-medium">{appointment.doctor.specialty}</p>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{appointment.hospital.name}</p>
                      <p className="text-xs text-gray-500">{appointment.hospital.address}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Date & Actions */}
                <div className="md:w-64 flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{appointment.time}</span>
                    </div>
                  </div>
                  
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() => onViewDetails?.(appointment.id)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  )}
                  
                  {appointment.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onCancel?.(appointment.id)}
                        className="flex-1 border border-red-500 text-red-600 hover:bg-red-50 font-medium py-2 rounded-lg transition-colors text-sm"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => onReschedule?.(appointment.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition-colors text-sm"
                      >
                        Đổi lịch
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentList;