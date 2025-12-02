import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle, Search, Star, Award, ArrowLeft, ArrowRight, MapPin, Home, Mail, Phone, Heart } from 'lucide-react';
import { useAppointments } from '../contexts/AppointmentContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { formatDate, formatCurrency } from '../utils/helpers';
import { PAGES } from '../utils/constants';
const API_BASE_URL = 'http://localhost:8080';
// Dữ liệu giả lập người dùng đã xác thực (Autofill) - Giữ mock cho user
const MOCK_USER_DATA = {
    fullName: 'Lê Văn Khách',
    email: 'le.v.khach@gmail.com',
    phone: '0987654321',
    // Giả sử có firebaseUid: 'user-firebase-uid-123'
};
const BookingPage = ({ navigate }) => {
    const { addAppointment } = useAppointments();
    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    // --- STATE DỮ LIỆU ĐỘNG (Từ API MySQL) ---
    const [areasData, setAreasData] = useState([]);
    const [hospitalsData, setHospitalsData] = useState([]);
    const [specialtiesData, setSpecialtiesData] = useState([]);
    const [availableDoctorsData, setAvailableDoctorsData] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    // Mở rộng formData để chứa tất cả 8 bước
    const [formData, setFormData] = useState({
        areaId: '', hospitalId: '', specialtyId: '',
        date: '', time: '', doctorId: '',
    
        // B6: Thông tin BN (Autofill) - Giữ mock, có thể update từ GET /users/me sau
        fullName: MOCK_USER_DATA.fullName,
        email: MOCK_USER_DATA.email,
        phone: MOCK_USER_DATA.phone,
        type: '',
        notes: '',
        examinationType: 'offline', // Mặc định offline, sẽ map sang examination_type enum
        userId: '1',  // Giả sử userId=1 cho user đã auth (cần lấy từ AuthContext sau)
        scheduleId: '' // Để lưu scheduleId tương ứng với doctor/date/time đã chọn
    });
    const [errors, setErrors] = useState({});
    // Dữ liệu hỗ trợ từ API
    const selectedDoctor = availableDoctorsData.find(d => d.id === formData.doctorId);
    const filteredDoctors = availableDoctorsData.filter(doctor =>
        doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // Function generate possible time slots (30 phút intervals từ 7:00 đến 17:30)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 7; hour <= 17; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push({ time });
            }
        }
        return slots;
    };
    // Helper to format time for API (append :00)
    const formatTimeForAPI = (time) => encodeURIComponent(time);
    // --- LOGIC GỌI API THỰC TẾ (Từ MySQL) ---
    // B1: Load Khu vực khi component mount
    useEffect(() => {
        const fetchAreas = async () => {
            try {
                // Gọi API GET /areas từ MySQL
                const response = await fetch(`${API_BASE_URL}/areas`);
                if (!response.ok) throw new Error('API error');
                const data = await response.json();
                setAreasData(data); // Đổ dữ liệu từ MySQL vào state
            } catch (error) {
                console.error("Lỗi tải Khu vực:", error);
                setAreasData([]); // Không fallback mock, để trống nếu lỗi
            }
        };
        fetchAreas();
    }, []);
    // B2: Load Bệnh viện khi areaId thay đổi
    useEffect(() => {
        if (formData.areaId) {
            const fetchHospitals = async () => {
                try {
                    // Gọi API GET /hospitals?area_id=X từ MySQL
                    const response = await fetch(`${API_BASE_URL}/hospitals?area_id=${formData.areaId}`);
                    if (!response.ok) throw new Error('API error');
                    const data = await response.json();
                    setHospitalsData(data);
                } catch (error) {
                    console.error("Lỗi tải Bệnh viện:", error);
                    setHospitalsData([]);
                }
            };
            fetchHospitals();
        } else {
            setHospitalsData([]);
        }
    }, [formData.areaId]);

    // B3: Load Chuyên khoa khi hospitalId thay đổi
    useEffect(() => {
        if (formData.hospitalId) {
            const fetchSpecialties = async () => {
                try {
                    // Gọi API GET /specialties?hospital_id=Y từ MySQL
                    const response = await fetch(`${API_BASE_URL}/specialties?hospital_id=${formData.hospitalId}`);
                    if (!response.ok) throw new Error('API error');
                    const data = await response.json();
                    setSpecialtiesData(data);
                } catch (error) {
                    console.error("Lỗi tải Chuyên khoa:", error);
                    setSpecialtiesData([]);
                }
            };
            fetchSpecialties();
        } else {
            setSpecialtiesData([]);
        }
    }, [formData.hospitalId]);

    // --- useEffect gọi API khi đủ dữ liệu ---
    useEffect(() => {
        if (formData.specialtyId && formData.date && formData.time) {
            fetchAndLoadDoctors(formData.date, formData.time);
        } else {
            setAvailableDoctorsData([]); // Reset nếu thiếu dữ liệu
        }
    }, [formData.specialtyId, formData.date, formData.time]);

    // --- B4-B5: Load bác sĩ rảnh theo chuyên khoa/Ngày/Giờ ---
    const fetchAndLoadDoctors = async (date, time) => {
        if (!formData.specialtyId || !date || !time) {
            console.log('Skip fetch: missing params', { specialtyId: formData.specialtyId, date, time });
            setAvailableDoctorsData([]);
            return;
        }

        const encodedTime = formatTimeForAPI(time);  // Sử dụng helper đã fix
        const apiUrl = `${API_BASE_URL}/schedules/available-doctors?specialtyId=${formData.specialtyId}&date=${date}&time=${encodedTime}`;
        console.log('Calling schedules API:', apiUrl);
        console.log('Params raw:', { specialtyId: formData.specialtyId, date, time });

        try {
            setIsLoading(true);

            const scheduleResponse = await fetch(apiUrl);
            console.log('Schedules response status:', scheduleResponse.status);
            if (!scheduleResponse.ok) throw new Error(`Schedules API error: ${scheduleResponse.status}`);
            const scheduleData = await scheduleResponse.json();
            console.log('scheduleData raw:', scheduleData);  // Check: [1] hay [{id:1}]? Empty?

            if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
                console.log('No schedules found');
                setAvailableDoctorsData([]);
                return;
            }

            // **FIX: scheduleData là array schedule IDs (e.g. [1]), cần fetch full schedules để lấy doctor_id**
            const scheduleIds = scheduleData.join(',');  // e.g. '1' hoặc '1,2'
            console.log('scheduleIds from API:', scheduleIds);

            if (scheduleIds.length > 0) {
                // 1. Gọi API để lấy full schedules theo IDs (giả sử endpoint /schedules?ids=... tồn tại và trả full objects)
                const fullSchedulesUrl = `${API_BASE_URL}/schedules?ids=${scheduleIds}`;
                console.log('Calling full schedules API:', fullSchedulesUrl);

                const fullSchedulesResponse = await fetch(fullSchedulesUrl);
                if (!fullSchedulesResponse.ok) throw new Error(`Full schedules API error: ${fullSchedulesResponse.status}`);
                const fullSchedulesData = await fullSchedulesResponse.json();
                console.log('fullSchedulesData raw:', fullSchedulesData);  // Nên là [{id:1, doctor_id: X, ...}]

                if (!Array.isArray(fullSchedulesData) || fullSchedulesData.length === 0) {
                    console.log('No full schedules data');
                    setAvailableDoctorsData([]);
                    return;
                }

                // 2. Extract unique doctor_ids từ full schedules + enrich doctors với schedule info nếu cần
                const doctorIdsRaw = Array.from(
                    new Set(fullSchedulesData.map(schedule => schedule.doctor_id).filter(Boolean))
                );
                const doctorIds = doctorIdsRaw.join(',');
                console.log('doctorIds extracted:', doctorIds);  // e.g. '1'

                if (doctorIds.length > 0) {
                    // 3. Gọi API doctors để lấy chi tiết
                    const doctorsUrl = `${API_BASE_URL}/doctors/details?ids=${doctorIds}`;
                    console.log('Calling doctors API:', doctorsUrl);

                    const doctorsResponse = await fetch(doctorsUrl);
                    console.log('Doctors response status:', doctorsResponse.status);
                    if (!doctorsResponse.ok) throw new Error(`Doctors API error: ${doctorsResponse.status}`);
                    let doctorsData = await doctorsResponse.json();
                    console.log('doctorsData raw:', doctorsData);  // Array doctors hay empty? Structure?

                    // **ENRICH: Thêm remainingPatients và scheduleId cho mỗi doctor (dựa trên fullSchedulesData)**
                    doctorsData = doctorsData.map(doctor => {
                        // Tìm schedule tương ứng với doctor_id này
                        const matchingSchedule = fullSchedulesData.find(s => s.doctor_id === doctor.id);
                        if (matchingSchedule) {
                            const bookedCount = fullSchedulesData.filter(s => s.doctor_id === doctor.id).length; // Hoặc gọi count nếu cần chính xác
                            return {
                                ...doctor,
                                remainingPatients: matchingSchedule.max_patients - bookedCount, // Tính remaining
                                scheduleId: matchingSchedule.id  // Lưu scheduleId cho doctor này
                            };
                        }
                        return doctor;
                    });

                    setAvailableDoctorsData(doctorsData || []);  // Fallback empty
                } else {
                    console.log('No doctorIds from schedules, setting empty');
                    setAvailableDoctorsData([]);
                }
            } else {
                console.log('No scheduleIds, setting empty');
                setAvailableDoctorsData([]);
            }
        } catch (error) {
            console.error("Lỗi tải Bác sĩ rảnh:", error);
            setAvailableDoctorsData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // --- handleChange chuẩn ---
    const handleChange = (field, value) => {
        setFormData(prev => {
            const updated = { ...prev };

            switch(field) {
                case 'areaId':
                    updated.areaId = value;
                    updated.hospitalId = '';
                    updated.specialtyId = '';
                    updated.date = '';
                    updated.time = '';
                    updated.doctorId = '';
                    updated.scheduleId = '';
                    setHospitalsData([]);
                    setSpecialtiesData([]);
                    setAvailableDoctorsData([]);
                    break;

                case 'hospitalId':
                    updated.hospitalId = value;
                    updated.specialtyId = '';
                    updated.date = '';
                    updated.time = '';
                    updated.doctorId = '';
                    updated.scheduleId = '';
                    setSpecialtiesData([]);
                    setAvailableDoctorsData([]);
                    break;

                case 'specialtyId':
                    updated.specialtyId = value;
                    updated.date = '';
                    updated.time = '';
                    updated.doctorId = '';
                    updated.scheduleId = '';
                    setAvailableDoctorsData([]);
                    break;

                case 'date':
                    updated.date = value;
                    updated.time = '';
                    updated.doctorId = '';
                    updated.scheduleId = '';
                    setAvailableDoctorsData([]);
                    break;

                case 'time':
                    updated.time = value;
                    updated.doctorId = '';
                    updated.scheduleId = '';
                    break;

                case 'doctorId':
                    // **FIX: Khi chọn doctor, lấy scheduleId từ data enriched**
                    const selectedDoc = availableDoctorsData.find(d => d.id === Number(value));
                    updated.doctorId = Number(value);
                    updated.scheduleId = selectedDoc?.scheduleId || ''; // Set scheduleId tương ứng
                    console.log('Selected doctorId:', updated.doctorId, 'scheduleId:', updated.scheduleId);
                    break;

                case 'examinationType':
                    updated.examinationType = value; // 'online' hoặc 'offline'
                    break;

                default:
                    updated[field] = value;
            }

            return updated;
        });

        setErrors(prev => ({ ...prev, [field]: '' }));
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
            case 4:
                if (!formData.date || !formData.time) {
                    newErrors.time = 'Vui lòng chọn Ngày và Giờ.';
                } else if (availableDoctorsData.length === 0 && !isLoading) {
                    // Nếu đã chọn Giờ/Ngày, nhưng API Doctors trả về rỗng -> ngoài khung giờ hoặc hết slot
                    newErrors.time = 'Không tìm thấy bác sĩ rảnh vào khung giờ này (có thể ngoài giờ làm hoặc hết slot). Chọn giờ khác.';
                }
                break;
            case 5: if (!formData.doctorId) newErrors.doctorId = 'Vui lòng chọn Bác sĩ.'; break;
            case 6: if (!formData.type || !formData.fullName) newErrors.type = 'Vui lòng điền Lý do khám.'; break;
            case 7: handleSubmit(); return;
            default: break;
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setStep(step + 1);
        window.scrollTo(0, 0);
    };
    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (!formData.userId || !formData.scheduleId) {
                throw new Error('Chưa có userId hoặc scheduleId');
            }

            // **FIX: Map đúng DTO fields**
            const appointmentData = {
                user_id: Number(formData.userId),          // phải là số nguyên
                doctor_id: Number(formData.doctorId),
                hospital_id: Number(formData.hospitalId),
                schedule_id: Number(formData.scheduleId),  // đã set từ doctor selection
                appointment_date: formData.date,           // 'YYYY-MM-DD'
                appointment_time: formData.time,           // 'HH:mm'
                examination_type: formData.examinationType, // 'online' hoặc 'offline' từ step 6
                symptoms: formData.notes || formData.type, // Map notes hoặc type sang symptoms (mô tả triệu chứng)
            };

            console.log('Submitting appointmentData:', appointmentData); // Debug

            const response = await fetch(`${API_BASE_URL}/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointmentData),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Submit error');
            }

            const result = await response.json();
            addAppointment(result);
            setStep(8);
        } catch (error) {
            console.error('Lỗi submit:', error);
            setErrors({ submit: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };
    // Nếu đã hoàn tất (Step 8), hiển thị Success Modal
    if (step === 8) {
        const selectedHospital = hospitalsData.find(h => h.id === formData.hospitalId);
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center animate-scale-in">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Đặt lịch thành công!</h2>
                    <p className="text-gray-600 mb-6">
                        Lịch hẹn của bạn đã được xác nhận và thanh toán (Mô phỏng). Số slot còn lại đã được cập nhật.
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
                                <span>{selectedHospital?.name || 'Bệnh viện'}</span>
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
                {/* Step 1: Chọn Khu vực (Từ API) */}
                {step === 1 && (
                    <div className="space-y-6">
                        <Card>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Chọn Khu vực</h2>
                            <select
                                value={formData.areaId}
                                onChange={(e) => handleChange('areaId', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={areasData.length === 0}
                            >
                                <option value="">-- Chọn Tỉnh thành --</option>
                                {areasData.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                            {errors.areaId && <p className="text-red-600 mt-2">{errors.areaId}</p>}
                        </Card>
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={validateAndNext}
                            disabled={!formData.areaId || areasData.length === 0}
                            icon={ArrowRight}
                            iconPosition="right"
                        >
                            Tiếp tục
                        </Button>
                    </div>
                )}
                {/* Step 2: Chọn Bệnh viện (Từ API) */}
                {step === 2 && (
                    <div className="space-y-6">
                        <Card>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Chọn Bệnh viện</h2>
                            <select
                                value={formData.hospitalId}
                                onChange={(e) => handleChange('hospitalId', e.target.value)}
                                disabled={!formData.areaId || hospitalsData.length === 0}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                <option value="">-- Chọn Bệnh viện --</option>
                                {hospitalsData.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
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
            
                {/* Step 3: Chọn Chuyên khoa (Từ API) */}
                {step === 3 && (
                    <div className="space-y-6">
                        <Card>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Chọn Chuyên khoa</h2>
                            <select
                                value={formData.specialtyId}
                                onChange={(e) => handleChange('specialtyId', e.target.value)}
                                disabled={!formData.hospitalId || specialtiesData.length === 0}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                <option value="">-- Chọn Chuyên khoa --</option>
                                {specialtiesData.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                {/* Step 4: Chọn Ngày/Giờ (Tất cả slots generated đều selectable, không check availability trước) */}
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
                            {/* Time Slots UI (Generated 30min slots, tất cả selectable - filter doctors sau) */}
                            <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Chọn khung giờ <span className="text-red-500">*</span>
                            </label>
                            
                            {!formData.date ? (
                                <p className="text-gray-500 text-sm">Vui lòng chọn ngày trước để xem khung giờ.</p>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {generateTimeSlots().map((slot) => (
                                        <button
                                            key={slot.time}
                                            onClick={() => handleChange('time', slot.time)}
                                            disabled={isLoading}
                                            className={`py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                                                formData.time === slot.time
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                                    : 'border-gray-200 hover:border-blue-500 hover:shadow-md'
                                            }`}
                                        >
                                            <Clock className="w-4 h-4 inline mr-1" /> {slot.time}
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            {errors.time && (<p className="text-red-600 text-sm mt-2">{errors.time}</p>)}
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
                                disabled={!formData.date || !formData.time || isLoading}
                                icon={ArrowRight}
                                iconPosition="right"
                                className="flex-1"
                            >
                                Tiếp tục
                            </Button>
                        </div>
                    </div>
                )}
                {/* Step 5: Chọn Bác sĩ (Từ API, đã filter theo schedule: khung giờ + remaining patients > 0) */}
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
                            {/* Doctors List (Từ availableDoctorsData - đã filter theo khung giờ và max_patients) */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {isLoading ? (
                                    <p className="text-blue-600 col-span-full text-center py-8">Đang tải danh sách bác sĩ rảnh...</p>
                                ) : filteredDoctors.length === 0 ? (
                                    <p className="text-gray-500 col-span-full text-center py-8">
                                        {searchQuery ? 'Không tìm thấy bác sĩ phù hợp.' : 'Không tìm thấy bác sĩ nào rảnh vào khung giờ này (ngoài giờ làm hoặc hết slot).'}
                                    </p>
                                ) : (
                                    filteredDoctors.map((doctor) => (
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
                                                    {doctor.avatar || '👨‍⚕️'}
                                                </div>
                                            
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{doctor.name}</h3>
                                                    <p className="text-blue-600 font-medium text-sm mb-2">{doctor.specialty}</p>
                                                
                                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                                        <span className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                            {doctor.rating || 4.5}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Award className="w-4 h-4" />
                                                            {doctor.experience || 10} năm
                                                        </span>
                                                    </div>
                                                    {/* Hiển thị remaining slots từ enriched data */}
                                                    {doctor.remainingPatients !== undefined && doctor.remainingPatients > 0 && (
                                                        <p className="text-xs text-green-600">Còn {doctor.remainingPatients} slot</p>
                                                    )}
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(doctor.consultationFee || 0)}
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
                                    ))
                                )}
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
                                disabled={!formData.doctorId || availableDoctorsData.length === 0 || isLoading}
                                icon={ArrowRight}
                                iconPosition="right"
                                className="flex-1"
                            >
                                Tiếp tục
                            </Button>
                        </div>
                    </div>
                )}
            
                {/* Step 6: Điền Thông tin Bệnh nhân (Mock) */}
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
                            {/* **NEW: Chọn loại khám (online/offline) - map sang examination_type */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Loại hình khám <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="offline"
                                            checked={formData.examinationType === 'offline'}
                                            onChange={(e) => handleChange('examinationType', e.target.value)}
                                            className="rounded"
                                        />
                                        <span className="text-sm">Khám trực tiếp</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="online"
                                            checked={formData.examinationType === 'online'}
                                            onChange={(e) => handleChange('examinationType', e.target.value)}
                                            className="rounded"
                                        />
                                        <span className="text-sm">Khám online</span>
                                    </label>
                                </div>
                            </div>
                            {/* Optional notes - map sang symptoms */}
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
                {/* Step 7: Xác nhận & Thanh toán */}
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
                                            <p className="font-semibold text-gray-900">{hospitalsData.find(h => h.id === formData.hospitalId)?.name || 'Bệnh viện'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Lý do khám</p>
                                            <p className="font-semibold text-gray-900">{formData.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                        <Heart className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Loại hình</p>
                                            <p className="font-semibold text-gray-900 capitalize">{formData.examinationType}</p>
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
                            {errors.submit && <p className="text-red-600 text-sm mt-4">{errors.submit}</p>}
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
            </main>
        </div>
    );
};
export default BookingPage;