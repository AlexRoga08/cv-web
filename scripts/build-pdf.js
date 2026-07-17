const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const cv = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'cv.json'), 'utf8'));

const photoDataUrl = `data:image/jpeg;base64,${fs
  .readFileSync(path.join(ROOT, 'assets', 'foto.jpg'))
  .toString('base64')}`;

const skillGroup = (g) => `        <div class="skill-group">
          <div class="skill-group-name">${g.title}</div>
          <div class="badges">
${g.badges.map((b) => `            <span class="badge">${b}</span>`).join('\n')}
          </div>
        </div>`;

const eduItem = (e) => `        <div class="edu-item">
          <div class="edu-year">${e.year}</div>
          <div class="edu-degree">${e.degreePdf || e.degree}</div>
          <div class="edu-school">${e.schoolPdf || e.school}</div>
        </div>`;

const timelineItem = (e) => `        <div class="timeline-item">
          <div class="timeline-header">
            <span class="role">${e.role}</span>
            <span class="dates">${e.dates}</span>
          </div>
          <div class="company">${e.company}</div>
          <ul class="bullets">
${e.bullets.map((b) => `            <li>${b}</li>`).join('\n')}
          </ul>
        </div>`;

const projectItem = (p) => `        <div class="project-item">
          <div class="project-header">
            <span class="project-name">${p.name}</span>
            <span class="project-url">${p.urlLabel || p.tag}</span>
          </div>
          <div class="project-desc">${p.descPdf || p.desc}</div>
        </div>`;

const contactItems = [
  cv.contact.email,
  cv.contact.linkedinLabel,
  cv.contact.siteLabel,
  cv.contact.location,
];

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', Arial, sans-serif;
    font-size: 9pt;
    color: #0d1b2a;
    background: #fff;
    line-height: 1.45;
    padding: 14mm 16mm;
  }

  /* Header */
  .header {
    border-bottom: 3px solid #1B4F72;
    padding-bottom: 10px;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .header-text { flex: 1; }
  .header-photo {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #BDD7EE;
    flex-shrink: 0;
  }
  .header-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }
  .name {
    font-size: 21pt;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #0d1b2a;
    line-height: 1.1;
    margin-bottom: 3px;
  }
  .name span { color: #1B4F72; }
  .tagline {
    font-size: 8.5pt;
    color: #5a6a7a;
    margin-bottom: 7px;
  }
  .contact {
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
  }
  .contact-item {
    font-size: 8pt;
    color: #2471A3;
  }

  /* Body */
  .body {
    display: grid;
    grid-template-columns: 36% 64%;
    gap: 22px;
  }

  /* Section */
  .section { margin-bottom: 14px; }
  .section-title {
    font-size: 7pt;
    font-weight: 700;
    color: #1B4F72;
    letter-spacing: 2px;
    text-transform: uppercase;
    border-bottom: 1px solid #e0e6ec;
    padding-bottom: 3px;
    margin-bottom: 7px;
  }

  /* Skills */
  .skill-group { margin-bottom: 8px; }
  .skill-group-name {
    font-size: 7.5pt;
    font-weight: 700;
    color: #0d1b2a;
    margin-bottom: 3px;
  }
  .badges { display: flex; flex-wrap: wrap; gap: 3px; }
  .badge {
    font-size: 7pt;
    background: #f4f6f8;
    border: 1px solid #e0e6ec;
    padding: 2px 6px;
    border-radius: 3px;
    color: #0d1b2a;
  }

  /* Education */
  .edu-item { margin-bottom: 8px; }
  .edu-year { font-size: 7pt; color: #1B4F72; font-weight: 700; }
  .edu-degree { font-size: 7.5pt; font-weight: 600; color: #0d1b2a; line-height: 1.3; }
  .edu-school { font-size: 7.5pt; color: #2471A3; }
  .edu-location { font-size: 7pt; color: #8a9bac; }

  /* Languages */
  .lang-item { font-size: 8pt; color: #5a6a7a; margin-bottom: 2px; }

  /* Quote */
  .quote {
    font-size: 8pt;
    font-weight: 600;
    color: #1B4F72;
    border-left: 2px solid #1B4F72;
    padding-left: 8px;
    margin-top: 10px;
    line-height: 1.5;
  }

  /* Timeline */
  .timeline-item { margin-bottom: 10px; }
  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
  }
  .role { font-size: 8.5pt; font-weight: 700; color: #0d1b2a; }
  .dates { font-size: 7.5pt; color: #8a9bac; white-space: nowrap; flex-shrink: 0; }
  .company { font-size: 7.5pt; color: #2471A3; margin-bottom: 3px; }
  .bullets { list-style: none; }
  .bullets li {
    font-size: 7.5pt;
    color: #5a6a7a;
    padding-left: 10px;
    position: relative;
    margin-bottom: 2px;
    line-height: 1.4;
  }
  .bullets li::before { content: '–'; position: absolute; left: 0; color: #1B4F72; }

  /* Projects */
  .project-item { margin-bottom: 7px; }
  .project-header { display: flex; align-items: baseline; gap: 7px; margin-bottom: 2px; }
  .project-name { font-size: 8pt; font-weight: 700; color: #1B4F72; }
  .project-url { font-size: 7pt; color: #8a9bac; }
  .project-desc { font-size: 7.5pt; color: #5a6a7a; line-height: 1.4; }
</style>
</head>
<body>

  <div class="header">
    <div class="header-text">
      <div class="name">${cv.name.first} <span>${cv.name.last}</span></div>
      <div class="tagline">${cv.tagline.pdf}</div>
      <div class="contact">
${contactItems.map((c) => `        <span class="contact-item">${c}</span>`).join('\n')}
      </div>
    </div>
    <div class="header-photo">
      <img src="${photoDataUrl}" alt="${cv.name.first} ${cv.name.last}">
    </div>
  </div>

  <div class="body">

    <!-- Left column -->
    <div>
      <div class="section">
        <div class="section-title">Skills</div>

${cv.skills.map(skillGroup).join('\n\n')}
      </div>

      <div class="section">
        <div class="section-title">Formación</div>

${cv.education.map(eduItem).join('\n\n')}
      </div>

      <div class="section">
        <div class="section-title">Idiomas</div>
${cv.languages.map((l) => `        <div class="lang-item">${l}</div>`).join('\n')}
      </div>

      <div class="quote">${cv.about.highlight}</div>
    </div>

    <!-- Right column -->
    <div>
      <div class="section">
        <div class="section-title">Experiencia</div>

${cv.experience.map(timelineItem).join('\n\n')}
      </div>

      <div class="section">
        <div class="section-title">Proyectos propios</div>

${cv.projects.map(projectItem).join('\n\n')}
      </div>
    </div>

  </div>
</body>
</html>`;

module.exports = { html };

if (require.main === module) {
  (async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: path.join(ROOT, 'assets', 'cv.pdf'),
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    const pages = await page.evaluate(
      () => Math.ceil(document.documentElement.scrollHeight / ((297 * 96) / 25.4))
    );
    await browser.close();

    if (pages > 1) {
      console.warn(`AVISO: el contenido ocupa ~${pages} páginas. El CV debe caber en una.`);
    }
    console.log('PDF generado: assets/cv.pdf');
  })();
}
