const cursorDot = document.querySelector('.cursor-dot');
const cursorFollower = document.querySelector('.cursor-follower');
const cursorGlow = document.querySelector('.cursor-glow');
const preloader = document.getElementById('preloader');

// --- Cosmic Background (Constellation) ---
const canvas = document.getElementById('bg-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 100;
    const connectionDistance = 150;

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.alpha = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', initParticles);
    initParticles();
    animateParticles();
}

// --- Logo Text Shifter ---
const logoTexts = document.querySelectorAll('.logo-text-shift');
const phrases = ['Agent Ducky', 'Ahmed Magdy'];
let phraseIndex = 0;

function scrambleText(element, targetText) {
    const chars = '!@#$%^&*()_+<>?:{}|[]';
    const iterations = 10;
    let currentIteration = 0;

    const interval = setInterval(() => {
        element.textContent = targetText
            .split('')
            .map((char, index) => {
                if (index < currentIteration) return targetText[index];
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');

        if (currentIteration >= targetText.length) {
            clearInterval(interval);
            element.textContent = targetText;
        }
        currentIteration += targetText.length / iterations;
    }, 50);
}

setInterval(() => {
    phraseIndex = (phraseIndex + 1) % phrases.length;
    logoTexts.forEach(el => scrambleText(el, phrases[phraseIndex]));
}, 4000);

// --- Lenis Smooth Scroll ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- GSAP ScrollTrigger Integration ---
gsap.registerPlugin(ScrollTrigger);

// --- Experience Horizontal Scroll ---
function initExperienceScroll() {
    const container = document.querySelector('.experience-horizontal-container');
    const wrapper = document.querySelector('.experience-horizontal-wrapper');
    const grid = document.querySelector('.experience-grid');

    if (!container || !wrapper || !grid) return;

    const scrollWidth = grid.offsetWidth;
    const windowWidth = window.innerWidth;
    const horizontalScrollAmount = scrollWidth - windowWidth + (windowWidth * 0.1); // Add small buffer

    gsap.to(wrapper, {
        x: () => -horizontalScrollAmount,
        ease: "none",
        scrollTrigger: {
            trigger: container,
            start: "center center",
            end: () => `+=${horizontalScrollAmount}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            markers: false
        }
    });
}

// --- GSAP Reveals ---
function initGSAP() {
    // Only enable animations on devices that have hover (usually desktop/mouse)
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouchDevice) return;

    // Initialize Experience Horizontal Scroll
    initExperienceScroll();

    gsap.utils.toArray('.reveal').forEach((el) => {
        ScrollTrigger.create({
            trigger: el,
            start: 'top 95%', // Reveal earlier
            end: 'bottom 15%',
            onEnter: () => el.classList.add('active'),
            onLeave: () => el.classList.remove('active'),
            onEnterBack: () => el.classList.add('active'),
            onLeaveBack: () => el.classList.remove('active'),
        });
    });

    // Refresh triggers after layout settles
    window.addEventListener('load', () => {
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 500);
    });
}

// --- Preloader ---
const hidePreloader = () => {
    if (!preloader || preloader.classList.contains('fade-out')) return;

    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouchDevice) {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    } else {
        initGSAP();
    }
    preloader.classList.add('fade-out');
    console.log("Preloader hidden");
};

window.addEventListener('load', () => {
    setTimeout(hidePreloader, 800); // Reduced delay for better UX
});

// Fallback: Force hide preloader after 4 seconds regardless of load event
setTimeout(hidePreloader, 4000);

// --- Mouse Tracking & Glow/Grid ---
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let glowX = 0, glowY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cursorDot) {
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    }

    // Update CSS variables for Grid Background
    document.documentElement.style.setProperty('--mouse-x', `${mouseX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${mouseY}px`);
});

// Smooth follower and glow movement
// Smooth follower and glow movement
function animateCursor() {
    // Handle visibility based on device input type (touch vs mouse)
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (isTouchDevice) {
        if (cursorDot) cursorDot.style.display = 'none';
        if (cursorFollower) cursorFollower.style.display = 'none';
    } else {
        if (cursorDot) cursorDot.style.display = 'block';
        if (cursorFollower) cursorFollower.style.display = 'block';

        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;

        glowX += (mouseX - glowX) * 0.05;
        glowY += (mouseY - glowY) * 0.05;

        if (cursorFollower) {
            cursorFollower.style.left = `${cursorX}px`;
            cursorFollower.style.top = `${cursorY}px`;
        }

        if (cursorGlow) {
            cursorGlow.style.left = `${glowX}px`;
            cursorGlow.style.top = `${glowY}px`;
        }
    }

    requestAnimationFrame(animateCursor);
}
animateCursor();

// --- Magnetic Interactivity ---
const magneticEls = document.querySelectorAll('.tech-btn, .social-link, .brand, .burger-menu, .cta-brush, .cta-brush-vid-container');
magneticEls.forEach(el => {
    el.addEventListener('mousemove', (e) => {
        // Disable on touch devices
        const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
        if (isTouchDevice) return;

        const { left, top, width, height } = el.getBoundingClientRect();
        const center = { x: left + width / 2, y: top + height / 2 };
        const m = { x: e.clientX - center.x, y: e.clientY - center.y };

        el.style.transform = `translate(${m.x * 0.3}px, ${m.y * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => {
        el.style.transform = `translate(0, 0)`;
    });
});

// Cursor Hover States
const hoverables = document.querySelectorAll('a, button, .project-card, .service-item, #scrollbar-thumb, .brand');
hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// --- Character Splitting (Robust version) ---
const splitCharacters = () => {
    const charRevealEls = document.querySelectorAll('.char-reveal');
    charRevealEls.forEach(parent => {
        let globalCharCount = 0;
        const processNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                if (!text.trim() && text.length > 0) return; // Skip empty text nodes

                const fragment = document.createDocumentFragment();
                text.split('').forEach((char) => {
                    const span = document.createElement('span');
                    span.innerHTML = char === ' ' ? '&nbsp;' : char;
                    if (char.trim() !== '') {
                        span.classList.add('char');
                        span.style.setProperty('--delay', `${globalCharCount * 0.02}s`);
                        globalCharCount++;
                    }
                    fragment.appendChild(span);
                });
                node.parentNode.replaceChild(fragment, node);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.classList.contains('char')) return;
                Array.from(node.childNodes).forEach(processNode);
            }
        };
        Array.from(parent.childNodes).forEach(processNode);
    });
};
splitCharacters();

// --- Hero Parallax ---
const heroSection = document.querySelector('.hero');
if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
        const { width, height } = heroSection.getBoundingClientRect();
        const offX = (e.clientX / width - 0.5) * 40;
        const offY = (e.clientY / height - 0.5) * 40;
        // Logic for parallax can be added here if needed
    });
}

