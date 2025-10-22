import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../config/firebase';
import toast from 'react-hot-toast';
import './PortfolioPreview.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PortfolioPreview = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    // If data was passed via navigation state, use it
    if (location.state?.portfolioData) {
      setPortfolioData(location.state.portfolioData);
    } else if (id && id !== 'temp') {
      // Otherwise, fetch from API (only if not a temp preview)
      fetchPortfolio();
    }
  }, [id]);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get(
        `${API_URL}/api/portfolio/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setPortfolioData(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load portfolio');
      navigate('/portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
  if (!portfolioData) return;

  try {
    toast.loading('Generating PDF...');
    
    // Get the HTML content
    const htmlContent = portfolioData.generated_html || portfolioData.portfolio?.generated_html;
    
    if (!htmlContent) {
      toast.dismiss();
      toast.error('No HTML content found');
      return;
    }

    // Call backend to generate PDF directly without saving
    const response = await axios.post(
      `${API_URL}/api/portfolio/download-pdf`,
      { htmlContent },
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const fileName = portfolioData.full_name 
      ? `${portfolioData.full_name.replace(/\s+/g, '_')}_Portfolio.pdf`
      : 'Portfolio.pdf';
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.dismiss();
    toast.success('PDF downloaded successfully!');
  } catch (error) {
    console.error('Download error:', error);
    toast.dismiss();
    toast.error('Failed to download PDF. Please try again.');
  }
};


  const handleSaveForLater = () => {
  toast.success('Portfolio generated successfully!');
  navigate('/');
};

  const handleRegenerate = () => {
    if (!location.state?.formData) {
      toast.error('Cannot regenerate - original data not found');
      return;
    }

    setIsRegenerating(true);
    toast.success('Regenerating with new design...');
    
    // Navigate back to generating page with same form data
    navigate('/portfolio/generating', {
      state: { 
        portfolioData: location.state.formData,
        isRegeneration: true // Flag to indicate this is a regeneration
      }
    });
  };

  if (loading) {
    return (
      <div className="preview-container">
        <div className="preview-loading">
          <div className="spinner"></div>
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="preview-container">
        <div className="preview-error">
          <h2>Portfolio not found</h2>
          <button onClick={() => navigate('/portfolio')} className="btn-primary">
            Back to Create
          </button>
        </div>
      </div>
    );
  }

  const htmlContent = portfolioData?.portfolio?.generated_html || portfolioData?.generated_html;

  return (
    <div className="preview-container">
      <div className="preview-header">
        <h2>✨ Your Portfolio is Ready!</h2>
        <p>Preview your portfolio and choose what to do next</p>
        {id === 'temp' && (
          <p className="temp-notice">⚠️ This is a temporary preview. Click "Download" or "Save" to keep it.</p>
        )}
      </div>

      <div className="preview-content">
        <div className="preview-frame">
          {htmlContent ? (
            <iframe
              srcDoc={htmlContent}
              title="Portfolio Preview"
              className="portfolio-iframe"
            />
          ) : (
            <div className="preview-no-html">
              <p>Preview not available</p>
            </div>
          )}
        </div>

        <div className="preview-actions">
          <button onClick={handleDownload} className="btn-download">
            <span className="icon">📥</span>
            <span className="btn-content">
              <strong>Download PDF</strong>
              <span className="subtitle">
                {id === 'temp' ? 'Save & download' : 'Save to device'}
              </span>
            </span>
          </button>

          <button 
            onClick={handleRegenerate} 
            className="btn-regenerate" 
            disabled={isRegenerating || !location.state?.formData}
          >
            <span className="icon">🔄</span>
            <span className="btn-content">
              <strong>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</strong>
              <span className="subtitle">New design, same data</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPreview;
