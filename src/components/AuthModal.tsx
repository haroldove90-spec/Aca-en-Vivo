import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Loader2, CheckCircle2, Palmtree } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('cliente');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`,
            },
          },
        });
        if (error) throw error;
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setIsLogin(true);
          onClose();
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-dark/90 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-md rounded-none overflow-hidden relative shadow-2xl"
          >
            <div className="bg-primary p-8 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <Palmtree className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                {isLogin ? 'Bienvenido de Nuevo' : 'Únete a AcaEnVivo'}
              </h2>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-2">
                {isLogin ? 'Ingresa a tu cuenta' : 'Crea tu perfil de viajero'}
              </p>
            </div>

            <div className="p-8">
              {success ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-none flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-dark uppercase tracking-tight">
                    ¡Registro exitoso! Por favor verifica tu correo.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAuth} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted">Nombre Completo</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-none py-3 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary/20"
                            placeholder="Juan Pérez"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted">Tipo de Cuenta</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'cliente', label: 'Cliente' },
                            { id: 'hotel', label: 'Hotel' },
                            { id: 'negocio', label: 'Negocio' }
                          ].map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setRole(option.id)}
                              className={cn(
                                "py-2 text-[10px] font-black uppercase tracking-tighter border-2 transition-all",
                                role === option.id 
                                  ? "border-primary bg-primary text-white" 
                                  : "border-gray-100 bg-gray-50 text-muted hover:border-gray-200"
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-none py-3 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary/20"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-none py-3 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary/20"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest text-center">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isLogin ? 'Entrar' : 'Registrarme')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="w-full text-[10px] font-black text-muted uppercase tracking-widest hover:text-primary transition-colors"
                  >
                    {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}
                  </button>
                </form>
              )}
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
