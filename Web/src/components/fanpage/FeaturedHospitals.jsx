import React, { useState } from 'react';
import { TrendingUp, BadgeCheck, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeaturedHospitals = ({ hospitals }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sort by followers descending
  const sortedHospitals = [...hospitals].sort((a, b) => {
    const fA = a.fanpage?.follower_count || 0;
    const fB = b.fanpage?.follower_count || 0;
    return fB - fA;
  });

  const displayHospitals = sortedHospitals.slice(0, 5);

  const filteredModalHospitals = sortedHospitals.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900 text-lg">Bệnh viện nổi bật</h3>
        </div>

        <div className="space-y-5">
          {displayHospitals.map((hospital) => (
            <div 
              key={hospital.id} 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate(`/fanpage/${hospital.fanpage?.id}`)}
            >
              <img 
                src={hospital?.fanpage?.avatar_url || 'https://via.placeholder.com/48'} 
                alt={hospital.name} 
                className="w-12 h-12 rounded-full object-cover border border-gray-100 group-hover:border-blue-200 transition-colors"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-semibold text-gray-900 text-[15px] truncate group-hover:text-blue-600 transition-colors">
                    {hospital.name}
                  </h4>
                  {hospital?.fanpage?.follower_count >= 100000 && (
                    <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0" style={{ color: 'white' }} title="Đã xác minh" />
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {hospital.city}
                </p>
                {hospital?.fanpage?.follower_count > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {hospital.fanpage.follower_count.toLocaleString('vi-VN')} người theo dõi
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full mt-6 py-2.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Xem tất cả
        </button>
      </div>

      {/* View All Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <h3 className="font-bold text-xl text-gray-900">Danh sách Bệnh viện</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc khu vực..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm shadow-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Modal List */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredModalHospitals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                  {filteredModalHospitals.map(hospital => (
                    <div 
                      key={hospital.id}
                      onClick={() => {
                        setIsModalOpen(false);
                        navigate(`/fanpage/${hospital.fanpage?.id}`);
                      }}
                      className="flex items-center gap-4 p-3 hover:bg-blue-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-blue-100"
                    >
                      <img 
                        src={hospital?.fanpage?.avatar_url || 'https://via.placeholder.com/64'} 
                        alt={hospital.name} 
                        className="w-14 h-14 rounded-full object-cover border border-gray-100 shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-semibold text-gray-900 text-[15px] truncate">
                            {hospital.name}
                          </h4>
                          {hospital?.fanpage?.follower_count >= 100000 && (
                            <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0" style={{ color: 'white' }} title="Đã xác minh" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-0.5">{hospital.city}</p>
                        {hospital?.fanpage?.follower_count > 0 && (
                          <p className="text-xs font-medium text-blue-600 mt-1">
                            {hospital.fanpage.follower_count.toLocaleString('vi-VN')} theo dõi
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Không tìm thấy bệnh viện nào phù hợp.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeaturedHospitals;
