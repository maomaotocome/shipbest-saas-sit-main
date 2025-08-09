export interface Notification {
  id?: string;
  type: string;
  priority: number;
  scheduledAt?: string | Date;
  expiresAt?: string | Date;
  targetUserType: string;
  translations?: Translation[];
  userStatuses?: { userId: string }[];
}

export interface Translation {
  locale: string;
  title: string;
  content: string;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
}

export interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
  notification?: Notification;
}

export interface UsersResponse {
  data: User[];
  total: number;
  totalPages: number;
}
