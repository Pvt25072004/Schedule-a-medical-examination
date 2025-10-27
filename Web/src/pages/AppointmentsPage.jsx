import React, { useState } from 'react';
import { Clock, Calendar, MapPin, Phone, XCircle, CheckCircle } from 'lucide-react';
import { useAppointments } from '../contexts/AppointmentContext';
import Layout from '../components/common/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { PAGES } from '../utils/constants';
import { formatDate, getStatusColor, getStatusText } from '../utils/helpers';

const AppointmentsPage = ({ navigate }) => {
  const { appointments, cancelAppointment } = useAppointments();
  const [filter, setFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'upcoming') return apt.status === 'pending' || apt.status === 'confirmed';
    if (filter === 'completed') return apt.status === 'completed';
    if (filter === 'cancelled') return apt.status === 'cancelled';
    return true;
  });

  const handleCancelAppointment = (id) => {
    if (window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) {
      cancelAppointment(id);
      setSelectedAppointment(null);
    }
  };

  return (
    <Layout
      title="Lịch hẹn"
      subtitle="Quản lý các cuộc hẹn của bạn"
      showBack
      onBack={() => navigate(PAGES.HOME)}
      maxWidth="4xl"
    >
      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'Tất cả', count: appointments.length },
            { key: 'upcoming', label: 'Sắp tới', count: appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length },
            { key: 'completed', label: 'Hoàn thành', count: appointments.filter(a => a.status === 'completed').length },
            { key: 'cancelled', label: 'Đã hủy', count: appointments.filter(a => a.status === 'cancelled').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                filter === tab.key
                  ? 'bg-teal-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map(apt => (
            <Card 
              key={apt.id} 
              padding="lg"
              hover
              onClick={() => setSelectedAppointment(apt)}
              className="cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-teal-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-lg text-gray-800">{apt.doctorName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(apt.status)}`}>
                        {getStatusText(apt.status)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{apt.specialty}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(apt.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{apt.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>STL Clinic - 123 Đường ABC, Q.1, TP.HCM</span>
                      </div>
                    </div>
                    
                    {apt.type && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Lý do: </span>
                          {apt.type}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              {(apt.status === 'pending' || apt.status === 'confirmed') && (
                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Phone}
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Gọi: 1900-xxxx');
                    }}
                    className="flex-1"
                  >
                    Liên hệ
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={XCircle}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelAppointment(apt.id);
                    }}
                    className="flex-1"
                  >
                    Hủy lịch
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card padding="lg" className="text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">
            Không có lịch hẹn nào
          </h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all' 
              ? 'Bạn chưa có lịch hẹn nào'
              : `Không có lịch hẹn ${getStatusText(filter).toLowerCase()}`
            }
          </p>
          <Button
            variant="primary"
            onClick={() => navigate(PAGES.BOOKING)}
          >
            Đặt lịch ngay
          </Button>
        </Card>
      )}

      {/* Quick Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          variant="primary"
          size="lg"
          icon={Calendar}
          onClick={() => navigate(PAGES.BOOKING)}
          className="shadow-xl"
        >
          Đặt lịch mới
        </Button>
      </div>
    </Layout>
  );
};

export default AppointmentsPage;