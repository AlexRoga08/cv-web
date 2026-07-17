const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const cv = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'cv.json'), 'utf8'));

const badges = (items, indent, cls) =>
  items.map((b) => `${indent}<span class="${cls}">${b}</span>`).join('\n');

const externalIcon = (indent) => `${indent}<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8">
${indent}  <path d="M2 10L10 2M5 2h5v5"/>
${indent}</svg>`;

const projectCard = (p) => {
  const link = p.url
    ? `              <a href="${p.url}" target="_blank" rel="noopener" class="project-link">
                ${p.urlLabel}
${externalIcon('                ')}
              </a>`
    : `              <span class="project-tag">${p.tag}</span>`;

  return `          <div class="project-card animate-item">
            <div class="project-card-top">
              <h3 class="project-name">${p.name}</h3>
${link}
            </div>
            <p class="project-desc">${p.desc}</p>
            <div class="project-techs">
${badges(p.techs, '              ', 'skill-badge')}
            </div>
          </div>`;
};

const timelineItem = (e) => `          <div class="timeline-item animate-item">
            <div class="timeline-dot"></div>
            <div class="timeline-body">
              <div class="timeline-header">
                <span class="timeline-role">${e.role}</span>
                <span class="timeline-dates">${e.dates}</span>
              </div>
              <div class="timeline-company">${e.company}</div>
              <ul class="timeline-bullets">
${e.bullets.map((b) => `                <li>${b}</li>`).join('\n')}
              </ul>
            </div>
          </div>`;

const skillGroup = (g) => `          <div class="skill-group animate-item">
            <h3 class="skill-group-title">${g.title}</h3>
            <div class="skill-badges">
${badges(g.badges, '              ', 'skill-badge')}
            </div>
          </div>`;

const eduItem = (e) => `          <div class="edu-item animate-item">
            <span class="edu-year">${e.year}</span>
            <h3 class="edu-title">${e.degree}</h3>
            <div class="edu-school">${e.school}</div>
            <div class="edu-location">${e.location}</div>
          </div>`;

const aboutBadges = [...cv.languages, ...cv.about.extraBadges];

const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${cv.meta.description}">
  <title>${cv.name.first} ${cv.name.last}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- Top navigation -->
  <nav class="nav" id="nav">
    <div class="nav-logo"><span class="nav-logo-first">A</span><span class="nav-logo-last">RG</span></div>
    <div class="nav-links">
      <a href="#proyectos" class="nav-link">Proyectos</a>
      <a href="#experiencia" class="nav-link">Experiencia</a>
      <a href="#skills" class="nav-link">Skills</a>
      <a href="#contacto" class="nav-link">Contacto</a>
    </div>
  </nav>

  <!-- Dot navigation (right side) -->
  <div class="dots-nav" id="dotsNav" aria-label="Navegación de secciones">
    <button class="dot active" data-index="0" aria-label="Inicio"></button>
    <button class="dot" data-index="1" aria-label="Proyectos"></button>
    <button class="dot" data-index="2" aria-label="Experiencia"></button>
    <button class="dot" data-index="3" aria-label="Skills"></button>
    <button class="dot" data-index="4" aria-label="Formación"></button>
    <button class="dot" data-index="5" aria-label="Sobre mí"></button>
    <button class="dot" data-index="6" aria-label="Contacto"></button>
  </div>

  <!-- Sections container -->
  <main class="sections" id="sections" role="main">

    <section class="section" id="hero" data-index="0">
      <div class="section-num">01</div>

      <div class="hero-content">
        <div class="hero-text">
          <div class="hero-tag animate-item">
            <span class="tag-line"></span>
            ${cv.hero.availability}
          </div>
          <h1 class="hero-name animate-item">
            ${cv.name.first}<br><span>${cv.name.last}</span>
          </h1>
          <p class="hero-tagline animate-item">
            ${cv.tagline.web.join('<br>\n            ')}
          </p>
          <div class="hero-pills animate-item">
