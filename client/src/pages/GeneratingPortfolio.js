import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../config/firebase';
import toast from 'react-hot-toast';
import './GeneratingPortfolio.css';

const GeneratingPortfolio = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('Uploading photo...');

    // Use a ref to prevent double execution
    const hasGeneratedRef = useRef(false);

    useEffect(() => {
        // Prevent double execution in React Strict Mode
        if (hasGeneratedRef.current) return;
        hasGeneratedRef.current = true;

        generatePortfolio();
    }, []);

    const generatePortfolio = async () => {
        try {
            const portfolioData = location.state?.portfolioData;
            if (!portfolioData) {
                toast.error('No form data found');
                navigate('/portfolio');
                return;
            }

            // Progress simulation with steps
            const steps = [
                { percent: 25, message: 'Uploading photo...' },
                { percent: 50, message: 'Generating HTML design...' },
                { percent: 75, message: 'Creating PDF...' },
                { percent: 90, message: 'Finalizing...' }
            ];

            let stepIndex = 0;
            const progressInterval = setInterval(() => {
                if (stepIndex < steps.length) {
                    setProgress(steps[stepIndex].percent);
                    setCurrentStep(steps[stepIndex].message);
                    stepIndex++;
                }
            }, 1000);

            // Convert portfolioData object to FormData
            const formDataToSend = new FormData();
            formDataToSend.append('fullName', portfolioData.fullName);
            formDataToSend.append('email', portfolioData.email);
            formDataToSend.append('phone', portfolioData.phone);
            formDataToSend.append('bio', portfolioData.bio);

            if (portfolioData.photo) {
                formDataToSend.append('photo', portfolioData.photo);
            }

            formDataToSend.append('education', JSON.stringify(portfolioData.education));
            formDataToSend.append('experience', JSON.stringify(portfolioData.experience));
            formDataToSend.append('projects', JSON.stringify(portfolioData.projects));
            formDataToSend.append('skills', JSON.stringify(portfolioData.skills));
            formDataToSend.append('socialLinks', JSON.stringify(portfolioData.socialLinks));

            const token = await auth.currentUser.getIdToken();
            const response = await axios.post(
                'http://localhost:5000/api/portfolio/create',
                formDataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            clearInterval(progressInterval);
            setProgress(100);
            setCurrentStep('Complete!');

            setTimeout(() => {
                navigate(`/portfolio/preview/temp`, {  // ← Use 'temp' as ID for unsaved portfolios
                    state: {
                        portfolioData: response.data,
                        formData: portfolioData // Keep form data for regeneration
                    }
                });
            }, 500);
        } catch (err) {
            console.error('Generation error:', err);
            toast.error(err.response?.data?.error || 'Failed to generate portfolio');
            navigate('/portfolio');
        }
    };

    return (
        <div className="generating-container">
            <div className="generating-content">
                <div className="generating-icon">
                    <div className="spinner"></div>
                </div>

                <h2>Creating Your Portfolio</h2>
                <p className="current-step">{currentStep}</p>

                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}>
                        <span className="progress-text">{progress}%</span>
                    </div>
                </div>

                <div className="progress-steps">
                    <div className={`step ${progress >= 25 ? 'active' : ''}`}>
                        <div className="step-icon">{progress >= 25 ? '✓' : '1'}</div>
                        <p>Upload Photo</p>
                    </div>
                    <div className={`step ${progress >= 50 ? 'active' : ''}`}>
                        <div className="step-icon">{progress >= 50 ? '✓' : '2'}</div>
                        <p>Generate HTML</p>
                    </div>
                    <div className={`step ${progress >= 75 ? 'active' : ''}`}>
                        <div className="step-icon">{progress >= 75 ? '✓' : '3'}</div>
                        <p>Create PDF</p>
                    </div>
                    <div className={`step ${progress === 100 ? 'active' : ''}`}>
                        <div className="step-icon">{progress === 100 ? '✓' : '4'}</div>
                        <p>Finalize</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneratingPortfolio;
