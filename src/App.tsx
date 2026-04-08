import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { AuthModal } from './components/AuthModal';
import ClienteFeed from './pages/cliente/Feed';
import ClienteFavorites from './pages/cliente/Favorites';
import ClienteReservations from './pages/cliente/Reservations';
import ClienteProfile from './pages/cliente/Profile';
import ClienteSettings from './pages/cliente/Settings';
import NotificationHistory from './pages/cliente/NotificationHistory';
import BusinessDetail from './pages/cliente/BusinessDetail';
import HotelDashboard from './pages/hotel/Dashboard';
import DevDashboard from './pages/admin/DevDashboard';
import AgenciaDashboard from './pages/admin/AgenciaDashboard';
import NegocioDashboard from './pages/negocio/Dashboard';
import ClasificadosDashboard from './pages/clasificados/Dashboard';
import { Loader2 } from 'lucide-react';
import { Layout } from './components/Layout';
import { NotificationProvider } from './contexts/NotificationContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { SearchProvider } from './contexts/SearchContext';
import { CartProvider } from './contexts/CartContext';

// --- Route Guard Component ---
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setRole(profile?.role || 'cliente');
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setRole(profile?.role || 'cliente');
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#142850]">
        <Loader2 className="w-12 h-12 text-[#00A8CC] animate-spin" />
      </div>
    );
  }

  // For this prototype, if not logged in, we allow access to simulate the flow
  // In production, we would redirect to login: if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  
  if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    // If user has wrong role, redirect to their dashboard or home
    if (role === 'hotel') return <Navigate to="/hotel" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <NotificationProvider>
      <FavoritesProvider>
        <SearchProvider>
          <CartProvider>
            <Router>
              <div className="min-h-screen bg-bg font-sans">
                <Routes>
              {/* Public Feed */}
              <Route path="/" element={<Layout onAuthClick={() => setIsAuthOpen(true)}><ClienteFeed /></Layout>} />
              <Route path="/favoritos" element={<Layout onAuthClick={() => setIsAuthOpen(true)}><ClienteFavorites /></Layout>} />
              <Route path="/reservas" element={<Layout onAuthClick={() => setIsAuthOpen(true)}><ClienteReservations /></Layout>} />
              <Route path="/perfil" element={<Layout onAuthClick={() => setIsAuthOpen(true)}><ClienteProfile /></Layout>} />
              <Route path="/settings" element={<Layout onAuthClick={() => setIsAuthOpen(true)}><ClienteSettings /></Layout>} />
              <Route path="/notificaciones" element={<Layout onAuthClick={() => setIsAuthOpen(true)}><NotificationHistory /></Layout>} />
              <Route path="/business/:id" element={<Layout onAuthClick={() => setIsAuthOpen(true)}><BusinessDetail /></Layout>} />
              
              {/* Hotel Dashboard (Protected) */}
              <Route 
                path="/hotel" 
                element={
                  <ProtectedRoute allowedRoles={['hotel', 'admin', 'agencia']}>
                    <Layout onAuthClick={() => setIsAuthOpen(true)}>
                      <HotelDashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Agencia Panel (Protected) */}
              <Route 
                path="/admin-agencia" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'agencia']}>
                    <Layout onAuthClick={() => setIsAuthOpen(true)}>
                      <AgenciaDashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Negocio Panel (Protected) */}
              <Route 
                path="/negocio" 
                element={
                  <ProtectedRoute allowedRoles={['negocio', 'admin', 'agencia']}>
                    <Layout onAuthClick={() => setIsAuthOpen(true)}>
                      <NegocioDashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Dev Dashboard (Protected) */}
              <Route 
                path="/admin-dev" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout onAuthClick={() => setIsAuthOpen(true)}>
                      <DevDashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Clasificados Dashboard (Protected) */}
              <Route 
                path="/clasificados" 
                element={
                  <ProtectedRoute allowedRoles={['clasificados', 'admin', 'agencia']}>
                    <Layout onAuthClick={() => setIsAuthOpen(true)}>
                      <ClasificadosDashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(true)} />
        </Router>
          </CartProvider>
        </SearchProvider>
      </FavoritesProvider>
    </NotificationProvider>
  );
}

export default App;
