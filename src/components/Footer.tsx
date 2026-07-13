import { Lock } from 'lucide-react';

interface FooterProps {
  onAdminClick: () => void;
}

export default function Footer({ onAdminClick }: FooterProps) {
  return (
    <footer id="footer" className="w-full bg-white border-t border-slate-100">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-serif text-lg font-bold text-primary tracking-tight">
            Willemes Ferreira Advocacia
          </span>
          <button 
            id="btn-footer-admin-discreet"
            onClick={onAdminClick}
            className="group font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-secondary hover:text-tertiary transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none"
            title="Acesso Restrito"
          >
            <span>Inscrição OAB/MA 21.031</span>
            <Lock className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-tertiary" />
          </button>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-xs font-sans font-bold uppercase tracking-[0.15em] text-secondary">
          <a href="#home" className="hover:text-tertiary transition-colors">Início</a>
          <a href="#sobre" className="hover:text-tertiary transition-colors">Sobre Nós</a>
          <a href="#atuacao" className="hover:text-tertiary transition-colors">Especialidades</a>
          <a href="#blog" className="hover:text-tertiary transition-colors">Informativo</a>
          <a href="#contato" className="hover:text-tertiary transition-colors">Contato</a>
        </div>

        {/* Copyright */}
        <div className="text-center md:text-right font-sans text-xs text-secondary opacity-85 flex flex-col gap-1">
          <p>© 2026 Advocacia OAB/MA 21.031. Todos os direitos reservados.</p>
          <p className="text-[10px] text-slate-400">Desenvolvido com padrões éticos e profissionais da OAB.</p>
        </div>
      </div>
    </footer>
  );
}

