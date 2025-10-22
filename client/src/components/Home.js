import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PrismaticBurst from './backgrounds/PrismaticBurst';
import PillNav from './ui/PillNav';
import SplitText from './animations/SplitText';
import { Sparkles, Zap, Download, User, LayoutDashboard, LogOut, ArrowRight } from 'lucide-react'; // Added ArrowRight
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      navigate('/portfolio');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
  };

  const navItems = [];

  return (
    <div className="home-container">
      {/* PillNav */}
      <PillNav
        logo="/portico.svg"
        logoAlt="Portico - AI Portfolio Generator"
        items={navItems}
        activeHref="/"
        baseColor="#fff"
        pillColor="#667eea"
        hoveredPillTextColor="#fff"
        pillTextColor="#fff"
      />

      {/* Profile Menu / Login Button */}
      <div className="nav-auth">
        {user ? (
          <div className="profile-dropdown">
            <button 
              className="profile-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <User size={20} />
            </button>
            
            {showProfileMenu && (
              <div className="profile-menu">
                <button 
                  className="profile-menu-item"
                  onClick={() => { navigate('/dashboard'); setShowProfileMenu(false); }}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </button>
                <button 
                  className="profile-menu-item"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            className="login-button"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        )}
      </div>

      {/* Animated Background */}
      <div className="home-background">
        <PrismaticBurst
          intensity={2}
          speed={0.5}
          animationType="rotate3d"
          colors={['#667eea', '#764ba2', '#f093fb', '#4facfe']}
          distort={15}
          rayCount={8}
          mixBlendMode="lighten"
        />
      </div>

      {/* Content - Single Page, No Scroll */}
      <div className="home-content">
        <div className="hero-compact">
          {/* Hero */}
          <div className="hero-text">
            <SplitText
              text="Portico"
              className="hero-title-compact"
              delay={50}
              duration={0.8}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
            />
            
            <p className="hero-subtitle-compact fade-in-delayed">
              Create stunning, professional portfolios in seconds with AI
            </p>

            <button className="cta-button-compact" onClick={handleGetStarted}>
              <Sparkles size={20} />
              Get Started Free
              <span className="cta-shine"></span>
            </button>
          </div>

          {/* How It Works - Compact */}
          <div className="steps-compact">
            <div className="step-mini">
              <div className="step-icon-mini">
                <Zap size={24} />
              </div>
              <h4>Fill Details</h4>
            </div>

            {/* Changed: Now using ArrowRight icon */}
            <div className="step-arrow-mini">
              <ArrowRight size={28} strokeWidth={2} />
            </div>

            <div className="step-mini">
              <div className="step-icon-mini">
                <Sparkles size={24} />
              </div>
              <h4>AI Generates</h4>
            </div>

            {/* Changed: Now using ArrowRight icon */}
            <div className="step-arrow-mini">
              <ArrowRight size={28} strokeWidth={2} />
            </div>

            <div className="step-mini">
              <div className="step-icon-mini">
                <Download size={24} />
              </div>
              <h4>Download PDF</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
