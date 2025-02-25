export interface Database {
  public: {
    Tables: {
      doctors: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          specialty: string;
          license_number: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          specialty: string;
          license_number: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          specialty?: string;
          license_number?: string;
          created_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          user_id: string;
          doctor_id: string;
          full_name: string;
          date_of_birth: string;
          medical_history: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          doctor_id: string;
          full_name: string;
          date_of_birth: string;
          medical_history?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          doctor_id?: string;
          full_name?: string;
          date_of_birth?: string;
          medical_history?: string | null;
          created_at?: string;
        };
      };
      medical_reports: {
        Row: {
          id: string;
          doctor_id: string;
          patient_id: string;
          visit_reason: string;
          image_url: string;
          symptoms: string;
          analysis: string;
          health_status: 'improving' | 'deteriorating' | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          patient_id: string;
          visit_reason: string;
          image_url: string;
          symptoms: string;
          analysis: string;
          health_status?: 'improving' | 'deteriorating' | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          patient_id?: string;
          visit_reason?: string;
          image_url?: string;
          symptoms?: string;
          analysis?: string;
          health_status?: 'improving' | 'deteriorating' | null;
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          doctor_id: string;
          patient_id: string;
          scheduled_for: string;
          visit_reason: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          patient_id: string;
          scheduled_for: string;
          visit_reason: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          patient_id?: string;
          scheduled_for?: string;
          visit_reason?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

export type Tables = Database['public']['Tables'];
export type Doctor = Tables['doctors']['Row'];
export type Patient = Tables['patients']['Row'];
export type MedicalReport = Tables['medical_reports']['Row'];
export type Appointment = Tables['appointments']['Row'];