// --- Simple Parallax for Project Panels ---
gsap.utils.toArray('.project-panel').forEach(panel => {
    const imageBg = panel.querySelector('.image-bg');

    if (imageBg) {
        gsap.to(imageBg, {
            yPercent: 20,
            ease: 'none',
            scrollTrigger: {
                trigger: panel,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });
    }
});

// --- Mobile Navigation Logic ---
const menuBtn = document.querySelector('.menu-btn');
const mobileMenu = document.querySelector('.mobile-menu-overlay');
const closeMenuBtn = document.querySelector('.mobile-menu-close');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');

function openMenu() {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeMenu() {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

if (menuBtn) {
    menuBtn.addEventListener('click', openMenu);
}

if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', closeMenu);
}

// Close menu when clicking a link
mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
});










const track = document.getElementById('scrollbar-track');
const thumb = document.getElementById('scrollbar-thumb');

// 1. Calculate Thumb Height based on content size
function updateThumbSize() {
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    // Calculate ratio
    let thumbHeight = (clientHeight / scrollHeight) * clientHeight;

    // Prevent thumb from being too small (e.g., smaller than 30px)
    if (thumbHeight < 30) thumbHeight = 30;

    thumb.style.height = `${thumbHeight}px`;
}

// 2. Move Thumb when Page Scrolls
function updateThumbPosition() {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    const trackHeight = clientHeight;
    const thumbHeight = thumb.offsetHeight;

    // The math to map scroll position to thumb position
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = trackHeight - thumbHeight;

    const scrollRatio = scrollTop / maxScrollTop;
    const thumbTop = scrollRatio * maxThumbTop;

    thumb.style.transform = `translateY(${thumbTop}px)`;
}

// 3. Drag Logic (Move Page when Thumb is dragged)
let isDragging = false;
let startY;
let startThumbTop;

thumb.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY;
    // Get current translate Y value
    const style = window.getComputedStyle(thumb);
    const matrix = new WebKitCSSMatrix(style.transform);
    startThumbTop = matrix.m42;

    document.body.style.userSelect = 'none'; // Prevent text highlighting
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const deltaY = e.clientY - startY;
    const thumbHeight = thumb.offsetHeight;
    const trackHeight = document.documentElement.clientHeight;
    const scrollHeight = document.documentElement.scrollHeight;

    const maxThumbTop = trackHeight - thumbHeight;
    const maxScrollTop = scrollHeight - trackHeight;

    // Calculate new thumb position
    let newThumbTop = startThumbTop + deltaY;

    // Constrain within track
    if (newThumbTop < 0) newThumbTop = 0;
    if (newThumbTop > maxThumbTop) newThumbTop = maxThumbTop;

    // Calculate corresponding page scroll
    const scrollRatio = newThumbTop / maxThumbTop;
    const newScrollTop = scrollRatio * maxScrollTop;

    // Scroll the window
    window.scrollTo(0, newScrollTop);
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = '';
});

// Initialize and Listeners
window.addEventListener('scroll', updateThumbPosition);
window.addEventListener('resize', () => {
    updateThumbSize();
    updateThumbPosition();
});

// Run once on load
updateThumbSize();