import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import ClienteFeed from './pages/cliente/Feed';
import HotelDashboard from './pages/hotel/Dashboard';
import DevDashboard from './pages/admin/DevDashboard';
import AgenciaDashboard from './pages/admin/AgenciaDashboard';
import { Loader2 } from 'lucide-react';

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

function NavSwitcher() {
  const navigate = useNavigate();
  
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      <div className="bg-[#142850]/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-1">
        <button 
          onClick={() => navigate('/')} 
          className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#00A8CC] hover:bg-white/5 transition-colors"
        >
          Feed Cliente
        </button>
        <button 
          onClick={() => navigate('/hotel')} 
          className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-colors"
        >
          Panel Hotel
        </button>
        <button 
          onClick={() => navigate('/admin-agencia')} 
          className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:bg-white/5 transition-colors"
        >
          Agencia
        </button>
        <button 
          onClick={() => navigate('/admin-dev')} 
          className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-yellow-400 hover:bg-white/5 transition-colors"
        >
          Dev Master
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Routes>
          {/* Public Feed */}
          <Route path="/" element={<ClienteFeed />} />
          
          {/* Hotel Dashboard (Protected) */}
          <Route 
            path="/hotel" 
            element={
              <ProtectedRoute allowedRoles={['hotel', 'admin']}>
                <HotelDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Agencia Panel (Protected) */}
          <Route 
            path="/admin-agencia" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AgenciaDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Dev Dashboard (Protected) */}
          <Route 
            path="/admin-dev" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DevDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <NavSwitcher />
      </div>
    </Router>
  );
}

export default App;
