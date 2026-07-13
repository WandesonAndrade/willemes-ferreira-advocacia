export interface BlogPost {
  id: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  readTime: string;
}

export interface PracticeArea {
  id: string;
  iconName: string;
  name: string;
  description: string;
  fullDetails: string;
  services: string[];
}

export interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  message: string;
  date: string; // ISO date string when booked
  status: 'Pendente' | 'Confirmada' | 'Cancelada';
  notes?: string;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Advogado' | 'Secretário' | 'Editor';
  status: 'Ativo' | 'Inativo';
  password?: string;
  createdAt: string;
  notes?: string;
}
