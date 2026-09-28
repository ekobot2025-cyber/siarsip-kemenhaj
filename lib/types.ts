export type SecurityLevel = 'PUBLIK' | 'INTERNAL' | 'TERBATAS' | 'RAHASIA';
export type ArchiveStatus = 'AKTIF' | 'INAKTIF' | 'PERMANEN' | 'DIMUSNAHKAN';
export type RoleCode = 'SUPER_ADMIN' | 'ADMIN_ARSIP' | 'ADMIN_UNIT' | 'PIMPINAN' | 'PEGAWAI';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  nip: string;
  job_title: string;
  unit_id: number | null;
  unit_name?: string;
  unit_code?: string;
  role_id: number;
  role_code: RoleCode;
  role_name: string;
  status: 'ACTIVE' | 'INACTIVE';
  last_login: string | null;
  created_at: string;
}

export interface Unit {
  id: number;
  code: string;
  name: string;
  leader_name: string;
  leader_nip: string;
  description: string;
  is_active: number; // 1 or 0
  display_order: number;
  archive_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ArchiveCategory {
  id: number;
  code: string;
  name: string;
  description: string;
  unit_id: number | null; // null means universal/all units
  unit_name?: string;
  unit_code?: string;
  is_active: number;
  archive_count?: number;
  created_at: string;
}

export interface Archive {
  id: number;
  archive_code: string;
  unit_id: number;
  unit_name?: string;
  unit_code?: string;
  category_id: number;
  category_name?: string;
  category_code?: string;
  document_number: string;
  document_title: string;
  document_date: string;
  year: number;
  subject: string;
  origin: string;
  destination: string;
  description: string;
  keywords: string;
  security_level: SecurityLevel;
  status: ArchiveStatus;
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  created_by: number;
  creator_name?: string;
  created_at: string;
  updated_at: string;
  is_favorite?: boolean;
}

export interface ArchiveAttachment {
  id: number;
  archive_id: number;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
  description: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  user_name: string;
  action: string;
  module: string;
  record_id: string | null;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface DashboardStats {
  totalArchives: number;
  archivesThisYear: number;
  incomingLetters: number;
  outgoingLetters: number;
  totalUnits: number;
  documentsThisMonth: number;
  newDocsCount: number;
  unprocessedLettersCount: number;
  todayActivitiesCount: number;
  monthlyStats: {
    month: string;
    archives: number;
    suratMasuk: number;
    suratKeluar: number;
  }[];
  unitDistribution: {
    unitId: number;
    unitCode: string;
    unitName: string;
    count: number;
  }[];
  categoryDistribution: {
    categoryName: string;
    count: number;
  }[];
}
