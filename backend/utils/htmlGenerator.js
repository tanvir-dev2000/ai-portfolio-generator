const groq = require('../config/groq');

async function generatePortfolioHTML(portfolioData) {
    // Format data for the prompt
    const educationText = portfolioData.education ? JSON.stringify(portfolioData.education, null, 2) : '';
    const experienceText = portfolioData.experience ? JSON.stringify(portfolioData.experience, null, 2) : '';
    const projectsText = portfolioData.projects ? JSON.stringify(portfolioData.projects, null, 2) : '';

    // Extract skills from the nested structure
    const softSkills = portfolioData.skills?.soft || [];
    const technicalSkills = portfolioData.skills?.technical || [];
    const languages = portfolioData.skills?.languages || [];
    const tools = portfolioData.skills?.tools || [];

    // Combine technical skills and tools
    const allTechnicalSkills = [...technicalSkills, ...tools];

    // Get social links
    const socialLinks = portfolioData.social_links || {};

    const prompt = `CRITICAL OUTPUT REQUIREMENTS:
- Return ONLY the HTML code
- Do NOT include markdown code blocks
- Do NOT add any explanatory text before or after
- Start immediately with <!DOCTYPE html>
- All CSS must be inline within a single <style> tag in the <head>

---

Create a stunning, modern, award-winning portfolio website in HTML with inline CSS, inspired by the best designs from Awwwards, Behance, and Dribbble. The output MUST use modern layout techniques (Flexbox and CSS Grid) to ensure all components are perfectly aligned, responsive, and production-ready.

CANDIDATE INFORMATION:
Full Name: ${portfolioData.full_name}
Email: ${portfolioData.email}
Phone: ${portfolioData.phone || 'N/A'}
Profile Photo: ${portfolioData.photo_url || ''}
Bio: ${portfolioData.bio}

Soft Skills: ${softSkills.join(', ') || 'N/A'}
Technical Skills: ${allTechnicalSkills.join(', ') || 'N/A'}
Languages: ${languages.join(', ') || 'N/A'}

${educationText ? `Education: ${educationText}` : ''}
${experienceText ? `Work Experience: ${experienceText}` : ''}
${projectsText ? `Projects: ${projectsText}` : ''}

Social Links:
${socialLinks.linkedin ? `LinkedIn: ${socialLinks.linkedin}` : ''}
${socialLinks.github ? `GitHub: ${socialLinks.github}` : ''}
${socialLinks.twitter ? `Twitter: ${socialLinks.twitter}` : ''}
${socialLinks.website ? `Website: ${socialLinks.website}` : ''}

---

CONTENT ENHANCEMENT INSTRUCTIONS - YOU ARE ENCOURAGED TO:

1. ENHANCE SHORT BIOS:
   - If bio is under 50 words, expand to 2-3 compelling paragraphs
   - Highlight expertise, passion, and professional philosophy based on their skills
   - Use confident, professional tone
   - Example: "I'm a developer" becomes "A passionate software engineer with expertise in modern web technologies, dedicated to crafting elegant solutions to complex problems. With a strong foundation in both frontend and backend development, specializes in building scalable, user-centric applications that drive business value."

2. ADD PROFESSIONAL TAGLINES:
   - Create a powerful 1-line tagline under the name
   - Base it on their primary skills and role
   - Examples: "Full-Stack Developer & UI/UX Enthusiast", "Creative Frontend Engineer | React Specialist"

3. EXPAND PROJECT DESCRIPTIONS:
   - Transform brief project mentions into detailed 3-5 sentence descriptions
   - Include: Problem, Solution, Technologies, Key Features, Impact
   - Use professional language and technical depth

4. DETAIL WORK EXPERIENCE:
   - Expand each role to 4-5 impactful bullet points
   - Use strong action verbs: Architected, Spearheaded, Engineered, Optimized
   - Add measurable achievements where logical

5. ENHANCE SKILLS PRESENTATION:
   - Group skills into clear categories
   - Add visual presentation elements

GUARDRAILS:
- DO NOT fabricate specific company names, dates, or metrics not provided
- DO NOT add skills or technologies not mentioned
- DO expand on provided information professionally

---

DESIGN FREEDOM - CHOOSE YOUR CREATIVE DIRECTION:

YOU HAVE COMPLETE FREEDOM TO CHOOSE:

THEME OPTIONS - Pick ONE and commit to it:

1. MODERN DARK MODE:
   - Primary BG: Deep black #0a0a0a to charcoal #1a1a1a
   - Text: Bright white #ffffff to off-white #f5f5f5
   - Accent: Choose ONE vibrant color (electric blue #00d9ff, neon green #39ff14, cyber pink #ff0080, vivid purple #a855f7)
   - Style: Sleek, high-tech, modern, bold
   - Best for: Tech roles, creative portfolios, startups

2. CLEAN LIGHT MODE (Professional/Corporate):
   - Primary BG: Pure white #ffffff to off-white #fafafa
   - Text: Deep black #1a1a1a to charcoal #2d2d2d
   - Accent: Choose ONE professional color (deep blue #1e40af, forest green #047857, rich purple #7c3aed, crimson #dc2626)
   - Style: Clean, minimal, trustworthy, elegant
   - Best for: Business, consulting, traditional industries

3. GRADIENT ACCENT MODE (Creative/Bold):
   - Base: Either light or dark
   - Accent: Use vibrant gradients (e.g., blue to purple, pink to orange, teal to green)
   - Style: Eye-catching, modern, artistic
   - Best for: Designers, artists, creative agencies

4. MINIMALIST MONOCHROME (Sophisticated):
   - Grayscale palette with one subtle accent
   - Heavy emphasis on typography and whitespace
   - Style: Elegant, sophisticated, timeless
   - Best for: Senior professionals, consultants, writers

LAYOUT STYLE OPTIONS - Pick ONE:

1. SPLIT-SCREEN SIDEBAR (Modern):
   - Desktop: Fixed sidebar (30%) + scrollable content (70%)
   - Sidebar: Photo, name, nav, contact
   - Content: Full sections with generous spacing
   - Best for: Detailed portfolios with multiple sections

2. SINGLE-COLUMN CENTER (Classic):
   - All content centered, max-width 900px
   - Hero at top with photo
   - Sections flow vertically with clear separation
   - Best for: Minimalist approach, content-focused

3. CARD-BASED GRID (Dynamic):
   - Hero section full-width
   - Content in responsive grid cards
   - Sections as standalone cards with shadows
   - Best for: Visual portfolios, varied content types

4. HORIZONTAL SCROLL (Unique):
   - Sections scroll horizontally on desktop
   - Vertical on mobile
   - Modern, interactive feel
   - Best for: Creative, designer portfolios

TYPOGRAPHY STYLE:

- Choose font combinations (system fonts):
  * Modern: Sharp headings with clean body
  * Classic: Serif headings with sans-serif body
  * Geometric: Uniform sans-serif throughout
- Font sizes: Create clear hierarchy
- Letter-spacing: Adjust for style (tight for modern, loose for elegant)

VISUAL ELEMENTS YOU CAN ADD:

- Decorative shapes (circles, lines, dots)
- Gradient overlays
- Image filters or borders
- Custom bullet points or list styles
- Section dividers (lines, shapes, gradients)
- Animated hover effects
- Skill level indicators (bars, circles, percentages)
- Project thumbnails or icons
- Social media icon styles

SPACING & DENSITY:

- Choose generous (luxury feel) or compact (information-dense)
- Section padding: 60-120px vertical
- Element gaps: 16-48px

---

REQUIRED TECHNICAL SPECIFICATIONS:

LAYOUT REQUIREMENTS:
- Use CSS Grid or Flexbox for all major layouts
- Perfect alignment: no overlapping elements
- Responsive breakpoints:
  * Mobile: 320-767px (single column, stacked)
  * Tablet: 768-1023px (optimized spacing)
  * Desktop: 1024px+ (your chosen layout style)

HTML STRUCTURE:
- Semantic HTML5: header, nav, main, section, article, footer
- Proper heading hierarchy (h1 → h2 → h3)
- Meta tags: title, description, viewport

CSS ORGANIZATION:
- Inline within single <style> tag
- Well-organized sections
- Consistent naming
- Mobile-first approach

VISUAL POLISH:
- Smooth transitions: transition: all 0.3s ease
- Subtle shadows: box-shadow: 0 4px 6px rgba(0,0,0,0.1 or 0.3)
- Hover effects on interactive elements
- Print-friendly: @media print styles

ACCESSIBILITY:
- High contrast ratios (WCAG AA minimum)
- Touch-friendly sizes (44x44px minimum)
- Readable font sizes (min 16px body)

---

CREATIVE DECISION-MAKING GUIDELINES:

Based on the candidate's profile, make intelligent design choices:

- Technical/Developer roles → Dark mode, modern layouts, tech accent colors
- Business/Corporate roles → Light mode, clean layouts, professional colors
- Creative/Design roles → Bold accents, unique layouts, gradients
- Senior/Executive roles → Minimalist, sophisticated, timeless
- Startup/Entrepreneurial → Bold, modern, innovative

Consider their skills:
- Frontend Developer → Show off CSS skills with animations
- Backend Developer → Clean, functional, data-focused
- Full-Stack → Balanced, comprehensive, modern
- Designer → Beautiful, creative, visually striking

---

CRITICAL PDF/PRINT OPTIMIZATION (ADD THESE CSS RULES):

Add these styles INSIDE your <style> tag for perfect PDF rendering:

/* PDF Page Break Control - CRITICAL */
* {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* Keep sections together */
section, article, .section, .card, .project-card, .experience-item, .education-item, .skill-group {
  page-break-inside: avoid;
  break-inside: avoid;
  margin-bottom: 20px;
}

/* Keep headings with content */
h1, h2, h3, h4, h5, h6 {
  page-break-after: avoid;
  break-after: avoid;
  margin-top: 15px;
}

/* Images and figures */
img, figure {
  page-break-inside: avoid;
  max-width: 100%;
  height: auto;
}

/* Lists */
ul, ol {
  page-break-inside: avoid;
}

/* Page setup */
@page {
  margin: 15mm 10mm;
  size: A4;
}

/* Print media query */
@media print {
  body {
    margin: 0;
    padding: 0;
  }
  
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}

FINAL REQUIREMENTS:

The portfolio MUST:
✓ Look professionally designed (Awwwards quality)
✓ Have flawless alignment with Flexbox/Grid
✓ Be fully responsive (320px to 4K)
✓ Have detailed, enhanced content
✓ Include smooth animations
✓ Be print-ready and PDF-optimized
✓ Have perfect typography hierarchy
✓ Feel unique and memorable
✓ Showcase the candidate as a top professional

BE CREATIVE. BE BOLD. MAKE IT STUNNING.

Choose your design direction and execute it flawlessly. Make this portfolio stand out while remaining professional and polished.

Generate ONLY the complete HTML code with inline CSS. No markdown. No explanations. Start with <!DOCTYPE html>.`;




    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert web designer and developer. Generate beautiful, creative, and professional portfolio websites. Each portfolio should have a unique color scheme and modern design. Output only clean, complete HTML code without any explanations or markdown formatting.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,  // Increased temperature for more creativity
            max_tokens: 8000,
        });

        let htmlContent = completion.choices[0]?.message?.content || '';

        // Clean up the response - remove markdown code blocks if present
        htmlContent = htmlContent.replace(/``````\n?/g, '').trim();

        if (!htmlContent.includes('<!DOCTYPE html>')) {
            throw new Error('Generated content is not valid HTML');
        }

        return htmlContent;
    } catch (error) {
        console.error('Groq API Error:', error);
        throw new Error('Failed to generate portfolio HTML: ' + error.message);
    }
}

module.exports = { generatePortfolioHTML };
