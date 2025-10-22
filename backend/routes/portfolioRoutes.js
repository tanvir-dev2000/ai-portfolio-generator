const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { verifyFirebaseToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const portfolioController = require('../controllers/portfolioController');

// Existing routes
router.post('/create', verifyFirebaseToken, upload.single('photo'), portfolioController.createPortfolio);
router.get('/my-portfolios', verifyFirebaseToken, portfolioController.getPortfolios);

// NEW: Direct PDF download without saving
router.post('/download-pdf', async (req, res) => {
  try {
    const { htmlContent } = req.body;

    if (!htmlContent) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Generate PDF
    const pdfGenerator = require('../utils/pdfGenerator');
    const tempPath = path.join(__dirname, '../temp', `portfolio_${Date.now()}.pdf`);
    
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    await pdfGenerator.generatePDF(htmlContent, tempPath);
    
    // Read the PDF
    const pdfBuffer = await fs.promises.readFile(tempPath);
    
    // Delete temp file
    await fs.promises.unlink(tempPath);
    
    // Send PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=portfolio.pdf');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

module.exports = router;
