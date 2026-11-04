import { workshop } from './data/site.js';
import { projects } from './data/projects.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
document.documentElement.classList.add('interactive');
const nav = document.querySelector('#main-nav');
const menuToggle = document.querySelector('.menu-toggle');
const closeMenu = () => {
  nav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Otvori meni');
  document.body.classList.remove('menu-open');
};
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  if (isOpen) return closeMenu();
  nav.classList.add('is-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Zatvori meni');
  document.body.classList.add('menu-open');
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
  if (event.key === 'Tab' && menuToggle.getAttribute('aria-expanded') === 'true') {
    const items = [...nav.querySelectorAll('a'), menuToggle];
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
window.matchMedia('(min-width: 851px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

// This is the supplied registration total, not a simulated live counter.
document.querySelectorAll('[data-registration-count]').forEach(node => { node.textContent = String(workshop.registrations); });

const dialog = document.querySelector('#registration-dialog');
const registrationEmail = document.querySelector('#registration-email');
const dateInputs = [...dialog.querySelectorAll('[name="workshop-date"]')];
dateInputs.forEach((input, index) => {
  if (input.value === 'all' || !workshop.dates[index - 1]) return;
  input.value = workshop.dates[index - 1];
});
const buildEmailLink = () => {
  const choice = dateInputs.find(input => input.checked)?.value || 'all';
  const selected = choice === 'all' ? workshop.dates.join(' i ') : choice;
  const subject = `Prijava za LinkedIn i CV radionicu: ${selected}`;
  const body = `Zdravo, ERCM Progres!\n\nŽelim da se prijavim za LinkedIn i CV radionicu putem Zooma.\nZanimaju me: ${selected}\n\nIme i prezime: \n\nMolim vas da mi pošaljete detalje radionice.\n\nHvala!`;
  registrationEmail.href = `mailto:${workshop.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
dateInputs.forEach(input => input.addEventListener('change', buildEmailLink));
buildEmailLink();

function safeWebUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value, location.href);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
const externalRegistration = safeWebUrl(workshop.registrationUrl);
document.querySelectorAll('[data-register]').forEach(link => {
  if (externalRegistration) { link.href = externalRegistration; return; }
  link.href = registrationEmail.href;
  link.addEventListener('click', event => {
    if (typeof dialog.showModal !== 'function' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    closeMenu();
    dialog.showModal();
  });
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
// Scroll locking also handles the native Escape-to-close dialog behavior.
const dialogObserver = new MutationObserver(() => { document.documentElement.style.overflow = dialog.open ? 'hidden' : ''; });
dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] });

// Dve trake se ukrštaju i klize u suprotnim smerovima. Nazivi dolaze iz data/projects.js.
function buildRibbons(titles) {
  const stage = document.querySelector('#project-ribbons');
  if (!stage || !titles.length) return;
  const makeRibbon = (className, list, label) => {
    const ribbon = document.createElement('div');
    ribbon.className = `ribbon ${className}`;
    const track = document.createElement('div');
    track.className = 'ribbon-track';
    // Dve identične grupe daju neprekidnu petlju (translateX do -50%).
    for (let copy = 0; copy < 2; copy += 1) {
      const group = document.createElement('div');
      group.className = 'ribbon-group';
      // Niz se ponavlja da grupa uvek bude šira od ekrana.
      for (let round = 0; round < 2; round += 1) {
        for (const title of list) {
          const name = document.createElement('span');
          name.className = 'ribbon-name';
          name.textContent = title;
          const mark = document.createElement('span');
          mark.className = 'ribbon-mark';
          mark.textContent = label;
          group.append(name, mark);
        }
      }
      track.append(group);
    }
    ribbon.append(track);
    return ribbon;
  };
  const shifted = [...titles.slice(2), ...titles.slice(0, 2)];
  stage.append(makeRibbon('ribbon-lime', titles, '✳'), makeRibbon('ribbon-ink', shifted, '↗'));
  stage.hidden = false;
}

const projectList = document.querySelector('#project-list');
const validProjects = projects.filter(project => project && typeof project.title === 'string' && project.title.trim());
if (validProjects.length) {
  document.querySelector('#projects-empty').hidden = true;
  buildRibbons(validProjects.map(project => project.title));
  for (const [index, project] of validProjects.entries()) {
    const article = document.createElement('article');
    article.className = 'project-item reveal';
    const visual = document.createElement('div');
    visual.className = 'project-visual';
    const imageUrl = safeWebUrl(project.image);
    if (imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = project.imageAlt || project.title;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 640;
      img.height = 480;
      visual.append(img);
    } else {
      const placeholder = document.createElement('span');
      placeholder.className = 'project-placeholder';
      placeholder.textContent = String(index + 1).padStart(2, '0');
      placeholder.setAttribute('aria-hidden', 'true');
      visual.append(placeholder);
    }
    article.append(visual);
    if (project.category) {
      const category = document.createElement('span');
      category.className = 'small-label';
      category.textContent = project.category;
      article.append(category);
    }
    const title = document.createElement('h3');
    title.textContent = project.title;
    article.append(title);
    if (project.description) {
      const description = document.createElement('p');
      description.textContent = project.description;
      article.append(description);
    }
    const projectUrl = safeWebUrl(project.url);
    if (projectUrl) {
      const link = document.createElement('a');
      link.className = 'text-link';
      link.href = projectUrl;
      link.textContent = 'Pogledaj projekat ↗';
      link.setAttribute('aria-label', `Pogledaj projekat: ${project.title}`);
      article.append(link);
    }
    projectList.append(article);
  }
}

// Reveals are progressive enhancement: content stays visible without JavaScript.
let revealObserver;
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  document.documentElement.classList.add('motion-ready');
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
}

const memberCount = document.querySelector('[data-count-to]');
memberCount.setAttribute('aria-label', '21 član organizacije');
let countFrame = 0;
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const countObserver = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    countObserver.disconnect();
    const started = performance.now();
    const animate = now => {
      const progress = Math.min((now - started) / 1100, 1);
      memberCount.textContent = String(Math.round(21 * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1 && !reducedMotion.matches) countFrame = requestAnimationFrame(animate);
      else memberCount.textContent = '21';
    };
    countFrame = requestAnimationFrame(animate);
  }, { threshold: .55 });
  countObserver.observe(memberCount);
}

const heroArt = document.querySelector('.hero-art');
heroArt.addEventListener('pointermove', event => {
  if (reducedMotion.matches || !finePointer.matches) return;
  const rect = heroArt.getBoundingClientRect();
  heroArt.style.setProperty('--mouse-x', `${((event.clientX - rect.left) / rect.width - .5) * 17}px`);
  heroArt.style.setProperty('--mouse-y', `${((event.clientY - rect.top) / rect.height - .5) * 17}px`);
});
heroArt.addEventListener('pointerleave', () => {
  heroArt.style.setProperty('--mouse-x', '0px');
  heroArt.style.setProperty('--mouse-y', '0px');
});
document.querySelectorAll('.magnetic').forEach(link => {
  link.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches) return;
    const bounds = link.getBoundingClientRect();
    link.style.transform = `translate(${(event.clientX - bounds.left - bounds.width / 2) * .05}px, ${(event.clientY - bounds.top - bounds.height / 2) * .1}px)`;
  });
  link.addEventListener('pointerleave', () => { link.style.transform = ''; });
});

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      nav.querySelectorAll('a').forEach(link => {
        const current = link.hash === `#${entry.target.id}`;
        link.classList.toggle('active', current);
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
  document.querySelectorAll('main>section').forEach(section => sectionObserver.observe(section));
}

const motionToggle = document.querySelector('.motion-toggle');
const stopMotion = () => {
  document.documentElement.classList.remove('motion-ready');
  revealObserver?.disconnect();
  cancelAnimationFrame(countFrame);
  memberCount.textContent = '21';
  document.querySelectorAll('.magnetic').forEach(link => { link.style.transform = ''; });
};
motionToggle.addEventListener('click', () => {
  const paused = document.documentElement.classList.toggle('motion-paused');
  motionToggle.setAttribute('aria-pressed', String(paused));
  const label = paused ? 'Pokreni animacije' : 'Pauziraj animacije';
  motionToggle.setAttribute('aria-label', label);
  motionToggle.querySelector('.motion-label').textContent = label;
  motionToggle.querySelector('span').textContent = paused ? '▷' : 'Ⅱ';
  if (paused) stopMotion();
});
reducedMotion.addEventListener('change', event => {
  if (event.matches) stopMotion();
});

// A small scroll response keeps the hero's type connected to the growth motif.
// Trake se pri skrolovanju naginju i razmiču kao makaze.
const ribbonStage = document.querySelector('#project-ribbons');
let scrollFrame = 0;
window.addEventListener('scroll', () => {
  if (scrollFrame || reducedMotion.matches || document.documentElement.classList.contains('motion-paused')) return;
  scrollFrame = requestAnimationFrame(() => {
    const offset = Math.min(window.scrollY * .025, 12);
    document.querySelector('.green-word').style.setProperty('--scroll-shift', `${offset}px`);
    if (ribbonStage && !ribbonStage.hidden) {
      const rect = ribbonStage.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        ribbonStage.style.setProperty('--tilt', `${((progress - .5) * 14).toFixed(2)}deg`);
      }
    }
    scrollFrame = 0;
  });
}, { passive: true });
