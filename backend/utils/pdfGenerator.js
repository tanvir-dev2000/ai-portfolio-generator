const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

async function generatePDF(html, outputPath) {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    const printFriendlyHTML = `
      <style>
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        section, .section, article, .card, .project-card, .experience-item, .education-item {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid !important;
          break-after: avoid !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        img, figure {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        @page {
          margin: 15mm 10mm;
        }
        ul, ol {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      </style>
      ${html}
    `;

    await page.setContent(printFriendlyHTML, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    await page.setViewport({ width: 794, height: 1123 });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '10mm',
        bottom: '15mm',
        left: '10mm',
      },
      preferCSSPageSize: false,
      displayHeaderFooter: false,
    });

    return outputPath;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { generatePDF };
