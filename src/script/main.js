const appSections = ['Home', 'About', 'Projects', 'Contact'];
const sectionElements = appSections.map((id) => document.getElementById(id));
const panelElements = document.querySelectorAll('.panel');
const navLinks = document.querySelectorAll('.nav-link');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-toggle i');
const commandInput = document.getElementById('terminal-input');
const output = document.getElementById('terminal-output');
const typeLine = document.getElementById('type-line');
const questButton = document.getElementById('start-quest');
const statusBar = document.querySelector('.status-bar');
const terminalWindow = document.querySelector('.terminal-window');

const companyButtons = document.querySelectorAll('.companies .exp-company');
const jobs = document.querySelectorAll('.job');
const jobDescriptions = document.querySelector('.job-descriptions');
const expPrevButton = document.getElementById('exp-prev');
const expNextButton = document.getElementById('exp-next');
const expPosition = document.getElementById('exp-position');
const expProgressBar = document.getElementById('exp-progress-bar');
const OUTPUT_MAX_LINES = 11;

let currentSectionIndex = 0;
let currentTabIndex = 0;

function getInitialExperienceIndex() {
  for (let index = 0; index < companyButtons.length; index += 1) {
    if (companyButtons[index].classList.contains('active')) {
      return index;
    }
  }

  return 0;
}

let currentExperienceIndex = getInitialExperienceIndex();

function appendLog(message) {
  const line = document.createElement('p');
  line.innerHTML = message;
  output.appendChild(line);

  while (output.childElementCount > OUTPUT_MAX_LINES) {
    output.removeChild(output.firstElementChild);
  }
}

function syncActiveNav(sectionName) {
  const normalized = sectionName.toLowerCase();

  navLinks.forEach((link) => {
    const linkSection = (link.dataset.target || '').toLowerCase();
    link.classList.toggle('active', linkSection === normalized);
  });

  mobileNavLinks.forEach((link) => {
    const linkSection = (link.dataset.target || '').toLowerCase();
    link.classList.toggle('active', linkSection === normalized);
  });
}

function triggerWarpEffect() {
  if (!terminalWindow) {
    return;
  }

  terminalWindow.classList.remove('is-warping');
  window.requestAnimationFrame(() => {
    terminalWindow.classList.add('is-warping');
    window.setTimeout(() => {
      terminalWindow.classList.remove('is-warping');
    }, 280);
  });
}

function activateSectionByIndex(index, shouldScroll = true) {
  const safeIndex = Math.max(0, Math.min(index, appSections.length - 1));
  const previousIndex = currentSectionIndex;
  currentSectionIndex = safeIndex;
  currentTabIndex = safeIndex;

  panelElements.forEach((panel) => panel.classList.remove('active-panel'));
  sectionElements[safeIndex].classList.add('active-panel');

  syncActiveNav(appSections[safeIndex]);

  if (safeIndex !== previousIndex) {
    triggerWarpEffect();
  }

  if (shouldScroll && terminalWindow) {
    const headerOffset = statusBar ? statusBar.offsetHeight + 12 : 88;
    const targetTop = terminalWindow.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
  }
}

function activateSectionByName(name) {
  const normalized = name.trim().toLowerCase();
  const index = appSections.findIndex((section) => section.toLowerCase() === normalized);

  if (index === -1) {
    appendLog(`error: unknown section "${name}"`);
    return;
  }

  activateSectionByIndex(index);
}

function updateThemeIcon() {
  const isLight = document.body.classList.contains('light-theme');
  themeIcon.classList.toggle('fa-sun', isLight);
  themeIcon.classList.toggle('fa-moon', !isLight);
}

function setTheme(themeMode) {
  const makeLight = themeMode === 'light';
  document.body.classList.toggle('light-theme', makeLight);
  localStorage.setItem('portfolioTheme', makeLight ? 'light' : 'dark');
  updateThemeIcon();
}

function toggleTheme() {
  const isLight = document.body.classList.contains('light-theme');
  setTheme(isLight ? 'dark' : 'light');
  appendLog(`theme changed to ${isLight ? 'dark' : 'light'}`);
}

function runCommand(value) {
  const raw = value.trim();
  if (!raw) {
    return;
  }

  const command = raw.startsWith(':') ? raw.slice(1) : raw;
  const normalized = command.toLowerCase();

  appendLog(`<span style="color: var(--highlight)">:</span> ${command}`);

  if (normalized === 'help') {
    appendLog('<strong>command guide</strong>');
    appendLog('help -> show this guide');
    appendLog('home | about | projects | contact -> jump to section');
    appendLog('skills -> show tech stack summary');
    appendLog('theme -> switch color mode');
    appendLog('clear -> clear terminal output');
    return;
  }

  if (normalized === 'clear') {
    output.innerHTML = '';
    appendLog('terminal cleared');
    return;
  }

  if (normalized === 'theme') {
    toggleTheme();
    return;
  }

  if (normalized === 'skills') {
    appendLog('skills => C#, ASP.NET Core, Minimal APIs, EF Core, SQL, JWT, FluentValidation, SignalR, JavaScript, TypeScript, React, Node.js');
    return;
  }

  if (appSections.map((section) => section.toLowerCase()).includes(normalized)) {
    activateSectionByName(normalized);
    return;
  }

  appendLog(`error: command not found -> ${command}`);
}

