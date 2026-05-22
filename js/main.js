(function () {
  'use strict';

  const sectionsContainer = document.getElementById('sections');
  const sectionEls = Array.from(document.querySelectorAll('.section'));
  const dots = Array.from(document.querySelectorAll('.dot'));
  let currentIndex = 0;

  // ── Scroll to section ────────────────────────────────────────────────────
  function scrollToSection(index) {
    if (index < 0 || index >= sectionEls.length) return;
    sectionEls[index].scrollIntoView({ behavior: 'smooth' });
  }

  // Expose globally so onclick attributes in HTML can call it
  window.scrollToSection = scrollToSection;

  // ── Update active dot ────────────────────────────────────────────────────
  function setActiveDot(index) {
    dots.forEach(d => d.classList.remove('active'));
    if (dots[index]) dots[index].classList.add('active');
    currentIndex = index;
  }

  // ── IntersectionObserver: active dot tracking ────────────────────────────
  const dotObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index, 10);
          setActiveDot(index);
        }
      });
    },
    { root: sectionsContainer, threshold: 0.6 }
  );

  sectionEls.forEach(s => dotObserver.observe(s));

  // ── Dot click ────────────────────────────────────────────────────────────
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index, 10);
      scrollToSection(index);
    });
  });

  // ── Nav link smooth scroll ───────────────────────────────────────────────
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ── Keyboard navigation ───────────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      scrollToSection(currentIndex + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      scrollToSection(currentIndex - 1);
    }
  });

  // ── IntersectionObserver: section animations ─────────────────────────────
  const animObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const items = Array.from(entry.target.querySelectorAll('.animate-item'));
          items.forEach((item, i) => {
            setTimeout(() => item.classList.add('visible'), i * 100);
          });
          // Stop observing once animated
          animObserver.unobserve(entry.target);
        }
      });
    },
    { root: sectionsContainer, threshold: 0.2 }
  );

  sectionEls.forEach(s => animObserver.observe(s));

  // ── Animate hero immediately on load ─────────────────────────────────────
  // Hero is visible on load — IntersectionObserver may miss it
  window.addEventListener('DOMContentLoaded', () => {
    const heroItems = Array.from(document.querySelectorAll('#hero .animate-item'));
    heroItems.forEach((item, i) => {
      setTimeout(() => item.classList.add('visible'), 150 + i * 100);
    });
  });

}());
