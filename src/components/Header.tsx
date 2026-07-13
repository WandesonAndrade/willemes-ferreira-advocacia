import { useState, useEffect } from 'react';
import { Menu, X, Scale } from 'lucide-react';

interface HeaderProps {
  onConsultationClick: () => void;
}

export default function Header({ onConsultationClick }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'sobre', 'atuacao', 'blog', 'contato'];
      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '#home', id: 'home' },
    { label: 'Sobre', href: '#sobre', id: 'sobre' },
    { label: 'Atuação', href: '#atuacao', id: 'atuacao' },
    { label: 'Blog', href: '#blog', id: 'blog' },
    { label: 'Contato', href: '#contato', id: 'contato' },
  ];

  return (
    <header 
      id="main-header"
      className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-outline-variant transition-shadow duration-300 shadow-sm"
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 h-20 flex justify-between items-center">
        {/* Brand / Logo */}
        <a 
          href="#home" 
          id="header-brand"
          className="flex items-center gap-2 group focus:outline-none"
        >
          <Scale className="h-6 w-6 text-primary group-hover:text-tertiary transition-colors" />
          <div className="flex flex-col">
            <span className="font-serif text-lg font-semibold tracking-tight text-primary leading-tight">
              Willemes Ferreira
            </span>
            <span className="font-sans text-[10px] uppercase font-bold tracking-[0.15em] text-secondary">
              OAB/MA 21.031
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav id="desktop-nav" className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              id={`nav-link-${item.id}`}
              className={`font-sans text-xs uppercase font-bold tracking-[0.12em] transition-all duration-300 pb-1 border-b-2 ${
                activeSection === item.id
                  ? 'border-tertiary text-primary'
                  : 'border-transparent text-secondary hover:text-primary hover:border-outline-variant'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Call to Action Button */}
        <div className="hidden md:flex items-center">
          <button
            id="btn-header-consult"
            onClick={onConsultationClick}
            className="bg-primary hover:bg-primary-container text-white px-6 py-2.5 font-sans text-xs uppercase font-bold tracking-widest rounded-sm shadow-sm hover:shadow transition-all duration-300"
          >
            Consultar Agora
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          id="btn-mobile-menu"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-primary focus:outline-none p-1"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Panel */}
      {isOpen && (
        <div 
          id="mobile-nav-panel"
          className="md:hidden bg-white border-b border-outline-variant animate-in slide-in-from-top duration-300"
        >
          <div className="px-6 py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                id={`mobile-nav-link-${item.id}`}
                onClick={() => setIsOpen(false)}
                className={`font-sans text-sm font-semibold tracking-wide py-2 ${
                  activeSection === item.id
                    ? 'text-tertiary font-bold pl-2 border-l-2 border-tertiary'
                    : 'text-secondary hover:text-primary pl-2 border-l-2 border-transparent'
                }`}
              >
                {item.label}
              </a>
            ))}
            <button
              id="btn-mobile-consult"
              onClick={() => {
                setIsOpen(false);
                onConsultationClick();
              }}
              className="w-full bg-primary text-white py-3 font-sans text-xs uppercase font-bold tracking-widest rounded-sm text-center mt-2 shadow-sm"
            >
              Consultar Agora
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
