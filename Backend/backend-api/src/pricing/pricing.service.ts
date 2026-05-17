import { Injectable } from '@nestjs/common';
import { Doctor } from '../doctors/doctor.entity';
import { Hospital } from '../hospitals/entities/hospital.entity';

@Injectable()
export class PricingService {
  /**
   * Pure function to calculate appointment fees based on doctor and hospital data.
   * @param doctor The doctor entity with consultation_fee
   * @param hospital The hospital entity with facility_fee
   */
  calculateAppointmentFee(doctor: Doctor, hospital: Hospital) {
    const doctorFee = Number(doctor.consultation_fee) || 0;
    const hospitalFee = Number(hospital.facility_fee) || 0;
    const totalFee = doctorFee + hospitalFee;

    return {
      doctorFeeSnapshot: doctorFee,
      hospitalFeeSnapshot: hospitalFee,
      totalFee: totalFee,
      doctorNameSnapshot: doctor.name,
      hospitalNameSnapshot: hospital.name,
      currencySnapshot: 'VND',
    };
  }
}