function typeWriter(text, speed = 36) {
  typeLine.textContent = '';
  let index = 0;
  const timer = setInterval(() => {
    typeLine.textContent += text[index] || '';
    index += 1;
    if (index >= text.length) {
      clearInterval(timer);
    }
  }, speed);
}

function setExperienceTab(index, focusButton = false) {
  if (!companyButtons.length || !jobs.length) {
    return;
  }

  const safeIndex = (index + companyButtons.length) % companyButtons.length;
  const previousIndex = currentExperienceIndex;

  if (jobDescriptions && safeIndex !== previousIndex) {
    const movedForward =
      safeIndex > previousIndex ||
      (previousIndex === companyButtons.length - 1 && safeIndex === 0);

    jobDescriptions.classList.remove('is-next', 'is-prev');
    jobDescriptions.classList.add(movedForward ? 'is-next' : 'is-prev');
  }

  currentExperienceIndex = safeIndex;

  companyButtons.forEach((button, buttonIndex) => {
    const isActive = buttonIndex === safeIndex;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });

  jobs.forEach((job, jobIndex) => {
    job.classList.toggle('active', jobIndex === safeIndex);
  });

  if (expPosition) {
    expPosition.textContent = `${safeIndex + 1} / ${companyButtons.length}`;
  }

  if (expProgressBar) {
    const progressPercent = ((safeIndex + 1) / companyButtons.length) * 100;
    expProgressBar.style.width = `${progressPercent}%`;
  }

  if (focusButton) {
    companyButtons[safeIndex].focus();
  }
}

themeToggle.addEventListener('click', toggleTheme);

commandInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    runCommand(commandInput.value);
    commandInput.value = '';
  }
});

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    activateSectionByName(link.dataset.target || 'Home');
  });
});

mobileNavLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    activateSectionByName(link.dataset.target || 'Home');
  });
});

companyButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    setExperienceTab(index);
  });

  button.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      setExperienceTab(index + 1, true);
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      setExperienceTab(index - 1, true);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setExperienceTab(0, true);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setExperienceTab(companyButtons.length - 1, true);
    }
  });
});

expPrevButton?.addEventListener('click', () => {
  setExperienceTab(currentExperienceIndex - 1, true);
});

expNextButton?.addEventListener('click', () => {
  setExperienceTab(currentExperienceIndex + 1, true);
});

questButton.addEventListener('click', () => {
  appendLog('quest started: opening mission details');
  activateSectionByName('About');
});

document.addEventListener('keydown', (event) => {
  if (event.target === commandInput) {
    if (event.key === 'Escape') {
      commandInput.blur();
    }
    return;
  }

  if (event.target.closest('.companies')) {
    return;
  }

  if (event.key === ':') {
    event.preventDefault();
    commandInput.focus();
    commandInput.value = ':';
    return;
  }

  if (event.key === 'j') {
    event.preventDefault();
    activateSectionByIndex(currentSectionIndex + 1);
    return;
  }

  if (event.key === 'k') {
    event.preventDefault();
    activateSectionByIndex(currentSectionIndex - 1);
    return;
  }

  if (event.key === 'l') {
    event.preventDefault();
    currentTabIndex = (currentTabIndex + 1) % appSections.length;
    activateSectionByIndex(currentTabIndex);
    return;
  }

  if (event.key === 'h') {
    event.preventDefault();
    currentTabIndex = (currentTabIndex - 1 + appSections.length) % appSections.length;
    activateSectionByIndex(currentTabIndex);
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = appSections.findIndex((name) => name === entry.target.id);
        if (index >= 0) {
          currentSectionIndex = index;
          currentTabIndex = index;
          syncActiveNav(appSections[index]);
          panelElements.forEach((panel) => panel.classList.remove('active-panel'));
          entry.target.classList.add('active-panel');
        }
      }
    });
  },
  {
    threshold: 0.55,
  }
);

sectionElements.forEach((section) => observer.observe(section));

const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

if (hasFinePointer) {
  let cursorFrameRequested = false;
  let pendingCursorX = 0;
  let pendingCursorY = 0;

  document.addEventListener('pointermove', (event) => {
    pendingCursorX = event.clientX;
    pendingCursorY = event.clientY;

    if (cursorFrameRequested) {
      return;
    }

    cursorFrameRequested = true;
    window.requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--cursor-x', `${pendingCursorX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${pendingCursorY}px`);
      cursorFrameRequested = false;
    });
  });
}

const savedTheme = localStorage.getItem('portfolioTheme');
setTheme(savedTheme === 'light' ? 'light' : 'dark');
activateSectionByIndex(0, false);
setExperienceTab(currentExperienceIndex);
typeWriter('Mission: Build resilient backend systems and clean APIs that scale for real users.');