${badges(cv.hero.pills, '            ', 'pill')}
          </div>
          <div class="hero-ctas animate-item">
            <button class="btn-primary" onclick="scrollToSection(1)">Ver proyectos</button>
            <a class="btn-secondary" href="assets/cv.pdf" download="CV_Alejandro_Rodriguez.pdf">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 2v8M5 7l3 3 3-3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2"/>
              </svg>
              Descargar CV
            </a>
          </div>
        </div>

        <div class="hero-photo animate-item">
          <img src="assets/foto.jpg" alt="${cv.name.first} ${cv.name.last} — foto de perfil">
        </div>
      </div>

      <div class="scroll-hint" aria-hidden="true">
        <span>SCROLL</span>
        <div class="scroll-arrow"></div>
      </div>
    </section>

    <section class="section" id="proyectos" data-index="1">
      <div class="section-num">02</div>
      <div class="section-inner">
        <div class="section-header animate-item">
          <div class="section-label">Proyectos propios</div>
          <h2 class="section-title">Lo que he construido</h2>
        </div>
        <div class="projects-grid">

${cv.projects.map(projectCard).join('\n\n')}

        </div>
      </div>
    </section>

    <section class="section" id="experiencia" data-index="2">
      <div class="section-num">03</div>
      <div class="section-inner">
        <div class="section-header animate-item">
          <div class="section-label">Trayectoria</div>
          <h2 class="section-title">Experiencia laboral</h2>
        </div>
        <div class="timeline">

${cv.experience.map(timelineItem).join('\n\n')}

        </div>
      </div>
    </section>

    <section class="section" id="skills" data-index="3">
      <div class="section-num">04</div>
      <div class="section-inner">
        <div class="section-header animate-item">
          <div class="section-label">Herramientas y competencias</div>
          <h2 class="section-title">Skills</h2>
        </div>
        <div class="skills-grid">

${cv.skills.map(skillGroup).join('\n\n')}

        </div>
      </div>
    </section>

    <section class="section" id="formacion" data-index="4">
      <div class="section-num">05</div>
      <div class="section-inner">
        <div class="section-header animate-item">
          <div class="section-label">Estudios</div>
          <h2 class="section-title">Formación</h2>
        </div>
        <div class="education-grid">

${cv.education.map(eduItem).join('\n\n')}

        </div>

        <div class="edu-cert animate-item">
          <span class="edu-cert-label">${cv.certification.label}</span>
          <span class="edu-cert-name">${cv.certification.name}</span>
        </div>
      </div>
    </section>

    <section class="section" id="sobre-mi" data-index="5">
      <div class="section-num">06</div>
      <div class="section-inner sobre-inner">
        <div class="section-header animate-item">
          <div class="section-label">En resumen</div>
          <h2 class="section-title">Sobre mí</h2>
        </div>
        <div class="sobre-content">
${cv.about.paragraphs
  .map((p) => `          <p class="sobre-text animate-item">\n            ${p}\n          </p>`)
  .join('\n')}
          <div class="sobre-highlight animate-item">
            ${cv.about.highlight}
          </div>
          <div class="sobre-langs animate-item">
${badges(aboutBadges, '            ', 'skill-badge')}
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="contacto" data-index="6">
      <div class="section-num">07</div>
      <div class="section-inner contacto-inner">
        <div class="section-header animate-item">
          <div class="section-label">¿Hablamos?</div>
          <h2 class="section-title">Hablemos.</h2>
        </div>
        <p class="contacto-sub animate-item">
          ${cv.contactSection.sub}
        </p>
        <div class="contacto-links animate-item">
          <a href="mailto:${cv.contact.email}" class="contacto-link">
            <span class="contacto-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M2 7l10 7 10-7"/>
              </svg>
            </span>
            ${cv.contact.email}
          </a>
          <a href="${cv.contact.linkedinUrl}" target="_blank" rel="noopener" class="contacto-link">
            <span class="contacto-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="4"/>
                <path d="M7 10v7M7 7v.01M12 10v7M12 13a3 3 0 016 0v4"/>
              </svg>
            </span>
            ${cv.contact.linkedinLabel}
          </a>
        </div>
        <a class="btn-primary animate-item" href="assets/cv.pdf" download="CV_Alejandro_Rodriguez.pdf" style="display:inline-flex;align-items:center;gap:8px;margin-top:8px;">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 2v8M5 7l3 3 3-3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2"/>
          </svg>
          Descargar CV completo
        </a>
        <p class="contacto-footer animate-item">${cv.contactSection.footer}</p>
      </div>
    </section>

  </main>

  <script src="js/main.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, 'index.html'), html, 'utf8');
console.log('Sitio generado: index.html');
