export type NotificationType = 'email' | 'whatsapp';

export type NotificationStatus = 'sent' | 'failed' | 'pending';

export type NotificationChannel = 'resend' | 'meta';

export interface NotificationTemplate {
  _id: string;
  name: string;
  subject?: string;
  body: string;
  type: NotificationType;
  channel: NotificationChannel;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationHistory {
  _id: string;
  type: NotificationType;
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  body: string;
  status: NotificationStatus;
  errorMessage?: string;
  orderId?: string;
  userId?: string;
  sentAt: string;
  createdAt: string;
}

export interface NotificationSettings {
  _id: string;
  orderPending: boolean;
  orderProcessing: boolean;
  orderShipped: boolean;
  orderDelivered: boolean;
  orderCancelled: boolean;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  resendApiKey?: string;
  metaAccessToken?: string;
  metaPhoneNumberId?: string;
  metaWhatsAppBusinessId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendNotificationDto {
  type: NotificationType;
  recipient: string;
  subject?: string;
  body: string;
  orderId?: string;
  userId?: string;
  templateId?: string;
}

export interface CreateTemplateDto {
  name: string;
  subject?: string;
  body: string;
  type: NotificationType;
  channel: NotificationChannel;
  variables: string[];
  isActive?: boolean;
}

export interface UpdateTemplateDto {
  name?: string;
  subject?: string;
  body?: string;
  isActive?: boolean;
}

export interface NotificationStats {
  totalSent: number;
  totalFailed: number;
  emailSent: number;
  whatsappSent: number;
  todaySent: number;
}
