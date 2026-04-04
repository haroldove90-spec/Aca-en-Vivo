import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import ClienteFeed from './pages/cliente/Feed';
import HotelDashboard from './pages/hotel/Dashboard';
import { Layout } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Routes>
          {/* Cliente Routes */}
          <Route path="/" element={<ClienteFeed />} />
          
          {/* Hotel Routes (Simulated Route Group) */}
          <Route path="/hotel" element={<HotelDashboard />} />
          
          {/* Admin Routes Placeholder */}
          <Route path="/admin" element={
            <div className="p-10 text-center space-y-4">
              <h1 className="text-2xl font-bold text-[#142850]">Panel de Administración</h1>
              <p className="text-gray-500">Próximamente: Gestión de establecimientos y usuarios.</p>
              <Link to="/" className="text-[#00A8CC] font-bold underline">Volver al Inicio</Link>
            </div>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Debug Nav for Prototype */}
        <div className="fixed top-2 right-2 z-50 flex gap-2">
          <Link to="/" className="bg-white/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-[#142850] shadow-sm border border-gray-200">Cliente</Link>
          <Link to="/hotel" className="bg-white/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-[#142850] shadow-sm border border-gray-200">Hotel</Link>
          <Link to="/admin" className="bg-white/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-[#142850] shadow-sm border border-gray-200">Admin</Link>
        </div>
      </div>
    </Router>
  );
}

export default App;
