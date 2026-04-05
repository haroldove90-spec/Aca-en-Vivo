import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
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

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  created_at: any;
  sender_name?: string;
  sender_role?: string;
}

interface ChatSession {
  userId: string;
  userName: string;
  userRole: string;
  lastMessage: string;
  timestamp: any;
  unread: boolean;
}

export function SupportChat({ isAdmin = false }: { isAdmin?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUser = auth.currentUser;
  const adminId = 'admin-agencia-1'; // Fixed admin ID for support

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Listen for messages
  useEffect(() => {
    if (!isOpen) return;

    let q;
    if (isAdmin) {
      if (activeChat) {
        // Messages for a specific chat session
        q = query(
          collection(db, 'messages'),
          where('session_id', '==', activeChat),
          orderBy('created_at', 'asc'),
          limit(50)
        );
      } else {
        // Listen for all sessions (simplified for demo)
        setSessions([
          { userId: 'hotel-2', userName: 'Hotel Emporio', userRole: 'hotel', lastMessage: '¿Cómo puedo actualizar mi plan?', timestamp: new Date(), unread: true },
          { userId: 'negocio-1', userName: 'Yates Bonanza', userRole: 'negocio', lastMessage: 'Gracias por la ayuda.', timestamp: new Date(Date.now() - 3600000), unread: false },
        ]);
        return;
      }
    } else {
      // For business owner, listen to their chat with admin
      const sessionId = currentUser?.uid || 'guest';
      q = query(
        collection(db, 'messages'),
        where('session_id', '==', sessionId),
        orderBy('created_at', 'asc'),
        limit(50)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [isOpen, isAdmin, activeChat, currentUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const sessionId = isAdmin ? activeChat : (currentUser?.uid || 'guest');
    if (!sessionId) return;

    try {
      await addDoc(collection(db, 'messages'), {
        session_id: sessionId,
        sender_id: currentUser?.uid || 'guest',
        receiver_id: isAdmin ? sessionId : adminId,
        text: newMessage,
        created_at: serverTimestamp(),
        sender_name: isAdmin ? 'Admin Agencia' : (currentUser?.displayName || 'Socio'),
        sender_role: isAdmin ? 'admin' : 'socio'
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="fixed bottom-20 lg:bottom-10 right-6 lg:right-10 z-[150]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-none shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-gray-100 w-[calc(100vw-3rem)] sm:w-[400px] h-[500px] sm:h-[600px] flex flex-col overflow-hidden mb-6"
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
