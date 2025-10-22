const supabase = require('../config/supabase');
const cloudinary = require('../config/cloudinary');
const { generatePortfolioHTML } = require('../utils/htmlGenerator');
const { generatePDF } = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs').promises;

exports.createPortfolio = async (req, res) => {
  console.log('📝 Portfolio creation started');
  console.log('User ID:', req.user.uid);
  
  // DEBUG: Log raw body
  console.log('🔍 Raw request body:', req.body);

  try {
    const userId = req.user.uid;

    // Parse JSON fields - with proper checking
    let education, experience, projects, skills, socialLinks;

    try {
      // Check if the field is already an array/object or needs parsing
      education = Array.isArray(req.body.education) 
        ? req.body.education 
        : (req.body.education && req.body.education !== 'undefined') 
          ? JSON.parse(req.body.education) 
          : [];
      
      experience = Array.isArray(req.body.experience) 
        ? req.body.experience 
        : (req.body.experience && req.body.experience !== 'undefined') 
          ? JSON.parse(req.body.experience) 
          : [];
      
      projects = Array.isArray(req.body.projects) 
        ? req.body.projects 
        : (req.body.projects && req.body.projects !== 'undefined') 
          ? JSON.parse(req.body.projects) 
          : [];
      
      // Handle skills specially - it can be undefined
      if (!req.body.skills || req.body.skills === 'undefined') {
        skills = { technical: [], languages: [], tools: [], soft: [] };
      } else if (typeof req.body.skills === 'object' && !Array.isArray(req.body.skills)) {
        skills = req.body.skills;
      } else {
        skills = JSON.parse(req.body.skills);
      }
      
      socialLinks = (typeof req.body.socialLinks === 'object' && !Array.isArray(req.body.socialLinks))
        ? req.body.socialLinks
        : (req.body.socialLinks && req.body.socialLinks !== 'undefined') 
          ? JSON.parse(req.body.socialLinks) 
          : {};

      console.log('✅ Parsed data:', { 
        education: education.length, 
        experience: experience.length, 
        projects: projects.length, 
        skills, 
        socialLinks 
      });
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      return res.status(400).json({
        error: 'Invalid JSON format in form data',
        details: parseError.message
      });
    }

    // Upload photo to Cloudinary
    let photoUrl = null;
    if (req.file) {
      console.log('📤 Uploading photo to Cloudinary...');
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'portfolios',
              public_id: `${userId}_${Date.now()}`,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
        
        photoUrl = result.secure_url;
        console.log('✅ Photo uploaded:', photoUrl);
      } catch (uploadError) {
        console.error('❌ Cloudinary upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload photo' });
      }
    }

    // Prepare portfolio data for HTML generation
    const portfolioData = {
      full_name: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      bio: req.body.bio,
      photo_url: photoUrl,
      education: education,
      experience: experience,
      projects: projects,
      skills: skills,
      social_links: socialLinks,
    };

    console.log('🤖 Generating HTML...');
    let generatedHTML;
    try {
      generatedHTML = await generatePortfolioHTML(portfolioData);
      console.log('✅ HTML generated');
    } catch (groqError) {
      console.error('❌ HTML generation error:', groqError);
      return res.status(500).json({ error: 'Failed to generate HTML: ' + groqError.message });
    }

    console.log('📄 Generating PDF...');
    const timestamp = Date.now();
    const pdfFileName = `${userId}_portfolio_${timestamp}.pdf`;
    const pdfPath = path.join(__dirname, '../temp', pdfFileName);

    // Ensure temp directory exists
    await fs.mkdir(path.join(__dirname, '../temp'), { recursive: true });

    try {
      await generatePDF(generatedHTML, pdfPath);
      console.log('✅ PDF generated');
    } catch (pdfError) {
      console.error('❌ PDF error:', pdfError);
      return res.status(500).json({ error: 'Failed to generate PDF: ' + pdfError.message });
    }

    // Upload PDF to Supabase Storage
    console.log('📤 Uploading PDF to Supabase Storage...');
    let pdfDownloadUrl;
    try {
      const pdfBuffer = await fs.readFile(pdfPath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio-pdfs')
        .upload(`${userId}/${pdfFileName}`, pdfBuffer, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Supabase upload error:', uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('portfolio-pdfs')
        .getPublicUrl(`${userId}/${pdfFileName}`);

      pdfDownloadUrl = urlData.publicUrl;
      console.log('✅ PDF uploaded to Supabase:', pdfDownloadUrl);

      // Clean up temp file
      await fs.unlink(pdfPath);
    } catch (storageError) {
      console.error('❌ Storage error:', storageError);
      return res.status(500).json({ error: 'Failed to upload PDF: ' + storageError.message });
    }

    // Store portfolio data in Supabase Database
    console.log('💾 Saving to Supabase Database...');
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .insert([
          {
            firebase_uid: userId,
            email: req.body.email,
            full_name: req.body.fullName,
            phone: req.body.phone,
            bio: req.body.bio,
            photo_url: photoUrl,
            education: education,
            experience: experience,
            projects: projects,
            skills: skills,
            social_links: socialLinks,
            generated_html: generatedHTML,
            pdf_url: pdfDownloadUrl,
          },
        ])
        .select();

      if (error) {
        console.error('❌ Supabase database error:', error);
        throw error;
      }

      console.log('✅ Portfolio saved successfully!');

      res.status(201).json({
        success: true,
        portfolio: data[0],
        pdf_url: pdfDownloadUrl,
      });
    } catch (supabaseError) {
      console.error('❌ Database error:', supabaseError);
      return res.status(500).json({ error: 'Failed to save to database: ' + supabaseError.message });
    }

  } catch (error) {
    console.error('❌ Portfolio creation error:', error);
    res.status(500).json({ error: 'Failed to create portfolio: ' + error.message });
  }
};

exports.getPortfolios = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('firebase_uid', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, portfolios: data });
  } catch (error) {
    console.error('Fetch portfolios error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolios' });
  }
};
