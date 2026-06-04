import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, MapPin, Star, Award, ArrowLeft, Filter, TrendingUp, DollarSign, CheckCircle, Shield } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { PAGES } from "../utils/constants";
import { getDoctors as getDoctorsApi } from "../services/admin.doctors.api";
import { getHospitals } from "../services/admin.hospitals.api";
import { getCategories } from "../services/admin.categories.api";
import { formatCurrency, normalizeForSearch } from "../utils/helpers";

const DoctorListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [hospitalsList, setHospitalsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState(location.state?.specialty || "");
  const [selectedHospital, setSelectedHospital] = useState("");
  const [sortBy, setSortBy] = useState("reviews"); // 'reviews', 'rating', 'price_asc', 'price_desc'
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000000); // Default 20M
  const [isPopularOnly, setIsPopularOnly] = useState(false);
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
    const fetchData = async () => {
      try {
        setLoading(true);
        const [docsData, hospsData, catsData] = await Promise.all([
          getDoctorsApi(),
          getHospitals(),
          getCategories(),
        ]);
        
        const list = Array.isArray(docsData) ? docsData : (docsData?.data || []);
        const normalized = list.map((d) => ({
          ...d,
          name: d.name || d.user?.full_name || "Bác sĩ",
          avatar_url: d.avatar_url || d.user?.avatar_url || null,
          specialty: d.category?.name || "Đa khoa",
          consultationFee: d.consultation_fee || d.consultationFee || d.price || 500000,
        }));
        
        setDoctors(normalized);
        setHospitalsList(Array.isArray(hospsData) ? hospsData : (hospsData?.data || []));
        setCategoriesList(Array.isArray(catsData) ? catsData : (catsData?.data || []));
      } catch (error) {
        console.error("Error loading doctor list:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.specialty) {
      setSelectedSpecialty(location.state.specialty);
    }
  }, [location.state?.specialty]);

  const filteredAndSortedDoctors = useMemo(() => {
    let result = doctors.map((doctor) => ({
      ...doctor,
      averageRating: Number(doctor.rating || 5).toFixed(1),
      totalReviews: doctor.review_count || 0,
    }));

    // Search filter
    if (searchQuery) {
      const q = normalizeForSearch(searchQuery);
      result = result.filter(d => 
        normalizeForSearch(d.name || "").includes(q) || 
        normalizeForSearch(d.specialty || "").includes(q)
      );
    }

    // Specialty filter
    if (selectedSpecialty) {
      result = result.filter(d => d.specialty === selectedSpecialty || (d.category && d.category.name === selectedSpecialty));
    }

    // Hospital filter
    if (selectedHospital) {
      result = result.filter(d => {
        if (!d.hospitals || d.hospitals.length === 0) return false;
        return d.hospitals.some(h => String(h.id) === String(selectedHospital));
      });
    }

    // Filter by price
    result = result.filter(d => 
      Number(d.consultationFee || 0) >= minPrice && Number(d.consultationFee || 0) <= maxPrice
    );

    // Filter by popular
    if (isPopularOnly) {
      // Giả sử phổ biến là totalReviews > 0 hoặc averageRating >= 4.0
      result = result.filter(d => d.totalReviews > 0 || d.averageRating >= 4.0);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "reviews") return b.totalReviews - a.totalReviews;
      if (sortBy === "rating") return b.averageRating - a.averageRating;
      if (sortBy === "price_asc") return a.consultationFee - b.consultationFee;
      if (sortBy === "price_desc") return b.consultationFee - a.consultationFee;
      return 0;
    });

    return result;
  }, [doctors, searchQuery, selectedSpecialty, selectedHospital, minPrice, maxPrice, isPopularOnly, sortBy]);



  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Đội ngũ Bác sĩ Chuyên môn cao
          </h1>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto mb-6">
            Tìm kiếm và đặt lịch khám với các chuyên gia, bác sĩ uy tín hàng đầu.
            Cam kết mang lại trải nghiệm y tế tận tâm và chuyên nghiệp.
          </p>
          
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm bác sĩ, chuyên khoa..."
              className="block w-full pl-11 pr-4 py-3 rounded-full text-gray-900 shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none transition-shadow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="relative z-50" ref={filterRef}>
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex items-center justify-between border border-gray-100 relative">
            <div className="text-gray-600 font-medium">
              Tìm thấy <span className="text-blue-600 font-bold">{filteredAndSortedDoctors.length}</span> bác sĩ
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
                      🔥 Bác sĩ nổi bật (Đánh giá cao)
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><DollarSign className="w-5 h-5 text-blue-500"/> Sắp xếp theo</h3>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { id: "reviews", label: "Nhiều đánh giá nhất" },
                      { id: "rating", label: "Đánh giá cao nhất" },
                      { id: "price_asc", label: "Giá thấp đến cao" },
                      { id: "price_desc", label: "Giá cao xuống thấp" },
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
                    type="range" min="0" max="20000000" step="100000"
                    value={minPrice}
                    onChange={(e) => {
                      const value = Math.min(Number(e.target.value), maxPrice - 100000);
                      setMinPrice(value);
                    }}
                    className="absolute w-full top-3 h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full shadow-sm"
                    style={{ zIndex: minPrice > 10000000 ? 5 : 3 }}
                  />
                  
                  {/* Max Slider */}
                  <input 
                    type="range" min="0" max="20000000" step="100000"
                    value={maxPrice}
                    onChange={(e) => {
                      const value = Math.max(Number(e.target.value), minPrice + 100000);
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

              {/* Categories and Hospitals Filter */}
              <div className="border-t border-gray-100 pt-6 grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-bold text-gray-900 mb-3 flex items-center gap-2"><Award className="w-5 h-5 text-blue-500"/> Chuyên khoa</label>
                  <select 
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="">Tất cả chuyên khoa</option>
                    {categoriesList.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-900 mb-3 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-500"/> Cơ sở y tế</label>
                  <select 
                    value={selectedHospital}
                    onChange={(e) => setSelectedHospital(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="">Tất cả cơ sở y tế</option>
                    {hospitalsList.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(selectedHospital || selectedSpecialty || sortBy !== "reviews" || maxPrice < 20000000 || minPrice > 0 || isPopularOnly) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => {
                      setSelectedHospital("");
                      setSelectedSpecialty("");
                      setSortBy("reviews");
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
        ) : filteredAndSortedDoctors.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm mt-8">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bác sĩ</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Không có bác sĩ nào phù hợp với tiêu chí của bạn. 
              Vui lòng thử lại với các bộ lọc khác.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            {filteredAndSortedDoctors.map((doctor) => (
              <Card key={doctor.id} hover className="flex flex-col h-full overflow-hidden border-2 border-transparent hover:border-blue-100 transition-colors bg-white">
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex flex-col sm:flex-row gap-6 mb-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                      <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center text-5xl shadow-sm overflow-hidden border-2 border-blue-50">
                        {doctor.avatar_url ? (
                          <img src={doctor.avatar_url} alt={doctor.name} className="w-full h-full object-cover" />
                        ) : (
                          doctor.avatar || "👨‍⚕️"
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 truncate leading-tight" title={doctor.name}>{doctor.name}</h3>
                          <div className="inline-flex items-center gap-1 mt-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold border border-blue-100">
                            <Shield className="w-4 h-4" /> {doctor.specialty}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap justify-center sm:justify-start items-center gap-3">
                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md text-sm font-bold border border-yellow-100">
                          <Star className="w-4 h-4 fill-current text-yellow-500" />
                          {doctor.averageRating}
                        </div>
                        <span className="text-sm text-gray-500 font-medium">{doctor.totalReviews} đánh giá</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6 flex-grow line-clamp-3 leading-relaxed">
                    {doctor.description || "Bác sĩ chuyên khoa giàu kinh nghiệm, tận tâm với nghề và luôn đặt sức khỏe bệnh nhân lên hàng đầu."}
                  </p>

                  <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-xl mt-auto">
                    {Array.isArray(doctor.hospitals) && doctor.hospitals.length > 0 && (
                      <div className="flex items-center justify-between text-gray-700 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">Nơi công tác</span>
                        </div>
                        <span className="font-semibold text-right max-w-[50%] truncate" title={`${doctor.hospitals[0].name} ${doctor.hospitals[0].city ? `- ${typeof doctor.hospitals[0].city === 'string' ? doctor.hospitals[0].city : doctor.hospitals[0].city?.name}` : ''}`}>
                          {doctor.hospitals[0].name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-gray-700 pt-1">
                      <span className="font-medium">Tổng phí (Bác sĩ + CSYT)</span>
                      <span className="text-xl font-bold text-blue-700">
                        {formatCurrency(Number(doctor.consultationFee || 0) + Number(doctor.hospitals?.[0]?.facility_fee || 0))}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    className="mt-auto shadow-md hover:shadow-lg font-semibold text-lg flex justify-center items-center gap-2"
                    onClick={() => navigate(PAGES.BOOK_DOCTOR, { state: { doctorId: doctor.id } })}
                  >
                    Đặt lịch ngay
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorListPage;
