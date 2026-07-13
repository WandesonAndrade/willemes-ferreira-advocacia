import { MessageSquare } from 'lucide-react';

export default function WhatsAppButton() {
  const whatsappUrl = "https://wa.me/5599981101886?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20consulta%20com%20o%20Dr.%20Willemes%20Ferreira.";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      id="whatsapp-floating-btn"
      aria-label="Fale conosco pelo WhatsApp"
      className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-50 flex items-center gap-2 group cursor-pointer"
    >
      <MessageSquare className="h-6 w-6 text-white fill-white" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 font-sans text-xs uppercase font-bold tracking-widest leading-none">
        Fale Conosco
      </span>
    </a>
  );
}
