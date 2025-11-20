import React from 'react';
import { 
  Calendar, Clock, MapPin, User, Phone, 
  CheckCircle, XCircle, AlertCircle, MoreVertical,
  MessageSquare, Video, Navigation
} from 'lucide-react';

const AppointmentCard = ({ 
  appointment = {
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
    status: "confirmed", // confirmed, pending, completed, cancelled
    type: "in-person", // in-person, video
    reason: "Kiểm tra sức khỏe định kỳ",
    bookingCode: "MD123456"
  },
  onCancel,
  onReschedule,
  onViewDetails,
  variant = "default" // default, compact, detailed
}) => {

  const statusConfig = {
    confirmed: {
      icon: CheckCircle,
      label: "Đã xác nhận",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
      borderColor: "border-green-500"
    },
    pending: {
      icon: AlertCircle,
      label: "Chờ xác nhận",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-500"
    },
    completed: {
      icon: CheckCircle,
      label: "Hoàn thành",
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
      borderColor: "border-blue-500"
    },
    cancelled: {
      icon: XCircle,
      label: "Đã hủy",
      bgColor: "bg-red-100",
      textColor: "text-red-700",
      borderColor: "border-red-500"
    }
  };

  const status = statusConfig[appointment.status];
  const StatusIcon = status.icon;

  if (variant === "compact") {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{appointment.doctor.avatar}</div>
            <div>
              <h3 className="font-bold text-gray-800">{appointment.doctor.name}</h3>
              <p className="text-sm text-gray-600">{appointment.doctor.specialty}</p>
            </div>
          </div>
          <span className={`flex items-center gap-1 ${status.bgColor} ${status.textColor} px-2 py-1 rounded-full text-xs font-medium`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-green-500" />
            {appointment.date}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-green-500" />
            {appointment.time.split(' - ')[0]}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border-2 ${status.borderColor} overflow-hidden hover:shadow-lg transition-all`}>
      {/* Status Banner */}
      <div className={`${status.bgColor} ${status.textColor} px-4 py-2 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <StatusIcon className="w-4 h-4" />
          <span className="font-semibold text-sm">{status.label}</span>
        </div>
        <span className="text-xs font-medium">Mã: {appointment.bookingCode}</span>
      </div>

      <div className="p-6">
        {/* Doctor Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{appointment.doctor.avatar}</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {appointment.doctor.name}
              </h3>
              <p className="text-green-600 font-medium mb-1">{appointment.doctor.specialty}</p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {appointment.doctor.phone}
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Appointment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Ngày khám</p>
                <p className="font-semibold text-gray-800">{appointment.date}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Thời gian</p>
                <p className="font-semibold text-gray-800">{appointment.time}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Cơ sở y tế</p>
                <p className="font-semibold text-gray-800">{appointment.hospital.name}</p>
                <p className="text-sm text-gray-600">{appointment.hospital.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Type & Reason */}
        {variant === "detailed" && (
          <div className="mb-4 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {appointment.type === 'video' ? (
                <Video className="w-5 h-5 text-green-500" />
              ) : (
                <User className="w-5 h-5 text-green-500" />
              )}
              <span className="font-medium text-gray-800">
                {appointment.type === 'video' ? 'Khám qua video' : 'Khám tại cơ sở'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Lý do khám:</span> {appointment.reason}
            </p>
          </div>
        )}

        {/* Actions */}
        {appointment.status === 'confirmed' && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onViewDetails?.(appointment.id)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Xem chi tiết
            </button>
            <button className="px-4 border border-green-500 text-green-600 hover:bg-green-50 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Nhắn tin
            </button>
            <button className="px-4 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Navigation className="w-5 h-5" />
              Chỉ đường
            </button>
          </div>
        )}

        {appointment.status === 'pending' && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onReschedule?.(appointment.id)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Đổi lịch
            </button>
            <button
              onClick={() => onCancel?.(appointment.id)}
              className="flex-1 border border-red-500 text-red-600 hover:bg-red-50 font-medium py-2.5 rounded-lg transition-colors"
            >
              Hủy lịch
            </button>
          </div>
        )}

        {appointment.status === 'completed' && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg transition-colors">
              Xem hồ sơ khám
            </button>
            <button className="flex-1 border border-green-500 text-green-600 hover:bg-green-50 font-medium py-2.5 rounded-lg transition-colors">
              Đặt lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;