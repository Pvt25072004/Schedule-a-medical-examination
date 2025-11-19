import React from 'react';
import { 
  MapPin, Phone, Mail, Calendar, Star, Award, 
  Heart, MessageCircle, Share2, MoreVertical 
} from 'lucide-react';

const ProfileCard = ({ 
  user = {
    name: "Nguyễn Văn A",
    avatar: "👤",
    role: "Bệnh nhân",
    location: "TP. Hồ Chí Minh",
    phone: "0123 456 789",
    email: "nguyenvana@email.com",
    joinDate: "01/2024",
    stats: {
      appointments: 12,
      reviews: 8,
      favorites: 5,
      points: 2450
    },
    verified: true
  },
  type = "default" // "default", "doctor", "compact"
}) => {
  
  if (type === "compact") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{user.avatar}</div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.role}</p>
          </div>
          <button className="text-green-600 hover:text-green-700">
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (type === "doctor") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
        <div className="h-20 bg-gradient-to-r from-green-500 to-green-600"></div>
        <div className="px-6 pb-6">
          <div className="flex justify-between items-start -mt-12 mb-4">
            <div className="text-6xl bg-white rounded-full p-2 shadow-lg">{user.avatar}</div>
            <div className="flex gap-2 mt-14">
              <button className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors">
                <MessageCircle className="w-5 h-5" />
              </button>
              <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 p-2 rounded-lg transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              {user.verified && (
                <div className="bg-green-500 text-white rounded-full p-0.5">
                  <Award className="w-4 h-4" />
                </div>
              )}
            </div>
            <p className="text-green-600 font-medium">{user.specialty || "Chuyên khoa Tim mạch"}</p>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="text-sm">{user.hospital || "Bệnh viện Đa khoa Quốc tế"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold">{user.rating || "4.9"} ({user.totalReviews || "256"} đánh giá)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-green-500" />
              <span className="text-sm">{user.experience || "15"} năm kinh nghiệm</span>
            </div>
          </div>

          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-colors">
            Đặt lịch khám
          </button>
        </div>
      </div>
    );
  }

  // Default patient card
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header Background */}
      <div className="h-24 bg-gradient-to-r from-green-500 to-green-600 relative">
        <button className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Content */}
      <div className="px-6 pb-6">
        {/* Avatar and Actions */}
        <div className="flex justify-between items-start -mt-12 mb-4">
          <div className="relative">
            <div className="text-6xl bg-white rounded-full p-2 shadow-lg">{user.avatar}</div>
            {user.verified && (
              <div className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-1 shadow">
                <Award className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-14">
            <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 p-2 rounded-lg transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h2>
          <p className="text-gray-600 flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
            {user.role}
          </p>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 text-green-500" />
            <span className="text-sm">{user.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4 text-green-500" />
            <span className="text-sm">{user.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4 text-green-500" />
            <span className="text-sm">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 text-green-500" />
            <span className="text-sm">Tham gia từ {user.joinDate}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{user.stats.appointments}</div>
            <div className="text-xs text-gray-600">Lịch hẹn</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{user.stats.reviews}</div>
            <div className="text-xs text-gray-600">Đánh giá</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{user.stats.favorites}</div>
            <div className="text-xs text-gray-600">Yêu thích</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{user.stats.points}</div>
            <div className="text-xs text-gray-600">Điểm</div>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Nhắn tin
        </button>
      </div>
    </div>
  );
};

// Example usage component
const ProfileCardDemo = () => {
  const patientData = {
    name: "Nguyễn Văn A",
    avatar: "👤",
    role: "Bệnh nhân",
    location: "TP. Hồ Chí Minh",
    phone: "0123 456 789",
    email: "nguyenvana@email.com",
    joinDate: "01/2024",
    stats: {
      appointments: 12,
      reviews: 8,
      favorites: 5,
      points: 2450
    },
    verified: true
  };

  const doctorData = {
    name: "BS. Nguyễn Thị Bình",
    avatar: "👩‍⚕️",
    specialty: "Tim mạch",
    hospital: "Bệnh viện Đa khoa Quốc tế",
    rating: "4.9",
    totalReviews: "256",
    experience: "15",
    verified: true
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile Card Components</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Default Patient Card */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Patient Card (Default)</h2>
            <ProfileCard user={patientData} type="default" />
          </div>

          {/* Doctor Card */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Doctor Card</h2>
            <ProfileCard user={doctorData} type="doctor" />
          </div>

          {/* Compact Card */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Compact Card</h2>
            <ProfileCard user={patientData} type="compact" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCardDemo;