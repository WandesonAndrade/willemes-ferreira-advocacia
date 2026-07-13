import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Phone, Mail, Check, Calendar, ClipboardCheck, ArrowRight, ShieldCheck, User, Briefcase, MessageSquare } from 'lucide-react';
import { Appointment } from '../types';

interface ContactProps {
  onNewAppointmentBooked: () => void;
}

export default function Contact({ onNewAppointmentBooked }: ContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    area: 'Selecione uma área...',
    message: ''
  });

  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || formData.area === 'Selecione uma área...') {
      alert('Por favor, preencha todos os campos obrigatórios e selecione a área de interesse.');
      return;
    }

    setIsSubmitting(true);

    // Simulate sending / processing network lag
    setTimeout(() => {
      const newAppointment: Appointment = {
        id: 'REQ-' + Math.floor(100000 + Math.random() * 900000),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        area: formData.area,
        message: formData.message,
        date: new Date().toISOString(),
        status: 'Pendente'
      };

      // Retrieve existing from localStorage
      const existing = localStorage.getItem('willemes_appointments');
      const appointmentsList: Appointment[] = existing ? JSON.parse(existing) : [];
      appointmentsList.unshift(newAppointment);
      localStorage.setItem('willemes_appointments', JSON.stringify(appointmentsList));

      setBookingSuccess(newAppointment);
      setIsSubmitting(false);
      onNewAppointmentBooked(); // Notify parent to update list
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        area: 'Selecione uma área...',
        message: ''
      });
    }, 1200);
  };

  return (
    <section id="contato" className="py-20 md:py-28 bg-slate-50/70 transition-all duration-700 relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-tertiary/2 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-80 h-80 bg-primary/2 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="mb-16">
          <span className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-tertiary block mb-3">
            Atendimento
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary">
            Iniciar Atendimento Especializado
          </h2>
          <div className="w-16 h-1 bg-tertiary mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          
          {/* Booking Form Card (left 7 cols on desktop) */}
          <div className="lg:col-span-7 bg-white p-8 md:p-10 border border-slate-100 rounded-sm shadow-[0_15px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between relative group overflow-hidden">
            {/* Top border highlight */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-tertiary to-[#c26014]" />

            <div>
              <h3 className="font-serif text-2xl font-bold text-primary mb-2">
                Agende uma Consulta
              </h3>
              <p className="font-sans text-xs md:text-sm text-secondary mb-8 leading-relaxed">
                Preencha os campos abaixo para iniciar seu atendimento preventivo ou contencioso. Retornaremos em até 24h úteis.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Full Name */}
                <div className="group flex flex-col gap-1.5">
                  <label htmlFor="form-name" className="block font-sans text-[10px] uppercase font-bold tracking-widest text-slate-500 group-focus-within:text-tertiary transition-colors duration-300">
                    Nome Completo <span className="text-tertiary">*</span>
                  </label>
                  <div className="relative rounded-sm overflow-hidden">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-tertiary transition-colors duration-300">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      id="form-name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ex: João Silva de Sousa"
                      className="w-full border border-slate-200 pl-11 pr-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-tertiary/10 focus:border-tertiary transition-all duration-300 bg-white font-sans text-sm rounded-sm text-primary placeholder:text-slate-400/70 hover:border-slate-300"
                    />
                  </div>
                </div>

                {/* Email and Phone Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="group flex flex-col gap-1.5">
                    <label htmlFor="form-email" className="block font-sans text-[10px] uppercase font-bold tracking-widest text-slate-500 group-focus-within:text-tertiary transition-colors duration-300">
                      E-mail <span className="text-tertiary">*</span>
                    </label>
                    <div className="relative rounded-sm overflow-hidden">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-tertiary transition-colors duration-300">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        id="form-email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Ex: joao@exemplo.com"
                        className="w-full border border-slate-200 pl-11 pr-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-tertiary/10 focus:border-tertiary transition-all duration-300 bg-white font-sans text-sm rounded-sm text-primary placeholder:text-slate-400/70 hover:border-slate-300"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="group flex flex-col gap-1.5">
                    <label htmlFor="form-phone" className="block font-sans text-[10px] uppercase font-bold tracking-widest text-slate-500 group-focus-within:text-tertiary transition-colors duration-300">
                      Telefone / WhatsApp <span className="text-tertiary">*</span>
                    </label>
                    <div className="relative rounded-sm overflow-hidden">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-tertiary transition-colors duration-300">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        id="form-phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Ex: (99) 98110-1886"
                        className="w-full border border-slate-200 pl-11 pr-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-tertiary/10 focus:border-tertiary transition-all duration-300 bg-white font-sans text-sm rounded-sm text-primary placeholder:text-slate-400/70 hover:border-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Area of Interest */}
                <div className="group flex flex-col gap-1.5">
                  <label htmlFor="form-area" className="block font-sans text-[10px] uppercase font-bold tracking-widest text-slate-500 group-focus-within:text-tertiary transition-colors duration-300">
                    Área de Interesse <span className="text-tertiary">*</span>
                  </label>
                  <div className="relative rounded-sm overflow-hidden">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-tertiary transition-colors duration-300">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <select
                      id="form-area"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      className="w-full border border-slate-200 pl-11 pr-10 py-3.5 focus:outline-none focus:ring-4 focus:ring-tertiary/10 focus:border-tertiary transition-all duration-300 bg-white font-sans text-sm rounded-sm text-primary font-medium cursor-pointer hover:border-slate-300 appearance-none"
                    >
                      <option disabled value="Selecione uma área...">Selecione uma área...</option>
                      <option value="Direito Civil">Direito Civil</option>
                      <option value="Direito Trabalhista">Direito Trabalhista</option>
                      <option value="Direito Previdenciário">Direito Previdenciário</option>
                      <option value="Direito de Família">Direito de Família e Sucessões</option>
                    </select>
                    {/* Select custom chevron arrow overlay */}
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-tertiary">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="group flex flex-col gap-1.5">
                  <label htmlFor="form-message" className="block font-sans text-[10px] uppercase font-bold tracking-widest text-slate-500 group-focus-within:text-tertiary transition-colors duration-300">
                    Resumo do caso ou Mensagem (Opcional)
                  </label>
                  <div className="relative rounded-sm overflow-hidden">
                    <div className="absolute top-3.5 left-3.5 flex items-start pointer-events-none text-slate-400 group-focus-within:text-tertiary transition-colors duration-300">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <textarea
                      id="form-message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Descreva brevemente sua necessidade para agilizarmos a análise..."
                      className="w-full border border-slate-200 pl-11 pr-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-tertiary/10 focus:border-tertiary transition-all duration-300 bg-white font-sans text-sm rounded-sm text-primary placeholder:text-slate-400/70 hover:border-slate-300 resize-none"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  id="btn-form-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-tertiary to-[#c26014] hover:from-primary hover:to-primary text-white py-4 font-sans text-xs uppercase font-bold tracking-widest rounded-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Enviar Solicitação de Consulta</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Details & Map (right 5 cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full gap-8">
            <div className="flex flex-col justify-center">
              <span className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-tertiary block mb-3">
                Informações de Contato
              </span>
              <h3 className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-8">
                Canais de Atendimento
              </h3>

              <div className="flex flex-col gap-5">
                {/* Address Bento Card */}
                <div className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.01)] hover:border-tertiary/30 transition-all duration-300 group">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-sm text-primary group-hover:bg-tertiary/10 group-hover:text-tertiary transition-all duration-300">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-sans text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
                      Endereço Presencial
                    </p>
                    <a 
                      href="https://www.google.com/maps/place/4%C2%B051'58.0%22S+43%C2%B021'02.7%22W/@-4.866111,-43.350750,17z"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-sm md:text-base text-primary font-medium leading-relaxed hover:text-tertiary transition-colors"
                    >
                      Avenida Jerusalém, 1766A - Nova Caxias
                      <br />
                      Caxias - MA, 65609-020
                    </a>
                  </div>
                </div>

                {/* Phone Bento Card */}
                <div className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.01)] hover:border-tertiary/30 transition-all duration-300 group">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-sm text-primary group-hover:bg-tertiary/10 group-hover:text-tertiary transition-all duration-300">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-sans text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
                      Telefone &amp; WhatsApp
                    </p>
                    <a 
                      href="https://wa.me/5599981101886"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-sm md:text-base text-primary font-medium leading-relaxed hover:text-tertiary transition-colors"
                    >
                      (99) 98110-1886
                    </a>
                  </div>
                </div>

                {/* Email Bento Card */}
                <div className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.01)] hover:border-tertiary/30 transition-all duration-300 group">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-sm text-primary group-hover:bg-tertiary/10 group-hover:text-tertiary transition-all duration-300">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-sans text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
                      Correio Eletrônico
                    </p>
                    <a 
                      href="mailto:willferreira_2050@hotmail.com"
                      className="font-sans text-sm md:text-base text-primary font-medium leading-relaxed hover:text-tertiary transition-colors"
                    >
                      willferreira_2050@hotmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Structured Map Visualizer with Golden Accent Hairline */}
            <div className="border border-slate-100 grayscale hover:grayscale-0 transition-all duration-500 rounded-sm overflow-hidden h-64 relative shadow-[0_10px_30px_rgba(0,0,0,0.02)] group">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-tertiary z-20 pointer-events-none" />
              <iframe
                title="Localização do Escritório"
                src="https://maps.google.com/maps?q=-4.866111,-43.350750&t=&z=17&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Booking Confirmation Success Modal */}
      <AnimatePresence>
        {bookingSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingSuccess(null)}
              className="absolute inset-0 bg-primary-container/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-md bg-white border border-outline-variant p-8 shadow-2xl z-10 text-center rounded-sm"
            >
              {/* Success Icon */}
              <div className="mx-auto h-14 w-14 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-full mb-6">
                <ClipboardCheck className="h-8 w-8" />
              </div>

              {/* Title */}
              <h3 className="font-serif text-2xl font-bold text-primary mb-3">
                Solicitação Recebida!
              </h3>
              <p className="font-sans text-sm text-on-surface-variant mb-6 leading-relaxed">
                Olá, <strong className="text-primary">{bookingSuccess.name}</strong>. Sua solicitação de consulta jurídica foi registrada com sucesso sob o protocolo:
              </p>

              {/* Protocol Number Badge */}
              <div className="bg-surface-container-low border border-outline-variant p-4 font-sans rounded-sm mb-6 flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-secondary block mb-1">
                  Número de Protocolo
                </span>
                <span className="font-mono text-lg font-bold text-primary tracking-wider">
                  {bookingSuccess.id}
                </span>
              </div>

              {/* Quick Details List */}
              <div className="font-sans text-xs text-left text-on-surface-variant flex flex-col gap-2 border-b border-outline-variant pb-5 mb-6">
                <div className="flex justify-between">
                  <span>Área Solicitada:</span>
                  <strong className="text-primary">{bookingSuccess.area}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Contato Registrado:</span>
                  <strong className="text-primary">{bookingSuccess.phone}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Canal de Retorno:</span>
                  <strong className="text-primary">{bookingSuccess.email}</strong>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {/* Close Button */}
                <button
                  id="btn-success-close"
                  onClick={() => setBookingSuccess(null)}
                  className="w-full bg-primary hover:bg-primary-container text-white py-3 font-sans text-xs uppercase font-bold tracking-widest rounded-sm transition-all"
                >
                  Entendi
                </button>
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-secondary font-sans mt-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Seus dados estão protegidos por sigilo ético</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
