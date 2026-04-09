import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Loader2, CheckCircle2, Palmtree, Building2, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function AuthModal({ isOpen, onClose, message }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('cliente');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setIsLogin(true);
      setRole('cliente');
      setError(null);
      setSuccess(false);
      setEmail('');
      setPassword('');
      setFullName('');
      setBusinessName('');
      setPhone('');
      setWhatsapp('');
      setAddress('');
    }
  }, [isOpen]);

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
              business_name: businessName,
              phone: phone,
              whatsapp: whatsapp,
              address: address,
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
            className="bg-white w-full max-w-md rounded-none overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="bg-navy p-6 lg:p-10 text-white text-center relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full -ml-16 -mb-16 blur-2xl" />
              
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
              >
                <Palmtree className="w-10 h-10 lg:w-14 lg:h-14 mx-auto mb-4 lg:mb-6 text-accent" />
              </motion.div>
              
              <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter leading-none">
                {isLogin ? 'Bienvenido' : 'Únete'}
              </h2>
              <p className="text-white/50 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.3em] mt-2 lg:mt-4">
                {message || (isLogin ? 'Ingresa a tu cuenta' : 'Crea tu perfil en AcaEnVivo')}
              </p>
            </div>

            <div className="p-6 lg:p-10 overflow-y-auto no-scrollbar">
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 space-y-6"
                >
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-none flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-black text-dark uppercase tracking-tight">
                      ¡Registro exitoso!
                    </p>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
                      Por favor verifica tu correo electrónico
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.form 
                  layout
                  onSubmit={handleAuth} 
                  className="space-y-6"
                >
                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        key="register-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6 overflow-hidden"
                      >
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                            <User className="w-3 h-3" />
                            {role === 'cliente' ? 'Nombre Completo' : 'Nombre del Representante'}
                          </label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-gray-50 border-b-2 border-transparent focus:border-primary rounded-none py-4 px-4 text-xs font-bold transition-all outline-none"
                            placeholder={role === 'cliente' ? 'Juan Pérez' : 'Nombre del titular'}
                          />
                        </div>

                        {role !== 'cliente' && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                          >
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                                <Building2 className="w-3 h-3" />
                                {role === 'hotel' ? 'Nombre del Hotel' : 'Nombre del Negocio'}
                              </label>
                              <input
                                type="text"
                                required
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                className="w-full bg-gray-50 border-b-2 border-transparent focus:border-primary rounded-none py-4 px-4 text-xs font-bold transition-all outline-none"
                                placeholder={role === 'hotel' ? 'Hotel Acapulco Plaza' : 'Restaurante La Perla'}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Teléfono</label>
                                <input
                                  type="tel"
                                  required
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  className="w-full bg-gray-50 border-b-2 border-transparent focus:border-primary rounded-none py-4 px-4 text-xs font-bold transition-all outline-none"
                                  placeholder="7441234567"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted">WhatsApp</label>
                                <input
                                  type="tel"
                                  required
                                  value={whatsapp}
                                  onChange={(e) => setWhatsapp(e.target.value)}
                                  className="w-full bg-gray-50 border-b-2 border-transparent focus:border-primary rounded-none py-4 px-4 text-xs font-bold transition-all outline-none"
                                  placeholder="7441234567"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Dirección</label>
                              <input
                                type="text"
                                required
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full bg-gray-50 border-b-2 border-transparent focus:border-primary rounded-none py-4 px-4 text-xs font-bold transition-all outline-none"
                                placeholder="Av. Costera Miguel Alemán #123"
                              />
                            </div>
                          </motion.div>
                        )}

                        <div className="space-y-2">
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
                                  "py-3 lg:py-4 px-1 rounded-none text-[8px] lg:text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                                  role === option.id 
                                    ? "border-primary bg-primary text-white shadow-lg shadow-primary/20" 
                                    : "border-gray-100 bg-gray-50 text-muted hover:border-gray-200"
                                )}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border-b-2 border-transparent focus:border-primary rounded-none py-4 px-4 text-xs font-bold transition-all outline-none"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="w-3 h-3" />
                          Contraseña
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-gray-50 border-b-2 border-transparent focus:border-primary rounded-none py-4 px-4 text-xs font-bold transition-all outline-none"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[9px] font-black text-rose-500 uppercase tracking-widest text-center bg-rose-50 py-3"
                    >
                      {error}
                    </motion.p>
                  )}

                  <div className="space-y-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-5 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-[0.98]"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isLogin ? 'Entrar' : 'Registrarme')}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="w-full text-[9px] font-black text-muted uppercase tracking-[0.2em] hover:text-primary transition-colors py-2"
                    >
                      {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}
                    </button>
                  </div>
                </motion.form>
              )}
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 lg:top-6 lg:right-6 text-white/60 hover:text-white transition-colors z-10 p-2"
            >
              <X className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
