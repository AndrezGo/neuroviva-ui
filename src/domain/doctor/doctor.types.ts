export type AlertPriority = 'info' | 'media' | 'alta' | 'critica';

export interface DoctorPatient {
  patientId: string;
  name: string;
  conditions: string[];
  conditionStage: string | null;
  age: number;
  highestAlertPriority: AlertPriority | null;
  lastActivityAt: string | null;
}

export interface DoctorAlert {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  priority: AlertPriority;
  description: string;
  seen: boolean;
  resolved: boolean;
  createdAt: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  specialty: string | null;
  medicalLicense: string | null;
  isScientificCommittee: boolean;
}

export interface LookupDoctorResult {
  doctorId: string;
  specialty: string | null;
  medicalLicense: string | null;
}

export interface DoctorListItem {
  doctorId: string;
  name: string;
  specialty: string | null;
  medicalLicense: string | null;
}

export interface PatientDoctor {
  doctorId: string;
  name: string;
  specialty: string | null;
  medicalLicense: string | null;
}
