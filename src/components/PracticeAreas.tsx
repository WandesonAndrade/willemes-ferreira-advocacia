import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, Briefcase, BookOpen, Users, ArrowRight, X, CheckCircle, ArrowUpRight } from 'lucide-react';
import { PRACTICE_AREAS } from '../data';
import { PracticeArea } from '../types';

export default function PracticeAreas() {
  const [selectedArea, setSelectedArea] = useState<PracticeArea | null>(null);

  // Map icon names to Lucide icons with custom class transitions
  const getIcon = (name: string, customClass = "h-6 w-6 text-primary group-hover:text-tertiary transition-colors duration-300") => {
    switch (name) {
      case 'Scale':
        return <Scale className={customClass} />;
      case 'Briefcase':
        return <Briefcase className={customClass} />;
      case 'BookOpen':
        return <BookOpen className={customClass} />;
      case 'Users':
        return <Users className={customClass} />;
      default:
        return <Scale className={customClass} />;
    }
  };

  return (
    <section id="atuacao" className="py-20 md:py-28 bg-slate-50/50 transition-all duration-700 relative overflow-hidden">
      {/* Absolute Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-primary/2 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-tertiary/2 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="font-sans text-xs uppercase font-bold tracking-[0.25em] text-tertiary block mb-3">
            Especialidades
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary">
            Áreas de Atuação Jurídica
          </h2>
          <div className="w-16 h-1 bg-tertiary mx-auto mt-4 mb-5" />
          <p className="text-secondary text-sm md:text-base leading-relaxed font-sans">
            Soluções estratégicas, fundamentadas e de alto rigor técnico para proteger seus direitos e interesses patrimoniais, familiares e trabalhistas.
          </p>
        </div>

        {/* Practice Areas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRACTICE_AREAS.map((area, index) => {
            // Get category badge labels for modern visual details
            const getCategoryLabel = (id: string) => {
              switch (id) {
                case 'civil': return 'Direito Contratual';
                case 'trabalhista': return 'Laboral & Compliance';
                case 'previdenciario': return 'Previdência & INSS';
                case 'familia': return 'Planejamento Familiar';
                default: return 'Especialidade';
              }
            };

            return (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setSelectedArea(area)}
                className="group relative bg-white border border-slate-100 p-8 cursor-pointer flex flex-col justify-between h-full rounded-sm overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(194,96,20,0.06)] hover:-translate-y-1.5 focus-within:ring-2 focus-within:ring-tertiary focus-within:outline-none"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedArea(area);
                  }
                }}
              >
                {/* Elegant active gold accent hairline on top of card on hover */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-tertiary to-[#c26014] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20 pointer-events-none" />

                {/* 21st.dev Style Inner Background Mask to reveal only a very subtle golden outline border */}
                <div className="absolute inset-0 p-[1px] bg-gradient-to-b from-tertiary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-sm z-0" />
                <div className="absolute inset-[1px] bg-white rounded-sm pointer-events-none z-0 group-hover:bg-slate-50/10 transition-colors duration-500" />

                {/* Ambient radial lighting behind the icon on hover */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-tertiary/3 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />

                {/* Card Content */}
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    {/* Top Row: Tag & Serial Number */}
                    <div className="flex justify-between items-center mb-8">
                      <span className="font-sans text-[9px] uppercase font-bold tracking-[0.15em] text-tertiary bg-tertiary/5 px-3 py-1 rounded-sm border border-tertiary/10">
                        {getCategoryLabel(area.id)}
                      </span>
                      <span className="font-serif text-2xl font-bold text-slate-100 group-hover:text-tertiary/10 tracking-wider transition-colors duration-300 pointer-events-none">
                        0{index + 1}
                      </span>
                    </div>

                    {/* Icon Box with modern high-contrast borders */}
                    <div className="mb-6 p-4 bg-slate-50 border border-slate-100 w-fit rounded-sm group-hover:bg-tertiary/10 group-hover:border-transparent transition-all duration-300">
                      {getIcon(area.iconName)}
                    </div>
                    
                    {/* Title */}
                    <h3 className="font-serif text-lg font-bold text-primary mb-3 group-hover:text-tertiary transition-colors duration-300">
                      {area.name}
                    </h3>
                    
                    {/* Excerpt */}
                    <p className="text-secondary text-xs md:text-sm leading-relaxed font-sans mb-6">
                      {area.description}
                    </p>
                  </div>

                  {/* Footer Row: Services Count & Saber mais CTA */}
                  <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-50">
                    <span className="font-sans text-[11px] text-secondary font-semibold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-tertiary animate-pulse" />
                      {area.services.length} Serviços
                    </span>
                    <div className="flex items-center gap-1.5 text-primary group-hover:text-tertiary font-sans text-xs uppercase font-bold tracking-[0.12em]">
                      <span>Detalhes</span>
                      <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Practice Area Detail Modal */}
      <AnimatePresence>
        {selectedArea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArea(null)}
              className="fixed inset-0 bg-primary/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-2xl bg-white border border-slate-100 shadow-2xl z-10 max-h-[90vh] overflow-y-auto rounded-sm"
            >
              {/* Gold Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-tertiary to-[#c26014]" />

              {/* Close Button */}
              <button
                onClick={() => setSelectedArea(null)}
                className="absolute top-6 right-6 bg-slate-50 hover:bg-slate-100 text-secondary hover:text-primary transition-all rounded-full p-2.5 focus:outline-none"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-8 md:p-10">
                {/* Title Header */}
                <div className="flex items-center gap-4 mb-6 pt-2">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm text-tertiary">
                    {getIcon(selectedArea.iconName, "h-7 w-7 text-tertiary")}
                  </div>
                  <div>
                    <span className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-tertiary block mb-1">
                      Área de Especialidade
                    </span>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary leading-tight">
                      {selectedArea.name}
                    </h3>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-slate-100 mb-6" />

                {/* Body Details */}
                <div className="font-sans text-secondary text-sm md:text-base leading-relaxed mb-8 flex flex-col gap-4">
                  <p className="font-serif text-lg font-semibold text-primary leading-snug">
                    {selectedArea.description}
                  </p>
                  <p className="text-secondary leading-[1.6]">
                    {selectedArea.fullDetails}
                  </p>
                </div>

                {/* Sub-services list */}
                <div className="bg-slate-50/50 p-6 border border-slate-100 rounded-sm">
                  <h4 className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
                    Serviços Especializados Disponíveis
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-sans text-xs md:text-sm text-secondary">
                    {selectedArea.services.map((service, index) => (
                      <li key={index} className="flex items-start gap-2.5 group">
                        <CheckCircle className="h-4 w-4 text-tertiary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <span className="leading-relaxed">{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA at Bottom */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <span className="font-sans text-xs text-slate-400">
                    OAB/MA 21.031 · Dr. Willemes Ferreira
                  </span>
                  <a
                    href="#contato"
                    onClick={() => setSelectedArea(null)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-tertiary to-[#c26014] hover:from-primary hover:to-primary text-white px-6 py-3 font-sans text-xs uppercase font-bold tracking-widest rounded-sm shadow-md transition-all duration-300"
                  >
                    <span>Agendar Consulta</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
