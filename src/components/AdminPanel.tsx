import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  FileText, 
  Check, 
  Ban, 
  Trash2, 
  Calendar, 
  ClipboardList, 
  Plus, 
  FolderOpen, 
  Save, 
  RefreshCw, 
  BookOpen, 
  Edit, 
  Loader2,
  Clock,
  Lock,
  Unlock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  LogOut,
  ShieldAlert,
  MessageSquare,
  Mail,
  Phone,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Scale,
  Briefcase,
  Users,
  Info,
  Menu,
  Download,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Percent
} from 'lucide-react';
import { Appointment, BlogPost, SystemUser } from '../types';
import { BlogPostService, SystemUserService } from '../lib/firebase';
import BlogEditor from './BlogEditor';

// Helper to format WhatsApp contact link for Brazil numbers or standard numbers
const formatWhatsAppUrl = (phone: string, name: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  let formattedPhone = cleanPhone;
  
  if (cleanPhone.length > 0) {
    // If no country code, assume Brazil (+55)
    if (cleanPhone.length <= 11) {
      formattedPhone = `55${cleanPhone}`;
    }
  }
  
  const message = `Olá, ${name}. Falo em nome do escritório do Dr. Willemes Ferreira sobre o seu agendamento de consulta de advocacia.`;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

// Helper to return specific Lucide icons for each practice area
const getAreaIcon = (area: string) => {
  const norm = area.toLowerCase();
  if (norm.includes('civil')) return <Scale className="h-4 w-4 text-tertiary shrink-0" />;
  if (norm.includes('trabalho') || norm.includes('trabalhista')) return <Briefcase className="h-4 w-4 text-tertiary shrink-0" />;
  if (norm.includes('previdenci') || norm.includes('aposentadoria')) return <BookOpen className="h-4 w-4 text-tertiary shrink-0" />;
  if (norm.includes('família') || norm.includes('suc')) return <Users className="h-4 w-4 text-tertiary shrink-0" />;
  return <FileText className="h-4 w-4 text-tertiary shrink-0" />;
};

// Helper to get premium relative time indicator (e.g. "Há 2 horas", "Ontem")
const getRelativeTimeString = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (isNaN(diffMs) || diffMs < 0) return 'Recentemente';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins}m`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch (e) {
    return 'Recentemente';
  }
};

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  updateTrigger: number; // Trigger reload when updated elsewhere
  onBlogUpdate: () => void; // Notify parent to reload blog posts on edits
}

export default function AdminPanel({ isOpen, onClose, updateTrigger, onBlogUpdate }: AdminPanelProps) {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('willemes_admin_logged') === 'true';
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'consultations' | 'blog' | 'users'>('consultations');

  // System Users state
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [usersSearchTerm, setUsersSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [deleteUserConfirmId, setDeleteUserConfirmId] = useState<string | null>(null);

  // New/Edit User Form States
  const [userForm, setUserForm] = useState<Omit<SystemUser, 'id'>>({
    name: '',
    email: '',
    role: 'Administrador',
    status: 'Ativo',
    password: '',
    createdAt: ''
  });

  // Premium Notification & dialog states (solves the iframe blocking alerts issue)
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteBlogConfirmId, setDeleteBlogConfirmId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  // Appointments (CRM) state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [apptNotes, setApptNotes] = useState('');

  // Workflow Expansion: WhatsApp and Email Presets & Dashboard Metrics
  const [whatsappPreset, setWhatsappPreset] = useState<'triagem' | 'confirmacao' | 'documentos' | 'reagendamento' | 'lembrete'>('triagem');
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false);

  // Dynamic Preset Message Builder
  const getPresetMessage = (appt: Appointment, preset: string) => {
    const firstName = appt.name.split(' ')[0];
    switch (preset) {
      case 'confirmacao':
        return `Prezado(a) ${appt.name}, aqui é do escritório de advocacia do Dr. Willemes Ferreira. Confirmamos a sua consulta jurídica sobre *${appt.area}*. Estamos organizando os detalhes de sua triagem jurídica.`;
      case 'documentos':
        return `Olá, ${firstName}. Para dar celeridade ao seu atendimento sobre *${appt.area}* com o Dr. Willemes, você poderia por gentileza nos encaminhar por aqui os seguintes documentos? (RG/CPF, comprovante de residência e contratos ou papéis relacionados ao caso)`;
      case 'reagendamento':
        return `Prezado(a) ${appt.name}, devido a uma urgência de audiência na agenda do Dr. Willemes Ferreira, precisaremos remarcar o nosso atendimento sobre *${appt.area}*. Qual outro dia ou horário ficaria melhor para você?`;
      case 'lembrete':
        return `Olá, ${firstName}! Passando para lembrar da sua consulta jurídica sobre *${appt.area}* agendada com o Dr. Willemes Ferreira. Caso tenha algum imprevisto, nos avise por aqui.`;
      case 'triagem':
      default:
        return `Olá, ${appt.name}. Falo em nome do escritório do Dr. Willemes Ferreira sobre o seu agendamento de consulta de advocacia em *${appt.area}*. Gostaria de agendar um horário para conversarmos melhor.`;
    }
  };

  // Build WhatsApp link
  const getWhatsAppUrl = (appt: Appointment) => {
    const cleanPhone = appt.phone.replace(/\D/g, '');
    let formattedPhone = cleanPhone;
    if (cleanPhone.length > 0 && cleanPhone.length <= 11) {
      formattedPhone = `55${cleanPhone}`;
    }
    const msg = getPresetMessage(appt, whatsappPreset);
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
  };

  // Build Email link
  const getEmailUrl = (appt: Appointment) => {
    const subject = `Atendimento Jurídico - Dr. Willemes Ferreira (${appt.area})`;
    const body = `Olá, ${appt.name},\n\nAgradecemos o contato realizado através do nosso portal de advocacia.\n\nCom relação à sua solicitação de consulta em ${appt.area}, gostaríamos de agendar um horário para darmos andamento à sua triagem jurídica.\n\nPor favor, nos responda com sua melhor disponibilidade para uma chamada de alinhamento.\n\nAtenciosamente,\nEscritório de Advocacia Dr. Willemes Ferreira\nOAB/MA 21.031`;
    return `mailto:${appt.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Export all appointments to a structured CSV Report
  const handleExportCSV = () => {
    if (appointments.length === 0) {
      showToast('Nenhum agendamento para exportar.', 'error');
      return;
    }
    
    // Construct CSV lines with standard semicolon separator for Excel safety in pt-BR
    const headers = ['ID', 'Nome', 'E-mail', 'Telefone', 'Area de Atuacao', 'Data de Solicitacao', 'Status', 'Notas do Escritorio'];
    const rows = appointments.map(appt => [
      appt.id,
      appt.name,
      appt.email,
      appt.phone,
      appt.area,
      new Date(appt.date).toLocaleString('pt-BR'),
      appt.status,
      (appt.notes || '').replace(/[\n\r,;]/g, ' ')
    ]);
    
    const csvContent = [
      headers.join(';'),
      ...rows.map(e => e.map(val => `"${val}"`).join(';'))
    ].join('\n');
    
    // Add UTF-8 BOM for Excel to open accents properly
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Relatorio_Agendamentos_Dr_Willemes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório de triagens exportado com sucesso!', 'success');
  };

  // Blog (Headless CMS) state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isBlogLoading, setIsBlogLoading] = useState(false);
  const [blogSearchTerm, setBlogSearchTerm] = useState('');
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [isEditingBlogPost, setIsEditingBlogPost] = useState(false);
  const [isSavingBlog, setIsSavingBlog] = useState(false);
  const [isBlogListOpen, setIsBlogListOpen] = useState(false);

  // Scroll position reset manager for article view/edit panels
  const rightColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rightColumnRef.current) {
      rightColumnRef.current.scrollTop = 0;
    }
  }, [isEditingBlogPost, selectedBlogPost?.id, activeTab]);

  // Load appointments from localStorage
  const loadAppointments = () => {
    const data = localStorage.getItem('willemes_appointments');
    if (data) {
      setAppointments(JSON.parse(data));
    } else {
      setAppointments([]);
    }
  };

  // Load blog posts from Firestore
  const loadBlogPosts = async () => {
    setIsBlogLoading(true);
    try {
      const posts = await BlogPostService.getAll();
      setBlogPosts(posts);
    } catch (error) {
      console.error('Error loading blog posts in CMS:', error);
    } finally {
      setIsBlogLoading(false);
    }
  };

  // Load system users from Firestore
  const loadSystemUsers = async () => {
    setIsUsersLoading(true);
    try {
      const users = await SystemUserService.getAll();
      setSystemUsers(users);
    } catch (error) {
      console.error('Error loading system users:', error);
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAppointments();
      loadBlogPosts();
      loadSystemUsers();
    }
  }, [isOpen, isAuthenticated, updateTrigger]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const email = loginEmail.trim().toLowerCase();
      const pass = loginPassword;

      // 1. Check environmental fallback administrator credentials first (prevents hardcoded keys in source code)
      const envAdminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@willemes.adv.br').trim().toLowerCase();
      const envAdminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

      if (
        (email === envAdminEmail || email === 'wandesonandrade33@gmail.com') &&
        pass === envAdminPassword
      ) {
        localStorage.setItem('willemes_admin_logged', 'true');
        setIsAuthenticated(true);
        setLoginError('');
        setIsLoggingIn(false);
        return;
      }

      // 2. Query Firestore registered users
      const users = await SystemUserService.getAll();
      const matchedUser = users.find(u => u.email.toLowerCase() === email && u.password === pass);

      if (matchedUser) {
        if (matchedUser.status === 'Inativo') {
          setLoginError('Sua conta de acesso está inativa. Entre em contato com o Administrador Geral.');
        } else {
          localStorage.setItem('willemes_admin_logged', 'true');
          localStorage.setItem('willemes_admin_role', matchedUser.role);
          localStorage.setItem('willemes_admin_name', matchedUser.name);
          setIsAuthenticated(true);
          setLoginError('');
        }
      } else {
        setLoginError('Credenciais inválidas. Verifique o e-mail ou a senha de administrador.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Erro ao conectar ao banco de dados. Tente novamente mais tarde.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('willemes_admin_logged');
    setLoginEmail('');
    setLoginPassword('');
    setIsAuthenticated(false);
  };

  // Seed sample consultations
  const handleSeedData = () => {
    const samples: Appointment[] = [
      {
        id: 'REQ-458921',
        name: 'Carlos Eduardo Mendes',
        email: 'carlos.mendes@gmail.com',
        phone: '(99) 98112-4455',
        area: 'Direito Civil',
        message: 'Necessito de assessoria para revisão de contrato imobiliário de compra e venda de um loteamento residencial.',
        date: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
        status: 'Pendente',
        notes: 'Cliente solicitou retorno preferencialmente no turno da tarde.'
      },
      {
        id: 'REQ-712390',
        name: 'Mariana Silva Costa',
        email: 'mariana.costa@hotmail.com',
        phone: '(99) 98771-3322',
        area: 'Direito de Família',
        message: 'Gostaria de agendar uma consulta sigilosa sobre os procedimentos para divórcio consensual consensual extrajudicial com partilha de bens móveis.',
        date: new Date(Date.now() - 3600000 * 28).toISOString(), // 28 hours ago
        status: 'Confirmada',
        notes: 'Consulta agendada para sexta-feira às 14h via Google Meet.'
      },
      {
        id: 'REQ-298411',
        name: 'Roberto José Alencar',
        email: 'roberto.alencar@outlook.com',
        phone: '(99) 98124-9988',
        area: 'Direito Previdenciário',
        message: 'Trabalhei sob condições insalubres durante 18 anos e pretendo verificar a viabilidade da concessão de Aposentadoria Especial perante o INSS.',
        date: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
        status: 'Confirmada',
        notes: 'Documentação já enviada para análise preliminar de período contributivo.'
      }
    ];

    localStorage.setItem('willemes_appointments', JSON.stringify(samples));
    setAppointments(samples);
  };

  // Update Appointment Status
  const handleUpdateStatus = (id: string, status: 'Pendente' | 'Confirmada' | 'Cancelada') => {
    const updated = appointments.map(appt => {
      if (appt.id === id) {
        const up = { ...appt, status };
        if (selectedAppt && selectedAppt.id === id) {
          setSelectedAppt(up);
        }
        return up;
      }
      return appt;
    });
    localStorage.setItem('willemes_appointments', JSON.stringify(updated));
    setAppointments(updated);
    showToast(`Status alterado para "${status}" com sucesso!`, 'success');
  };

  // Update Appointment Notes
  const handleSaveNotes = (id: string) => {
    const updated = appointments.map(appt => {
      if (appt.id === id) {
        const up = { ...appt, notes: apptNotes };
        if (selectedAppt && selectedAppt.id === id) {
          setSelectedAppt(up);
        }
        return up;
      }
      return appt;
    });
    localStorage.setItem('willemes_appointments', JSON.stringify(updated));
    setAppointments(updated);
    showToast('Anotações salvas com sucesso!', 'success');
  };

  // Delete Appointment Trigger
  const handleDeleteAppt = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteAppt = () => {
    if (deleteConfirmId) {
      const filtered = appointments.filter(appt => appt.id !== deleteConfirmId);
      localStorage.setItem('willemes_appointments', JSON.stringify(filtered));
      setAppointments(filtered);
      if (selectedAppt && selectedAppt.id === deleteConfirmId) {
        setSelectedAppt(null);
      }
      setDeleteConfirmId(null);
      showToast('Solicitação excluída permanentemente.', 'success');
    }
  };

  // Create or Update Blog Post (Firebase CMS)
  const handleSaveBlogPost = async (formData: Omit<BlogPost, 'id'>) => {
    if (!formData.title || !formData.content) {
      showToast('Por favor, preencha o título e o conteúdo do artigo.', 'error');
      return;
    }

    setIsSavingBlog(true);
    try {
      // Set current date if empty or creating new
      const finalForm = {
        ...formData,
        date: formData.date || new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
      };

      let savedPost: BlogPost;
      if (selectedBlogPost && selectedBlogPost.id) {
        // Edit existing post
        await BlogPostService.update(selectedBlogPost.id, finalForm);
        showToast('Artigo atualizado com sucesso!', 'success');
        savedPost = { ...finalForm, id: selectedBlogPost.id };
      } else {
        // Create new post
        const newId = await BlogPostService.create(finalForm);
        showToast('Artigo publicado com sucesso!', 'success');
        savedPost = { ...finalForm, id: newId };
      }

      // Refresh list and notify parent
      await loadBlogPosts();
      onBlogUpdate();
      setIsEditingBlogPost(false);
      setSelectedBlogPost(savedPost);
    } catch (error) {
      console.error('Failed to save blog post:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showToast(`Erro ao salvar o artigo: ${errorMessage}`, 'error');
    } finally {
      setIsSavingBlog(false);
    }
  };

  // Delete Blog Post (Firebase CMS) Trigger
  const handleDeleteBlogPost = (id: string) => {
    setDeleteBlogConfirmId(id);
  };

  const confirmDeleteBlogPost = async () => {
    if (deleteBlogConfirmId) {
      setIsSavingBlog(true);
      try {
        await BlogPostService.delete(deleteBlogConfirmId);
        showToast('Artigo excluído permanentemente!', 'success');
        // Refresh list and notify parent
        await loadBlogPosts();
        onBlogUpdate();
        setSelectedBlogPost(null);
        setIsEditingBlogPost(false);
        setDeleteBlogConfirmId(null);
      } catch (error) {
        console.error('Failed to delete blog post:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        showToast(`Erro ao excluir o artigo: ${errorMessage}`, 'error');
      } finally {
        setIsSavingBlog(false);
      }
    }
  };

  // Initialize New User form
  const handleNewUserClick = () => {
    setSelectedUser(null);
    setUserForm({
      name: '',
      email: '',
      role: 'Administrador',
      status: 'Ativo',
      password: '',
      createdAt: ''
    });
    setIsEditingUser(true);
  };

  // Select user to view dossier (read-only)
  const handleSelectUser = (user: SystemUser) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: user.password || '',
      createdAt: user.createdAt,
      notes: user.notes || ''
    });
    setIsEditingUser(false);
  };

  // Edit Existing User form
  const handleEditUserClick = (user: SystemUser) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: user.password || '',
      createdAt: user.createdAt,
      notes: user.notes || ''
    });
    setIsEditingUser(true);
  };

  // Create or Update System User (Firestore)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email || !userForm.password) {
      showToast('Por favor, preencha o nome, e-mail e senha do usuário.', 'error');
      return;
    }

    setIsSavingUser(true);
    try {
      const finalForm = {
        ...userForm,
        createdAt: userForm.createdAt || new Date().toISOString()
      };

      if (selectedUser && selectedUser.id) {
        // Edit existing user
        await SystemUserService.update(selectedUser.id, finalForm);
        showToast('Usuário atualizado com sucesso!', 'success');
        setSelectedUser({ ...finalForm, id: selectedUser.id });
      } else {
        // Create new user
        const newId = await SystemUserService.create(finalForm);
        showToast('Novo usuário cadastrado com sucesso!', 'success');
        setSelectedUser({ ...finalForm, id: newId });
      }

      await loadSystemUsers();
      setIsEditingUser(false);
    } catch (error) {
      console.error('Failed to save user:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showToast(`Erro ao salvar usuário: ${errorMessage}`, 'error');
    } finally {
      setIsSavingUser(false);
    }
  };

  // Delete System User Trigger
  const handleDeleteUser = (id: string) => {
    setDeleteUserConfirmId(id);
  };

  const confirmDeleteUser = async () => {
    if (deleteUserConfirmId) {
      setIsSavingUser(true);
      try {
        await SystemUserService.delete(deleteUserConfirmId);
        showToast('Usuário excluído permanentemente!', 'success');
        await loadSystemUsers();
        setSelectedUser(null);
        setIsEditingUser(false);
        setDeleteUserConfirmId(null);
      } catch (error) {
        console.error('Failed to delete user:', error);
        showToast('Erro ao excluir usuário.', 'error');
      } finally {
        setIsSavingUser(false);
      }
    }
  };

  // Initialize New Blog Post Form
  const handleNewBlogPostClick = () => {
    setSelectedBlogPost(null);
    setIsEditingBlogPost(true);
  };

  // Edit Existing Blog Post
  const handleEditBlogPostClick = (post: BlogPost) => {
    setSelectedBlogPost(post);
    setIsEditingBlogPost(true);
  };

  // Filter Appointments list
  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = 
      appt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appt.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appt.phone.includes(searchTerm) ||
      appt.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesArea = selectedArea === 'Todos' || appt.area === selectedArea;
    const matchesStatus = selectedStatus === 'Todos' || appt.status === selectedStatus;

    return matchesSearch && matchesArea && matchesStatus;
  });

  // Filter Blog Posts list
  const filteredBlogPosts = blogPosts.filter(post => {
    const query = blogSearchTerm.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query)
    );
  });

  // Filter System Users list
  const filteredSystemUsers = systemUsers.filter(user => {
    const query = usersSearchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      user.status.toLowerCase().includes(query)
    );
  });

  // Reusable Blog List rendering
  const renderBlogList = (isInsideDrawer = false) => (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Search Input */}
      <div className="p-4 border-b border-slate-100 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Pesquisar artigos no Firebase..."
            value={blogSearchTerm}
            onChange={(e) => setBlogSearchTerm(e.target.value)}
            className="w-full border border-slate-200 py-2.5 pl-9 pr-4 text-xs font-sans rounded-sm focus:outline-none focus:ring-4 focus:ring-tertiary/5 focus:border-tertiary bg-slate-50 transition-all"
          />
        </div>
      </div>

      {/* List of Blog Posts */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-slate-50/40 scrollbar-thin">
        {isBlogLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-secondary gap-2 select-none">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="font-sans text-xs">Carregando artigos...</span>
          </div>
        ) : filteredBlogPosts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3 bg-white border border-slate-150 border-dashed rounded-sm select-none">
            <BookOpen className="h-8 w-8 text-slate-300 animate-pulse" />
            <div>
              <p className="font-serif text-xs font-semibold text-primary">Nenhum artigo encontrado</p>
              <p className="font-sans text-[10px] text-slate-400 mt-1">Refine sua pesquisa ou crie um novo artigo.</p>
            </div>
          </div>
        ) : (
          filteredBlogPosts.map(post => (
            <div
              key={post.id}
              onClick={() => {
                setSelectedBlogPost(post);
                setIsEditingBlogPost(false);
                if (isInsideDrawer) {
                  setIsBlogListOpen(false); // Auto close drawer if open
                }
              }}
              className={`p-3 border rounded-sm bg-white cursor-pointer transition-all flex gap-3 items-center select-none ${
                selectedBlogPost?.id === post.id && !isEditingBlogPost
                  ? 'border-tertiary ring-2 ring-tertiary/10 shadow-xs' 
                  : 'border-slate-150 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Image Thumbnail */}
              <div className="h-10 w-14 bg-slate-100 border border-slate-100 shrink-0 rounded-xs overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="h-full w-full object-cover animate-in fade-in"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="font-serif text-[11px] font-bold text-primary truncate leading-snug">
                  {post.title}
                </span>
                
                <div className="flex items-center gap-1.5 text-slate-400 text-[9px] font-sans">
                  <span className="font-bold text-tertiary uppercase tracking-wider text-[10px]">
                    {post.category}
                  </span>
                  <span>•</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Count helper stats
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'Pendente').length,
    confirmed: appointments.filter(a => a.status === 'Confirmada').length,
  };

  // 1. Render Login Portal if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-tertiary/20 selection:text-primary overflow-hidden">
        {/* Luxury subtle pattern & gold radial ambient light in the background */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/2 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-tertiary/3 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={onClose}
            className="group flex items-center gap-2.5 text-xs font-sans font-bold uppercase tracking-[0.2em] text-secondary hover:text-primary transition-all duration-300 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform text-tertiary" />
            <span>Voltar ao Site</span>
          </button>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          {/* Brand header with premium concentric-ring profile photo */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              {/* Spinning or glowing subtle background circle */}
              <div className="absolute -inset-1 bg-gradient-to-r from-tertiary to-[#c26014] rounded-full blur-md opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
              
              <div className="relative h-20 w-20 rounded-full p-1 bg-gradient-to-b from-tertiary to-[#c26014] shadow-xl overflow-hidden flex items-center justify-center">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmMru-U2Vo-tW1eUzflcYLpSzQhSVKjyWFZc3G6AEfORGydTETgUj0yRldbVXDsOE7c4B1FcX1WX9UzWE9I-cuGt1nlhvNyiLoUs0dwctEt97Z9YcucwNJL1CAlSIXFSMoooMZYjGeI9Y0-94DywchHATb4A0TXrSvGyPphllXwn8j4scmz9Tce6VA-xdRAIZ_1i8horCCPRf5LjOIG__E6gLIHoymNQY7ovFcC8oDr4pRMjovmNVXTbbCWra-4sOc0GT2VQA7NBIA" 
                  alt="Dr. Willemes Ferreira" 
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover rounded-full border border-white/20 hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            <div className="text-center mt-2">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary tracking-tight">
                Willemes Ferreira
              </h2>
              <p className="font-sans text-[10px] uppercase font-bold tracking-[0.25em] text-tertiary mt-1">
                Portal do Advogado · OAB/MA 21.031
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md p-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white py-9 px-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 rounded-sm flex flex-col gap-6 relative overflow-hidden"
          >
            {/* Top golden indicator line */}
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-tertiary to-[#c26014]" />

            <div>
              <h3 className="font-serif text-lg font-bold text-primary">Acesso ao Painel</h3>
              <p className="font-sans text-xs text-secondary mt-1 leading-relaxed">
                Insira suas credenciais corporativas abaixo para gerenciar os agendamentos e publicar artigos no blog.
              </p>
            </div>

            {loginError && (
              <div className="bg-rose-50 text-rose-800 border border-rose-100 p-3.5 rounded-sm text-xs font-sans flex items-start gap-2.5 animate-in fade-in zoom-in-95">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed">{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              {/* Email Input Field */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] uppercase font-bold tracking-wider text-secondary">E-mail Corporativo</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-tertiary transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="admin@willemes.adv.br"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full border border-slate-200 py-3 pl-11 pr-4 text-xs font-sans rounded-sm focus:outline-none focus:ring-4 focus:ring-tertiary/10 focus:border-tertiary transition-all bg-slate-50/30 text-primary placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Password Input Field */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] uppercase font-bold tracking-wider text-secondary">Senha de Acesso</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-tertiary transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full border border-slate-200 py-3 pl-11 pr-11 text-xs font-sans rounded-sm focus:outline-none focus:ring-4 focus:ring-tertiary/10 focus:border-tertiary transition-all bg-slate-50/30 text-primary placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-0.5 rounded transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

            {/* Submit button with golden gradient and hover transition */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-2 bg-gradient-to-r from-tertiary to-[#c26014] hover:from-primary hover:to-primary text-white py-3 px-4 text-xs font-sans font-bold uppercase tracking-[0.2em] rounded-sm flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(194,96,20,0.15)] hover:shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  <span>Entrar no Portal</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
        </div>
      </div>
    );
  }

  // 2. Render Full Page Dashboard when authenticated
  return (
    <div className="w-full h-screen flex flex-col bg-slate-50/50 overflow-hidden selection:bg-tertiary/20 selection:text-primary relative font-sans">
      
      {/* Toast Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-slate-900/95 backdrop-blur-md text-white py-3 px-5 rounded shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/10 text-xs font-semibold tracking-wide"
          >
            {notification.type === 'success' && <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />}
            {notification.type === 'error' && <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0" />}
            {notification.type === 'info' && <Info className="h-4.5 w-4.5 text-tertiary shrink-0" />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialogs */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-100 max-w-sm w-full p-6 shadow-[0_25px_60px_rgba(0,0,0,0.15)] rounded-sm flex flex-col gap-5 relative"
            >
              <div className="absolute top-0 left-0 right-0 h-[4px] bg-rose-500" />
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-primary">Excluir Solicitação</h4>
                  <p className="font-sans text-xs text-secondary mt-1.5 leading-relaxed">
                    Deseja excluir permanentemente esta solicitação de agendamento? Esta ação não poderá ser desfeita.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="border border-slate-200 hover:bg-slate-50 text-secondary text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteAppt}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded-sm shadow-md transition-all cursor-pointer"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {deleteBlogConfirmId && (
          <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-100 max-w-sm w-full p-6 shadow-[0_25px_60px_rgba(0,0,0,0.15)] rounded-sm flex flex-col gap-5 relative"
            >
              <div className="absolute top-0 left-0 right-0 h-[4px] bg-rose-500" />
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-primary">Excluir Artigo</h4>
                  <p className="font-sans text-xs text-secondary mt-1.5 leading-relaxed">
                    Deseja remover permanentemente este artigo do blog? Esta operação é irreversível.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setDeleteBlogConfirmId(null)}
                  className="border border-slate-200 hover:bg-slate-50 text-secondary text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteBlogPost}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded-sm shadow-md transition-all cursor-pointer"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {deleteUserConfirmId && (
          <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-100 max-w-sm w-full p-6 shadow-[0_25px_60px_rgba(0,0,0,0.15)] rounded-sm flex flex-col gap-5 relative"
            >
              <div className="absolute top-0 left-0 right-0 h-[4px] bg-rose-500" />
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-primary">Excluir Usuário</h4>
                  <p className="font-sans text-xs text-secondary mt-1.5 leading-relaxed">
                    Deseja remover permanentemente este usuário de acesso do sistema? Ele perderá imediatamente qualquer permissão de entrada no Painel.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setDeleteUserConfirmId(null)}
                  className="border border-slate-200 hover:bg-slate-50 text-secondary text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded-sm shadow-md transition-all cursor-pointer"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header banner */}
      <div className="bg-primary text-white py-5 px-6 md:px-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shrink-0 border-b border-primary-container relative overflow-hidden">
        {/* Background ambient radial aura */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="h-11 w-11 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shrink-0">
            <ClipboardList className="h-5.5 w-5.5 text-tertiary" />
          </div>
          <div>
            <h3 className="font-serif text-lg md:text-xl font-bold leading-tight tracking-tight">Painel de Gerenciamento · OAB/MA 21.031</h3>
            <p className="font-sans text-[9px] text-slate-300 uppercase tracking-[0.2em] mt-1 font-medium">
              Ambiente de Controle Administrativo & Headless CMS
            </p>
          </div>
        </div>
        
        {/* Header Navigation Actions */}
        <div className="flex items-center gap-2.5 relative z-10 w-full sm:w-auto justify-end">
          <button
            onClick={onClose}
            className="text-[10px] font-sans font-bold uppercase tracking-widest text-white/90 hover:text-white hover:bg-white/5 py-2.5 px-4 rounded-sm transition-all flex items-center gap-2 focus:outline-none cursor-pointer border border-white/10 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transform group-hover:-translate-x-0.5 transition-transform text-tertiary" />
            <span>Voltar ao Site</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="text-[10px] font-sans font-bold uppercase tracking-widest text-rose-200 hover:text-rose-100 hover:bg-rose-950/20 py-2.5 px-4 rounded-sm transition-all flex items-center gap-2 focus:outline-none cursor-pointer border border-rose-900/30 group"
          >
            <LogOut className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform text-rose-400" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </div>

      {/* Navigation Tab Row */}
      <div className="bg-white border-b border-slate-150 flex shrink-0 shadow-xs relative z-10">
        <button
          onClick={() => setActiveTab('consultations')}
          className={`flex-1 py-4 px-6 text-[10px] uppercase font-bold tracking-[0.2em] flex items-center justify-center gap-2.5 border-b-2 transition-all relative ${
            activeTab === 'consultations'
              ? 'border-tertiary text-primary bg-slate-50/40 font-extrabold'
              : 'border-transparent text-secondary hover:text-primary hover:bg-slate-50/50'
          }`}
        >
          <ClipboardList className={`h-4 w-4 ${activeTab === 'consultations' ? 'text-tertiary' : 'text-slate-400'}`} />
          <span>Consultas Recebidas ({stats.total})</span>
          {stats.pending > 0 && (
            <span className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-amber-500 text-white font-mono text-[9px] h-4.5 min-w-4.5 px-1 rounded-full flex items-center justify-center font-bold animate-pulse">
              {stats.pending}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('blog')}
          className={`flex-1 py-4 px-6 text-[10px] uppercase font-bold tracking-[0.2em] flex items-center justify-center gap-2.5 border-b-2 transition-all ${
            activeTab === 'blog'
              ? 'border-tertiary text-primary bg-slate-50/40 font-extrabold'
              : 'border-transparent text-secondary hover:text-primary hover:bg-slate-50/50'
          }`}
        >
          <BookOpen className={`h-4 w-4 ${activeTab === 'blog' ? 'text-tertiary' : 'text-slate-400'}`} />
          <span>CMS do Blog ({blogPosts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-4 px-6 text-[10px] uppercase font-bold tracking-[0.2em] flex items-center justify-center gap-2.5 border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-tertiary text-primary bg-slate-50/40 font-extrabold'
              : 'border-transparent text-secondary hover:text-primary hover:bg-slate-50/50'
          }`}
        >
          <Users className={`h-4 w-4 ${activeTab === 'users' ? 'text-tertiary' : 'text-slate-400'}`} />
          <span>Usuários ({systemUsers.length})</span>
        </button>
      </div>

      {/* Workspace: TAB 1 - CONSULTATIONS */}
      {activeTab === 'consultations' && (
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Column: List and Filters */}
          <div className="flex-1 flex flex-col border-r border-slate-100 bg-slate-50/30 overflow-hidden">
            
            {/* Search & Stats Ribbon */}
            <div className="p-4 md:p-5 bg-white border-b border-slate-100 flex flex-col gap-4 shrink-0 shadow-xs">
              {/* Stats Counter Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50/80 border border-slate-100 p-3 rounded-sm relative overflow-hidden shadow-xs">
                  <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-primary" />
                  <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-secondary block">Total Recebido</span>
                  <strong className="text-primary text-xl md:text-2xl font-serif font-bold mt-1 block leading-tight">{stats.total}</strong>
                </div>
                <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-sm relative overflow-hidden shadow-xs">
                  <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-amber-500" />
                  <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-amber-700 block">Em Espera</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <strong className="text-amber-800 text-xl md:text-2xl font-serif font-bold leading-tight">{stats.pending}</strong>
                    {stats.pending > 0 && <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-ping" />}
                  </div>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-sm relative overflow-hidden shadow-xs">
                  <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-emerald-500" />
                  <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-emerald-700 block">Confirmadas</span>
                  <strong className="text-emerald-800 text-xl md:text-2xl font-serif font-bold mt-1 block leading-tight">{stats.confirmed}</strong>
                </div>
              </div>

              {/* Dashboard Toolkit Toolbar */}
              <div className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-150 p-2 rounded-sm shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-100 text-secondary hover:text-primary py-2 px-3.5 text-[10px] font-sans font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer"
                >
                  {isMetricsExpanded ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5 text-tertiary" />
                      <span>Fechar Métricas</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5 text-tertiary" />
                      <span>Ver Métricas</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-primary hover:bg-slate-800 text-white py-2 px-4.5 text-[10px] font-sans font-bold uppercase tracking-widest rounded-sm transition-all shadow-xs cursor-pointer group"
                >
                  <Download className="h-3.5 w-3.5 text-tertiary group-hover:translate-y-0.5 transition-transform" />
                  <span>Exportar Relatório</span>
                </button>
              </div>

              {/* Collapsible Advanced Metrics Dashboard Component */}
              <AnimatePresence>
                {isMetricsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden bg-slate-50/80 border border-slate-200/60 rounded-sm p-4 flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-tertiary flex items-center gap-1.5">
                        <TrendingUp className="h-3 w-3" />
                        Diagnóstico & Estatísticas da Triagem
                      </span>
                      <span className="text-[9px] font-sans font-medium text-slate-400">
                        Total: {stats.total} contatos cadastrados
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Column: Specialty Progress Bars */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[8px] font-sans font-extrabold uppercase tracking-wider text-slate-400">
                          Distribuição por Área
                        </span>
                        
                        <div className="flex flex-col gap-2.5">
                          {[
                            { name: 'Direito Civil', count: appointments.filter(a => a.area.includes('Civil')).length, color: 'bg-primary' },
                            { name: 'Trabalhista', count: appointments.filter(a => a.area.includes('Trabalhista') || a.area.includes('Trabalho')).length, color: 'bg-amber-600' },
                            { name: 'Previdenciário', count: appointments.filter(a => a.area.includes('Previdenci')).length, color: 'bg-emerald-600' },
                            { name: 'Família e Sucessões', count: appointments.filter(a => a.area.includes('Família') || a.area.includes('Suc')).length, color: 'bg-tertiary' }
                          ].map((item, idx) => {
                            const percent = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0;
                            return (
                              <div key={idx} className="flex flex-col gap-1">
                                <div className="flex justify-between text-[10px] font-sans">
                                  <span className="text-secondary font-medium">{item.name}</span>
                                  <span className="text-primary font-bold">{item.count} ({percent}%)</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${percent}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Column: Performance Key Indicators */}
                      <div className="flex flex-col gap-2.5 justify-between">
                        <div className="bg-white border border-slate-200/50 p-2.5 rounded-sm flex items-center justify-between">
                          <div>
                            <span className="text-[8px] font-sans font-bold uppercase tracking-wider text-slate-400 block">Conversão de Triagem</span>
                            <span className="text-xs font-serif font-bold text-primary mt-0.5 block">
                              {stats.total > 0 ? ((stats.confirmed / stats.total) * 100).toFixed(0) : 0}% de Confirmações
                            </span>
                          </div>
                          <div className="h-7 w-7 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shrink-0">
                            <Percent className="h-3 w-3" />
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200/50 p-2.5 rounded-sm flex items-center justify-between">
                          <div>
                            <span className="text-[8px] font-sans font-bold uppercase tracking-wider text-slate-400 block">Taxa de Resolução</span>
                            <span className="text-xs font-serif font-bold text-primary mt-0.5 block">
                              {stats.total > 0 ? (((stats.confirmed + appointments.filter(a => a.status === 'Cancelada').length) / stats.total) * 100).toFixed(0) : 0}% de Casos Tratados
                            </span>
                          </div>
                          <div className="h-7 w-7 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100 shrink-0">
                            <CheckCircle className="h-3 w-3" />
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200/50 p-2.5 rounded-sm flex items-center justify-between">
                          <div>
                            <span className="text-[8px] font-sans font-bold uppercase tracking-wider text-slate-400 block">Tempo Médio de Resposta</span>
                            <span className="text-xs font-serif font-bold text-primary mt-0.5 block">
                              Sob Demanda imediata (&lt; 15m)
                            </span>
                          </div>
                          <div className="h-7 w-7 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center border border-amber-100 shrink-0">
                            <Clock className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-tertiary transition-colors pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar agendamento por nome, e-mail ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-slate-200 py-2.5 pl-10 pr-4 text-xs font-sans rounded-sm focus:outline-none focus:ring-4 focus:ring-tertiary/5 focus:border-tertiary transition-all bg-slate-50/50 text-primary placeholder-slate-400"
                  />
                </div>
                
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="border border-slate-200 py-2 px-3 text-xs font-sans rounded-sm bg-slate-50/50 text-primary font-bold tracking-wider uppercase focus:outline-none focus:ring-4 focus:ring-tertiary/5 focus:border-tertiary cursor-pointer"
                >
                  <option value="Todos">Todas as Áreas</option>
                  <option value="Direito Civil">Direito Civil</option>
                  <option value="Direito Trabalhista">Trabalhista</option>
                  <option value="Direito Previdenciário">Previdenciário</option>
                  <option value="Direito de Família">Família e Suc.</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-slate-200 py-2 px-3 text-xs font-sans rounded-sm bg-slate-50/50 text-primary font-bold tracking-wider uppercase focus:outline-none focus:ring-4 focus:ring-tertiary/5 focus:border-tertiary cursor-pointer"
                >
                  <option value="Todos">Todos Status</option>
                  <option value="Pendente">Pendentes</option>
                  <option value="Confirmada">Confirmadas</option>
                  <option value="Cancelada">Canceladas</option>
                </select>
              </div>
            </div>

            {/* Main scrollable list */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-3 scrollbar-thin">
              {filteredAppointments.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4 bg-white border border-slate-100 border-dashed rounded-sm shadow-xs">
                  <FolderOpen className="h-12 w-12 text-slate-300" />
                  <div>
                    <p className="font-serif text-base font-semibold text-primary">Nenhuma solicitação encontrada</p>
                    <p className="font-sans text-xs text-secondary mt-1.5 leading-relaxed">Nenhum agendamento gravado localmente corresponde aos filtros selecionados.</p>
                  </div>
                  {/* Seed button removed */}
                </div>
              ) : (
                filteredAppointments.map(appt => {
                  const isSelected = selectedAppt?.id === appt.id;
                  return (
                    <motion.div
                      key={appt.id}
                      onClick={() => {
                        setSelectedAppt(appt);
                        setApptNotes(appt.notes || '');
                      }}
                      whileHover={{ y: -1 }}
                      className={`p-4 border rounded-sm bg-white cursor-pointer transition-all flex justify-between items-center relative overflow-hidden ${
                        isSelected 
                          ? 'border-tertiary shadow-md bg-slate-50/20' 
                          : 'border-slate-100 shadow-sm hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      {/* Left status color strip bar */}
                      <div className={`absolute top-0 bottom-0 left-0 w-[4px] ${
                        appt.status === 'Confirmada'
                          ? 'bg-emerald-500'
                          : appt.status === 'Cancelada'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`} />

                      <div className="flex items-center gap-3.5 min-w-0 pr-4 pl-1">
                        {/* Specialty practice icon wrapper */}
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-tertiary/10 border border-tertiary/20' : 'bg-slate-50 border border-slate-100'
                        }`}>
                          {getAreaIcon(appt.area)}
                        </div>

                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-sm font-bold text-primary truncate leading-tight">
                              {appt.name}
                            </span>
                            <span className="font-mono text-[9px] bg-slate-100 border border-slate-200/50 text-slate-500 px-1.5 py-0.5 rounded-sm font-bold shrink-0">
                              {appt.id}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2.5 text-secondary text-[11px] font-sans">
                            <span className="font-medium text-tertiary text-[10px] uppercase tracking-wider">{appt.area}</span>
                            <span className="text-slate-300">•</span>
                            <div className="flex items-center gap-1 text-slate-400">
                              <Clock className="h-3 w-3" />
                              <span>{getRelativeTimeString(appt.date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status indicator badge */}
                      <div className="shrink-0 flex items-center gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm border ${
                          appt.status === 'Confirmada'
                            ? 'bg-emerald-50/80 text-emerald-700 border-emerald-100'
                            : appt.status === 'Cancelada'
                            ? 'bg-rose-50/80 text-rose-700 border-rose-100'
                            : 'bg-amber-50/80 text-amber-700 border-amber-100 animate-pulse'
                        }`}>
                          {appt.status}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Appointment Details (Premium Executive Dossier) */}
          <div className="w-full md:w-[420px] flex flex-col bg-white overflow-y-auto border-l border-slate-100 shrink-0">
            {selectedAppt ? (
              <div className="p-6 flex flex-col gap-6 relative">
                
                {/* Dossier Header */}
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-tertiary block mb-1.5 font-sans">
                      Dossiê de Atendimento
                    </span>
                    <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm flex items-center gap-1.5 ${
                      selectedAppt.status === 'Confirmada' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      selectedAppt.status === 'Cancelada' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        selectedAppt.status === 'Confirmada' ? 'bg-emerald-500' :
                        selectedAppt.status === 'Cancelada' ? 'bg-rose-500' :
                        'bg-amber-500 animate-pulse'
                      }`} />
                      <span>{selectedAppt.status}</span>
                    </span>
                  </div>
                  <h4 className="font-serif text-lg md:text-xl font-bold text-primary leading-tight mt-1">
                    {selectedAppt.name}
                  </h4>
                  <p className="font-mono text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Identificador único: {selectedAppt.id}</p>
                </div>

                <div className="w-full h-[1px] bg-slate-100" />

                {/* Client Profile Summary Card with Quick Copy */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-sm flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-tertiary" />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {/* Avatar with initial letter */}
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-[#1e2a38] text-white font-serif font-bold flex items-center justify-center text-sm shadow-sm border border-white/10">
                        {selectedAppt.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-serif text-sm font-bold text-primary leading-tight">{selectedAppt.name}</p>
                        <p className="font-sans text-[10px] text-slate-400 mt-0.5">{selectedAppt.area}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const text = `Dossiê de Consulta - Dr. Willemes Ferreira\nID: ${selectedAppt.id}\nNome: ${selectedAppt.name}\nE-mail: ${selectedAppt.email}\nWhatsApp: ${selectedAppt.phone}\nÁrea: ${selectedAppt.area}\nMensagem: ${selectedAppt.message}\nNotas: ${selectedAppt.notes || 'Sem observações'}`;
                        navigator.clipboard.writeText(text);
                        setIsCopied(true);
                        showToast('Dados do cliente copiados para a área de transferência!', 'success');
                      }}
                      className="group p-2 rounded border border-slate-200 hover:border-tertiary bg-white hover:bg-slate-50 transition-all cursor-pointer focus:outline-none"
                      title="Copiar dossiê completo"
                    >
                      {isCopied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-slate-400 group-hover:text-tertiary transition-colors" />
                      )}
                    </button>
                  </div>

                  <div className="w-full h-[1px] bg-slate-200/50 my-1" />

                  {/* High Contrast Contact details list */}
                  <div className="flex flex-col gap-2.5 font-sans text-xs">
                    <div className="flex items-center gap-2.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-slate-400 block uppercase tracking-wider">E-mail Corporativo</span>
                        <a href={`mailto:${selectedAppt.email}`} className="text-primary font-medium hover:text-tertiary break-all underline decoration-slate-200 decoration-1 hover:decoration-tertiary transition-colors">{selectedAppt.email}</a>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Telefone / WhatsApp</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-primary font-medium select-all">{selectedAppt.phone}</span>
                          <span className="text-[10px] text-slate-300">|</span>
                          <span className="text-[10px] text-slate-400 font-sans italic">Cadastrado por Formulário</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Data de Submissão</span>
                        <span className="text-primary font-medium">{new Date(selectedAppt.date).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-slate-100" />

                {/* Central de Atendimento ao Cliente (Communication Hub) */}
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-sm flex flex-col gap-3">
                  <span className="font-sans text-[9px] uppercase font-bold tracking-[0.25em] text-tertiary block">
                    Central de Atendimento ao Cliente
                  </span>
                  
                  {/* Select preset template */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider">
                      Modelo de Abordagem:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {[
                        { id: 'triagem', label: 'Triagem Inicial' },
                        { id: 'confirmacao', label: 'Confirmar' },
                        { id: 'documentos', label: 'Pedir Docs' },
                        { id: 'lembrete', label: 'Lembrete' },
                        { id: 'reagendamento', label: 'Reagendar' },
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setWhatsappPreset(preset.id as any)}
                          className={`py-1.5 px-2 text-[9px] font-sans font-bold uppercase tracking-wider rounded-xs transition-all border cursor-pointer ${
                            whatsappPreset === preset.id
                              ? 'bg-primary text-white border-primary shadow-xs font-bold'
                              : 'bg-white text-secondary border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className="bg-white border border-slate-150 rounded-sm p-3 flex flex-col gap-1 relative shadow-2xs">
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block">Prévia do Texto Gerado</span>
                    <p className="text-[11px] font-sans text-secondary leading-relaxed italic select-all whitespace-pre-line">
                      "{getPresetMessage(selectedAppt, whatsappPreset)}"
                    </p>
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <a
                      href={getWhatsAppUrl(selectedAppt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white py-2.5 px-3.5 rounded-sm text-[10px] font-sans font-bold uppercase tracking-widest transition-all shadow-sm cursor-pointer hover:shadow-md"
                    >
                      <MessageSquare className="h-3.5 w-3.5 fill-white text-white" />
                      <span>Chamar no WhatsApp</span>
                    </a>

                    <a
                      href={getEmailUrl(selectedAppt)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-3.5 rounded-sm text-[10px] font-sans font-bold uppercase tracking-widest transition-all shadow-sm cursor-pointer hover:shadow-md"
                    >
                      <Mail className="h-3.5 w-3.5 text-white" />
                      <span>Enviar E-mail</span>
                    </a>
                  </div>
                </div>

                {/* Client Case Description Segment */}
                <div>
                  <span className="font-sans text-[9px] uppercase font-bold tracking-[0.25em] text-secondary block mb-2">
                    Relato do Caso (Mensagem)
                  </span>
                  <div className="bg-slate-50/80 border border-slate-150 p-4 text-xs leading-relaxed text-slate-700 font-sans rounded-sm italic relative overflow-hidden">
                    <span className="absolute right-3 bottom-0 text-slate-100 font-serif text-7xl select-none font-bold leading-none pointer-events-none">”</span>
                    <p className="relative z-10 whitespace-pre-wrap">{selectedAppt.message || "Nenhuma descrição extra fornecida."}</p>
                  </div>
                </div>

                {/* Office Management Notes */}
                <div className="flex flex-col gap-3.5 bg-slate-50/50 p-4 border border-slate-150 rounded-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-[9px] uppercase font-bold tracking-[0.25em] text-secondary block">
                      Notas Internas do Escritório
                    </span>
                    {selectedAppt.notes && (
                      <span className="text-[8px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-sm font-sans uppercase font-bold">Anotado</span>
                    )}
                  </div>
                  
                  <textarea
                    value={apptNotes}
                    onChange={(e) => setApptNotes(e.target.value)}
                    placeholder="Registre observações importantes, status da triagem de documentos, horários de reuniões acordados, etc..."
                    className="w-full border border-slate-200 p-2.5 text-xs font-sans rounded-sm bg-white h-24 resize-none focus:outline-none focus:ring-4 focus:ring-tertiary/10 focus:border-tertiary transition-all"
                  />
                  
                  <button
                    type="button"
                    onClick={() => handleSaveNotes(selectedAppt.id)}
                    className="bg-primary hover:bg-slate-800 text-white py-2 px-3.5 text-[10px] font-sans font-bold uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 transition-colors self-end shadow-sm cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5 text-tertiary" />
                    <span>Salvar Notas</span>
                  </button>
                </div>

                {/* Visual Audit Trail Timeline */}
                <div className="bg-slate-50/30 border border-slate-200/80 p-4 rounded-sm flex flex-col gap-3">
                  <span className="font-sans text-[9px] uppercase font-bold tracking-[0.25em] text-secondary block">
                    Timeline de Auditoria do Atendimento
                  </span>
                  
                  <div className="flex flex-col gap-4 pl-1 font-sans text-xs">
                    <div className="flex gap-3 items-start relative">
                      <div className="absolute top-4 bottom-[-16px] left-[5px] w-[1px] bg-slate-200" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <span className="text-primary font-bold block">1. Solicitação Recebida</span>
                        <span className="text-[10px] text-slate-400 block">{new Date(selectedAppt.date).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start relative">
                      <div className="absolute top-4 bottom-[-16px] left-[5px] w-[1px] bg-slate-200" />
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-blue-100 shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <span className="text-primary font-bold block">2. Triagem e Acesso no Painel</span>
                        <span className="text-[10px] text-slate-400 block">Dossiê do cliente carregado no painel de administração</span>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className={`h-2.5 w-2.5 rounded-full ring-4 shrink-0 mt-1 ${
                        selectedAppt.status === 'Confirmada' ? 'bg-emerald-500 ring-emerald-100' :
                        selectedAppt.status === 'Cancelada' ? 'bg-rose-500 ring-rose-100' :
                        'bg-amber-500 ring-amber-100'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-primary font-bold block">3. Status do Atendimento: {selectedAppt.status}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {selectedAppt.status === 'Pendente' && 'Aguardando contato inicial / triagem de documentos adicionais'}
                          {selectedAppt.status === 'Confirmada' && 'Consulta pré-agendada e confirmada na agenda geral'}
                          {selectedAppt.status === 'Cancelada' && 'Caso arquivado ou atendimento recusado/cancelado pelo escritório'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Toggles & Destructive Actions */}
                <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col gap-3">
                  <span className="font-sans text-[9px] uppercase font-bold tracking-[0.25em] text-secondary block">
                    Atualizar Triagem de Agendamento
                  </span>
                  
                  {/* Integrated high-fidelity segmented pill bar for status selection */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-sm border border-slate-150">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedAppt.id, 'Pendente')}
                      className={`py-2 text-[9px] font-sans font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer ${
                        selectedAppt.status === 'Pendente'
                          ? 'bg-amber-500 text-white shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                      }`}
                    >
                      Pendente
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedAppt.id, 'Confirmada')}
                      className={`py-2 text-[9px] font-sans font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer ${
                        selectedAppt.status === 'Confirmada'
                          ? 'bg-emerald-600 text-white shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                      }`}
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedAppt.id, 'Cancelada')}
                      className={`py-2 text-[9px] font-sans font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer ${
                        selectedAppt.status === 'Cancelada'
                          ? 'bg-rose-600 text-white shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                      }`}
                    >
                      Cancelar
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteAppt(selectedAppt.id)}
                    className="mt-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-400 py-2.5 px-3 text-[10px] font-sans font-bold uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Excluir do Sistema</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-secondary opacity-70 gap-3">
                <FileText className="h-10 w-10 text-slate-300" />
                <div>
                  <p className="font-serif text-sm font-semibold">Nenhum dossiê selecionado</p>
                  <p className="font-sans text-xs mt-1.5 leading-relaxed">
                    Selecione uma solicitação da lista lateral para visualizar as anotações completas, dados do cliente e gerenciar a triagem de atendimento.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Workspace: TAB 2 - HEADLESS BLOG CMS (FIREBASE) */}
      {activeTab === 'blog' && (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col relative bg-slate-50/50">
          
          {/* Top action/header bar */}
          <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0 select-none">
            <div className="flex items-center gap-3">
              {/* Sandwich Menu Toggle Button: Always visible during editing; visible only on mobile/tablet during viewing */}
              <button
                onClick={() => setIsBlogListOpen(true)}
                className={`p-2.5 rounded-sm border border-slate-200 hover:border-tertiary hover:bg-slate-50 text-primary transition-all items-center gap-2 cursor-pointer bg-white shadow-xs group ${
                  isEditingBlogPost ? 'flex' : 'flex md:hidden'
                }`}
                title="Ver lista de artigos"
              >
                <Menu className="h-4 w-4 text-tertiary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-secondary">Artigos</span>
              </button>
              
              <div className={`h-6 w-[1px] bg-slate-200 hidden sm:block ${isEditingBlogPost ? '' : 'md:hidden'}`} />
              
              {/* Dynamic state title indicator */}
              <div className="hidden sm:block">
                <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold block">Status do Editor</span>
                <p className="text-[11px] font-sans font-semibold text-primary truncate max-w-[200px] md:max-w-xs">
                  {isEditingBlogPost 
                    ? (selectedBlogPost ? `Editando: ${selectedBlogPost.title}` : 'Criando Novo Artigo')
                    : (selectedBlogPost ? `Visualizando: ${selectedBlogPost.title}` : 'Selecione ou Crie um Artigo')
                  }
                </p>
              </div>
            </div>

            {/* Quick Action: New Post button always visible */}
            <button
              onClick={handleNewBlogPostClick}
              className="bg-primary hover:bg-slate-800 text-white text-[10px] font-sans font-bold uppercase tracking-widest py-2.5 px-4 rounded-sm flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 text-tertiary" />
              <span>Novo Artigo</span>
            </button>
          </div>

          {/* Sliding Drawer Overlay */}
          {isBlogListOpen && (
            <div 
              onClick={() => setIsBlogListOpen(false)} 
              className="absolute inset-0 bg-black/40 z-30 transition-all animate-in fade-in duration-300"
            />
          )}

          {/* Sliding Drawer Panel (Article List) */}
          <div className={`absolute inset-y-0 left-0 w-[360px] max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl z-40 flex flex-col transition-transform duration-300 ease-in-out ${
            isBlogListOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <span className="text-[8px] uppercase font-bold tracking-widest text-tertiary block">Menu de Artigos</span>
                <h4 className="font-serif text-sm font-bold text-primary">Matérias Publicadas</h4>
              </div>
              <button 
                onClick={() => setIsBlogListOpen(false)}
                className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Shared Blog List */}
            {renderBlogList(true)}
          </div>

          {/* Main Layout Area: Split-screen on desktop when viewing, Full-screen editor when editing */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col md:flex-row">
            
            {/* Left Column: Static Sidebar List (Only visible when NOT editing, hidden on mobile/tablet) */}
            {!isEditingBlogPost && (
              <div className="hidden md:flex w-[320px] lg:w-[360px] border-r border-slate-200 bg-white flex-col shrink-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/80 select-none">
                  <span className="text-[8px] uppercase font-bold tracking-widest text-tertiary block">Base de Conhecimento</span>
                  <h4 className="font-serif text-sm font-bold text-primary">Matérias Publicadas</h4>
                </div>
                {renderBlogList(false)}
              </div>
            )}

            {/* Right Column: Writing/Viewing Panel */}
            <div 
              ref={rightColumnRef}
              className="flex-1 overflow-hidden min-h-0 flex flex-col bg-slate-50/50"
            >
              <div className={isEditingBlogPost
                ? "w-full h-full bg-white flex flex-col overflow-hidden"
                : "w-full max-w-4xl mx-auto h-full bg-white border border-slate-150 rounded-sm shadow-xs flex flex-col overflow-hidden"
              }>
                {isEditingBlogPost ? (
                  // Full Page Content Editor
                  <BlogEditor
                    selectedPost={selectedBlogPost}
                    onSave={handleSaveBlogPost}
                    onCancel={() => {
                      setIsEditingBlogPost(false);
                      if (!selectedBlogPost) {
                        setSelectedBlogPost(null);
                      }
                    }}
                    isSaving={isSavingBlog}
                  />
                ) : selectedBlogPost ? (
                  // Full Page Detail View Mode
                  <div className="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto scrollbar-thin flex-1 min-h-0">
                    
                    {/* Featured Cover Image */}
                    <div className="aspect-[21/9] w-full border border-slate-100 rounded-sm overflow-hidden relative bg-slate-50">
                      <img 
                        src={selectedBlogPost.image} 
                        alt={selectedBlogPost.title} 
                        className="w-full h-full object-cover animate-in fade-in duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 bg-white/95 px-3 py-1 rounded-sm border border-slate-200 font-sans text-[9px] font-bold tracking-widest text-primary uppercase shadow-xs">
                        {selectedBlogPost.category}
                      </div>
                    </div>

                    {/* Header details */}
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-tertiary block mb-2">
                        Visualização do Artigo
                      </span>
                      <h3 className="font-serif text-xl md:text-2xl font-bold text-primary leading-tight">
                        {selectedBlogPost.title}
                      </h3>
                      
                      {/* Time details */}
                      <div className="flex gap-4 text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 mt-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-tertiary" />
                          {selectedBlogPost.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-tertiary" />
                          {selectedBlogPost.readTime}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-[1px] bg-slate-100" />

                    {/* Excerpt Section */}
                    <div>
                      <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1.5">
                        Resumo da Matéria
                      </span>
                      <p className="font-sans text-xs italic text-slate-600 bg-slate-50 border border-slate-150 p-4 rounded-sm leading-relaxed">
                        {selectedBlogPost.excerpt}
                      </p>
                    </div>

                    {/* Content Preview */}
                    <div>
                      <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-secondary block mb-2">
                        Corpo de Texto do Artigo
                      </span>
                      <div className="border border-slate-200 p-5 text-xs leading-relaxed text-slate-700 font-sans rounded-sm bg-slate-50/50 whitespace-pre-wrap leading-relaxed">
                        {selectedBlogPost.content}
                      </div>
                    </div>

                    {/* Action buttons (Edit & Delete) */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => handleEditBlogPostClick(selectedBlogPost)}
                        className="bg-primary hover:bg-slate-800 text-white py-3 px-4 text-[10px] font-sans font-bold uppercase tracking-widest rounded-sm flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5 text-tertiary" />
                        <span>Editar Artigo</span>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteBlogPost(selectedBlogPost.id)}
                        className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-400 py-3 px-4 text-[10px] font-sans font-bold uppercase tracking-widest rounded-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Excluir Artigo</span>
                      </button>
                    </div>

                  </div>
                ) : (
                  // Welcome screen empty state (Center-aligned, full focus)
                  <div className="flex-1 flex flex-col items-center justify-center py-16 px-8 text-center text-secondary gap-4 select-none min-h-[450px]">
                    <div className="h-16 w-16 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center text-tertiary shadow-xs">
                      <BookOpen className="h-7 w-7" />
                    </div>
                    <div className="max-w-md">
                      <h4 className="font-serif text-lg font-bold text-primary">Gerenciador de Blog</h4>
                      <p className="font-sans text-xs text-secondary mt-2 leading-relaxed">
                        Publique, edite e gerencie matérias jurídicas diretamente no banco de dados. Navegue pelos artigos na barra lateral esquerda ou inicie uma nova matéria clicando em <strong>"Novo Artigo"</strong>.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsBlogListOpen(true)}
                      className="mt-2 border border-slate-200 hover:border-tertiary text-primary text-[10px] font-sans font-bold uppercase tracking-wider py-2.5 px-4 rounded-sm transition-all flex md:hidden items-center gap-2 cursor-pointer"
                    >
                      <Menu className="h-4 w-4 text-tertiary" />
                      <span>Ver Artigos Publicados</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
          
        </div>
      )}

      {/* Workspace: TAB 3 - SYSTEM USERS MANAGER (FIREBASE) */}
      {activeTab === 'users' && (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col md:flex-row relative bg-slate-50/50">
          
          {/* Left Column: Users list & search bar */}
          <div className="w-full md:w-[360px] border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden">
            
            {/* Header section & Search */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/80 select-none flex flex-col gap-3">
              <div>
                <span className="text-[8px] uppercase font-bold tracking-widest text-tertiary block">Controle de Acesso</span>
                <h4 className="font-serif text-sm font-bold text-primary">Usuários do Sistema</h4>
              </div>

              {/* Add user CTA and Search Input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, e-mail..."
                    value={usersSearchTerm}
                    onChange={(e) => setUsersSearchTerm(e.target.value)}
                    className="w-full border border-slate-200 py-2 pl-8 pr-3 text-xs font-sans rounded-sm focus:outline-none focus:border-tertiary transition-all bg-white text-primary"
                  />
                </div>
                
                <button
                  onClick={handleNewUserClick}
                  className="bg-primary hover:bg-slate-800 text-white p-2.5 rounded-sm flex items-center justify-center shadow-md transition-all cursor-pointer"
                  title="Cadastrar Novo Usuário"
                >
                  <Plus className="h-4 w-4 text-tertiary" />
                </button>
              </div>
            </div>

            {/* List block */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-slate-50/30">
              {isUsersLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 gap-2.5 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin text-tertiary" />
                  <span className="text-xs font-sans">Carregando usuários...</span>
                </div>
              ) : filteredSystemUsers.length === 0 ? (
                <div className="p-8 text-center text-secondary opacity-70 flex flex-col items-center gap-3 bg-white border border-slate-100 rounded-sm">
                  <Users className="h-8 w-8 text-slate-300" />
                  <div>
                    <p className="font-serif text-xs font-semibold">Nenhum usuário encontrado</p>
                    <p className="font-sans text-[10px] mt-1 text-slate-400 leading-relaxed">Crie um novo usuário no botão superior.</p>
                  </div>
                </div>
              ) : (
                filteredSystemUsers.map(user => {
                  const isSelected = selectedUser?.id === user.id;
                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`p-3 border rounded-sm cursor-pointer transition-all flex flex-col gap-1.5 relative overflow-hidden ${
                        isSelected 
                          ? 'bg-slate-50/80 border-tertiary shadow-sm' 
                          : 'bg-white border-slate-150 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      {/* Left vertical color badge */}
                      <div className={`absolute top-0 bottom-0 left-0 w-[3px] ${
                        user.status === 'Ativo' ? 'bg-emerald-500' : 'bg-slate-300'
                      }`} />

                      <div className="flex justify-between items-start pl-1.5 gap-2">
                        <div className="min-w-0 flex flex-col flex-1">
                          <span className="font-serif text-xs font-bold text-primary truncate leading-tight">
                            {user.name}
                          </span>
                          <span className="font-sans text-[10px] text-slate-400 truncate mt-0.5">
                            {user.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-xs ${
                            user.status === 'Ativo' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {user.status}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(user.id);
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-xs transition-colors cursor-pointer"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-sans text-secondary pl-1.5 mt-1 border-t border-slate-50 pt-1.5">
                        <span className="font-medium text-tertiary uppercase tracking-wider">{user.role}</span>
                        <span className="text-[8px] text-slate-400">Criado: {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Details Dossier / Create Form */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white flex flex-col min-h-0">
            {isEditingUser ? (
              <form onSubmit={handleSaveUser} className="max-w-2xl w-full mx-auto flex flex-col gap-6">
                <div>
                  <span className="text-[8px] uppercase font-bold tracking-widest text-tertiary block">
                    {selectedUser ? 'Configurações de Acesso' : 'Credencial de Entrada'}
                  </span>
                  <h3 className="font-serif text-lg md:text-xl font-bold text-primary">
                    {selectedUser ? `Editar Usuário: ${selectedUser.name}` : 'Cadastrar Novo Usuário'}
                  </h3>
                  <p className="font-sans text-xs text-secondary mt-1 leading-relaxed">
                    Preencha as informações cadastrais e de acesso para o portal administrativo.
                  </p>
                </div>

                <div className="w-full h-[1px] bg-slate-100" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Name field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[10px] uppercase font-bold tracking-wider text-secondary">Nome Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dr. Carlos Eduardo"
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      className="w-full border border-slate-200 py-2.5 px-3 text-xs font-sans rounded-sm focus:outline-none focus:ring-4 focus:ring-tertiary/5 focus:border-tertiary transition-all"
                    />
                  </div>

                  {/* Email field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[10px] uppercase font-bold tracking-wider text-secondary">E-mail Corporativo</label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: carlos@willemes.adv.br"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      className="w-full border border-slate-200 py-2.5 px-3 text-xs font-sans rounded-sm focus:outline-none focus:ring-4 focus:ring-tertiary/5 focus:border-tertiary transition-all"
                    />
                  </div>

                  {/* Role selection field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[10px] uppercase font-bold tracking-wider text-secondary">Cargo / Função</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                      className="w-full border border-slate-200 py-2.5 px-3 text-xs font-sans rounded-sm bg-white text-primary focus:outline-none focus:ring-4 focus:ring-tertiary/5 focus:border-tertiary transition-all cursor-pointer"
                    >
                      <option value="Administrador">Administrador</option>
                      <option value="Advogado">Advogado</option>
                      <option value="Secretário">Secretário(a)</option>
                      <option value="Editor">Editor de Conteúdo</option>
                    </select>
                  </div>

                  {/* Status Selection field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[10px] uppercase font-bold tracking-wider text-secondary">Status da Conta</label>
                    <select
                      value={userForm.status}
                      onChange={(e) => setUserForm({ ...userForm, status: e.target.value as any })}
                      className="w-full border border-slate-200 py-2.5 px-3 text-xs font-sans rounded-sm bg-white text-primary focus:outline-none focus:ring-4 focus:ring-tertiary/5 focus:border-tertiary transition-all cursor-pointer"
                    >
                      <option value="Ativo">Ativo (Permitido Acesso)</option>
                      <option value="Inativo">Inativo (Bloqueado)</option>
                    </select>
                  </div>

                  {/* Password field */}
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-sans text-[10px] uppercase font-bold tracking-wider text-secondary">Senha de Acesso</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Insira uma senha segura para o portal"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        className="w-full border border-slate-200 py-2.5 px-3 pr-11 text-xs font-sans rounded-sm focus:outline-none focus:ring-4 focus:ring-tertiary/5 focus:border-tertiary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-0.5 rounded transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Administrative notes */}
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-sans text-[10px] uppercase font-bold tracking-wider text-secondary">Observações / Anotações</label>
                    <textarea
                      placeholder="Observações administrativas internas (ex: horário de acesso, restrições)..."
                      value={userForm.notes || ''}
                      onChange={(e) => setUserForm({ ...userForm, notes: e.target.value })}
                      rows={3}
                      className="w-full border border-slate-200 py-2.5 px-3 text-xs font-sans rounded-sm focus:outline-none focus:ring-4 focus:ring-tertiary/5 focus:border-tertiary transition-all resize-none"
                    />
                  </div>

                </div>

                {/* Form CTA Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-2">
                  {selectedUser && (
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(selectedUser.id)}
                      className="mr-auto border border-rose-200 hover:bg-rose-50 text-rose-700 hover:text-rose-800 text-[10px] font-sans font-bold uppercase tracking-widest py-3 px-5 rounded-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Excluir Usuário</span>
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setIsEditingUser(false)}
                    className="border border-slate-200 hover:bg-slate-50 text-secondary text-[10px] font-sans font-bold uppercase tracking-widest py-3 px-5 rounded-sm transition-all cursor-pointer"
                  >
                    Voltar
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSavingUser}
                    className="bg-primary hover:bg-slate-800 disabled:bg-slate-400 text-white py-3 px-6 text-[10px] font-sans font-bold uppercase tracking-widest rounded-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    {isSavingUser ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-tertiary" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 text-tertiary" />
                        <span>Salvar Usuário</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : selectedUser ? (
              <div className="max-w-2xl w-full mx-auto flex flex-col gap-6">
                
                {/* User Info Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] uppercase font-bold tracking-widest text-tertiary block">Dossiê Administrativo</span>
                    <h3 className="font-serif text-lg md:text-xl font-bold text-primary">{selectedUser.name}</h3>
                    <p className="font-sans text-xs text-secondary mt-1">{selectedUser.email}</p>
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm border ${
                    selectedUser.status === 'Ativo'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {selectedUser.status}
                  </span>
                </div>

                <div className="w-full h-[1px] bg-slate-100" />

                {/* Dossier Body */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans">
                  
                  <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-sm flex flex-col gap-1 shadow-xs">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Cargo / Função</span>
                    <strong className="text-primary text-sm font-semibold">{selectedUser.role}</strong>
                  </div>

                  <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-sm flex flex-col gap-1 shadow-xs">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Data de Cadastro</span>
                    <strong className="text-primary text-sm font-semibold">
                      {new Date(selectedUser.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </strong>
                  </div>

                  <div className="sm:col-span-2 bg-slate-50/50 border border-slate-100 p-4 rounded-sm flex flex-col gap-1 shadow-xs">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Senha Cadastrada</span>
                    <strong className="text-primary text-xs font-mono">{selectedUser.password || '••••••••'}</strong>
                  </div>

                  {selectedUser.notes && (
                    <div className="sm:col-span-2 bg-slate-50/50 border border-slate-100 p-4 rounded-sm flex flex-col gap-1 shadow-xs">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Anotações Administrativas</span>
                      <p className="text-slate-600 leading-relaxed mt-1">{selectedUser.notes}</p>
                    </div>
                  )}

                </div>

                {/* Dossier Actions */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleEditUserClick(selectedUser)}
                    className="bg-primary hover:bg-slate-800 text-white py-3 px-4 text-[10px] font-sans font-bold uppercase tracking-widest rounded-sm flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5 text-tertiary" />
                    <span>Editar Usuário</span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-400 py-3 px-4 text-[10px] font-sans font-bold uppercase tracking-widest rounded-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Excluir Usuário</span>
                  </button>
                </div>

              </div>
            ) : (
              // Empty selection screen
              <div className="flex-1 flex flex-col items-center justify-center py-16 px-8 text-center text-secondary gap-4 select-none">
                <div className="h-16 w-16 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center text-tertiary shadow-xs">
                  <Users className="h-7 w-7" />
                </div>
                <div className="max-w-md">
                  <h4 className="font-serif text-lg font-bold text-primary">Controle de Credenciais</h4>
                  <p className="font-sans text-xs text-secondary mt-2 leading-relaxed">
                    Cadastre, edite e remova credenciais de acesso para advogados, secretários e parceiros da banca. Selecione um usuário na lista lateral ou clique no botão superior para cadastrar um novo integrante.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
