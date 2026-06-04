import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  ChevronDown,
  MapPin,
  ArrowLeft
} from "lucide-react";
import { getMyMedicalRecords } from "../services/medical-records.api";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { formatDate } from "../utils/helpers";
import { PAGES } from "../utils/constants";

const MedicalRecordsPage = ({ navigate: injectedNavigate }) => {
  const routerNavigate = useNavigate();
  const navigate = injectedNavigate || routerNavigate;
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const data = await getMyMedicalRecords();
        if (data && Array.isArray(data)) {
          setRecords(data);
        } else if (data && data.data && Array.isArray(data.data)) {
          setRecords(data.data);
        } else {
          setRecords([]);
        }
      } catch (err) {
        console.error("Error fetching medical records:", err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const filteredRecords = records.filter((record) => {
    const searchLower = searchQuery.toLowerCase();
    const doctorName = record.appointment?.doctor?.user?.full_name?.toLowerCase() || "";
    const hospitalName = record.appointment?.hospital?.name?.toLowerCase() || "";
    const diagnosis = record.diagnosis?.toLowerCase() || "";
    
    return (
      doctorName.includes(searchLower) ||
      hospitalName.includes(searchLower) ||
      diagnosis.includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-[#f8fbff] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(PAGES.HOME)}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Về trang chủ
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-[#143250] flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                  <FileText className="w-6 h-6" />
                </div>
                Hồ sơ bệnh án
              </h1>
              <p className="text-gray-500 mt-2">
                Quản lý và theo dõi lịch sử khám bệnh của bạn
              </p>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm bác sĩ, bệnh viện, chẩn đoán..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none shadow-sm"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Records List */}
          <div className="lg:col-span-1 space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Đang tải hồ sơ...</p>
              </div>
            ) : filteredRecords.length > 0 ? (
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedRecord?.id === record.id
                        ? "border-blue-500 bg-blue-50/50 shadow-md"
                        : "border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        <Calendar className="w-4 h-4" />
                        {record.appointment?.appointment_date ? formatDate(record.appointment.appointment_date) : "N/A"}
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-[#143250] mb-2 line-clamp-2">
                      {record.diagnosis || "Chưa có chẩn đoán"}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{record.appointment?.doctor?.user?.full_name || "Bác sĩ ẩn danh"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{record.appointment?.hospital?.name || "Cơ sở y tế ẩn"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Không tìm thấy hồ sơ</h3>
                <p className="text-gray-500">Bạn chưa có hồ sơ bệnh án nào phù hợp với tìm kiếm.</p>
              </div>
            )}
          </div>

          {/* Record Details */}
          <div className="lg:col-span-2">
            {selectedRecord ? (
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden sticky top-24">
                <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-[#143250]">Chi tiết bệnh án</h2>
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      Ngày khám: {selectedRecord.appointment?.appointment_date ? formatDate(selectedRecord.appointment.appointment_date) : "N/A"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-0.5 font-medium">Bác sĩ phụ trách</p>
                        <p className="font-bold text-[#143250]">{selectedRecord.appointment?.doctor?.user?.full_name || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100">
                      <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-0.5 font-medium">Cơ sở y tế</p>
                        <p className="font-bold text-[#143250]">{selectedRecord.appointment?.hospital?.name || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Chẩn đoán
                    </h3>
                    <div className="bg-gray-50 rounded-2xl p-5 text-gray-800 text-lg leading-relaxed whitespace-pre-wrap border border-gray-100">
                      {selectedRecord.diagnosis || "Không có chẩn đoán"}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Đơn thuốc
                    </h3>
                    <div className="bg-blue-50/50 rounded-2xl p-5 text-gray-800 leading-relaxed whitespace-pre-wrap border border-blue-100">
                      {selectedRecord.prescription || "Không có đơn thuốc"}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      Ghi chú thêm từ bác sĩ
                    </h3>
                    <div className="bg-orange-50/50 rounded-2xl p-5 text-gray-800 leading-relaxed whitespace-pre-wrap border border-orange-100">
                      {selectedRecord.notes || "Không có ghi chú"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <FileText className="w-12 h-12 text-blue-300" />
                </div>
                <h2 className="text-2xl font-bold text-[#143250] mb-3">Chưa chọn bệnh án</h2>
                <p className="text-gray-500 max-w-sm">
                  Vui lòng chọn một hồ sơ bệnh án từ danh sách bên trái để xem chi tiết chẩn đoán và đơn thuốc.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordsPage;
