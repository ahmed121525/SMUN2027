// Responsive navbar: hamburger toggle, smooth scrolling, active link highlighting, accessible behaviour.

document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const navList = document.getElementById('navList');
  const brand = document.getElementById('brand');
  const links = Array.from(document.querySelectorAll('.nav-link'));
  const nav = document.querySelector('.nav');

  function openMenu() {
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    navList.classList.add('open');
  }

  function closeMenu() {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    navList.classList.remove('open');
  }

  // Toggle handler
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    if (expanded) closeMenu();
    else openMenu();
  });

  // Close when pressing Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Brand scroll-to-top
  brand.addEventListener('click', (e) => {
    e.preventDefault();
    closeMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // subtle visual feedback
  });

  // Smooth scrolling for nav links and active class toggle
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      // set active styling
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offset = nav.offsetHeight || 76;
          const topPos = target.getBoundingClientRect().top + window.pageYOffset - offset + 8;
          window.scrollTo({ top: topPos, behavior: 'smooth' });
        }
      }
      // close mobile menu after clicking
      if (navList.classList.contains('open')) closeMenu();
    });
  });

  // IntersectionObserver to highlight link of section in view
  if ('IntersectionObserver' in window) {
    const sectionMap = links
      .map(l => l.getAttribute('href'))
      .filter(h => h && h.startsWith('#'))
      .map(h => document.querySelector(h))
      .filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = links.find(l => l.getAttribute('href') === `#${id}`);
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: `-${nav.offsetHeight}px 0px -40% 0px`, threshold: 0.35 });

    sectionMap.forEach(s => observer.observe(s));
  }

  // Close menu if clicking outside when open (mobile)
  document.addEventListener('click', (e) => {
    if (!navList.classList.contains('open')) return;
    const isInside = nav.contains(e.target);
    if (!isInside) closeMenu();
  });

  // On resize: ensure menu state matches desktop expectations
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (window.innerWidth > 860) {
        // guarantee visible on desktop
        navList.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    }, 120);
  });
  //timer
  const targetDate = new Date("May 30, 2026 09:00:00").getTime();

      function updateTimer() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
          document.getElementById("days").textContent = "00";
          document.getElementById("hours").textContent = "00";
          document.getElementById("minutes").textContent = "00";
          document.getElementById("seconds").textContent = "00";
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").textContent = String(days).padStart(2, "0");
        document.getElementById("hours").textContent = String(hours).padStart(2, "0");
        document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
        document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
      }

      updateTimer();
      setInterval(updateTimer, 1000);
});

//TIMER
