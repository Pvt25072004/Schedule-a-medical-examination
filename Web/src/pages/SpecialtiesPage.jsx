import React, { useState, useEffect } from "react";
import { Search, ChevronRight } from "lucide-react";
import Footer from "../components/common/Footer";
import { getCategories } from "../services/admin.categories.api";
import { PAGES } from "../utils/constants";
import { normalizeForSearch } from "../utils/helpers";

const getCategoryIcon = (name) => {
  const normalized = name.toLowerCase();
  if (normalized.includes("tim")) return "❤️";
  if (normalized.includes("nhi")) return "👶";
  if (normalized.includes("răng") || normalized.includes("nha")) return "🦷";
  if (normalized.includes("mắt")) return "👁️";
  if (normalized.includes("da")) return "💆";
  if (normalized.includes("tai") || normalized.includes("mũi") || normalized.includes("họng")) return "👂";
  if (normalized.includes("sản") || normalized.includes("phụ khoa")) return "👩‍⚕️";
  if (normalized.includes("thần kinh")) return "🧠";
  if (normalized.includes("xương") || normalized.includes("khớp")) return "🦴";
  return "🩺";
};

const SpecialtiesPage = ({ navigate }) => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(Array.isArray(res) ? res : (res?.data || []));
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(c => 
    normalizeForSearch(c.name).includes(normalizeForSearch(searchQuery)) || 
    (c.description && normalizeForSearch(c.description).includes(normalizeForSearch(searchQuery)))
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-gradient-to-r from-[#143250] to-[#1a446d] text-white pt-20 pb-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Chuyên khoa khám bệnh
          </h1>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Hàng chục chuyên khoa với đội ngũ bác sĩ hàng đầu luôn sẵn sàng chăm sóc sức khỏe cho bạn và gia đình.
          </p>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Tìm kiếm chuyên khoa..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 shadow-xl focus:outline-none focus:ring-4 focus:ring-[#48a1f3] transition-all text-lg"
            />
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-20">
        {loading ? (
          <div className="flex justify-center items-center py-20 bg-white rounded-3xl shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#48a1f3]"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy chuyên khoa</h3>
            <p className="text-gray-500">Vui lòng thử lại với từ khóa khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div 
                key={category.id}
                onClick={() => navigate(PAGES.DOCTORS, { state: { specialty: category.name } })}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex items-start gap-5"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform shadow-inner overflow-hidden">
                  {category.image_url ? (
                    <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                  ) : (
                    getCategoryIcon(category.name)
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-lg font-bold text-[#143250] mb-2 group-hover:text-[#48a1f3] transition-colors truncate">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {category.description || `Khám và điều trị các bệnh lý thuộc chuyên khoa ${category.name}`}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-[#48a1f3] opacity-0 group-hover:opacity-100 transition-opacity">
                    Xem bác sĩ <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SpecialtiesPage;
