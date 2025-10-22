import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import axios from 'axios';
import toast from 'react-hot-toast';
import Prism from './backgrounds/Prism';
import Stepper, { Step } from './Stepper';
import { User, Mail, Phone, Briefcase, GraduationCap, Code, Award, Link as LinkIcon, Plus, Trash2, X } from 'lucide-react';

import './PortfolioForm.css';
import TagInput from './TagInput';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function PortfolioForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const stepperRef = useRef(null);

    // Form Data State
    const [formData, setFormData] = useState({
        // Step 1: Personal Information
        fullName: '',
        email: '',
        phone: '',
        bio: '',
        photo: null,

        // Step 2: Education
        education: [
            { institution: '', degree: '', field: '', startYear: '', endYear: '', description: '' }
        ],

        // Step 3: Experience
        experience: [
            { title: '', company: '', location: '', startDate: '', endDate: '', description: '' }
        ],

        // Step 4: Projects
        projects: [
            { title: '', description: '', technologies: '', link: '' }
        ],

        // Step 5: Skills
        skills: {
            technical: [],
            languages: [],
            tools: [],
            soft: []
        },

        // Step 6: Social Links (Optional)
        socialLinks: {
            linkedin: '',
            github: '',
            twitter: '',
            website: ''
        }
    });

    // Add this validation function after useState declarations
    const validateForm = () => {
        // Step 1: Personal Information
        if (!formData.fullName.trim()) {
            return { isValid: false, step: 1, message: 'Full name is required' };
        }
        if (!formData.email.trim()) {
            return { isValid: false, step: 1, message: 'Email is required' };
        }
        if (!formData.phone.trim()) {
            return { isValid: false, step: 1, message: 'Phone number is required' };
        }
        if (!formData.bio.trim()) {
            return { isValid: false, step: 1, message: 'Professional bio is required' };
        }

        // Step 2: Education
        if (formData.education.length === 0 || !formData.education[0].institution.trim()) {
            return { isValid: false, step: 2, message: 'At least one education entry is required' };
        }
        for (let i = 0; i < formData.education.length; i++) {
            const edu = formData.education[i];
            if (!edu.institution.trim() || !edu.degree.trim() || !edu.field.trim() || !edu.startYear.trim() || !edu.endYear.trim()) {
                return { isValid: false, step: 2, message: `Please complete all required fields in Education #${i + 1}` };
            }
        }

        // Step 3: Experience
        if (formData.experience.length === 0 || !formData.experience[0].title.trim()) {
            return { isValid: false, step: 3, message: 'At least one experience entry is required' };
        }
        for (let i = 0; i < formData.experience.length; i++) {
            const exp = formData.experience[i];
            if (!exp.title.trim() || !exp.company.trim() || !exp.startDate.trim() || !exp.endDate.trim() || !exp.description.trim()) {
                return { isValid: false, step: 3, message: `Please complete all required fields in Experience #${i + 1}` };
            }
        }

        // Step 4: Projects
        if (formData.projects.length === 0 || !formData.projects[0].title.trim()) {
            return { isValid: false, step: 4, message: 'At least one project is required' };
        }
        for (let i = 0; i < formData.projects.length; i++) {
            const proj = formData.projects[i];
            if (!proj.title.trim() || !proj.description.trim() || !proj.technologies.trim()) {
                return { isValid: false, step: 4, message: `Please complete all required fields in Project #${i + 1}` };
            }
        }

        return { isValid: true };
    };


    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle photo upload
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, photo: file });
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    // Handle Education array
    const handleEducationChange = (index, field, value) => {
        const newEducation = [...formData.education];
        newEducation[index][field] = value;
        setFormData({ ...formData, education: newEducation });
    };

    const addEducation = () => {
        setFormData({
            ...formData,
            education: [...formData.education, { institution: '', degree: '', field: '', startYear: '', endYear: '', description: '' }]
        });
    };

    const removeEducation = (index) => {
        const newEducation = formData.education.filter((_, i) => i !== index);
        setFormData({ ...formData, education: newEducation });
    };

    // Handle Experience array
    const handleExperienceChange = (index, field, value) => {
        const newExperience = [...formData.experience];
        newExperience[index][field] = value;
        setFormData({ ...formData, experience: newExperience });
    };

    const addExperience = () => {
        setFormData({
            ...formData,
            experience: [...formData.experience, { title: '', company: '', location: '', startDate: '', endDate: '', description: '' }]
        });
    };

    const removeExperience = (index) => {
        const newExperience = formData.experience.filter((_, i) => i !== index);
        setFormData({ ...formData, experience: newExperience });
    };

    // Handle Projects array
    const handleProjectChange = (index, field, value) => {
        const newProjects = [...formData.projects];
        newProjects[index][field] = value;
        setFormData({ ...formData, projects: newProjects });
    };

    const addProject = () => {
        setFormData({
            ...formData,
            projects: [...formData.projects, { title: '', description: '', technologies: '', link: '' }]
        });
    };

    const removeProject = (index) => {
        const newProjects = formData.projects.filter((_, i) => i !== index);
        setFormData({ ...formData, projects: newProjects });
    };

    // Handle Skills (comma-separated input)
    const handleSkillsChange = (category, value) => {
        const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
        setFormData({
            ...formData,
            skills: {
                ...formData.skills,
                [category]: skillsArray
            }
        });
    };

    // Handle Social Links
    const handleSocialChange = (platform, value) => {
        setFormData({
            ...formData,
            socialLinks: {
                ...formData.socialLinks,
                [platform]: value
            }
        });
    };

    // Form Submission
    const handleSubmit = async () => {
        // Validate first
        const validation = validateForm();

        if (!validation.isValid) {
            toast.error(validation.message);
            stepperRef.current?.goToStep(validation.step);
            return;
        }

        try {
            // Create a serializable object instead of FormData
            const portfolioData = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                bio: formData.bio,
                photo: formData.photo, // Keep the File object reference
                education: formData.education,
                experience: formData.experience,
                projects: formData.projects,
                skills: formData.skills,
                socialLinks: formData.socialLinks,
            };

            // Navigate to generating page with serializable data
            navigate('/portfolio/generating', {
                state: { portfolioData }
            });

        } catch (error) {
            console.error('Error preparing form:', error);
            toast.error('Failed to prepare form data');
        }
    };




    return (
        <div className="portfolio-form-container">
            {/* Prism Background */}
            <div className="portfolio-background">
                <Prism
                    height={4.0}
                    baseWidth={6.0}
                    animationType="3drotate"
                    glow={1.5}
                    noise={0.3}
                    scale={3.5}
                    hueShift={0}
                    colorFrequency={1.0}
                    bloom={1.2}
                    timeScale={0.25}
                />
            </div>

            {/* Stepper Form */}
            <Stepper
                ref={stepperRef}  // ADD THIS
                initialStep={1}
                onFinalStepCompleted={handleSubmit}
                nextButtonText="Next Step"
                backButtonText="Back"
            >

                {/* Step 1: Personal Information */}
                <Step>
                    <div className="step-content">
                        <div className="step-header">
                            <User size={32} className="step-icon" />
                            <h2>Personal Information</h2>
                            <p>Let's start with your basic details</p>
                        </div>

                        {/* Profile Photo - Centered at Top */}
                        <div className="photo-upload-section">
                            <label className="photo-label">Profile Photo</label>
                            {photoPreview ? (
                                <div className="photo-preview-circle">
                                    <img src={photoPreview} alt="Preview" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPhotoPreview(null);
                                            setFormData({ ...formData, photo: null });
                                        }}
                                        className="remove-photo-btn"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <label className="upload-circle-label">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        style={{ display: 'none' }}
                                    />
                                    <div className="upload-circle">
                                        <Plus size={40} />
                                        <span>Upload Photo</span>
                                    </div>
                                </label>
                            )}
                        </div>

                        {/* Form Fields */}
                        <div className="form-grid">
                            {/* Full Name */}
                            <div className="form-field full-width">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Tanvir Rahman"
                                    required
                                />
                            </div>

                            {/* Professional Bio */}
                            <div className="form-field full-width">
                                <label>Professional Bio *</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Brief description about yourself..."
                                    rows="4"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="form-field">
                                <label>Email *</label>
                                <div className="input-with-icon">
                                    <Mail size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="tanvir@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="form-field">
                                <label>Phone *</label>
                                <div className="input-with-icon">
                                    <Phone size={18} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+88 (01) 123-456-789"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Step>


                {/* Step 2: Education */}
                <Step>
                    <div className="step-content">
                        <div className="step-header">
                            <GraduationCap size={32} className="step-icon" />
                            <h2>Education</h2>
                            <p>Add your educational background</p>
                        </div>

                        {formData.education.map((edu, index) => (
                            <div key={index} className="dynamic-section">
                                <div className="section-header">
                                    <h3>Education #{index + 1}</h3>
                                    {formData.education.length > 1 && (
                                        <button type="button" onClick={() => removeEducation(index)} className="remove-btn">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                <div className="form-grid">
                                    <div className="form-field">
                                        <label>Institution *</label>
                                        <input
                                            type="text"
                                            value={edu.institution}
                                            onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                                            placeholder="University Name"
                                            required
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Degree *</label>
                                        <input
                                            type="text"
                                            value={edu.degree}
                                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                            placeholder="Bachelor's, Master's, etc."
                                            required
                                        />
                                    </div>

                                    <div className="form-field full-width">
                                        <label>Field of Study *</label>
                                        <input
                                            type="text"
                                            value={edu.field}
                                            onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                                            placeholder="Computer Science, Business, etc."
                                            required
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Start Year *</label>
                                        <select
                                            value={edu.startYear}
                                            onChange={(e) => handleEducationChange(index, 'startYear', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Year</option>
                                            {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-field">
                                        <label>End Year *</label>
                                        <select
                                            value={edu.endYear}
                                            onChange={(e) => handleEducationChange(index, 'endYear', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Year</option>
                                            {Array.from({ length: 85 }, (_, i) => new Date().getFullYear() + 10 - i).map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-field full-width">
                                        <label>Description</label>
                                        <textarea
                                            value={edu.description}
                                            onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                                            placeholder="Key achievements, GPA, honors, etc..."
                                            rows="3"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button type="button" onClick={addEducation} className="add-btn">
                            <Plus size={18} />
                            Add Another Education
                        </button>
                    </div>
                </Step>


                {/* Step 3: Experience */}
                <Step>
                    <div className="step-content">
                        <div className="step-header">
                            <Briefcase size={32} className="step-icon" />
                            <h2>Work Experience</h2>
                            <p>Share your professional journey</p>
                        </div>

                        {formData.experience.map((exp, index) => (
                            <div key={index} className="dynamic-section">
                                <div className="section-header">
                                    <h3>Experience #{index + 1}</h3>
                                    {formData.experience.length > 1 && (
                                        <button type="button" onClick={() => removeExperience(index)} className="remove-btn">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                <div className="form-grid">
                                    <div className="form-field">
                                        <label>Job Title *</label>
                                        <input
                                            type="text"
                                            value={exp.title}
                                            onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                                            placeholder="Software Engineer"
                                            required
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Company *</label>
                                        <input
                                            type="text"
                                            value={exp.company}
                                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                            placeholder="Company Name"
                                            required
                                        />
                                    </div>

                                    <div className="form-field full-width">
                                        <label>Location</label>
                                        <input
                                            type="text"
                                            value={exp.location}
                                            onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                                            placeholder="City, Country"
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Start Year *</label>
                                        <select
                                            value={exp.startDate}
                                            onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Year</option>
                                            {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-field">
                                        <label>End Year *</label>
                                        <select
                                            value={exp.endDate}
                                            onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Year</option>
                                            <option value="Present">Present</option>
                                            {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-field full-width">
                                        <label>Description *</label>
                                        <textarea
                                            value={exp.description}
                                            onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                            placeholder="Describe your responsibilities and achievements..."
                                            rows="4"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button type="button" onClick={addExperience} className="add-btn">
                            <Plus size={18} />
                            Add Another Experience
                        </button>
                    </div>
                </Step>


                {/* Step 4: Projects */}
                <Step>
                    <div className="step-content">
                        <div className="step-header">
                            <Code size={32} className="step-icon" />
                            <h2>Projects</h2>
                            <p>Showcase your best work</p>
                        </div>

                        {formData.projects.map((project, index) => (
                            <div key={index} className="dynamic-section">
                                <div className="section-header">
                                    <h3>Project #{index + 1}</h3>
                                    {formData.projects.length > 1 && (
                                        <button type="button" onClick={() => removeProject(index)} className="remove-btn">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                <div className="form-grid">
                                    <div className="form-field full-width">
                                        <label>Project Title *</label>
                                        <input
                                            type="text"
                                            value={project.title}
                                            onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                                            placeholder="E-commerce Platform"
                                            required
                                        />
                                    </div>

                                    <div className="form-field full-width">
                                        <label>Description *</label>
                                        <textarea
                                            value={project.description}
                                            onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                                            placeholder="Describe your project, its features and impact..."
                                            rows="3"
                                            required
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Technologies Used *</label>
                                        <input
                                            type="text"
                                            value={project.technologies}
                                            onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                                            placeholder="React, Node.js, MongoDB"
                                            required
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Project Link</label>
                                        <input
                                            type="url"
                                            value={project.link}
                                            onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                                            placeholder="https://project-demo.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button type="button" onClick={addProject} className="add-btn">
                            <Plus size={18} />
                            Add Another Project
                        </button>
                    </div>
                </Step>

                {/* Step 5: Skills */}
                <Step>
                    <div className="step-content">
                        <div className="step-header">
                            <Award size={32} className="step-icon" />
                            <h2>Skills</h2>
                            <p>Add your skills as tags</p>
                        </div>

                        <div className="form-grid">
                            <div className="form-field full-width">
                                <label>Technical Skills</label>
                                <TagInput
                                    tags={formData.skills.technical}
                                    onTagsChange={(tags) => setFormData({
                                        ...formData,
                                        skills: { ...formData.skills, technical: tags }
                                    })}
                                    placeholder="Type a skill and press Enter"
                                />
                            </div>

                            <div className="form-field full-width">
                                <label>Languages</label>
                                <TagInput
                                    tags={formData.skills.languages}
                                    onTagsChange={(tags) => setFormData({
                                        ...formData,
                                        skills: { ...formData.skills, languages: tags }
                                    })}
                                    placeholder="Type a language and press Enter"
                                />
                            </div>

                            <div className="form-field full-width">
                                <label>Tools & Technologies</label>
                                <TagInput
                                    tags={formData.skills.tools}
                                    onTagsChange={(tags) => setFormData({
                                        ...formData,
                                        skills: { ...formData.skills, tools: tags }
                                    })}
                                    placeholder="Type a tool and press Enter"
                                />
                            </div>

                            <div className="form-field full-width">
                                <label>Soft Skills</label>
                                <TagInput
                                    tags={formData.skills.soft}
                                    onTagsChange={(tags) => setFormData({
                                        ...formData,
                                        skills: { ...formData.skills, soft: tags }
                                    })}
                                    placeholder="Type a skill and press Enter"
                                />
                            </div>
                        </div>
                    </div>
                </Step>



                {/* Step 6: Social Links (Optional) */}
                <Step>
                    <div className="step-content">
                        <div className="step-header">
                            <LinkIcon size={32} className="step-icon" />
                            <h2>Social Links</h2>
                            <p>Add your online presence (optional)</p>
                        </div>

                        <div className="form-grid">
                            <div className="form-field full-width">
                                <label>LinkedIn Profile</label>
                                <input
                                    type="url"
                                    value={formData.socialLinks.linkedin}
                                    onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                />
                            </div>

                            <div className="form-field full-width">
                                <label>GitHub Profile</label>
                                <input
                                    type="url"
                                    value={formData.socialLinks.github}
                                    onChange={(e) => handleSocialChange('github', e.target.value)}
                                    placeholder="https://github.com/yourusername"
                                />
                            </div>

                            <div className="form-field full-width">
                                <label>Twitter Profile</label>
                                <input
                                    type="url"
                                    value={formData.socialLinks.twitter}
                                    onChange={(e) => handleSocialChange('twitter', e.target.value)}
                                    placeholder="https://twitter.com/yourusername"
                                />
                            </div>

                            <div className="form-field full-width">
                                <label>Personal Website</label>
                                <input
                                    type="url"
                                    value={formData.socialLinks.website}
                                    onChange={(e) => handleSocialChange('website', e.target.value)}
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                        </div>
                    </div>
                </Step>
            </Stepper>
        </div>
    );
}

export default PortfolioForm;



