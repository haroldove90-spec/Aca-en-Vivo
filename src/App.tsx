import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import ClienteFeed from './pages/cliente/Feed';
import HotelDashboard from './pages/hotel/Dashboard';
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
          
          {/* Admin Panel (Protected) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="p-10 text-center space-y-4 bg-white min-h-screen">
                  <h1 className="text-2xl font-black text-[#142850] uppercase tracking-tighter">Admin Agency</h1>
                  <p className="text-gray-500 text-sm">Gestión centralizada de hoteles y clasificados.</p>
                  <button onClick={() => window.location.href = '/'} className="text-[#00A8CC] font-bold underline">Volver al Inicio</button>
                </div>
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Prototype Navigation Switcher */}
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
          <div className="bg-[#142850]/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-1">
            <button 
              onClick={() => window.location.href = '/'} 
              className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#00A8CC] hover:bg-white/5 transition-colors"
            >
              Feed Cliente
            </button>
            <button 
              onClick={() => window.location.href = '/hotel'} 
              className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-colors"
            >
              Panel Hotel
            </button>
            <button 
              onClick={() => window.location.href = '/admin'} 
              className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/5 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;

