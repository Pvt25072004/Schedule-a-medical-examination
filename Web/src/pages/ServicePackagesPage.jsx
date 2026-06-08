import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, Filter, Shield, Clock, Plus, ArrowRight, TrendingUp, DollarSign } from "lucide-react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { PAGES } from "../utils/constants";
import { getAllServicePackages } from "../services/service-packages.api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { normalizeForSearch } from "../utils/helpers";

const ServicePackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHospitals, setSelectedHospitals] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000000); // Default 20M
  const [sortBy, setSortBy] = useState("default");
  const [isPopularOnly, setIsPopularOnly] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const filterRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await getAllServicePackages();
        setPackages(data || []);
        setFilteredPackages(data || []);
      } catch (error) {
        console.error("Lỗi khi tải gói dịch vụ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const uniqueHospitals = useMemo(() => {
    const hospitalsMap = new Map();
    packages.forEach(pkg => {
      if (pkg.hospitals) {
        pkg.hospitals.forEach(h => {
          if (!hospitalsMap.has(h.id)) {
            hospitalsMap.set(h.id, h);
          }
        });
      }
    });
    return Array.from(hospitalsMap.values());
  }, [packages]);

  useEffect(() => {
    let filtered = packages;
    
    if (searchTerm) {
      const normalizedSearch = normalizeForSearch(searchTerm);
      filtered = filtered.filter((pkg) => 
        normalizeForSearch(pkg.name).includes(normalizedSearch) || 
        normalizeForSearch(pkg.description).includes(normalizedSearch) ||
        pkg.categories?.some(c => normalizeForSearch(c.name).includes(normalizedSearch))
      );
    }

    if (selectedHospitals.length > 0) {
      filtered = filtered.filter(pkg => 
        pkg.hospitals?.some(h => selectedHospitals.includes(h.id))
      );
    }
    
    // Filter by price
    filtered = filtered.filter(pkg => 
      Number(pkg.fixed_price || 0) >= minPrice && Number(pkg.fixed_price || 0) <= maxPrice
    );

    // Filter by popular
    if (isPopularOnly) {
      filtered = filtered.filter(pkg => (pkg.booking_count || 0) > 0);
    }
    
    // Sort
    if (sortBy === "price_asc") {
      filtered.sort((a, b) => Number(a.fixed_price || 0) - Number(b.fixed_price || 0));
    } else if (sortBy === "price_desc") {
      filtered.sort((a, b) => Number(b.fixed_price || 0) - Number(a.fixed_price || 0));
    }
    
    setFilteredPackages(filtered);
  }, [searchTerm, selectedHospitals, minPrice, maxPrice, sortBy, isPopularOnly, packages]);

  const requireAuthAndNavigate = (page, options) => {
    if (!isAuthenticated) {
      navigate(PAGES.LOGIN);
    } else {
      navigate(page, options);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Gói Khám Sức Khoẻ Toàn Diện
          </h1>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto mb-6">
            Chủ động bảo vệ sức khoẻ với các gói khám được thiết kế bởi chuyên gia. 
            Phù hợp với mọi độ tuổi và nhu cầu.
          </p>
          
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm gói khám (VD: Tầm soát ung thư, tổng quát...)"
              className="block w-full pl-11 pr-4 py-3 rounded-full text-gray-900 shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="relative z-50" ref={filterRef}>
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex items-center justify-between border border-gray-100 relative">
            <div className="text-gray-600 font-medium">
              Tìm thấy <span className="text-blue-600 font-bold">{filteredPackages.length}</span> gói khám
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 font-medium transition-colors p-2 rounded-lg ${showFilters ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}
            >
              <Filter className="w-5 h-5" /> Lọc
            </button>
          </div>

          {showFilters && (
            <div className="absolute right-0 top-full mt-2 w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 animate-fade-in space-y-6 p-6 md:p-8 z-50">
            
            {/* Highlight & Sort options */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-500"/> Lọc nâng cao</h3>
                <div className="flex flex-wrap gap-3">
                   <button
                    onClick={() => setIsPopularOnly(!isPopularOnly)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors flex items-center gap-2 ${
                      isPopularOnly
                        ? 'bg-orange-100 text-orange-700 border-orange-300 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    🔥 Phổ biến (Nhiều lượt đặt)
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><DollarSign className="w-5 h-5 text-blue-500"/> Sắp xếp theo giá</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: "default", label: "Mặc định" },
                    { id: "price_asc", label: "Thấp đến cao" },
                    { id: "price_desc", label: "Cao xuống thấp" },
                  ].map(opt => (
                     <button
                      key={opt.id}
                      onClick={() => setSortBy(opt.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                        sortBy === opt.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Filter */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><DollarSign className="w-5 h-5 text-blue-500"/> Mức giá: {minPrice.toLocaleString()}đ - {maxPrice.toLocaleString()}đ</h3>
              <div className="relative px-2 h-10 w-full max-w-2xl">
                {/* Track background */}
                <div className="absolute w-[calc(100%-1rem)] h-2 bg-gray-200 rounded-full top-3"></div>
                {/* Active track */}
                <div 
                  className="absolute h-2 bg-blue-600 rounded-full top-3 pointer-events-none" 
                  style={{ 
                    left: `calc(0.5rem + ${(minPrice / 20000000) * (100 - 4)}%)`, 
                    right: `calc(0.5rem + ${100 - (maxPrice / 20000000) * 100}%)` 
                  }}
                ></div>
                
                {/* Min Slider */}
                <input 
                  type="range" min="0" max="20000000" step="500000"
                  value={minPrice}
                  onChange={(e) => {
                    const value = Math.min(Number(e.target.value), maxPrice - 500000);
                    setMinPrice(value);
                  }}
                  className="absolute w-full top-3 h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full shadow-sm"
                  style={{ zIndex: minPrice > 10000000 ? 5 : 3 }}
                />
                
                {/* Max Slider */}
                <input 
                  type="range" min="0" max="20000000" step="500000"
                  value={maxPrice}
                  onChange={(e) => {
                    const value = Math.max(Number(e.target.value), minPrice + 500000);
                    setMaxPrice(value);
                  }}
                  className="absolute w-full top-3 h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full shadow-sm"
                  style={{ zIndex: 4 }}
                />
                
                <div className="flex justify-between text-xs font-medium text-gray-500 mt-8 absolute w-full left-0 px-2">
                  <span>0đ</span>
                  <span>20.000.000đ+</span>
                </div>
              </div>
            </div>

            {/* Hospital Filter */}
            {uniqueHospitals.length > 0 && (
              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-bold text-gray-900 mb-3">Lọc theo Cơ sở y tế</h3>
                <div className="flex flex-wrap gap-3">
                  {uniqueHospitals.map(hospital => (
                    <button
                      key={hospital.id}
                      onClick={() => {
                        setSelectedHospitals(prev => 
                          prev.includes(hospital.id) 
                            ? prev.filter(id => id !== hospital.id)
                            : [...prev, hospital.id]
                        )
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                        selectedHospitals.includes(hospital.id)
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {hospital.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(selectedHospitals.length > 0 || sortBy !== "default" || maxPrice < 20000000 || minPrice > 0 || isPopularOnly) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => {
                    setSelectedHospitals([]);
                    setSortBy("default");
                    setMaxPrice(20000000);
                    setMinPrice(0);
                    setIsPopularOnly(false);
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  Bỏ lọc tất cả
                </button>
              </div>
            )}
          </div>
        )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg) => (
              <Card key={pkg.id} hover className="flex flex-col h-full overflow-hidden border-2 border-transparent hover:border-blue-100 transition-colors bg-white">
                {pkg.image_url && (
                  <div className="relative h-48 bg-gray-100 overflow-hidden shrink-0 border-b border-gray-100">
                    <img 
                      src={pkg.image_url} 
                      alt={pkg.name} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-6">
                    {!pkg.image_url ? (
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                        <Shield className="w-8 h-8" />
                      </div>
                    ) : (
                      <div></div>
                    )}
                    <div className="flex flex-col items-end gap-2">
                      {pkg.code && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-bold border border-gray-200 shadow-sm">
                          Mã: {pkg.code}
                        </span>
                      )}
                      {pkg.booking_count > 0 && (
                        <div className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1 border border-orange-100">
                          🔥 {pkg.booking_count} lượt đặt
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                    {pkg.name}
                  </h3>
                  
                  <div 
                    className="text-gray-600 mb-6 flex-grow line-clamp-3 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: pkg.description || "Gói khám sức khỏe toàn diện với nhiều hạng mục thiết yếu được các chuyên gia khuyên dùng định kỳ hàng năm."
                    }}
                  />
                  
                  <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between text-gray-700">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <span>Thời gian khám dự kiến</span>
                      </div>
                      <span className="font-semibold">{pkg.duration_minutes || 30} phút</span>
                    </div>
                    {pkg.hospitals && pkg.hospitals.length > 0 && (
                      <div className="flex items-center justify-between text-gray-700 pt-3 border-t border-gray-200">
                        <span className="font-medium">Cơ sở y tế</span>
                        <span className="font-semibold text-right max-w-[60%] truncate" title={pkg.hospitals.map(h => h.name).join(', ')}>
                          {pkg.hospitals.map(h => h.name).join(', ')}
                        </span>
                      </div>
                    )}
                    {pkg.fixed_price && (
                      <div className="flex items-center justify-between text-gray-700 pt-3 border-t border-gray-200">
                        <span className="font-medium">Chi phí</span>
                        <span className="text-xl font-bold text-blue-700">
                          {Number(pkg.fixed_price).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    className="mt-auto shadow-md hover:shadow-lg font-semibold text-lg flex justify-center items-center gap-2"
                    onClick={() => requireAuthAndNavigate(PAGES.BOOK_PACKAGE.replace(":id", pkg.id))}
                  >
                    Đăng ký ngay <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredPackages.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy gói khám</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Không có gói khám nào phù hợp với từ khóa tìm kiếm của bạn. 
              Vui lòng thử lại với từ khóa khác.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicePackagesPage;
