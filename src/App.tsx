import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import ClienteFeed from './pages/cliente/Feed';
import ClienteFavorites from './pages/cliente/Favorites';
import ClienteReservations from './pages/cliente/Reservations';
import ClienteProfile from './pages/cliente/Profile';
import ClienteSettings from './pages/cliente/Settings';
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

// --- Route Guard Component ---
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch role from Firestore
        const userDoc = await getDoc(doc(db, 'profiles', currentUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        } else {
          setRole('cliente'); // Default
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
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
  return (
    <NotificationProvider>
      <FavoritesProvider>
        <SearchProvider>
          <Router>
            <div className="min-h-screen bg-bg font-sans">
              <Routes>
            {/* Public Feed */}
            <Route path="/" element={<Layout><ClienteFeed /></Layout>} />
            <Route path="/favoritos" element={<Layout><ClienteFavorites /></Layout>} />
            <Route path="/reservas" element={<Layout><ClienteReservations /></Layout>} />
            <Route path="/perfil" element={<Layout><ClienteProfile /></Layout>} />
            <Route path="/settings" element={<Layout><ClienteSettings /></Layout>} />
            
            {/* Hotel Dashboard (Protected) */}
            <Route 
              path="/hotel" 
              element={
                <ProtectedRoute allowedRoles={['hotel', 'admin']}>
                  <Layout>
                    <HotelDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Agencia Panel (Protected) */}
            <Route 
              path="/admin-agencia" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <AgenciaDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            {/* Negocio Panel (Protected) */}
            <Route 
              path="/negocio" 
              element={
                <ProtectedRoute allowedRoles={['negocio', 'admin']}>
                  <Layout>
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
                  <Layout>
                    <DevDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            {/* Clasificados Dashboard (Protected) */}
            <Route 
              path="/clasificados" 
              element={
                <ProtectedRoute allowedRoles={['clasificados', 'admin']}>
                  <Layout>
                    <ClasificadosDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
        </SearchProvider>
      </FavoritesProvider>
    </NotificationProvider>
  );
}

export default App;
