import { motion } from 'motion/react';
import { ShieldCheck, Scale, FileText, Landmark, Quote } from 'lucide-react';

export default function About() {
  const officeValues = [
    {
      icon: <ShieldCheck className="h-5 w-5 text-tertiary" />,
      title: "Ética e Sigilo",
      description: "Absoluto respeito às normas morais e de confidencialidade estabelecidas pela Ordem."
    },
    {
      icon: <Scale className="h-5 w-5 text-tertiary" />,
      title: "Rigor Técnico",
      description: "Análise processual meticulosa e fundamentação jurídica atualizada e robusta."
    },
    {
      icon: <FileText className="h-5 w-5 text-tertiary" />,
      title: "Transparência",
      description: "Informação clara e contínua sobre o andamento e chances de cada processo."
    },
    {
      icon: <Landmark className="h-5 w-5 text-tertiary" />,
      title: "Compromisso",
      description: "Foco total na melhor solução jurídica, seja de forma preventiva ou contenciosa."
    }
  ];

  return (
    <section id="sobre" className="py-20 md:py-28 bg-white overflow-hidden relative">
      {/* Absolute Decorative Background Element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -z-0 pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-72 h-72 bg-tertiary/2 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Portrait Image Column */}
          <div className="lg:col-span-5 relative">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/5] border border-outline-variant p-4 bg-white z-10 shadow-xl rounded-sm group overflow-hidden"
            >
              {/* Gold frame line overlay that expands on hover */}
              <div className="absolute inset-0 border-[2px] border-tertiary/0 group-hover:border-tertiary/20 transition-all duration-500 rounded-sm z-20 pointer-events-none m-2" />
              
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmMru-U2Vo-tW1eUzflcYLpSzQhSVKjyWFZc3G6AEfORGydTETgUj0yRldbVXDsOE7c4B1FcX1WX9UzWE9I-cuGt1nlhvNyiLoUs0dwctEt97Z9YcucwNJL1CAlSIXFSMoooMZYjGeI9Y0-94DywchHATb4A0TXrSvGyPphllXwn8j4scmz9Tce6VA-xdRAIZ_1i8horCCPRf5LjOIG__E6gLIHoymNQY7ovFcC8oDr4pRMjovmNVXTbbCWra-4sOc0GT2VQA7NBIA" 
                alt="Willemes Ferreira" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-102 transition-all duration-700 ease-in-out rounded-sm"
              />
            </motion.div>
            
            {/* Background decorative square with custom pattern */}
            <div 
              className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/5 -z-0 pointer-events-none rounded-sm border border-primary/10" 
              aria-hidden="true" 
            />
          </div>

          {/* Bio Text Column */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-3"
            >
              <span className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-tertiary">
                Trajetória e Valores
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary leading-tight">
                Defesa sólida, inteligência estratégica e compromisso inabalável com o cliente.
              </h2>
              <div className="w-16 h-1 bg-tertiary mt-2" />
            </motion.div>

            {/* Quote Element */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-slate-50 border-l-4 border-tertiary p-5 italic text-sm text-primary font-serif relative"
            >
              <Quote className="absolute right-4 bottom-3 h-10 w-10 text-slate-200/60 pointer-events-none" />
              "A nossa missão vai além de peticionar e acompanhar audiências. Nosso foco é oferecer paz de espírito e segurança jurídica para que nossos clientes possam focar no que realmente importa em suas vidas e negócios."
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col gap-4 text-on-surface-variant text-base leading-relaxed font-sans"
            >
              <p>
                Com sede em Caxias/MA, o escritório do advogado <strong>Willemes Ferreira (OAB/MA 21.031)</strong> destaca-se pela prestação de serviços jurídicos de alta performance técnica. Oferecemos suporte completo tanto em disputas complexas quanto na assessoria preventiva personalizada.
              </p>
            </motion.div>

            {/* Statistics Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-3 gap-4 border-t border-b border-outline-variant/60 py-6 my-2"
            >
              <div>
                <p className="font-serif text-3xl md:text-4xl font-bold text-primary mb-1">
                  10+
                </p>
                <p className="font-sans text-[10px] uppercase font-bold tracking-widest text-secondary">
                  Anos de Atuação
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl md:text-4xl font-bold text-primary mb-1">
                  98%
                </p>
                <p className="font-sans text-[10px] uppercase font-bold tracking-widest text-secondary">
                  Casos de Sucesso
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl md:text-4xl font-bold text-primary mb-1">
                  500+
                </p>
                <p className="font-sans text-[10px] uppercase font-bold tracking-widest text-secondary">
                  Clientes Satisfeitos
                </p>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Virtues/Values Bento Grid at bottom */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {officeValues.map((val, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative bg-white border border-slate-100 p-7 rounded-sm cursor-pointer flex flex-col h-full overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgba(194,96,20,0.05)] hover:-translate-y-1.5 focus-within:ring-2 focus-within:ring-tertiary focus-within:outline-none"
            >
              {/* Elegant active gold accent hairline on top of card on hover */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-tertiary to-[#c26014] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20 pointer-events-none" />

              {/* Subtle inner background golden gradient highlight on hover */}
              <div className="absolute inset-0 p-[1px] bg-gradient-to-b from-tertiary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-sm z-0" />
              <div className="absolute inset-[1px] bg-white rounded-sm pointer-events-none z-0 group-hover:bg-slate-50/20 transition-colors duration-500" />

              <div className="relative z-10 flex flex-col h-full">
                {/* Icon Box with modern high-contrast borders */}
                <div className="p-3 bg-slate-50 w-fit rounded-sm border border-slate-100 mb-5 group-hover:bg-tertiary/10 group-hover:border-transparent transition-all duration-300">
                  {val.icon}
                </div>
                <h4 className="font-serif text-lg font-bold text-primary mb-2.5 group-hover:text-tertiary transition-colors duration-300">
                  {val.title}
                </h4>
                <p className="font-sans text-xs md:text-sm text-secondary leading-relaxed">
                  {val.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
