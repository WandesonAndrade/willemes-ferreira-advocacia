import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import PracticeAreas from './components/PracticeAreas';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import WhatsAppButton from './components/WhatsAppButton';

export default function App() {
  const [view, setView] = useState<'home' | 'admin' | 'blog'>(() => {
    const hash = window.location.hash;
    if (hash === '#admin') return 'admin';
    if (hash === '#blog-all') return 'blog';
    return 'home';
  });
  const [adminUpdateTrigger, setAdminUpdateTrigger] = useState(0);
  const [blogUpdateTrigger, setBlogUpdateTrigger] = useState(0);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setView('admin');
      } else if (hash === '#blog-all') {
        setView('blog');
      } else {
        setView('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Guarantee scrolling to anchor hash on view transitions to home
  useEffect(() => {
    if (view === 'home' && window.location.hash) {
      const hash = window.location.hash;
      const id = hash.startsWith('#') ? hash.substring(1) : hash;
      if (id) {
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, [view]);

  const navigateToAdmin = () => {
    window.location.hash = 'admin';
    setView('admin');
  };

  const navigateToHome = () => {
    window.location.hash = '';
    setView('home');
  };

  const navigateToBlog = () => {
    window.location.hash = 'blog-all';
    setView('blog');
  };

  // Trigger smooth scroll to contact section
  const handleScrollToContact = () => {
    if (view !== 'home') {
      window.location.hash = 'contato';
    } else {
      const contactEl = document.getElementById('contato');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Trigger smooth scroll to practice areas section
  const handleScrollToPractice = () => {
    if (view !== 'home') {
      window.location.hash = 'atuacao';
    } else {
      const practiceEl = document.getElementById('atuacao');
      if (practiceEl) {
        practiceEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Notify Admin Panel to reload appointments list upon new submits
  const handleNewAppointment = () => {
    setAdminUpdateTrigger(prev => prev + 1);
  };

  if (view === 'admin') {
    return (
      <div id="app-root" className="min-h-screen bg-slate-100 flex flex-col">
        <AdminPanel 
          isOpen={true} 
          onClose={navigateToHome} 
          updateTrigger={adminUpdateTrigger}
          onBlogUpdate={() => setBlogUpdateTrigger(prev => prev + 1)}
        />
      </div>
    );
  }

  if (view === 'blog') {
    return (
      <div id="app-root" className="min-h-screen flex flex-col bg-background text-on-background selection:bg-tertiary-fixed-dim selection:text-primary">
        {/* Sticky Top Navigation */}
        <Header onConsultationClick={handleScrollToContact} />

        {/* Main Section */}
        <main className="flex-1">
          <Blog updateTrigger={blogUpdateTrigger} isFullPage={true} />
        </main>

        {/* Footer & Floating widgets */}
        <Footer onAdminClick={navigateToAdmin} />
        <WhatsAppButton />
      </div>
    );
  }

  return (
    <div id="app-root" className="min-h-screen flex flex-col bg-background text-on-background selection:bg-tertiary-fixed-dim selection:text-primary">
      
      {/* Sticky Top Navigation */}
      <Header onConsultationClick={handleScrollToContact} />

      {/* Main Sections */}
      <main className="flex-1">
        <Hero 
          onPracticeClick={handleScrollToPractice} 
          onContactClick={handleScrollToContact} 
        />
        <About />
        <PracticeAreas />
        <Blog updateTrigger={blogUpdateTrigger} limit={3} />
        <Contact onNewAppointmentBooked={handleNewAppointment} />
      </main>

      {/* Footer & Floating widgets */}
      <Footer onAdminClick={navigateToAdmin} />
      <WhatsAppButton />
    </div>
  );
}
