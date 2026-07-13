import { motion } from 'motion/react';
import { ArrowRight, Shield, Award, Users } from 'lucide-react';

interface HeroProps {
  onPracticeClick: () => void;
  onContactClick: () => void;
}

export default function Hero({ onPracticeClick, onContactClick }: HeroProps) {
  return (
    <section 
      id="home" 
      className="relative min-h-[90vh] flex items-center overflow-hidden transition-all duration-700 bg-primary"
    >
      {/* Background Image with Elegant Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center scale-105" 
          style={{ 
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDSyjiEtarV9HDYu5RsOd69XIVVmGJmnnbN1ShlzZuGoNU1Ase5_h_RfN78pURATIlV8MLGL8THYtIXKYFOydoof5i10WEyCjEKmvy53AaFaJBMKitz5QSNHHCnPUelZYo3hWE8HLVay-eKtGClNdTKcvIq0ZiCfTLpEDWM0od_CprzfMd1HkcAQHNS0AroawU8j0-mQvva4Udfch8GVNOVyhXoPUBK1E7cKuwYoOoU5Y3oGnCMOCY")`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 hero-gradient" />
        
        {/* Subtle executive grid alignment lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 w-full py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Text Content */}
          <div className="lg:col-span-8 text-white">
            {/* Elegant upper sub-badge */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tertiary/10 border border-tertiary/30 backdrop-blur-sm mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <span className="font-sans text-[10px] uppercase font-bold tracking-[0.25em] text-tertiary-fixed-dim">
                Willemes Ferreira · OAB/MA 21.031
              </span>
            </motion.div>

            {/* Title with eb-garamond luxury touch and dual-tone golden typography */}
            <motion.h1 
              id="hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl mb-6 leading-[1.1] tracking-tight font-bold text-slate-50"
            >
              Advocacia de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffcf9e] via-tertiary-fixed-dim to-tertiary font-medium">excelência</span> e soluções jurídicas estratégicas
            </motion.h1>

            {/* OAB/MA Highlight & Subtitle with a finer layout */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-sans text-sm md:text-base text-slate-300 leading-relaxed mb-10 max-w-xl"
            >
              Defesa altamente técnica e personalizada para proteger seus direitos. Atendimento em Caxias/MA e região com total ética, transparência e agilidade.
            </motion.p>

            {/* Premium CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                id="btn-hero-practices"
                onClick={onPracticeClick}
                className="group relative bg-gradient-to-r from-tertiary to-[#c26014] hover:from-white hover:to-white text-white hover:text-primary px-8 py-4 font-sans text-xs uppercase font-bold tracking-[0.15em] rounded-sm shadow-xl transition-all duration-300 text-center overflow-hidden flex items-center justify-center gap-2"
              >
                <span>Ver Especialidades</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                id="btn-hero-contact"
                onClick={onContactClick}
                className="border border-slate-400/40 hover:border-white text-white hover:bg-white/5 px-8 py-4 font-sans text-xs uppercase font-bold tracking-[0.15em] rounded-sm transition-all duration-300 text-center"
              >
                Falar com Advogado
              </button>
            </motion.div>
          </div>

          {/* Right Floating Credentials Column (Bento grid visual hook) */}
          <div className="lg:col-span-4 hidden lg:flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/5 border border-white/10 p-6 rounded-sm backdrop-blur-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-5 w-5 text-tertiary-fixed-dim" />
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-200">Segurança Jurídica</span>
              </div>
              <p className="font-sans text-xs text-slate-300 leading-relaxed">
                Processos e consultorias conduzidos com máximo rigor técnico e conformidade com as leis vigentes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-white/5 border border-white/10 p-6 rounded-sm backdrop-blur-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <Award className="h-5 w-5 text-tertiary-fixed-dim" />
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-200">Defesa Incisiva</span>
              </div>
              <p className="font-sans text-xs text-slate-300 leading-relaxed">
                Foco no melhor resultado possível, seja através do acordo extrajudicial ou da atuação em juízo.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-white/5 border border-white/10 p-6 rounded-sm backdrop-blur-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-5 w-5 text-tertiary-fixed-dim" />
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-200">Atendimento Humanizado</span>
              </div>
              <p className="font-sans text-xs text-slate-300 leading-relaxed">
                Canal aberto e direto com o advogado especialista para acompanhar cada detalhe da sua causa.
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
