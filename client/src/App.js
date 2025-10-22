import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import PortfolioForm from './components/PortfolioForm';
import PrivateRoute from './components/PrivateRoute';
import GeneratingPortfolio from './pages/GeneratingPortfolio';
import PortfolioPreview from './pages/PortfolioPreview';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/portfolio" 
            element={<PrivateRoute><PortfolioForm /></PrivateRoute>} 
          />
          
          <Route 
            path="/portfolio/generating" 
            element={<PrivateRoute><GeneratingPortfolio /></PrivateRoute>} 
          />
          
          <Route 
            path="/portfolio/preview/:id" 
            element={<PrivateRoute><PortfolioPreview /></PrivateRoute>} 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
