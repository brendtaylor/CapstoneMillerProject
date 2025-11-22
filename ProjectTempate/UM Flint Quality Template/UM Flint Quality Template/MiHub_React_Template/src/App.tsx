import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './components/AuthContext';
import axios from 'axios';
import { Toaster } from "./components/ui/toaster"
import { AnimatePresence, motion } from "framer-motion";
import TicketDetails from './pages/quality/TicketDetails';

//Page Imports
import Quality from './pages/quality/quality';
import Schedule from './pages/quality/schedule';
import Documents from './pages/quality/documents';
import Purchasing from './pages/quality/purchasing';


// const PrivateRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
//   const { isAuthenticated, loading } = useAuth();
//   if (loading) return <div>Loading...</div>;
//   return isAuthenticated ? element : <Navigate to="/login" />;
// };

const AppContent: React.FC = () => {
  const location = useLocation();
  // const { isAuthenticated, username } = useAuth();
  // const isLoginPage = location.pathname === '/login';

  const pageVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
    exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } },
  };   

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 px-2">
            <motion.div
              key={location.pathname} // Ensure animation triggers on route change
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
            >
            <Routes>
              <Route path="/" element={<Navigate to="/quality" replace />} />
              <Route path="/quality" element={<Quality />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/purchasing" element={<Purchasing />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/tickets/:id" element={<TicketDetails />} />
            </Routes>
          </motion.div>
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
          <div className="flex flex-col h-screen">
            <Toaster />
            <AppContent />
          </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
