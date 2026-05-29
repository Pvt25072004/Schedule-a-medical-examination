import React, { useState, useEffect, useMemo } from "react";
import { Search, MapPin, Star, Award, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { PAGES } from "../utils/constants";
import { getDoctors as getDoctorsApi } from "../services/admin.doctors.api";
import { getAllReviews } from "../services/reviews.api";
import { getHospitals } from "../services/admin.hospitals.api";
import { getCategories } from "../services/admin.categories.api";
import { formatCurrency, normalizeForSearch } from "../utils/helpers";

const DoctorListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [hospitalsList, setHospitalsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState(location.state?.specialty || "");
  const [selectedHospital, setSelectedHospital] = useState("");
  const [sortBy, setSortBy] = useState("reviews"); // 'reviews', 'rating', 'price_asc', 'price_desc'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [docsData, revsData, hospsData, catsData] = await Promise.all([
          getDoctorsApi(),
          getAllReviews(),
          getHospitals(),
          getCategories(),
        ]);
        
        const list = Array.isArray(docsData) ? docsData : [];
        const normalized = list.map((d) => ({
          ...d,
          specialty: d.specialty || d.category?.name || "Đa khoa",
          consultationFee: d.consultationFee || d.price || 500000,
        }));
        
        setDoctors(normalized);
        setReviews(Array.isArray(revsData) ? revsData : []);
        setHospitalsList(Array.isArray(hospsData) ? hospsData : []);
        setCategoriesList(Array.isArray(catsData) ? catsData : []);
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

  const doctorRatingsMap = useMemo(() => {
    const map = new Map();
    reviews.forEach((review) => {
      const doctorId = review.doctor_id || review.doctor?.id;
      const rating = review.rating;
      if (doctorId && rating != null) {
        if (!map.has(doctorId)) {
          map.set(doctorId, { total: 0, count: 0 });
        }
        const data = map.get(doctorId);
        data.total += Number(rating);
        data.count += 1;
      }
    });
    
    const result = new Map();
    map.forEach((data, doctorId) => {
      result.set(doctorId, {
        rating: (data.total / data.count).toFixed(1),
        count: data.count
      });
    });
    return result;
  }, [reviews]);

  const doctorsWithRatings = useMemo(() => {
    return doctors.map((doctor) => {
      const ratingInfo = doctorRatingsMap.get(doctor.id) || { rating: "0.0", count: 0 };
      return {
        ...doctor,
        averageRating: parseFloat(ratingInfo.rating),
        totalReviews: ratingInfo.count,
      };
    });
  }, [doctors, doctorRatingsMap]);

  const filteredAndSortedDoctors = useMemo(() => {
    let result = [...doctorsWithRatings];

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

    // Sort
    result.sort((a, b) => {
      if (sortBy === "reviews") return b.totalReviews - a.totalReviews;
      if (sortBy === "rating") return b.averageRating - a.averageRating;
      if (sortBy === "price_asc") return a.consultationFee - b.consultationFee;
      if (sortBy === "price_desc") return b.consultationFee - a.consultationFee;
      return 0;
    });

    return result;
  }, [doctorsWithRatings, searchQuery, selectedSpecialty, selectedHospital, sortBy]);



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header is managed globally in AppRoutes */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Danh sách bác sĩ</h2>
          <p className="text-gray-600">Tìm kiếm và đặt lịch với các bác sĩ uy tín</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <Card className="sticky top-24">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Bộ lọc</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên khoa</label>
                  <select 
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tất cả chuyên khoa</option>
                    {categoriesList.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bệnh viện / Phòng khám</label>
                  <select 
                    value={selectedHospital}
                    onChange={(e) => setSelectedHospital(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tất cả cơ sở y tế</option>
                    {hospitalsList.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp theo</label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="reviews">Nhiều đánh giá nhất</option>
                    <option value="rating">Đánh giá cao nhất</option>
                    <option value="price_asc">Giá khám từ thấp - cao</option>
                    <option value="price_desc">Giá khám từ cao - thấp</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Search Bar */}
            <div className="mb-6 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm bác sĩ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="mb-4 text-gray-600">
              Tìm thấy <span className="font-bold text-gray-900">{filteredAndSortedDoctors.length}</span> bác sĩ
            </div>

            {/* Doctor List */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Đang tải danh sách bác sĩ...</div>
            ) : filteredAndSortedDoctors.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                <p className="text-gray-500 text-lg">Không tìm thấy bác sĩ phù hợp với tiêu chí của bạn.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedDoctors.map((doctor) => (
                  <Card key={doctor.id} className="hover:shadow-md transition-shadow duration-300">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-4xl shadow-inner overflow-hidden border-4 border-white">
                          {doctor.avatar_url ? (
                            <img src={doctor.avatar_url} alt={doctor.name} className="w-full h-full object-cover" />
                          ) : (
                            doctor.avatar || "👨‍⚕️"
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{doctor.name}</h3>
                            <div className="inline-block mt-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                              {doctor.specialty}
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:items-end">
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star className="w-5 h-5 fill-current" />
                              <span className="font-bold">{doctor.averageRating}</span>
                            </div>
                            <span className="text-sm text-gray-500">{doctor.totalReviews} đánh giá</span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                          {doctor.description || "Bác sĩ chuyên khoa giàu kinh nghiệm, tận tâm với nghề và luôn đặt sức khỏe bệnh nhân lên hàng đầu."}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-auto">
                          <div className="space-y-2">
                            {Array.isArray(doctor.hospitals) && doctor.hospitals.length > 0 && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{doctor.hospitals[0].name} {doctor.hospitals[0].city ? `- ${doctor.hospitals[0].city}` : ''}</span>
                              </div>
                            )}
                            <div className="text-sm">
                              <span className="text-gray-500">Phí khám</span>
                              <p className="text-lg font-bold text-blue-600">{formatCurrency(doctor.consultationFee)}</p>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => navigate(PAGES.BOOK_DOCTOR, { state: { doctorId: doctor.id } })}
                            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-black transition-colors w-full sm:w-auto text-center"
                          >
                            Đặt lịch ngay
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorListPage;
