import React, { useState } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle, Search, Star, Award, ArrowLeft, ArrowRight, MapPin, Home, Mail, Phone, Heart } from 'lucide-react';
import { useAppointments } from '../contexts/AppointmentContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { PAGES, DOCTORS, TIME_SLOTS, AREAS, HOSPITALS, SPECIALTIES } from '../utils/constants';
import { formatDate, formatCurrency } from '../utils/helpers';

// Dữ liệu giả lập người dùng đã xác thực (Autofill)
const MOCK_USER_DATA = {
    fullName: 'Lê Văn Khách',
    email: 'le.v.khach@gmail.com',
    phone: '0987654321',
};

const BookingPage = ({ navigate }) => {
    const { addAppointment, isSlotAvailable } = useAppointments();
    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
   
    // Mở rộng formData để chứa tất cả 8 bước
    const [formData, setFormData] = useState({
        // B1-B3: Lọc Địa lý
        areaId: '',
        hospitalId: '',
        specialtyId: '',
       
        // B4-B5: Lọc Giờ & Bác sĩ
        date: '',
        time: '',
        doctorId: '',
       
        // B6: Thông tin BN (Autofill)
        fullName: MOCK_USER_DATA.fullName,
        email: MOCK_USER_DATA.email,
        phone: MOCK_USER_DATA.phone,
        type: '', // Lý do khám (mục type cũ)
        notes: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false); // Step 8: Hoàn tất
    const selectedDoctor = DOCTORS.find(d => d.id === formData.doctorId);
    const filteredHospitals = HOSPITALS.filter(h => h.areaId === formData.areaId);
    const filteredSpecialties = SPECIALTIES.filter(s => s.hospitalId === formData.hospitalId);
   
    // Giả lập danh sách bác sĩ rảnh sau khi chọn giờ (từ Step 4) - lọc theo specialty
    const availableDoctors = DOCTORS.filter(d => d.specialtyId === formData.specialtyId);

    // Filtered doctors cho search ở Step 5
    const filteredDoctors = availableDoctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
        // Logic reset dữ liệu phụ thuộc
        if (field === 'areaId') {
            setFormData(prev => ({ ...prev, hospitalId: '', specialtyId: '', doctorId: '' }));
        } else if (field === 'hospitalId') {
            setFormData(prev => ({ ...prev, specialtyId: '', doctorId: '' }));
        } else if (field === 'specialtyId') {
             // Sau khi chọn chuyên khoa, reset giờ và bác sĩ nếu cần
            setFormData(prev => ({ ...prev, date: '', time: '', doctorId: '' }));
        }
    };

    // Bảng định nghĩa 8 bước (cho UI)
    const steps = [
        { number: 1, title: 'Khu vực', icon: MapPin },
        { number: 2, title: 'Bệnh viện', icon: Home },
        { number: 3, title: 'Chuyên khoa', icon: Heart },
        { number: 4, title: 'Chọn giờ', icon: Clock },
        { number: 5, title: 'Chọn bác sĩ', icon: User },
        { number: 6, title: 'Thông tin BN', icon: FileText },
        { number: 7, title: 'Thanh toán', icon: CheckCircle },
        { number: 8, title: 'Hoàn tất', icon: CheckCircle },
    ];

    const validateAndNext = () => {
        const newErrors = {};
        switch (step) {
            case 1: if (!formData.areaId) newErrors.areaId = 'Vui lòng chọn Tỉnh thành.'; break;
            case 2: if (!formData.hospitalId) newErrors.hospitalId = 'Vui lòng chọn Bệnh viện.'; break;
            case 3: if (!formData.specialtyId) newErrors.specialtyId = 'Vui lòng chọn Chuyên khoa.'; break;
            case 4: if (!formData.date || !formData.time) newErrors.time = 'Vui lòng chọn Ngày và Giờ.'; break;
            case 5: if (!formData.doctorId) newErrors.doctorId = 'Vui lòng chọn Bác sĩ.'; break;
            case 6: if (!formData.type || !formData.fullName) newErrors.type = 'Vui lòng điền Lý do khám.'; break;
            case 7: // Bước thanh toán - gọi submit
                handleSubmit();
                return;
            default: break;
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
       
        // Chuyển sang bước kế tiếp
        setStep(step + 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        // BƯỚC 7: XỬ LÝ THANH TOÁN (Mô phỏng gọi API POST /appointments/initiate)
        setIsLoading(true);
        setTimeout(() => {
            // Sau khi backend trả về paymentUrl, ta mô phỏng thanh toán thành công
            // Thông báo cho Backend (nếu cần) và chuyển sang hoàn tất.
           
            // Logik addAppointment cũ
            const doctor = DOCTORS.find(d => d.id === formData.doctorId);
            addAppointment({ ...formData, doctorName: doctor.name, specialty: doctor.specialty });
            setIsLoading(false);
            setStep(8); // Chuyển sang BƯỚC 8: Hoàn tất
        }, 1500);
    };
   
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Nếu đã hoàn tất (Step 8), hiển thị Success Modal
    if (step === 8) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center animate-scale-in">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Đặt lịch thành công!</h2>
                    <p className="text-gray-600 mb-6">
                        Lịch hẹn của bạn đã được xác nhận và thanh toán (Mô phỏng).
                    </p>
                   
                    <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">{selectedDoctor?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span>{formatDate(formData.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span>{formData.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                <span>{HOSPITALS.find(h => h.id === formData.hospitalId)?.name || 'Bệnh viện'}</span>
                            </div>
                        </div>
                    </div>
       
                    <Button variant="primary" size="lg" fullWidth onClick={() => navigate(PAGES.APPOINTMENTS)}>
                        Xem lịch hẹn
                    </Button>
                </Card>
            </div>
        );
    }
   
    // Giao diện chính (Steps 1-7)
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <button
                            onClick={() => step > 1 ? setStep(step - 1) : navigate(PAGES.HOME)}
                            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>{step > 1 ? 'Quay lại' : 'Trang chủ'}</span>
                        </button>
                        
                        <h1 className="text-xl font-bold text-gray-900">Đặt lịch khám</h1>
                        <div className="w-20"></div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Steps */}
                <Card className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((s, index) => (
                            <React.Fragment key={s.number}>
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                                            step >= s.number
                                                ? 'bg-blue-600 text-white scale-110 shadow-lg'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}
                                    >
                                        {step > s.number ? (
                                            <CheckCircle className="w-6 h-6" />
                                        ) : (
                                            <s.icon className="w-6 h-6" />
                                        )}
                                    </div>
                                    <p className={`text-sm mt-2 font-medium hidden sm:block ${step >= s.number ? 'text-blue-600' : 'text-gray-500'}`}>
                                        {s.title}
                                    </p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-1 mx-2 transition-all ${
                                        step > s.number ? 'bg-blue-600' : 'bg-gray-200'
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </Card>

                {/* --- START: 8 BƯỚC UI RIÊNG BIỆT --- */}
                {/* Step 1: Chọn Khu vực (API: GET /areas) */}
                {step === 1 && (
                    <div className="space-y-6">
                        <Card>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Chọn Khu vực</h2>
                            <select 
                                value={formData.areaId} 
                                onChange={(e) => handleChange('areaId', e.target.value)} 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Chọn Tỉnh thành --</option>
                                {AREAS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                            {errors.areaId && <p className="text-red-600 mt-2">{errors.areaId}</p>}
                        </Card>

                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={validateAndNext}
                            disabled={!formData.areaId}
                            icon={ArrowRight}
                            iconPosition="right"
                        >
                            Tiếp tục
                        </Button>
                    </div>
                )}

                {/* Step 2: Chọn Bệnh viện (API: GET /hospitals?areaId=X) */}
                {step === 2 && (
                    <div className="space-y-6">
                        <Card>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Chọn Bệnh viện</h2>
                            <select 
                                value={formData.hospitalId} 
                                onChange={(e) => handleChange('hospitalId', e.target.value)} 
                                disabled={!formData.areaId} 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                <option value="">-- Chọn Bệnh viện --</option>
                                {filteredHospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                            </select>
                            {errors.hospitalId && <p className="text-red-600 mt-2">{errors.hospitalId}</p>}
                        </Card>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setStep(1)}
                                icon={ArrowLeft}
                                className="flex-1"
                            >
                                Quay lại
                            </Button>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={validateAndNext}
                                disabled={!formData.hospitalId}
                                icon={ArrowRight}
                                iconPosition="right"
                                className="flex-1"
                            >
                                Tiếp tục
                            </Button>
                        </div>
                    </div>
                )}
               
                {/* Step 3: Chọn Chuyên khoa (API: GET /specialties?hospitalId=Y) */}
                {step === 3 && (
                    <div className="space-y-6">
                        <Card>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Chọn Chuyên khoa</h2>
                            <select 
                                value={formData.specialtyId} 
                                onChange={(e) => handleChange('specialtyId', e.target.value)} 
                                disabled={!formData.hospitalId} 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                <option value="">-- Chọn Chuyên khoa --</option>
                                {filteredSpecialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            {errors.specialtyId && <p className="text-red-600 mt-2">{errors.specialtyId}</p>}
                        </Card>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setStep(2)}
                                icon={ArrowLeft}
                                className="flex-1"
                            >
                                Quay lại
                            </Button>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={validateAndNext}
                                disabled={!formData.specialtyId}
                                icon={ArrowRight}
                                iconPosition="right"
                                className="flex-1"
                            >
                                Tiếp tục
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 4: Chọn Ngày/Giờ (API: GET /schedules/available-doctors) */}
                {step === 4 && (
                    <div className="space-y-6">
                        <Card>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Chọn Ngày và Giờ</h2>
                            {/* Date Selection */}
                            <div className="mb-6">
                                <Input 
                                    type="date" 
                                    label="Chọn ngày khám" 
                                    value={formData.date} 
                                    onChange={(e) => handleChange('date', e.target.value)} 
                                    min={getMinDate()} 
                                    error={errors.date} 
                                    icon={Calendar} 
                                    required 
                                    helperText="Chọn ngày bạn muốn đến khám"
                                />
                            </div>

                            {/* Time Slots UI */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Chọn khung giờ <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {TIME_SLOTS.map((slot) => {
                                        const available = formData.date ? isSlotAvailable(formData.doctorId || 'default', formData.date, slot.time) : true;
                                        return (
                                            <button
                                                key={slot.time}
                                                onClick={() => available && handleChange('time', slot.time)}
                                                disabled={!available}
                                                className={`py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                                                    formData.time === slot.time
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                                        : available
                                                        ? 'border-gray-200 hover:border-blue-500 hover:shadow-md'
                                                        : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                <Clock className="w-4 h-4 inline mr-1" />
                                                {slot.time}
                                                {slot.popular && available && (
                                                    <span className="block text-xs mt-1 text-orange-500">Phổ biến</span>
                                                )}
                                                {!available && (
                                                    <span className="block text-xs mt-1">Đã đầy</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.time && (
                                    <p className="text-red-600 text-sm mt-2">{errors.time}</p>
                                )}
                            </div>
                        </Card>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setStep(3)}
                                icon={ArrowLeft}
                                className="flex-1"
                            >
                                Quay lại
                            </Button>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={validateAndNext}
                                disabled={!formData.date || !formData.time}
                                icon={ArrowRight}
                                iconPosition="right"
                                className="flex-1"
                            >
                                Tiếp tục
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 5: Chọn Bác sĩ (API: GET /doctors/details?ids=...) */}
                {step === 5 && (
                    <div className="space-y-6">
                        <Card>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Chọn Bác sĩ</h2>
                            
                            {/* Search */}
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm bác sĩ theo tên hoặc chuyên khoa..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Doctors List */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {filteredDoctors.map((doctor) => (
                                    <Card
                                        key={doctor.id}
                                        hover
                                        onClick={() => handleChange('doctorId', doctor.id)}
                                        className={`cursor-pointer border-2 transition-all ${
                                            formData.doctorId === doctor.id
                                                ? 'border-blue-500 bg-blue-50 shadow-lg'
                                                : 'border-gray-200'
                                        }`}
                                    >
                                        <div className="flex gap-4">
                                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 shadow-lg">
                                                {doctor.avatar}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg text-gray-900 mb-1">{doctor.name}</h3>
                                                <p className="text-blue-600 font-medium text-sm mb-2">{doctor.specialty}</p>
                                                
                                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                                    <span className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                        {doctor.rating}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Award className="w-4 h-4" />
                                                        {doctor.experience} năm
                                                    </span>
                                                </div>
                                                
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(doctor.consultationFee)}
                                                </p>
                                            </div>

                                            {formData.doctorId === doctor.id && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                        <CheckCircle className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {errors.doctorId && (
                                <p className="text-red-600 text-sm mt-4">{errors.doctorId}</p>
                            )}
                        </Card>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setStep(4)}
                                icon={ArrowLeft}
                                className="flex-1"
                            >
                                Quay lại
                            </Button>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={validateAndNext}
                                disabled={!formData.doctorId}
                                icon={ArrowRight}
                                iconPosition="right"
                                className="flex-1"
                            >
                                Tiếp tục
                            </Button>
                        </div>
                    </div>
                )}
               
                {/* Step 6: Điền Thông tin Bệnh nhân (API: GET /users/me) */}
                {step === 6 && (
                    <div className="space-y-6">
                        <Card>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Thông tin Bệnh nhân</h2>
                            <p className="text-sm text-gray-600 mb-4">Thông tin được tự động điền từ hồ sơ cá nhân của bạn.</p>
                            {/* Autofill Fields */}
                            <Input 
                                label="Họ và Tên" 
                                value={formData.fullName} 
                                onChange={(e) => handleChange('fullName', e.target.value)} 
                                error={errors.fullName} 
                                icon={User} 
                                required 
                            />
                            <Input 
                                type="email" 
                                label="Email" 
                                value={formData.email} 
                                disabled 
                                icon={Mail} 
                            />
                            <Input 
                                label="Số điện thoại" 
                                value={formData.phone} 
                                onChange={(e) => handleChange('phone', e.target.value)} 
                                icon={Phone} 
                                required 
                            />
                            {/* Required reason for consultation */}
                            <Input 
                                label="Lý do khám bệnh" 
                                placeholder="Ví dụ: Khám tổng quát, đau đầu..." 
                                value={formData.type} 
                                onChange={(e) => handleChange('type', e.target.value)} 
                                error={errors.type} 
                                icon={FileText} 
                                required 
                            />
                           
                            {/* Optional notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ghi chú thêm (tùy chọn)
                                </label>
                                <textarea
                                    placeholder="Mô tả triệu chứng hoặc thông tin bổ sung..."
                                    value={formData.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows="4"
                                />
                            </div>
                        </Card>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setStep(5)}
                                icon={ArrowLeft}
                                className="flex-1"
                            >
                                Quay lại
                            </Button>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={validateAndNext}
                                disabled={!formData.type}
                                icon={ArrowRight}
                                iconPosition="right"
                                className="flex-1"
                            >
                                Tiếp tục
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 7: Xác nhận & Thanh toán (API: POST /appointments/initiate) */}
                {step === 7 && (
                    <div className="space-y-6">
                        <Card>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Xác nhận & Thanh toán</h2>

                            {/* Summary */}
                            <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                    Tóm tắt đặt lịch
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                        <User className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Bác sĩ</p>
                                            <p className="font-semibold text-gray-900">{selectedDoctor?.name}</p>
                                            <p className="text-sm text-blue-600">{selectedDoctor?.specialty}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                        <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Ngày khám</p>
                                            <p className="font-semibold text-gray-900">{formatDate(formData.date)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                        <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Giờ khám</p>
                                            <p className="font-semibold text-gray-900">{formData.time}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Địa điểm</p>
                                            <p className="font-semibold text-gray-900">{HOSPITALS.find(h => h.id === formData.hospitalId)?.name || 'Bệnh viện'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Lý do khám</p>
                                            <p className="font-semibold text-gray-900">{formData.type}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                                <p className="text-sm text-yellow-800">
                                    <strong>Phí khám:</strong> {formatCurrency(selectedDoctor?.consultationFee || 0)} (Thanh toán trực tuyến an toàn)
                                </p>
                            </div>

                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <strong>Lưu ý:</strong> Vui lòng đến trước giờ hẹn 15 phút. Mang theo CMND/CCCD và sổ khám bệnh (nếu có).
                                </p>
                            </div>
                        </Card>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setStep(6)}
                                icon={ArrowLeft}
                                className="flex-1"
                            >
                                Quay lại
                            </Button>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={validateAndNext}
                                loading={isLoading}
                                disabled={isLoading}
                                icon={CheckCircle}
                                iconPosition="right"
                                className="flex-1"
                            >
                                Thanh toán & Xác nhận
                            </Button>
                        </div>
                    </div>
                )}
                {/* --- END: 8 BƯỚC UI RIÊNG BIỆT --- */}
            </main>
        </div>
    );
};

export default BookingPage;