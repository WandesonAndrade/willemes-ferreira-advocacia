import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  Loader2, 
  Image, 
  FileText, 
  HelpCircle, 
  Sparkles, 
  Wand2, 
  Eye, 
  Edit3, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight, 
  RefreshCw, 
  Bold, 
  Italic, 
  Heading3, 
  Quote, 
  List, 
  Link, 
  Clock, 
  ChevronRight,
  Sparkle,
  Type,
  FileEdit,
  Eraser
} from 'lucide-react';
import { BlogPost } from '../types';

interface BlogEditorProps {
  selectedPost: BlogPost | null;
  onSave: (formData: Omit<BlogPost, 'id'>) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const PRESET_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop',
    label: 'Martelo & Balança (Clássico)'
  },
  {
    url: 'https://images.unsplash.com/photo-1453728246353-6d6889a87d37?q=80&w=800&auto=format&fit=crop',
    label: 'Livros de Direito'
  },
  {
    url: 'https://images.unsplash.com/photo-1505664194779-8bebcb95c539?q=80&w=800&auto=format&fit=crop',
    label: 'Tribunal / Julgamento'
  },
  {
    url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=800&auto=format&fit=crop',
    label: 'Escritório Moderno'
  }
];

export default function BlogEditor({ selectedPost, onSave, onCancel, isSaving }: BlogEditorProps) {
  const [form, setForm] = useState<Omit<BlogPost, 'id'>>({
    title: '',
    category: 'DIREITO CIVIL',
    excerpt: '',
    content: '',
    image: PRESET_IMAGES[0].url,
    date: '',
    readTime: '4 min de leitura'
  });

  // Editor states
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [imageError, setImageError] = useState(false);
  const [isAutoCalculating, setIsAutoCalculating] = useState(true);

  // AI assistant states
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiAction, setAiAction] = useState<'improve' | 'suggest' | 'expand' | 'custom'>('improve');
  const [aiInstruction, setAiInstruction] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);
  const [aiPhrases, setAiPhrases] = useState('Iniciando assistente de IA...');

  // Textarea ref for inserting formatting
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // AI loading phrases rotator
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAiProcessing) {
      const phrases = [
        'Analisando a fundamentação do texto...',
        'Lapidando argumentos jurídicos...',
        'Aprimorando clareza e formalidade...',
        'Formatando citações e referências...',
        'Quase pronto para revisão...'
      ];
      let counter = 0;
      setAiPhrases(phrases[0]);
      interval = setInterval(() => {
        counter = (counter + 1) % phrases.length;
        setAiPhrases(phrases[counter]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAiProcessing]);

  // Sync with selectedPost on mount or change
  useEffect(() => {
    if (selectedPost) {
      setForm({
        title: selectedPost.title,
        category: selectedPost.category,
        excerpt: selectedPost.excerpt,
        content: selectedPost.content,
        image: selectedPost.image || PRESET_IMAGES[0].url,
        date: selectedPost.date,
        readTime: selectedPost.readTime || '4 min de leitura'
      });
      setIsAutoCalculating(false); // keep user value or existing
    } else {
      setForm({
        title: '',
        category: 'DIREITO CIVIL',
        excerpt: '',
        content: '',
        image: PRESET_IMAGES[0].url,
        date: '',
        readTime: '3 min de leitura'
      });
      setIsAutoCalculating(true);
    }
    setImageError(false);
    setAiResponse(null);
    setAiError(null);
    setAiSuccessMsg(null);
  }, [selectedPost]);

  // Handle word count & read time auto estimation
  useEffect(() => {
    if (!isAutoCalculating || !form.content) return;
    
    const wordCount = form.content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200)); // average speed 200 wpm
    
    setForm(prev => ({
      ...prev,
      readTime: `${minutes} min de leitura`
    }));
  }, [form.content, isAutoCalculating]);

  // Format insert helpers
  const insertFormatting = (prefix: string, suffix: string, defaultText: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const selectedText = text.substring(start, end);
    const replacement = selectedText ? (prefix + selectedText + suffix) : (prefix + defaultText + suffix);
    
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    
    setForm(prev => ({ ...prev, content: newContent }));
    
    // Reset selection focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText ? selectedText.length : defaultText.length));
    }, 50);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const selectPresetImage = (url: string) => {
    setForm(prev => ({ ...prev, image: url }));
    setImageError(false);
  };

  // Call server-side Gemini API
  const handleAiAction = async () => {
    setIsAiProcessing(true);
    setAiError(null);
    setAiResponse(null);
    setAiSuccessMsg(null);

    try {
      const response = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: aiAction,
          title: form.title,
          content: form.content || form.excerpt || 'Rascunho inicial...',
          category: form.category,
          instruction: aiInstruction
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na comunicação com a inteligência artificial.');
      }

      setAiResponse(data.text);
      setAiSuccessMsg('IA processou com sucesso! Revise o resultado abaixo.');
    } catch (err) {
      console.error('AI assistant failed:', err);
      setAiError(err instanceof Error ? err.message : 'Falha ao solicitar assistência de IA.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Apply AI result directly to editor form fields
  const applyAiResult = () => {
    if (!aiResponse) return;

    try {
      if (aiAction === 'suggest') {
        // Attempt to parse JSON response
        const cleanJsonStr = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJsonStr);
        setForm(prev => ({
          ...prev,
          title: parsed.title || prev.title,
          excerpt: parsed.excerpt || prev.excerpt
        }));
      } else if (aiAction === 'improve' || aiAction === 'expand' || aiAction === 'custom') {
        setForm(prev => ({
          ...prev,
          content: aiResponse
        }));
      }
      setAiSuccessMsg('Alterações aplicadas com sucesso no editor!');
      setAiResponse(null);
    } catch (e) {
      // Fallback: If JSON parse fails during suggest action, apply as raw string to content
      setForm(prev => ({
        ...prev,
        content: aiResponse
      }));
      setAiSuccessMsg('Alterações aplicadas como texto plano.');
      setAiResponse(null);
    }
  };

  // Render visual preview matching Blog.tsx exactly
  const renderPreviewContent = (text: string) => {
    if (!text) {
      return (
        <div className="text-center py-12 text-slate-400 font-sans italic">
          Nenhum conteúdo digitado ainda. Comece a redigir na aba de edição.
        </div>
      );
    }

    const paragraphs = text.split('\n\n');
    return paragraphs.map((paragraph, index) => {
      const trimmed = paragraph.trim();
      
      // Header Level 3
      if (trimmed.startsWith('###')) {
        return (
          <h4 key={index} className="font-serif text-lg md:text-xl font-bold text-primary mt-6 mb-3 border-l-4 border-tertiary pl-3">
            {trimmed.replace('###', '').trim()}
          </h4>
        );
      }
      
      // Blockquotes
      if (trimmed.startsWith('>') || trimmed.startsWith('**Nota:**') || trimmed.startsWith('**Atenção:**')) {
        return (
          <blockquote key={index} className="bg-slate-50 border-l-4 border-tertiary p-4 my-4 italic text-xs md:text-sm text-primary/90 font-serif relative rounded-r-sm">
            {trimmed.replace(/^>\s*/, '').trim()}
          </blockquote>
        );
      }

      // Lists
      if (trimmed.startsWith('*') || trimmed.startsWith('-') || /^\d+\./.test(trimmed)) {
        const items = trimmed.split('\n');
        return (
          <ul key={index} className="list-none flex flex-col gap-2 my-4 pl-1 font-sans text-secondary text-xs md:text-sm">
            {items.map((item, i) => {
              const cleaned = item.replace(/^[*-\s\d.]+(\s|)/, '').trim();
              const parts = cleaned.split('**');
              return (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary mt-2 shrink-0" />
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

      // First Paragraph with drop-cap (Classic Editorial style)
      if (index === 0) {
        const firstChar = trimmed.charAt(0);
        const restOfText = trimmed.slice(1);
        return (
          <p key={index} className="mb-4 text-secondary text-xs md:text-sm leading-[1.7] font-sans first-letter:float-left first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:text-tertiary first-letter:mr-2.5 first-letter:mt-1">
            {restOfText}
          </p>
        );
      }

      return (
        <p key={index} className="mb-4 text-secondary text-xs md:text-sm leading-[1.7] font-sans">
          {trimmed}
        </p>
      );
    });
  };

  // SEO Limit Indicators
  const titleOptimal = form.title.length > 10 && form.title.length <= 70;
  const titleWarning = form.title.length > 70;
  const excerptOptimal = form.excerpt.length >= 80 && form.excerpt.length <= 160;
  const excerptWarning = form.excerpt.length > 160;

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[600px] bg-slate-50 relative overflow-hidden">
      
      {/* LEFT: MAIN EDITOR WORKSPACE */}
      <div className="flex-1 bg-white border-r border-slate-100 flex flex-col h-full overflow-hidden">
        
        {/* Workspace Sticky Header */}
        <div className="p-4 md:p-6 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-white/95 backdrop-blur-md z-10">
          <div>
            <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-tertiary block mb-1">
              CMS Redesign Sênior
            </span>
            <h4 className="font-serif text-base md:text-lg font-bold text-primary leading-tight">
              {selectedPost ? 'Atualizar Artigo Publicado' : 'Criar Nova Matéria Jurídica'}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            {/* Split tabs */}
            <div className="flex bg-slate-100 p-0.5 rounded-sm border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-sans font-bold uppercase tracking-wider rounded-xs transition-all ${
                  activeTab === 'edit'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5 text-tertiary" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-sans font-bold uppercase tracking-wider rounded-xs transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Eye className="h-3.5 w-3.5 text-tertiary" />
                <span>Prévia Visual</span>
              </button>
            </div>

            {/* AI Assistant Toggle Button */}
            <button
              type="button"
              onClick={() => setShowAiAssistant(!showAiAssistant)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-sans font-bold uppercase tracking-widest rounded-sm transition-all shadow-xs border ${
                showAiAssistant 
                  ? 'bg-tertiary/10 border-tertiary text-primary font-black' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-secondary'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-tertiary animate-pulse" />
              <span>Redação IA</span>
            </button>
          </div>
        </div>

        {/* EDITOR FORM */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 flex flex-col gap-6 flex-1 overflow-y-auto scrollbar-thin">
          {activeTab === 'edit' ? (
            <div className="flex flex-col gap-5">
              
              {/* Title Section with character length meter */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-sans text-[10px] uppercase font-bold text-secondary tracking-wider flex items-center gap-1">
                    <Type className="h-3.5 w-3.5 text-tertiary" />
                    <span>Título da Matéria</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[9px] font-mono font-medium ${
                    titleWarning ? 'text-rose-500 font-bold' : titleOptimal ? 'text-emerald-600 font-bold' : 'text-slate-400'
                  }`}>
                    {form.title.length} caracteres {titleWarning && '(longo)'} {titleOptimal && '(ótimo para SEO)'}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mudanças no Código Civil e o Impacto nos Contratos de Aluguel..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-slate-200 p-3 text-xs font-sans rounded-sm focus:outline-none focus:ring-4 focus:ring-tertiary/5 focus:border-tertiary transition-all placeholder-slate-400"
                />
              </div>

              {/* Category, Date and reading time panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[10px] uppercase font-bold text-secondary tracking-wider">
                    Área Jurídica / Categoria
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="border border-slate-200 p-2.5 text-xs font-sans rounded-sm bg-white text-primary font-bold uppercase tracking-wider focus:outline-none focus:ring-4 focus:ring-tertiary/5 focus:border-tertiary cursor-pointer"
                  >
                    <option value="DIREITO CIVIL">DIREITO CIVIL</option>
                    <option value="TRABALHISTA">TRABALHISTA</option>
                    <option value="PREVIDENCIÁRIO">PREVIDENCIÁRIO</option>
                    <option value="FAMÍLIA E SUCESSÕES">FAMÍLIA E SUC.</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-sans text-[10px] uppercase font-bold text-secondary tracking-wider">
                      Tempo de Leitura
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAutoCalculating(!isAutoCalculating)}
                      className={`text-[8px] font-sans font-bold uppercase tracking-wider ${
                        isAutoCalculating ? 'text-tertiary font-bold' : 'text-slate-400'
                      }`}
                    >
                      {isAutoCalculating ? 'Auto-estimar Ativo' : 'Manual'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      disabled={isAutoCalculating}
                      placeholder="Ex: 5 min de leitura"
                      value={form.readTime}
                      onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                      className="w-full border border-slate-200 p-2.5 text-xs font-sans rounded-sm focus:outline-none focus:ring-4 focus:ring-tertiary/5 focus:border-tertiary transition-all disabled:bg-slate-50 disabled:text-slate-500 pl-8"
                    />
                    <Clock className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[10px] uppercase font-bold text-secondary tracking-wider">
                    Data de Publicação
                  </label>
                  <input
                    type="text"
                    placeholder="Deixe em branco para registrar data de hoje"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 text-xs font-sans rounded-sm focus:outline-none focus:ring-4 focus:ring-tertiary/5 focus:border-tertiary transition-all"
                  />
                </div>
              </div>

              {/* Cover image area */}
              <div className="flex flex-col gap-2 p-4 bg-slate-50/50 border border-slate-200/50 rounded-sm">
                <label className="font-sans text-[10px] uppercase font-bold text-secondary tracking-wider flex items-center gap-1.5">
                  <Image className="h-4 w-4 text-tertiary" />
                  <span>Configuração de Imagem de Capa</span>
                </label>

                <div className="flex flex-col md:flex-row gap-4 mt-1">
                  {/* Thumbnail Previews */}
                  <div className="flex-1 flex flex-col gap-2">
                    <span className="text-[9px] text-slate-400 font-sans font-bold uppercase tracking-wider">Escolha recomendada ou insira link:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PRESET_IMAGES.map((preset, index) => (
                        <button
                          type="button"
                          key={index}
                          onClick={() => selectPresetImage(preset.url)}
                          className={`group border rounded-sm p-1.5 text-[9px] font-sans font-bold flex items-center gap-2 transition-all truncate cursor-pointer bg-white ${
                            form.image === preset.url
                              ? 'border-tertiary ring-2 ring-tertiary/10 text-primary bg-tertiary/5'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-secondary'
                          }`}
                          title={preset.label}
                        >
                          <img src={preset.url} alt="" className="h-6 w-8 object-cover rounded-xs" referrerPolicy="no-referrer" />
                          <span className="truncate">{preset.label}</span>
                        </button>
                      ))}
                    </div>

                    <input
                      type="url"
                      placeholder="Ou insira a URL personalizada (https://...)"
                      value={form.image}
                      onChange={(e) => {
                        setForm({ ...form, image: e.target.value });
                        setImageError(false);
                      }}
                      className="w-full border border-slate-200 p-2.5 mt-2 text-xs font-sans rounded-sm focus:outline-none focus:ring-4 focus:ring-tertiary/5 focus:border-tertiary transition-all bg-white"
                    />
                  </div>

                  {/* Capa preview aspect-ratio locked card */}
                  <div className="w-full md:w-52 h-32 border border-slate-200 rounded-sm overflow-hidden relative bg-slate-100 shrink-0">
                    {form.image && !imageError ? (
                      <img
                        src={form.image}
                        alt="Preview da Capa"
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1.5 p-3 text-center">
                        <Image className="h-6 w-6 text-slate-300" />
                        <span className="text-[9px] font-sans">Sem imagem ou URL inválida</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-primary/90 px-2 py-0.5 rounded-xs text-[8px] font-mono font-bold uppercase text-white tracking-widest border border-slate-700">
                      Preview
                    </div>
                  </div>
                </div>
              </div>

              {/* Excerpt Section (SEO Resumo) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-sans text-[10px] uppercase font-bold text-secondary tracking-wider flex items-center gap-1">
                    <FileEdit className="h-3.5 w-3.5 text-tertiary" />
                    <span>Resumo / Introdução (Excerpt)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[9px] font-mono font-medium ${
                    excerptWarning ? 'text-rose-500 font-bold' : excerptOptimal ? 'text-emerald-600 font-bold' : 'text-slate-400'
                  }`}>
                    {form.excerpt.length} caracteres {excerptWarning && '(longo)'} {excerptOptimal && '(ideal: 80-160 para SEO)'}
                  </span>
                </div>
                <textarea
                  required
                  rows={2}
                  placeholder="Uma introdução clara, informativa e objetiva sobre a matéria para indexação e busca do blog..."
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full border border-slate-200 p-3 text-xs font-sans rounded-sm h-16 resize-none focus:outline-none focus:ring-4 focus:ring-tertiary/5 focus:border-tertiary transition-all"
                />
              </div>

              {/* Main Content with format helper toolbar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-sans text-[10px] uppercase font-bold text-secondary tracking-wider flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-tertiary" />
                    <span>Conteúdo Completo do Artigo</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-400 font-sans">
                      Letras: {form.content.length}
                    </span>
                    <span className="text-[9px] text-slate-400 font-sans">
                      Palavras: {form.content ? form.content.trim().split(/\s+/).filter(w => w.length > 0).length : 0}
                    </span>
                  </div>
                </div>

                {/* Markdown helper toolbar */}
                <div className="flex items-center gap-1 p-1 bg-slate-50 border border-slate-200 border-b-0 rounded-t-sm flex-wrap">
                  <button
                    type="button"
                    onClick={() => insertFormatting('**', '**', 'texto em negrito')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-primary transition-colors cursor-pointer"
                    title="Negrito (Ctrl+B)"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('_', '_', 'texto em itálico')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-primary transition-colors cursor-pointer"
                    title="Itálico (Ctrl+I)"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <div className="w-[1px] h-4 bg-slate-300 mx-1" />
                  <button
                    type="button"
                    onClick={() => insertFormatting('### ', '\n\n', 'Subtítulo Importante')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-primary transition-colors flex items-center gap-0.5 cursor-pointer"
                    title="Subtítulo H3"
                  >
                    <Heading3 className="h-3.5 w-3.5" />
                    <span className="text-[8px] font-sans font-bold">H3</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('> ', '\n\n', 'Citação de lei, nota ou trecho jurisprudencial')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-primary transition-colors cursor-pointer"
                    title="Bloco de Citação / Nota"
                  >
                    <Quote className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('- ', '\n', 'Item da lista')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-primary transition-colors cursor-pointer"
                    title="Lista com marcadores"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('[', '](https://...)', 'Texto do Link')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-primary transition-colors cursor-pointer"
                    title="Inserir Link"
                  >
                    <Link className="h-3.5 w-3.5" />
                  </button>
                  <div className="w-[1px] h-4 bg-slate-300 mx-1" />
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja apagar todo o rascunho de conteúdo?')) {
                        setForm(prev => ({ ...prev, content: '' }));
                      }
                    }}
                    className="p-1.5 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors ml-auto cursor-pointer"
                    title="Limpar conteúdo"
                  >
                    <Eraser className="h-3.5 w-3.5" />
                  </button>
                </div>

                <textarea
                  required
                  ref={contentRef}
                  placeholder="Redija aqui toda a fundamentação, argumentos, citações e referências jurídicas. Use quebras de linha duplas para dividir parágrafos de forma elegante. Use a barra de formatação acima ou as marcações Markdown."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full border border-slate-200 p-4 text-xs font-sans rounded-b-sm h-[320px] md:h-[420px] resize-y focus:outline-none focus:ring-4 focus:ring-tertiary/5 focus:border-tertiary transition-all leading-relaxed whitespace-pre-wrap"
                />
              </div>

            </div>
          ) : (
            
            /* HIGH FIDELITY PREVIEW TAB */
            <div className="border border-slate-200/80 rounded-sm p-6 md:p-8 bg-white max-w-3xl mx-auto shadow-xs w-full">
              {/* Cover Capa */}
              <div className="aspect-[21/9] w-full border border-slate-100 rounded-sm overflow-hidden relative bg-slate-100 mb-6">
                {form.image ? (
                  <img src={form.image} alt={form.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Image className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-white/95 px-2.5 py-0.5 rounded-xs border border-slate-200 font-sans text-[8px] font-bold tracking-widest text-primary uppercase shadow-xs">
                  {form.category}
                </div>
              </div>

              {/* Title Header */}
              <div className="mb-6">
                <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-tertiary block mb-2">
                  Prévia de Artigo de Blog
                </span>
                <h3 className="font-serif text-xl md:text-2xl font-bold text-primary leading-tight">
                  {form.title || 'Título provisório do artigo'}
                </h3>
                <div className="flex gap-4 text-[9px] font-sans font-bold uppercase tracking-wider text-slate-400 mt-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-tertiary" />
                    {form.readTime}
                  </span>
                </div>
              </div>

              <div className="w-full h-[1px] bg-slate-100 mb-6" />

              {/* Excerpt Summary */}
              {form.excerpt && (
                <div className="mb-6">
                  <p className="font-sans text-xs italic text-slate-600 bg-slate-50 border border-slate-200/60 p-4 rounded-sm leading-relaxed">
                    {form.excerpt}
                  </p>
                </div>
              )}

              {/* Dynamic Content */}
              <div className="prose max-w-none text-slate-700 leading-relaxed text-xs md:text-sm">
                {renderPreviewContent(form.content)}
              </div>
            </div>

          )}

          {/* Bottom Control panel */}
          <div className="flex gap-3 justify-end pt-5 border-t border-slate-100 mt-4 bg-white">
            <button
              type="button"
              onClick={onCancel}
              className="border border-slate-200 hover:bg-slate-50 text-secondary text-[10px] font-sans font-bold uppercase tracking-wider py-2.5 px-4 rounded-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isSaving}
              className="bg-primary hover:bg-slate-800 text-white text-[10px] font-sans font-bold uppercase tracking-widest py-2.5 px-5 rounded-sm flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-tertiary" />
                  <span>Salvando no Firestore...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 text-tertiary" />
                  <span>{selectedPost ? 'Atualizar Artigo' : 'Publicar Artigo'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>

      {/* RIGHT: EXPANDABLE AI WRITING ASSISTANT SIDEBAR */}
      {showAiAssistant && (
        <div className="w-full lg:w-[380px] bg-slate-100 border-l border-slate-200 flex flex-col shrink-0 animate-in slide-in-from-right duration-300">
          
          {/* AI Sidebar Header */}
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-xs shrink-0 select-none">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-tertiary" />
              <h5 className="font-serif text-sm font-bold text-primary">Assistente Redação IA</h5>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAiAssistant(false);
                setAiResponse(null);
              }}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
            >
              X
            </button>
          </div>

          {/* AI Sidebar Content scrollable */}
          <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1 scrollbar-thin">
            
            {/* Quick action card selection */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] uppercase font-bold tracking-wider text-secondary block">Selecione uma tarefa de IA</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAiAction('improve');
                    setAiResponse(null);
                  }}
                  className={`border rounded-sm p-2.5 text-[10px] font-sans font-bold text-left transition-all ${
                    aiAction === 'improve'
                      ? 'border-tertiary bg-white text-primary ring-2 ring-tertiary/10 shadow-xs'
                      : 'border-slate-250 hover:border-slate-350 hover:bg-slate-50 text-secondary bg-white'
                  }`}
                >
                  <Sparkle className="h-3.5 w-3.5 text-tertiary mb-1" />
                  <span>Refinar e Polir</span>
                  <p className="text-[8px] text-slate-400 font-normal mt-0.5">Corrige, formaliza e melhora o tom.</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAiAction('suggest');
                    setAiResponse(null);
                  }}
                  className={`border rounded-sm p-2.5 text-[10px] font-sans font-bold text-left transition-all ${
                    aiAction === 'suggest'
                      ? 'border-tertiary bg-white text-primary ring-2 ring-tertiary/10 shadow-xs'
                      : 'border-slate-250 hover:border-slate-350 hover:bg-slate-50 text-secondary bg-white'
                  }`}
                >
                  <Wand2 className="h-3.5 w-3.5 text-tertiary mb-1" />
                  <span>Sugestão de SEO</span>
                  <p className="text-[8px] text-slate-400 font-normal mt-0.5">Cria Título & Excerpt perfeitos para busca.</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAiAction('expand');
                    setAiResponse(null);
                  }}
                  className={`border rounded-sm p-2.5 text-[10px] font-sans font-bold text-left transition-all ${
                    aiAction === 'expand'
                      ? 'border-tertiary bg-white text-primary ring-2 ring-tertiary/10 shadow-xs'
                      : 'border-slate-250 hover:border-slate-350 hover:bg-slate-50 text-secondary bg-white'
                  }`}
                >
                  <ArrowRight className="h-3.5 w-3.5 text-tertiary mb-1" />
                  <span>Expandir Esboço</span>
                  <p className="text-[8px] text-slate-400 font-normal mt-0.5">Cria prosa completa de tópicos curtos.</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAiAction('custom');
                    setAiResponse(null);
                  }}
                  className={`border rounded-sm p-2.5 text-[10px] font-sans font-bold text-left transition-all ${
                    aiAction === 'custom'
                      ? 'border-tertiary bg-white text-primary ring-2 ring-tertiary/10 shadow-xs'
                      : 'border-slate-250 hover:border-slate-350 hover:bg-slate-50 text-secondary bg-white'
                  }`}
                >
                  <FileEdit className="h-3.5 w-3.5 text-tertiary mb-1" />
                  <span>Ajuste Manual</span>
                  <p className="text-[8px] text-slate-400 font-normal mt-0.5">Informe comandos específicos para a IA.</p>
                </button>
              </div>
            </div>

            {/* Custom Instruction Box */}
            {aiAction === 'custom' && (
              <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-250">
                <span className="text-[9px] uppercase font-bold tracking-wider text-secondary">Sua Instrução de Edição</span>
                <textarea
                  rows={2}
                  placeholder="Ex: Reescreva o parágrafo tal de forma mais amigável, cite leis previdenciárias vigentes..."
                  value={aiInstruction}
                  onChange={(e) => setAiInstruction(e.target.value)}
                  className="w-full border border-slate-250 p-2.5 text-xs font-sans rounded-sm bg-white focus:outline-none focus:ring-4 focus:ring-tertiary/5 focus:border-tertiary transition-all leading-relaxed"
                />
              </div>
            )}

            {/* Trigger actions */}
            <button
              type="button"
              disabled={isAiProcessing || (!form.content && !form.title && aiAction !== 'expand')}
              onClick={handleAiAction}
              className="w-full bg-gradient-to-r from-tertiary to-[#c26014] hover:from-primary hover:to-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] py-3.5 px-4 rounded-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {isAiProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Analisando...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 text-white" />
                  <span>Processar com IA</span>
                </>
              )}
            </button>

            {/* AI Response Display area with beautiful frames */}
            {isAiProcessing && (
              <div className="border border-tertiary/30 bg-tertiary/5 rounded-sm p-6 text-center flex flex-col items-center justify-center gap-3 animate-pulse">
                <Loader2 className="h-7 w-7 animate-spin text-tertiary" />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-primary">Assistente Pensando</span>
                  <span className="text-[9px] font-sans text-secondary italic animate-bounce mt-1">{aiPhrases}</span>
                </div>
              </div>
            )}

            {/* ERROR CARD */}
            {aiError && (
              <div className="border border-rose-150 bg-rose-50 text-rose-800 rounded-sm p-4 text-xs font-sans flex gap-2.5">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block uppercase tracking-wider text-[9px] mb-0.5">Erro no Servidor</span>
                  <p className="leading-relaxed text-[11px]">{aiError}</p>
                </div>
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {aiSuccessMsg && !isAiProcessing && (
              <div className="border border-emerald-150 bg-emerald-50/80 text-emerald-800 rounded-sm p-3.5 text-xs font-sans flex gap-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="leading-relaxed font-semibold text-[10px]">{aiSuccessMsg}</p>
                </div>
              </div>
            )}

            {/* RESULT PANEL WITH ACCEPT ACTIONS */}
            {aiResponse && !isAiProcessing && (
              <div className="border border-slate-200 bg-white rounded-sm overflow-hidden flex flex-col shadow-sm animate-in zoom-in-95 duration-200">
                <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="text-[8px] uppercase font-bold tracking-widest text-secondary">Proposta da Inteligência Artificial</span>
                  <button
                    type="button"
                    onClick={() => setAiResponse(null)}
                    className="text-[9px] font-sans font-medium text-slate-400 hover:text-slate-600"
                  >
                    Descartar
                  </button>
                </div>

                <div className="p-4 text-xs leading-relaxed text-slate-700 font-sans whitespace-pre-wrap max-h-72 overflow-y-auto scrollbar-thin border-b border-slate-100 bg-slate-50/20">
                  {aiResponse}
                </div>

                <div className="p-3 bg-white flex gap-2">
                  <button
                    type="button"
                    onClick={applyAiResult}
                    className="flex-1 bg-primary hover:bg-slate-800 text-white text-[10px] font-sans font-bold uppercase tracking-widest py-2 px-3 rounded-sm flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-tertiary" />
                    <span>Aplicar no Rascunho</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* AI Info Footer */}
          <div className="p-3 text-[8px] font-sans text-slate-400 text-center uppercase tracking-wider bg-slate-50 shrink-0">
            Alimentado por Gemini 3.5 Flash sênior
          </div>

        </div>
      )}

    </div>
  );
}
