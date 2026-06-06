import React from 'react';
import { TrendingUp, BadgeCheck } from 'lucide-react';

const FeaturedHospitals = ({ hospitals }) => {
  // Sort hospitals by rating (descending), then take top 5
  const displayHospitals = [...hospitals]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-900 text-lg">Bệnh viện nổi bật</h3>
      </div>

      <div className="space-y-5">
        {displayHospitals.map((hospital) => (
          <div 
            key={hospital.id} 
            className="flex items-center gap-3 group"
          >
              <img 
                src={hospital.avatar_url || 'https://via.placeholder.com/48'} 
                alt={hospital.name} 
                className="w-12 h-12 rounded-full object-cover border border-gray-100 group-hover:border-blue-200 transition-colors"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-semibold text-gray-900 text-[15px] truncate group-hover:text-blue-600 transition-colors">
                    {hospital.name}
                  </h4>
                  <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0" style={{ color: 'white' }} title="Đã xác minh" />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-gray-500 truncate">
                    {hospital.city?.name || hospital.city || 'Chưa cập nhật'}
                  </p>
                  {hospital.rating ? (
                    <span className="text-xs font-medium text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      ★ {Number(hospital.rating).toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                      Chưa có đánh giá
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
};

export default FeaturedHospitals;
