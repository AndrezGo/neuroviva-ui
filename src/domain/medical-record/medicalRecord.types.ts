/**
 * Domain types for the Medical Record feature.
 * Pure TypeScript — no imports from other layers.
 */

export interface ClinicalRecordAttachmentDto {
  id: string;
  fileName: string;
  contentType: string;
  signedUrl: string;
}

export interface ClinicalRecordDto {
  id: string;
  eventType: string;
  description: string;
  eventDate: string;
  createdAt: string;
  attachments: ClinicalRecordAttachmentDto[];
}

export interface UploadExamInput {
  description: string;
  eventDate?: string | null;
  attachments: File[];
}

export type ClinicalNoteEventType = 'consultation' | 'note' | 'other';

export interface UploadClinicalNoteInput {
  eventType: ClinicalNoteEventType;
  description: string;
  eventDate?: string | null;
  attachments: File[];
}

export interface UploadRecordResult {
  recordId: string;
}

export interface FollowUpEvent {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  eventDate: string;
  status?: string | null;
  attachmentUrl?: string | null;
  attachmentFileName?: string | null;
}
