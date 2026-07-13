import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Calendar, Clock, X, ChevronRight, Loader2, Search, ArrowLeft, Share2, HelpCircle, FileText, Send } from 'lucide-react';
import { BlogPost } from '../types';
import { BlogPostService } from '../lib/firebase';
import { BLOG_POSTS } from '../data';

interface BlogProps {
  updateTrigger?: number;
  limit?: number;
  isFullPage?: boolean;
}

export default function Blog({ updateTrigger = 0, limit, isFullPage = false }: BlogProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true);
      try {
        const fetchedPosts = await BlogPostService.getAll();
        // Sort posts so that newest or specific IDs take priority
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Failed to load posts, falling back:', error);
        setPosts(BLOG_POSTS);
      } finally {
        setIsLoading(false);
      }
    }
    loadPosts();
  }, [updateTrigger]);

  // Helper to render markdown-like content cleanly with beautiful typography
  const renderContent = (text: string) => {
    const paragraphs = text.split('\n\n');
    return paragraphs.map((paragraph, index) => {
      const trimmed = paragraph.trim();
      
      // Header Level 3
      if (trimmed.startsWith('###')) {
        return (
          <h4 key={index} className="font-serif text-xl md:text-2xl font-bold text-primary mt-8 mb-4 border-l-4 border-tertiary pl-3">
            {trimmed.replace('###', '').trim()}
          </h4>
        );
      }
      
      // Blockquotes
      if (trimmed.startsWith('>') || trimmed.startsWith('**Nota:**') || trimmed.startsWith('**Atenção:**')) {
        return (
          <blockquote key={index} className="bg-slate-50 border-l-4 border-tertiary p-5 my-6 italic text-sm md:text-base text-primary/90 font-serif relative rounded-r-sm">
            {trimmed.replace(/^>\s*/, '').trim()}
          </blockquote>
        );
      }

      // Lists
      if (trimmed.startsWith('*') || trimmed.startsWith('-') || /^\d+\./.test(trimmed)) {
        const items = trimmed.split('\n');
        return (
          <ul key={index} className="list-none flex flex-col gap-3 my-6 pl-2 font-sans text-secondary text-sm md:text-base">
            {items.map((item, i) => {
              const cleaned = item.replace(/^[*-\s\d.]+(\s|)/, '').trim();
              const parts = cleaned.split('**');
              return (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary mt-2.5 shrink-0" />
                  <span className="leading-relaxed">
                    {parts.length > 1 ? (
                      <>
                        <strong>{parts[1]}</strong>
                        {parts.slice(2).join('')}
                      </>
                    ) : (
                      cleaned
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        );
      }

      // First Paragraph with premium editorial drop-cap
      if (index === 0) {
        const firstChar = trimmed.charAt(0);
        const restOfText = trimmed.slice(1);
        return (
          <p key={index} className="mb-5 text-secondary text-sm md:text-base leading-[1.75] font-sans first-letter:float-left first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-tertiary first-letter:mr-3 first-letter:mt-1">
            {restOfText}
          </p>
        );
      }

      return (
        <p key={index} className="mb-5 text-secondary text-sm md:text-base leading-[1.75] font-sans">
          {trimmed}
        </p>
      );
    });
  };

  const handleCopyLink = (postTitle: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/#blog?title=${encodeURIComponent(postTitle)}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const categories = posts.length > 0 
    ? ['Todas', ...Array.from(new Set(posts.map(p => p.category)))] 
    : ['Todas'];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Featured post: the very first post, displayed prominently if no filter is active
  const hasFilterActive = searchQuery !== '' || selectedCategory !== 'Todas';
  const featuredPost = !hasFilterActive && filteredPosts.length > 0 ? filteredPosts[0] : null;
  
  // Remaining posts to be shown in the normal grid
  const remainingPosts = featuredPost 
    ? filteredPosts.filter(p => p.id !== featuredPost.id) 
    : filteredPosts;

  const displayedPosts = limit ? filteredPosts.slice(0, limit) : remainingPosts;

  return (
    <section id="blog" className={`py-20 md:py-28 bg-white transition-all duration-700 relative overflow-hidden ${isFullPage ? 'min-h-[90vh]' : ''}`}>
      {/* Decorative premium elements for background depth */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-slate-50/50 -z-0 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-tertiary/2 rounded-full blur-3xl pointer-events-none -z-0" />
      
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10">
        
        {isFullPage ? (
          <div className="mb-12">
            {/* Back button */}
            <a 
              href="#home"
              className="inline-flex items-center gap-2.5 font-sans text-xs uppercase font-bold tracking-[0.2em] text-primary hover:text-tertiary transition-colors mb-10 cursor-pointer group"
            >
              <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform text-tertiary" /> 
              <span>Voltar para o início</span>
            </a>
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="font-sans text-xs uppercase font-bold tracking-[0.25em] text-tertiary block mb-3">
                Informativo e Artigos
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-primary mb-4 leading-tight">
                Biblioteca de Direitos
              </h1>
              <p className="font-sans text-sm md:text-base text-secondary leading-relaxed">
                Esclarecimentos técnicos, atualizações legislativas e análises descomplicadas sobre os seus direitos civis, trabalhistas e previdenciários.
              </p>
              <div className="w-16 h-1 bg-tertiary mx-auto mt-6" />
            </div>

            {/* Featured Post (Visual Hook for high-end editorial blogs) */}
            {featuredPost && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-16 bg-white border border-slate-100 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden group hover:shadow-[0_20px_50px_rgba(194,96,20,0.06)] hover:-translate-y-1 transition-all duration-500"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch cursor-pointer" onClick={() => setActivePost(featuredPost)}>
                  {/* Big Image Section */}
                  <div className="lg:col-span-7 relative overflow-hidden aspect-[16/10] lg:aspect-auto min-h-[300px]">
                    <img 
                      src={featuredPost.image} 
                      alt={featuredPost.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover scale-101 group-hover:scale-103 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-60" />
                    
                    {/* Badge */}
                    <div className="absolute top-5 left-5 bg-gradient-to-r from-tertiary to-[#c26014] text-white px-4 py-1.5 font-sans text-[10px] uppercase font-bold tracking-[0.2em] rounded-sm shadow-md">
                      Artigo de Destaque
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className="lg:col-span-5 p-8 md:p-10 flex flex-col justify-center bg-slate-50/50 relative">
                    <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-tertiary" />
                    
                    <span className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-tertiary mb-3 block">
                      {featuredPost.category}
                    </span>
                    
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-4 leading-tight group-hover:text-tertiary transition-colors duration-300">
                      {featuredPost.title}
                    </h2>
                    
                    <p className="font-sans text-secondary text-xs md:text-sm leading-relaxed mb-6">
                      {featuredPost.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-semibold tracking-wider text-secondary mb-8">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-tertiary" />
                        {featuredPost.date}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-tertiary" />
                        {featuredPost.readTime}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 text-primary font-sans text-xs uppercase font-bold tracking-[0.18em] group-hover:text-tertiary transition-colors">
                      <span>Ler Artigo Completo</span>
                      <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Filter & Search Bar Layout */}
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-center bg-slate-50/70 p-6 border border-slate-100 rounded-sm mb-12">
              {/* Search input with modern inner shadow and focus styling */}
              <div className="relative w-full lg:w-96 group">
                <input 
                  type="text"
                  placeholder="Pesquisar por palavras-chave..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-11 bg-white border border-slate-200 font-sans text-sm text-primary rounded-sm focus:outline-none focus:ring-4 focus:ring-tertiary/10 focus:border-tertiary transition-all hover:border-slate-300"
                />
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-tertiary transition-colors" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 bg-slate-100 hover:bg-slate-200 text-secondary hover:text-primary text-[10px] uppercase font-bold px-2 py-1 rounded-sm transition-colors"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Dynamic Categories Tab/Chips with gold sliding effect */}
              <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 font-sans text-[11px] uppercase font-bold tracking-widest rounded-full border transition-all duration-300 ${
                      selectedCategory === cat 
                        ? 'bg-primary border-primary text-white shadow-md'
                        : 'bg-white border-slate-200 text-secondary hover:text-primary hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Blog Header Row for Home Page */
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <span className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-tertiary block mb-3">
                Conhecimento Prático
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary">
                Informativo do Seu Direito
              </h2>
              <div className="w-16 h-1 bg-tertiary mt-4" />
            </div>
            <a 
              href="#blog-all"
              className="group font-sans text-xs uppercase font-bold tracking-[0.18em] text-primary hover:text-tertiary transition-colors pb-1 border-b-2 border-primary/20 hover:border-tertiary flex items-center gap-1.5"
            >
              <span>Ver todos os artigos</span>
              <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        )}

        {/* Articles Grid / Loading state / Empty screen */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border border-slate-100 p-6 rounded-sm bg-white flex flex-col gap-4 animate-pulse">
                <div className="aspect-[16/10] bg-slate-100 rounded-sm w-full" />
                <div className="h-3 bg-slate-200 rounded w-1/4" />
                <div className="h-6 bg-slate-200 rounded w-5/6" />
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-1/2 mt-auto" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-sm p-8 max-w-lg mx-auto">
            <BookOpen className="h-10 w-10 text-tertiary/40 mx-auto mb-4" />
            <h4 className="font-serif text-lg font-bold text-primary mb-2">Nenhum artigo publicado</h4>
            <p className="font-sans text-xs text-secondary leading-relaxed">Artigos e informativos jurídicos serão publicados em breve.</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-sm p-8 max-w-lg mx-auto">
            <BookOpen className="h-10 w-10 text-tertiary/40 mx-auto mb-4" />
            <h4 className="font-serif text-lg font-bold text-primary mb-2">Nenhum artigo correspondente</h4>
            <p className="font-sans text-xs text-secondary leading-relaxed">Experimente alterar os filtros ou pesquisar por outro termo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedPosts.map((post, index) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-white border border-slate-100 p-6 cursor-pointer flex flex-col h-full rounded-sm overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(194,96,20,0.06)] hover:-translate-y-1.5"
                onClick={() => setActivePost(post)}
              >
                {/* Elegant active gold accent hairline on top of card on hover */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-tertiary to-[#c26014] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20 pointer-events-none" />
                
                {/* 21st.dev Style Inner Background Mask to reveal only a very subtle golden outline border */}
                <div className="absolute inset-0 p-[1px] bg-gradient-to-b from-tertiary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-sm z-0" />
                <div className="absolute inset-[1px] bg-white rounded-sm pointer-events-none z-0 group-hover:bg-slate-50/20 transition-colors duration-500" />

                {/* Accent ambient warm light from top-right */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-tertiary/3 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />

                {/* Card content wrapped in relative container */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Aspect Ratio Box with Image */}
                  <div className="aspect-[16/10] mb-5 overflow-hidden border border-slate-100 bg-slate-50 relative rounded-sm shadow-sm group-hover:border-slate-200/60 transition-colors duration-500">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover scale-101 group-hover:scale-104 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Modern executive category overlay badge with dynamic backdrop filter */}
                    <div className="absolute top-3 left-3 bg-primary/95 backdrop-blur-md text-white px-3 py-1 font-sans text-[9px] uppercase font-bold tracking-[0.18em] border border-white/10 rounded-sm shadow-sm">
                      {post.category}
                    </div>
                  </div>

                  {/* Metadata Row with custom dividers */}
                  <div className="flex items-center gap-3.5 font-sans text-[11px] font-semibold tracking-wider text-secondary mb-4">
                    <span className="flex items-center gap-1.5 hover:text-primary transition-colors duration-200">
                      <Calendar className="h-3.5 w-3.5 text-tertiary" />
                      {post.date}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <span className="flex items-center gap-1.5 hover:text-primary transition-colors duration-200">
                      <Clock className="h-3.5 w-3.5 text-tertiary" />
                      {post.readTime}
                    </span>
                  </div>

                  {/* Title with sleek serif typography & hover transition */}
                  <h3 className="font-serif text-lg md:text-xl font-bold text-primary group-hover:text-tertiary transition-colors duration-300 mb-3 leading-[1.35] line-clamp-2">
                    {post.title}
                  </h3>
                  
                  {/* Excerpt with fine letter spacing and optimal contrast */}
                  <p className="font-sans text-secondary text-xs md:text-sm leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Modern action link with arrow-sliding transition and delicate gold hover border */}
                  <div className="mt-auto pt-4 border-t border-slate-50 group-hover:border-slate-100 transition-colors duration-300 flex items-center justify-between text-primary group-hover:text-tertiary font-sans text-[11px] uppercase font-bold tracking-[0.15em]">
                    <span>Ler Artigo Completo</span>
                    <div className="p-1.5 bg-slate-50 group-hover:bg-tertiary/10 rounded-full transition-colors duration-300">
                      <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Article Detail Reading Modal */}
      <AnimatePresence>
        {activePost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePost(null)}
              className="fixed inset-0 bg-primary/60 backdrop-blur-sm"
            />

            {/* Modal content container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 30 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-3xl bg-white border border-slate-100 shadow-2xl z-10 my-8 overflow-hidden rounded-sm"
            >
              {/* Featured Header Banner */}
              <div className="relative h-64 md:h-80 w-full bg-slate-50">
                <img 
                  src={activePost.image} 
                  alt={activePost.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
                
                {/* Close Button on Banner */}
                <button
                  onClick={() => setActivePost(null)}
                  className="absolute top-6 right-6 bg-white/95 hover:bg-white text-primary p-2.5 shadow-md hover:shadow-lg rounded-full transition-all focus:outline-none"
                  aria-label="Close reading modal"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Categories Tag overlay */}
                <div className="absolute bottom-6 left-8 md:left-10">
                  <span className="bg-gradient-to-r from-tertiary to-[#c26014] text-white px-3.5 py-1.5 font-sans text-[10px] uppercase font-bold tracking-[0.2em] rounded-sm">
                    {activePost.category}
                  </span>
                </div>
              </div>

              {/* Article content padding */}
              <div className="p-8 md:p-11 max-h-[calc(92vh-250px)] overflow-y-auto scrollbar-thin">
                {/* Meta details row & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-sans text-xs text-secondary mb-6 border-b border-slate-100 pb-5">
                  <div className="flex flex-wrap items-center gap-5">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-tertiary" />
                      Publicado em {activePost.date}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200 hidden sm:inline" />
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="h-3.5 w-3.5 text-tertiary" />
                      Leitura: {activePost.readTime}
                    </span>
                  </div>

                  {/* Share button */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleCopyLink(activePost.title)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-primary font-medium transition-colors"
                    >
                      <Share2 className="h-3 w-3 text-tertiary" />
                      <span>{copiedLink ? 'Link copiado!' : 'Compartilhar'}</span>
                    </button>
                  </div>
                </div>

                {/* Big Article Title */}
                <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-6 leading-tight">
                  {activePost.title}
                </h3>

                {/* Body Text */}
                <div className="font-sans text-base leading-relaxed text-secondary pr-1">
                  {renderContent(activePost.content)}
                </div>

                {/* Styled Call-to-Action Conversion Box (Bento visual hook inside article) */}
                <div className="mt-10 p-6 bg-slate-50 border border-slate-100 rounded-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-tertiary" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-primary font-serif font-bold text-base">
                      <HelpCircle className="h-5 w-5 text-tertiary" />
                      <span>Ficou com dúvidas sobre este tema?</span>
                    </div>
                    <p className="font-sans text-xs md:text-sm text-secondary leading-relaxed mb-4">
                      A legislação pode ser complexa e cada caso possui particularidades que exigem análise de um profissional de confiança.
                    </p>
                    <a 
                      href={`https://wa.me/5599981101886?text=Ola%20Dr.%20Willemes,%20li%20seu%20artigo%20sobre%20"${encodeURIComponent(activePost.title)}"%20e%20gostaria%20de%20esclarecer%20uma%20duvida.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-tertiary to-[#c26014] hover:from-primary hover:to-primary text-white font-sans text-xs uppercase font-bold tracking-widest rounded-sm shadow-md transition-all duration-300"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Consultar Especialista</span>
                    </a>
                  </div>
                </div>

                {/* Author footer banner */}
                <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-5 bg-slate-50/50 p-6 rounded-sm">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmMru-U2Vo-tW1eUzflcYLpSzQhSVKjyWFZc3G6AEfORGydTETgUj0yRldbVXDsOE7c4B1FcX1WX9UzWE9I-cuGt1nlhvNyiLoUs0dwctEt97Z9YcucwNJL1CAlSIXFSMoooMZYjGeI9Y0-94DywchHATb4A0TXrSvGyPphllXwn8j4scmz9Tce6VA-xdRAIZ_1i8horCCPRf5LjOIG__E6gLIHoymNQY7ovFcC8oDr4pRMjovmNVXTbbCWra-4sOc0GT2VQA7NBIA" 
                    alt="Willemes Ferreira" 
                    className="w-14 h-14 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <p className="font-serif text-sm font-bold text-primary">Willemes Ferreira</p>
                    <p className="font-sans text-xs text-secondary leading-relaxed">Advogado inscrito na OAB/MA sob o número 21.031. Especialista em Direito Civil, Trabalhista e Previdenciário. Atuação focada em excelência, ética e soluções assertivas.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}


