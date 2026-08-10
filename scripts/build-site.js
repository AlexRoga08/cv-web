const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', file), 'utf8'));

const badges = (items, indent, cls) =>
  items.map((b) => `${indent}<span class="${cls}">${b}</span>`).join('\n');

const externalIcon = (indent) => `${indent}<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8">
${indent}  <path d="M2 10L10 2M5 2h5v5"/>
${indent}</svg>`;

const downloadIcon = (size, indent) => `${indent}<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
${indent}  <path d="M8 2v8M5 7l3 3 3-3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2"/>
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

const langSwitch = (cv, other) => {
  const link = (loc, label, active) =>
    `          <a href="${loc.home}" class="nav-lang-btn${active ? ' is-active' : ''}"${
      active ? ' aria-current="page"' : ''
    } hreflang="${loc.lang}">${label}</a>`;
  const [es, en] =
    cv.locale.lang === 'es' ? [cv.locale, other.locale] : [other.locale, cv.locale];
  return `        <div class="nav-lang" role="group" aria-label="${cv.ui.nav.langAria}">
${link(es, 'ES', cv.locale.lang === 'es')}
${link(en, 'EN', cv.locale.lang === 'en')}
        </div>`;
};

const render = (cv, other) => {
  const ui = cv.ui;
  const s = ui.sections;
  const aboutBadges = [...cv.languages, ...cv.about.extraBadges];

  return `<!DOCTYPE html>
<html lang="${cv.locale.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${cv.meta.description}">
  <title>${cv.name.first} ${cv.name.last}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>

  <!-- Top navigation -->
  <nav class="nav" id="nav">
    <div class="nav-logo"><span class="nav-logo-first">A</span><span class="nav-logo-last">RG</span></div>
    <div class="nav-right">
      <div class="nav-links">
        <a href="#proyectos" class="nav-link">${ui.nav.projects}</a>
        <a href="#experiencia" class="nav-link">${ui.nav.experience}</a>
        <a href="#skills" class="nav-link">${ui.nav.skills}</a>
        <a href="#contacto" class="nav-link">${ui.nav.contact}</a>
      </div>
      <div class="nav-actions">
${langSwitch(cv, other)}
        <a class="nav-cta" href="${cv.locale.pdf}" download="${cv.locale.pdfDownloadName}" aria-label="${ui.nav.downloadAria}">
${downloadIcon(13, '          ')}
          <span class="nav-cta-full">${ui.nav.download}</span>
          <span class="nav-cta-short">${ui.nav.downloadShort}</span>
        </a>
      </div>
    </div>
  </nav>

  <!-- Dot navigation (right side) -->
  <div class="dots-nav" id="dotsNav" aria-label="${ui.nav.dotsAria}">
${ui.dots
  .map(
    (label, i) =>
      `    <button class="dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="${label}"></button>`
  )
  .join('\n')}
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
            <button class="btn-primary" onclick="scrollToSection(1)">${ui.hero.viewProjects}</button>
            <a class="btn-secondary" href="${cv.locale.pdf}" download="${cv.locale.pdfDownloadName}">
${downloadIcon(14, '              ')}
              ${ui.hero.download}
            </a>
          </div>
        </div>

        <div class="hero-photo animate-item">
          <img src="/assets/foto.jpg" alt="${cv.name.first} ${cv.name.last} — ${ui.hero.photoAlt}">
        </div>
      </div>

      <div class="scroll-hint" aria-hidden="true">
        <span>${ui.hero.scroll}</span>
        <div class="scroll-arrow"></div>
      </div>
    </section>

    <section class="section" id="proyectos" data-index="1">
      <div class="section-num">02</div>
      <div class="section-inner">
        <div class="section-header animate-item">
          <div class="section-label">${s.projects.label}</div>
          <h2 class="section-title">${s.projects.title}</h2>
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
          <div class="section-label">${s.experience.label}</div>
          <h2 class="section-title">${s.experience.title}</h2>
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
          <div class="section-label">${s.skills.label}</div>
          <h2 class="section-title">${s.skills.title}</h2>
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
          <div class="section-label">${s.education.label}</div>
          <h2 class="section-title">${s.education.title}</h2>
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
          <div class="section-label">${s.about.label}</div>
          <h2 class="section-title">${s.about.title}</h2>
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
          <div class="section-label">${s.contact.label}</div>
          <h2 class="section-title">${s.contact.title}</h2>
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
        <a class="btn-primary animate-item" href="${cv.locale.pdf}" download="${cv.locale.pdfDownloadName}" style="display:inline-flex;align-items:center;gap:8px;margin-top:8px;">
${downloadIcon(15, '          ')}
          ${ui.contact.downloadFull}
        </a>
        <p class="contacto-footer animate-item">${cv.contactSection.footer}</p>
      </div>
    </section>

  </main>

  <script src="/js/main.js"></script>
</body>
</html>
`;
};

const es = read('cv.json');
const en = read('cv.en.json');

fs.writeFileSync(path.join(ROOT, 'index.html'), render(es, en), 'utf8');
console.log('Sitio generado: index.html');

fs.mkdirSync(path.join(ROOT, 'en'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'en', 'index.html'), render(en, es), 'utf8');
console.log('Sitio generado: en/index.html');
