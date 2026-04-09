import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  MessageSquare, 
  X, 
  User, 
  Search, 
  Clock, 
  CheckCheck,
  ShieldCheck,
  Store,
  Building2,
  Palmtree
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

interface Message {
  id: string;
  session_id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  created_at: string;
  sender_name?: string;
  sender_role?: string;
}

interface ChatSession {
  userId: string;
  userName: string;
  userRole: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

export function SupportChat({ isAdmin = false, inline = false }: { isAdmin?: boolean, inline?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(inline);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const adminId = 'admin-agencia-1'; // Fixed admin ID for support

  // Get or create guest ID
  const [guestId] = useState(() => {
    const saved = localStorage.getItem('aca_guest_id');
    if (saved) return saved;
    const newId = 'guest_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('aca_guest_id', newId);
    return newId;
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    if (!isOpen) return;

    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (isAdmin) {
      if (activeChat) {
        query = query.eq('session_id', activeChat);
      } else {
        // Fetch all messages to build session list
        const { data: allMessages } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (allMessages) {
          const sessionMap: Record<string, ChatSession> = {};
          allMessages.forEach(msg => {
            if (!sessionMap[msg.session_id]) {
              sessionMap[msg.session_id] = {
                userId: msg.session_id,
                userName: msg.sender_role === 'admin' ? 'Socio' : msg.sender_name,
                userRole: msg.sender_role === 'admin' ? 'socio' : msg.sender_role,
                lastMessage: msg.text,
                timestamp: msg.created_at,
                unread: false
              };
            }
          });
          setSessions(Object.values(sessionMap));
        }
        return;
      }
    } else {
      const sessionId = currentUser?.id || guestId;
      query = query.eq('session_id', sessionId);
    }

    const { data } = await query.limit(50);
    if (data) setMessages(data as Message[]);
  };

  // Listen for messages and sessions
  useEffect(() => {
    if (!isOpen) return;

    fetchMessages();

    const channel = supabase.channel('chat_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as Message;
        const sessionId = isAdmin ? activeChat : (currentUser?.id || guestId);
        
        if (newMsg.session_id === sessionId) {
          setMessages(prev => [...prev, newMsg]);
        }
        
        if (isAdmin && !activeChat) {
          fetchMessages(); // Refresh session list
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [isOpen, isAdmin, activeChat, currentUser, guestId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const sessionId = isAdmin ? activeChat : (currentUser?.id || guestId);
    if (!sessionId) return;

    try {
      const userRole = location.pathname.includes('hotel') ? 'hotel' : 
                       location.pathname.includes('negocio') ? 'negocio' : 
                       location.pathname.includes('clasificados') ? 'clasificados' : 'cliente';

      const { error } = await supabase
        .from('messages')
        .insert({
          session_id: sessionId,
          sender_id: currentUser?.id || null,
          receiver_id: isAdmin ? sessionId : adminId,
          text: newMessage,
          sender_name: isAdmin ? 'Admin Agencia' : (currentUser?.user_metadata?.full_name || 'Usuario'),
          sender_role: isAdmin ? 'admin' : userRole
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (inline) {
    return (
      <div className="w-full h-full flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-none flex items-center justify-center backdrop-blur-md">
              {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tighter uppercase leading-none">
                {isAdmin ? (activeChat ? 'Chat de Soporte' : 'Centro de Mensajes') : 'Soporte Agencia'}
              </h3>
              <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest mt-1">
                {isAdmin ? (activeChat ? 'Asistiendo a Socio' : 'Chats Activos') : 'En línea ahora'}
              </p>
            </div>
          </div>
          {isAdmin && activeChat && (
            <button 
              onClick={() => setActiveChat(null)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Volver a la lista
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isAdmin && !activeChat ? (
            // Admin Session List
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input 
                  type="text" 
                  placeholder="Buscar socio..."
                  className="w-full bg-gray-50 border-none rounded-none py-3 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {sessions.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <MessageSquare className="w-12 h-12 text-gray-100 mx-auto" />
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest">No hay chats activos</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.userId}
                    onClick={() => setActiveChat(session.userId)}
                    className="w-full p-4 rounded-none hover:bg-gray-50 transition-all flex items-center gap-4 group text-left border border-transparent hover:border-gray-100"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-none flex items-center justify-center group-hover:bg-white transition-colors relative">
                      {session.userRole === 'hotel' ? <Building2 className="w-6 h-6 text-blue-500" /> : 
                       session.userRole === 'negocio' ? <Store className="w-6 h-6 text-amber-500" /> : 
                       <Palmtree className="w-6 h-6 text-emerald-500" />}
                      {session.unread && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-none border-2 border-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black text-dark uppercase truncate">{session.userName}</span>
                        <span className="text-[9px] font-bold text-muted uppercase">Hoy</span>
                      </div>
                      <p className={cn(
                        "text-[11px] truncate",
                        session.unread ? "font-black text-dark" : "text-muted font-medium"
                      )}>
                        {session.lastMessage}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            // Chat Messages
            <>
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar"
              >
                {messages.length === 0 && (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                      <MessageSquare className="w-8 h-8 text-gray-200" />
                    </div>
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest">Inicia la conversación</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[80%]",
                      msg.sender_role === 'admin' ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "p-4 rounded-none text-sm font-bold shadow-sm",
                      msg.sender_role === 'admin' 
                        ? "bg-primary text-white" 
                        : "bg-gray-100 text-dark"
                    )}>
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-2 mt-2 px-1">
                      <span className="text-[9px] font-black text-muted uppercase tracking-widest">
                        {msg.sender_role === 'admin' ? 'Agencia' : msg.sender_name} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.sender_role === 'admin' && <CheckCheck className="w-3 h-3 text-primary" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <form 
                onSubmit={handleSendMessage}
                className="p-6 border-t border-gray-100 flex gap-3 shrink-0"
              >
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-gray-50 border-none rounded-none px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-14 h-14 bg-primary text-white rounded-none flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-all disabled:opacity-50"
                >
                  <Send className="w-6 h-6" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 lg:bottom-10 right-6 lg:right-10 z-[150]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-none shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-gray-100 w-[calc(100vw-3rem)] sm:w-[400px] h-[70vh] sm:h-[600px] flex flex-col overflow-hidden mb-6"
          >
            {/* Header */}
            <div className="bg-primary p-6 sm:p-8 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-none flex items-center justify-center backdrop-blur-md">
                  {isAdmin ? <ShieldCheck className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tighter uppercase leading-none">
                    {isAdmin ? (activeChat ? 'Chat de Soporte' : 'Centro de Mensajes') : 'Soporte Agencia'}
                  </h3>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">
                    {isAdmin ? (activeChat ? 'Asistiendo a Socio' : '2 chats activos') : 'En línea ahora'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (isAdmin && activeChat) setActiveChat(null);
                  else setIsOpen(false);
                }}
                className="w-10 h-10 bg-white/10 rounded-none flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {isAdmin && !activeChat ? (
                // Admin Session List
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input 
                      type="text" 
                      placeholder="Buscar socio..."
                      className="w-full bg-gray-50 border-none rounded-none py-3 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  {sessions.map((session) => (
                    <button
                      key={session.userId}
                      onClick={() => setActiveChat(session.userId)}
                      className="w-full p-4 rounded-none hover:bg-gray-50 transition-all flex items-center gap-4 group text-left border border-transparent hover:border-gray-100"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-none flex items-center justify-center group-hover:bg-white transition-colors relative">
                        {session.userRole === 'hotel' ? <Building2 className="w-6 h-6 text-blue-500" /> : 
                         session.userRole === 'negocio' ? <Store className="w-6 h-6 text-amber-500" /> : 
                         <Palmtree className="w-6 h-6 text-emerald-500" />}
                        {session.unread && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-none border-2 border-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-black text-dark uppercase truncate">{session.userName}</span>
                          <span className="text-[9px] font-bold text-muted uppercase">14:20</span>
                        </div>
                        <p className={cn(
                          "text-[11px] truncate",
                          session.unread ? "font-black text-dark" : "text-muted font-medium"
                        )}>
                          {session.lastMessage}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                // Chat Messages
                <>
                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar"
                  >
                    {messages.length === 0 && (
                      <div className="text-center py-10 space-y-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                          <MessageSquare className="w-8 h-8 text-gray-200" />
                        </div>
                        <p className="text-[10px] font-black text-muted uppercase tracking-widest">Inicia la conversación</p>
                      </div>
                    )}
                    {messages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={cn(
                          "flex flex-col max-w-[80%]",
                          msg.sender_id === currentUser?.uid ? "ml-auto items-end" : "items-start"
                        )}
                      >
                        <div className={cn(
                          "p-4 rounded-none text-sm font-bold shadow-sm",
                          msg.sender_id === currentUser?.uid 
                            ? "bg-primary text-white" 
                            : "bg-gray-100 text-dark"
                        )}>
                          {msg.text}
                        </div>
                        <div className="flex items-center gap-2 mt-2 px-1">
                          <span className="text-[9px] font-black text-muted uppercase tracking-widest">
                            {msg.sender_id === currentUser?.uid ? 'Tú' : msg.sender_name} • 14:25
                          </span>
                          {msg.sender_id === currentUser?.uid && <CheckCheck className="w-3 h-3 text-primary" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <form 
                    onSubmit={handleSendMessage}
                    className="p-6 border-t border-gray-100 flex gap-3"
                  >
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 bg-gray-50 border-none rounded-none px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="w-14 h-14 bg-primary text-white rounded-none flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-all disabled:opacity-50"
                    >
                      <Send className="w-6 h-6" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 sm:w-20 sm:h-20 rounded-none flex items-center justify-center shadow-2xl transition-all relative group",
          isOpen ? "bg-dark text-white" : "bg-primary text-white shadow-primary/40"
        )}
      >
        {isOpen ? <X className="w-6 h-6 sm:w-8 sm:h-8" /> : <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 group-hover:rotate-12 transition-transform" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-none border-4 border-bg flex items-center justify-center text-[10px] font-black">
            2
          </div>
        )}
      </motion.button>
    </div>
  );
}
