import React, { createContext, useState, useContext, useEffect } from "react";
import { generateId } from "../utils/helpers";
import { APPOINTMENT_STATUS } from "../utils/constants";
import { useAuth } from "./AuthContext";
import { getAppointmentsByUser, updateAppointment } from "../services/appointments.api";

const AppointmentContext = createContext();

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error("useAppointments must be used within AppointmentProvider");
  }
  return context;
};

export const AppointmentProvider = ({ children }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);

  // Load appointments thực từ backend theo bệnh nhân
  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setAppointments([]);
        return;
      }
      try {
        const data = await getAppointmentsByUser(user.id);
        const list = Array.isArray(data) ? data : [];
        const mapped = list.map((apt) => {
          const rawDate =
            typeof apt.appointment_date === "string"
              ? apt.appointment_date.slice(0, 10)
              : apt.appointment_date?.toString().slice(0, 10);
          const rawTime = (apt.appointment_time || "").slice(0, 5);
          return {
            id: apt.id, // dùng luôn id backend
            backendId: apt.id,
            doctorId: apt.doctor_id,
            doctorName: apt.doctor?.name || "Bác sĩ",
            specialty:
              apt.doctor?.specialty ||
              apt.doctor?.category?.name ||
              "Chuyên khoa",
            date: rawDate,
            time: rawTime,
            type: apt.symptoms || "",
            status: apt.status || APPOINTMENT_STATUS.PENDING,
            cancelReason: apt.cancel_reason || "",
            hasReview: false,
            notes: "",
          };
        });
        setAppointments(mapped);
      } catch (e) {
        console.error("Load patient appointments error:", e);
        setAppointments([]);
      }
    };
    void load();
  }, [user?.id]);

  const addAppointment = (appointmentData) => {
    const newAppointment = {
      id: generateId(),
      ...appointmentData,
      status: appointmentData.status || APPOINTMENT_STATUS.PENDING,
       hasReview: false,
      createdAt: new Date().toISOString(),
    };
    setAppointments([...appointments, newAppointment]);
    return newAppointment;
  };

  const updateAppointment = (id, updates) => {
    setAppointments(
      appointments.map((apt) => (apt.id === id ? { ...apt, ...updates } : apt))
    );
  };

  const cancelAppointment = async (id) => {
    const target = appointments.find((apt) => apt.id === id);
    if (target?.backendId) {
      try {
        await updateAppointment(target.backendId, {
          status: APPOINTMENT_STATUS.CANCELLED,
        });
      } catch (e) {
        console.error("Cancel appointment on server failed:", e);
      }
    }
    updateAppointment(id, { status: APPOINTMENT_STATUS.CANCELLED });
  };

  const deleteAppointment = (id) => {
    setAppointments(appointments.filter((apt) => apt.id !== id));
  };

  const getUpcomingAppointments = () => {
    return appointments
      .filter((apt) => apt.status !== APPOINTMENT_STATUS.CANCELLED)
      .sort(
        (a, b) =>
          new Date(`${b.date}T${b.time || "00:00"}`) -
          new Date(`${a.date}T${a.time || "00:00"}`)
      );
  };

  const getPastAppointments = () => {
    return appointments
      .filter((apt) => apt.status === APPOINTMENT_STATUS.COMPLETED)
      .sort(
        (a, b) =>
          new Date(`${b.date}T${b.time || "00:00"}`) -
          new Date(`${a.date}T${a.time || "00:00"}`)
      );
  };

  // Thống kê lịch hẹn cho HomePage, AppointmentsPage
  const getStatistics = () => {
    const total = appointments.length;
    const upcoming = appointments.filter(
      (apt) =>
        apt.status === APPOINTMENT_STATUS.PENDING ||
        apt.status === APPOINTMENT_STATUS.CONFIRMED
    ).length;
    const completed = appointments.filter(
      (apt) => apt.status === APPOINTMENT_STATUS.COMPLETED
    ).length;
    const cancelled = appointments.filter(
      (apt) => apt.status === APPOINTMENT_STATUS.CANCELLED
    ).length;
    const rejected = appointments.filter(
      (apt) => apt.status === APPOINTMENT_STATUS.REJECTED
    ).length;

    return { total, upcoming, completed, cancelled, rejected };
  };

  const isSlotAvailable = (doctorId, date, time) => {
    if (!doctorId || !date || !time) return true;
    return !appointments.some(
      (apt) =>
        String(apt.doctorId) === String(doctorId) &&
        apt.date === date &&
        apt.time === time &&
        apt.status !== APPOINTMENT_STATUS.CANCELLED
    );
  };

  const value = {
    appointments,
    addAppointment,
    updateAppointment,
    cancelAppointment,
    deleteAppointment,
    getUpcomingAppointments,
    getPastAppointments,
    getStatistics,
    isSlotAvailable,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};
