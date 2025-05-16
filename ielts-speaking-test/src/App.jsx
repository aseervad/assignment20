import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Navbar from './components/layout/Navbar';
import Footer from './components/Footer';
import Home from './components/pages/Home';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import SpeakingTests from './components/tests/SpeakingTests';
import ListeningTests from './components/tests/ListeningTests';
import AdminDashboard from './components/AdminDashboard';
import TestTakerDashboard from './components/TestTakerDashboard';

const RequireAuth = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role;

  if (!role) return <Navigate to="/login" />;
  if (!allowedRoles.includes(role)) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navbar />
        <div className="container mt-4 flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/speaking-tests" element={<SpeakingTests />} />
            <Route path="/listening-tests" element={<ListeningTests />} />
            <Route path="/admin-dashboard" element={
              <RequireAuth allowedRoles={['admin']}>
                <AdminDashboard />
              </RequireAuth>
             } />
            <Route path="/test-taker-dashboard" element={
              <RequireAuth allowedRoles={['test_taker']}>
                <TestTakerDashboard />
              </RequireAuth>
             } />
            </Routes>

        </div>
        <Footer />
      </div>
    </Router>
  );
}
                        
export default App;
