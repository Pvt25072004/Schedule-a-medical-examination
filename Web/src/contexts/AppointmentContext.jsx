import React, { createContext, useState, useContext } from 'react';
import { generateId } from '../utils/helpers';
import { APPOINTMENT_STATUS } from '../utils/constants';

const AppointmentContext = createContext();

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within AppointmentProvider');
  }
  return context;
};

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      doctorId: 'dr1',
      doctorName: 'BS. Nguyễn Văn A',
      specialty: 'Tim mạch',
      date: '2025-10-25',
      time: '10:00 - 11:00',
      type: 'Khám tim mạch định kỳ',
      status: APPOINTMENT_STATUS.CONFIRMED,
      notes: ''
    },
    {
      id: 2,
      doctorId: 'dr2',
      doctorName: 'BS. Trần Thị B',
      specialty: 'Nhi khoa',
      date: '2025-10-26',
      time: '14:00 - 15:00',
      type: 'Tái khám nhi khoa',
      status: APPOINTMENT_STATUS.PENDING,
      notes: ''
    }
  ]);

  const addAppointment = (appointmentData) => {
    const newAppointment = {
      id: generateId(),
      ...appointmentData,
      status: APPOINTMENT_STATUS.PENDING,
      createdAt: new Date().toISOString()
    };
    setAppointments([...appointments, newAppointment]);
    return newAppointment;
  };

  const updateAppointment = (id, updates) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, ...updates } : apt
    ));
  };

  const cancelAppointment = (id) => {
    updateAppointment(id, { status: APPOINTMENT_STATUS.CANCELLED });
  };

  const deleteAppointment = (id) => {
    setAppointments(appointments.filter(apt => apt.id !== id));
  };

  const getUpcomingAppointments = () => {
    return appointments
      .filter(apt => apt.status !== APPOINTMENT_STATUS.CANCELLED)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getPastAppointments = () => {
    return appointments
      .filter(apt => apt.status === APPOINTMENT_STATUS.COMPLETED)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const value = {
    appointments,
    addAppointment,
    updateAppointment,
    cancelAppointment,
    deleteAppointment,
    getUpcomingAppointments,
    getPastAppointments
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};