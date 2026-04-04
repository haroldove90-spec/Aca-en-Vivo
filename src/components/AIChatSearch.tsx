import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AIChatSearchProps {
  onFilter: (filters: any) => void;
  onClear: () => void;
}

export function AIChatSearch({ onFilter, onClear }: AIChatSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, { role: 'ai', text: data.textResponse }]);
        if (data.filters) {
          onFilter(data.filters);
        }
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: "Lo siento, tuve un problema procesando tu solicitud. ¿Podrías intentar de nuevo?" }]);
      }
    } catch (error) {
      console.error("Error calling AI:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Hubo un error de conexión. Por favor, intenta más tarde." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 relative z-30">
      {/* Floating Trigger / Search Bar */}
      <div 
        onClick={() => !isOpen && setIsOpen(true)}
        className={cn(
          "bg-white rounded-2xl shadow-xl border border-[#00A8CC]/20 p-4 flex items-center gap-3 cursor-pointer transition-all hover:border-[#00A8CC]/50",
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <div className="w-10 h-10 rounded-xl bg-[#142850] flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-[#00A8CC]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-[#142850]">¿Buscas algo específico?</p>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Pregúntale a nuestro Concierge IA</p>
        </div>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute top-0 left-4 right-4 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[450px]"
          >
            {/* Header */}
            <div className="bg-[#142850] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00A8CC]/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#00A8CC]" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-black uppercase tracking-tighter">Concierge AcaEnVivo</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">En línea ahora</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  onClear();
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
            >
              {messages.length === 0 && (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-[#F2E1C1] rounded-full mx-auto flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[#142850]" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium px-10">
                    "Hola, soy tu asistente de Acapulco. ¿Buscas un hotel con alberca en la Zona Dorada?"
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "max-w-[85%] p-3 rounded-2xl text-sm font-medium leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-[#00A8CC] text-white ml-auto rounded-tr-none" 
                      : "bg-[#142850] text-white mr-auto rounded-tl-none shadow-lg"
                  )}
                >
                  {msg.text}
                </div>
              ))}

              {loading && (
                <div className="bg-[#142850] text-white p-3 rounded-2xl rounded-tl-none mr-auto flex items-center gap-2 shadow-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-[#00A8CC]" />
                  <span className="text-xs font-bold animate-pulse">Escribiendo...</span>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu petición aquí..."
                className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00A8CC]/50 transition-all"
              />
              <button 
                type="submit"
                disabled={loading || !input.trim()}
                className="w-12 h-12 bg-[#00A8CC] rounded-xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-all disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
