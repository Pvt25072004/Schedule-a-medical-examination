import React, { useState } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAppointments } from '../contexts/AppointmentContext';
import Layout from '../components/common/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { PAGES, DOCTORS, TIME_SLOTS } from '../utils/constants';
import { formatDate } from '../utils/helpers';

const BookingPage = ({ navigate }) => {
  const { addAppointment } = useAppointments();
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    type: '',
    notes: ''
  });
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDoctor = DOCTORS.find(d => d.id === formData.doctorId);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.doctorId) newErrors.doctorId = 'Vui lòng chọn bác sĩ';
    if (!formData.date) newErrors.date = 'Vui lòng chọn ngày';
    if (!formData.time) newErrors.time = 'Vui lòng chọn giờ';
    if (!formData.type) newErrors.type = 'Vui lòng nhập lý do khám';
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const doctor = DOCTORS.find(d => d.id === formData.doctorId);
      addAppointment({
        ...formData,
        doctorName: doctor.name,
        specialty: doctor.specialty
      });
      
      setIsSubmitting(false);
      setShowSuccess(true);

      // Auto redirect after 2 seconds
      setTimeout(() => {
        navigate(PAGES.APPOINTMENTS);
      }, 2000);
    }, 1000);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // 3 months ahead
    return maxDate.toISOString().split('T')[0];
  };

  // Check if time slot is available (demo logic)
  const isTimeSlotAvailable = (time) => {
    // In real app, check against booked slots
    const hour = parseInt(time.split(':')[0]);
    const now = new Date();
    const selectedDate = new Date(formData.date);
    
    // If today, disable past hours
    if (selectedDate.toDateString() === now.toDateString()) {
      return hour > now.getHours();
    }
    return true;
  };

  // Success Modal
  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full animate-scale-in" padding="lg">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Đặt lịch thành công!
          </h3>
          <p className="text-gray-600 mb-6">
            Lịch hẹn của bạn đã được xác nhận. Chúng tôi sẽ gửi thông báo nhắc nhở trước giờ khám.
          </p>
          
          <div className="bg-teal-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-teal-600" />
              <span className="font-medium text-sm">{selectedDoctor?.name}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span className="text-sm">{formatDate(formData.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span className="text-sm">{formData.time}</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate(PAGES.APPOINTMENTS)}
          >
            Xem lịch hẹn
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <Layout
      title="Đặt lịch khám"
      subtitle="Chọn thông tin để đặt lịch hẹn"
      showBack
      onBack={() => navigate(PAGES.HOME)}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <Card padding="md">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  step >= s 
                    ? 'bg-teal-500 text-white scale-110' 
                    : step > s
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                    step > s ? 'bg-teal-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs font-medium">
            <span className={step >= 1 ? 'text-teal-600' : 'text-gray-500'}>Chọn bác sĩ</span>
            <span className={step >= 2 ? 'text-teal-600' : 'text-gray-500'}>Chọn thời gian</span>
            <span className={step >= 3 ? 'text-teal-600' : 'text-gray-500'}>Xác nhận</span>
          </div>
        </Card>

        {/* Step 1: Doctor Selection */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <Card padding="lg">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <User className="w-6 h-6 text-teal-600 mr-2" />
                Chọn bác sĩ / Chuyên khoa
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Chọn bác sĩ hoặc chuyên khoa phù hợp với nhu cầu của bạn
              </p>

              <div className="space-y-3">
                {DOCTORS.map(doctor => (
                  <Card
                    key={doctor.id}
                    padding="md"
                    hover
                    onClick={() => handleChange('doctorId', doctor.id)}
                    className={`cursor-pointer border-2 transition-all duration-200 ${
                      formData.doctorId === doctor.id
                        ? 'border-teal-500 bg-teal-50 shadow-lg scale-[1.02]'
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{doctor.avatar}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800">{doctor.name}</h4>
                        <p className="text-teal-600 text-sm font-medium">{doctor.specialty}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>⭐ 4.8 (120 đánh giá)</span>
                          <span>👥 500+ bệnh nhân</span>
                        </div>
                      </div>
                      {formData.doctorId === doctor.id && (
                        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center animate-scale-in">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
              
              {errors.doctorId && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-3 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.doctorId}</span>
                </div>
              )}
            </Card>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => formData.doctorId && setStep(2)}
              disabled={!formData.doctorId}
            >
              Tiếp tục
            </Button>
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <Card padding="lg">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Calendar className="w-6 h-6 text-teal-600 mr-2" />
                Chọn ngày và giờ khám
              </h3>
              
              {/* Selected Doctor Info */}
              {selectedDoctor && (
                <div className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl mb-6 border border-teal-100">
                  <p className="text-xs text-gray-600 mb-2">Bác sĩ đã chọn:</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedDoctor.avatar}</span>
                    <div>
                      <p className="font-bold text-lg text-gray-800">{selectedDoctor.name}</p>
                      <p className="text-teal-600 text-sm">{selectedDoctor.specialty}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Date Selection */}
              <div className="mb-6">
                <Input
                  type="date"
                  label="Chọn ngày khám"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  error={errors.date}
                  required
                  icon={Calendar}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Bạn có thể đặt lịch trong vòng 3 tháng tới
                </p>
              </div>
              
              {/* Time Selection */}
              <div>
                <label className="block font-semibold mb-3 text-gray-700">
                  Chọn khung giờ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {TIME_SLOTS.map(time => {
                    const available = isTimeSlotAvailable(time);
                    return (
                      <button
                        key={time}
                        onClick={() => available && handleChange('time', time)}
                        disabled={!available}
                        className={`py-3 px-4 rounded-xl border-2 transition-all duration-200 font-medium relative ${
                          formData.time === time
                            ? 'bg-teal-500 text-white border-teal-500 scale-105 shadow-lg'
                            : available
                            ? 'border-gray-200 hover:border-teal-500 hover:shadow-md text-gray-700'
                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Clock className="w-4 h-4 inline mr-1" />
                        {time}
                        {!available && (
                          <span className="absolute top-1 right-1 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                            Hết
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {errors.time && (
                  <div className="flex items-center gap-2 text-red-500 text-sm mt-3 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.time}</span>
                  </div>
                )}
              </div>
            </Card>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Quay lại
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => formData.date && formData.time && setStep(3)}
                disabled={!formData.date || !formData.time}
                className="flex-1"
              >
                Tiếp tục
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <Card padding="lg">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FileText className="w-6 h-6 text-teal-600 mr-2" />
                Thông tin chi tiết
              </h3>
              
              <div className="space-y-6">
                <Input
                  label="Lý do khám bệnh"
                  placeholder="Ví dụ: Đau đầu, sốt cao, khám tổng quát..."
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  error={errors.type}
                  required
                />
                
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">
                    Ghi chú thêm (tùy chọn)
                  </label>
                  <textarea
                    name="notes"
                    placeholder="Mô tả triệu chứng hoặc thông tin bổ sung..."
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none resize-none transition"
                    rows="4"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Thông tin này giúp bác sĩ chuẩn bị tốt hơn cho buổi khám
                  </p>
                </div>
                
                {/* Summary */}
                <div className="p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl space-y-3 border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 text-teal-600 mr-2" />
                    Tóm tắt đặt lịch
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <User className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600">Bác sĩ</p>
                        <p className="font-semibold text-gray-800">{selectedDoctor?.name}</p>
                        <p className="text-sm text-teal-600">{selectedDoctor?.specialty}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">Ngày khám</p>
                        <p className="font-semibold text-gray-800">{formatDate(formData.date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <Clock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">Giờ khám</p>
                        <p className="font-semibold text-gray-800">{formData.time}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <FileText className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600">Lý do khám</p>
                        <p className="font-semibold text-gray-800">{formData.type || 'Chưa nhập'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-800 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>
                      Vui lòng đến trước giờ hẹn 15 phút để hoàn tất thủ tục. Mang theo CMND/CCCD và sổ khám bệnh (nếu có).
                    </span>
                  </p>
                </div>
              </div>
            </Card>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Quay lại
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Xác nhận đặt lịch</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccess && <SuccessModal />}

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </Layout>
  );
};

export default BookingPage;