import React, { useState, useEffect } from "react";
import { Search, Filter, Shield, Clock, Plus, ArrowRight } from "lucide-react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { PAGES } from "../utils/constants";
import { getAllServicePackages } from "../services/service-packages.api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ServicePackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!searchTerm) {
      setFilteredPackages(packages);
    } else {
      const lower = searchTerm.toLowerCase();
      const filtered = packages.filter((pkg) => 
        pkg.name?.toLowerCase().includes(lower) || 
        pkg.description?.toLowerCase().includes(lower) ||
        pkg.categories?.some(c => c.name.toLowerCase().includes(lower))
      );
      setFilteredPackages(filtered);
    }
  }, [searchTerm, packages]);

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
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Gói Khám Sức Khoẻ Toàn Diện
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Chủ động bảo vệ sức khoẻ với các gói khám được thiết kế bởi chuyên gia. 
            Phù hợp với mọi độ tuổi và nhu cầu.
          </p>
          
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm gói khám (VD: Tầm soát ung thư, tổng quát...)"
              className="block w-full pl-12 pr-4 py-4 rounded-full text-gray-900 text-lg shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-8 flex items-center justify-between border border-gray-100">
          <div className="text-gray-600 font-medium">
            Tìm thấy <span className="text-blue-600 font-bold">{filteredPackages.length}</span> gói khám
          </div>
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors p-2 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5" /> Lọc
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg) => (
              <Card key={pkg.id} hover className="flex flex-col h-full overflow-hidden border-2 border-transparent hover:border-blue-100 transition-colors bg-white">
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <Shield className="w-8 h-8" />
                    </div>
                    {pkg.booking_count > 0 && (
                      <div className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1 border border-orange-100">
                        🔥 {pkg.booking_count} lượt đặt
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                    {pkg.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 flex-grow line-clamp-3 leading-relaxed">
                    {pkg.description || "Gói khám sức khỏe toàn diện với nhiều hạng mục thiết yếu được các chuyên gia khuyên dùng định kỳ hàng năm."}
                  </p>
                  
                  <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between text-gray-700">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <span>Thời gian khám dự kiến</span>
                      </div>
                      <span className="font-semibold">{pkg.duration_minutes || 30} phút</span>
                    </div>
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
                    onClick={() => requireAuthAndNavigate(PAGES.BOOKING, { state: { packageId: pkg.id } })}
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
