
const lightDark = document.querySelector('.light-dark');
const themeIcon = document.querySelector('.light-dark i');
const trialDiv = document.querySelector('.trial');

let theme = localStorage.getItem('themes');

function setLight() {
  document.body.classList.add('active');
  themeIcon.classList.remove('fa-moon');
  themeIcon.classList.add('fa-sun');
  trialDiv?.classList.add('active');
  themeIcon.style.color = '#FDB813';
}

function setDark() {
  document.body.classList.remove('active');
  themeIcon.classList.remove('fa-sun');
  themeIcon.classList.add('fa-moon');
  trialDiv?.classList.remove('active');
  themeIcon.style.color = '#B8AEA3';
}

theme === 'light' ? setLight() : setDark();

lightDark.addEventListener('click', () => {
  if(themeIcon.classList.contains('fa-moon')) {
    setLight();
    localStorage.setItem('themes','light');
  } else {
    setDark();
    localStorage.setItem('themes','dark');
  }
});


const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 70;
    if(scrollY >= sectionTop) current = section.getAttribute('id');
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if(link.getAttribute('href').includes(current)) link.classList.add('active');
  });
});

const companyButtons = document.querySelectorAll('.companies button');
const jobs = document.querySelectorAll('.job');

companyButtons.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    companyButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    jobs.forEach(j => j.classList.remove('active'));
    jobs[i].classList.add('active');
  });
});
