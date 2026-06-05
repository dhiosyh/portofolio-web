// =====================================================
//  DHIO.R - Portfolio Scripts
// =====================================================

// ── 1. SMOOTH SCROLL ─────────────────────────────────
// Smoothly scrolls to the target section when any
// internal anchor link (href="#...") is clicked.
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
    });
});


// ── 2. HAMBURGER / MOBILE NAV TOGGLE ─────────────────
// Opens and closes the mobile navigation drawer when the
// hamburger button is clicked. Also closes it when any
// link inside the drawer is tapped.

const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileNav    = document.getElementById('mobile-nav');
const menuIcon     = hamburgerBtn ? hamburgerBtn.querySelector('.material-symbols-outlined') : null;

/** Toggle the mobile drawer open / closed. */
function toggleMobileNav(forceClose = false) {
    const isOpen = mobileNav.classList.contains('is-open');
    if (forceClose || isOpen) {
        mobileNav.classList.remove('is-open');
        hamburgerBtn.classList.remove('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        if (menuIcon) menuIcon.textContent = 'menu';
    } else {
        mobileNav.classList.add('is-open');
        hamburgerBtn.classList.add('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        if (menuIcon) menuIcon.textContent = 'close';
    }
}

if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => toggleMobileNav());
}

// Auto-close when a nav link inside the drawer is clicked.
document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => toggleMobileNav(true));
});


// ── 2. ACTIVE NAVIGATION STATE ───────────────────────
// Uses IntersectionObserver to detect which section is
// currently in the viewport and highlights the matching
// nav link with the "active" class (cyan underline).

const navLinks = document.querySelectorAll('.nav-link');

/**
 * Set exactly one nav link as active, remove from others.
 * @param {string} sectionId - The id of the active section.
 */
function setActiveLink(sectionId) {
    navLinks.forEach(link => {
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Sections to observe (in document order).
const sectionIds = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'];

// Map section ids to the nav item that should light up.
// "hero" has no nav entry, so it falls back to "about".
const sectionToNav = {
    hero: 'about',
    about: 'about',
    skills: 'skills',
    projects: 'projects',
    experience: 'experience',
    contact: 'contact',
};

// Keep track of visible sections with their top positions
// so we always activate the topmost one in view.
const visibleSections = new Map();

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visibleSections.set(entry.target.id, entry.boundingClientRect.top);
            } else {
                visibleSections.delete(entry.target.id);
            }
        });

        if (visibleSections.size === 0) return;

        // Pick the section closest to the top of the viewport.
        let topSectionId = null;
        let minTop = Infinity;
        visibleSections.forEach((top, id) => {
            const absTop = Math.abs(top);
            if (absTop < minTop) {
                minTop = absTop;
                topSectionId = id;
            }
        });

        if (topSectionId) {
            setActiveLink(sectionToNav[topSectionId]);
        }
    },
    {
        // Trigger when a section crosses the middle band of the viewport.
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
    }
);

// Start observing all sections.
sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
});

// Set initial active state on page load.
setActiveLink('about');


// ── 3. PROJECT DETAILS MODAL ─────────────────────────
// Opens a modal with per-project details when a
// "View Details" button is clicked. Closes on the X
// button, Escape key, or clicking the dark overlay.

/** Project data registry — add/edit entries here. */
const projectData = {
    'self-balancing-robot': {
        title: 'Autonomous Self-Balancing Robot',
        tags: ['Robotics', 'PID Control', 'Embedded'],
        why: 'Menantang pemahaman saya tentang sistem kontrol dan integrasi hardware-software dengan berupaya menjaga sistem fisik yang pada dasarnya tidak stabil agar tetap tegak seimbang.',
        how: 'Saya bereksperimen secara intensif dengan penyetelan algoritma kontrol PID (Kp, Ki, Kd) dan fusi sensor IMU. Proses ini menuntut penyesuaian feedback loops secara terus-menerus untuk mengatasi penundaan respons motorik di dunia nyata.',
        impact: 'Mencapai kontrol motorik presisi tinggi dengan rising time 0.5–0.7 detik dan error steady-state yang sangat stabil di angka 0.44°.',
        tech: ['C/C++', 'STM32', 'MPU6050', 'PID Control', 'Sensor Fusion', 'PWM'],
        github: 'https://github.com/dhiosyh/Autonomous-Self-Balancing-Robot',
    },
    'sar-robot': {
        title: 'Autonomous SAR Robot',
        tags: ['Robotics', 'Sensor Fusion', 'C/C++'],
        why: 'Diperlukan sistem otonom yang andal untuk menavigasi medan yang tidak dapat diprediksi dan padat rintangan untuk misi pencarian dan penyelamatan (Search and Rescue).',
        how: 'Sebagai Technical PIC, saya memimpin tim lintas disiplin beranggotakan 10+ orang. Kontribusi utama saya adalah merancang arsitektur fusi sensor yang mengintegrasikan modul MPU6050 dan Ultrasonik untuk memecahkan masalah titik buta (blind-spots) navigasi robot.',
        impact: 'Prototipe berhasil mencapai tingkat keberhasilan misi 85% dalam simulasi rintangan skala nasional.',
        tech: ['C/C++', 'STM32', 'Sensor Fusion', 'PID Control', 'ESP32'],
        github: 'https://github.com/dhiosyh',
    },
    'sign-recognition': {
        title: 'Mobile Classroom Sign Recognition',
        tags: ['Android', 'Computer Vision', 'ML'],
        why: 'Menciptakan antarmuka aplikasi seluler yang human-centered untuk membantu mobilitas pengguna di area kampus dengan menerjemahkan rambu fisik/papan kelas menjadi informasi digital secara instan.',
        how: 'Saya menjembatani pengalaman pengguna (UX) seluler dengan machine learning. Prosesnya melibatkan rekayasa pipeline hybrid menggunakan OpenCV untuk pra-pemrosesan gambar (menangani berbagai kondisi pencahayaan) sebelum dimasukkan ke model EfficientNet kustom.',
        impact: 'Menghasilkan aplikasi native dengan pengalaman pengguna yang mulus dan latensi inferensi langsung di perangkat (on-device) di bawah 500ms.',
        tech: ['Android', 'Google ML Kit', 'EfficientNet', 'OpenCV', 'Java'],
        github: 'https://github.com/dhiosyh/BoardDetection_MobileAPP',
    },
    'pet-feeder': {
        title: 'IoT-Based Auto Pet Feeder',
        tags: ['IoT', 'ESP8266', 'Embedded'],
        why: 'Pemilik hewan peliharaan membutuhkan solusi perawatan otomatis yang menjamin kontrol porsi makanan yang presisi dan terpantau secara real-time, bukan sekadar pengatur waktu mekanis biasa.',
        how: 'Ini adalah proyek yang terus saya iterasi (Work-in-progress). Saya melalui proses debugging berulang pada kode ESP8266 dan melakukan kalibrasi mendalam pada sensor load cell HX711 untuk memastikan pengukuran berat tetap stabil terhadap getaran fisik perangkat.',
        impact: 'Menghasilkan akurasi distribusi makanan sebesar 98% dengan konsumsi daya yang dioptimalkan menggunakan mode WIFI_LIGHT_SLEEP.',
        tech: ['ESP8266', 'HX711', 'Blynk IoT', 'C/C++', 'Arduino', 'Sensor Calibration'],
        github: 'https://github.com/dhiosyh/IoT-Based-Smart-Auto-Pet-Feeder',
    },
};

// DOM references
const modalOverlay = document.getElementById('project-modal');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-description');
const modalTags = document.getElementById('modal-tags');
const modalTech = document.getElementById('modal-tech');
const modalGithub = document.getElementById('modal-github');

/** Build a small badge element. */
function makeBadge(text) {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = 'font-label-mono text-[10px] bg-primary/10 border border-primary/30 text-primary px-2 py-1 rounded';
    return span;
}

/** Open the modal and populate it with the given project's data. */
function openModal(projectId) {
    const data = projectData[projectId];
    if (!data) return;

    // ── Title & tags ──────────────────────────────────
    modalTitle.textContent = data.title;
    modalGithub.href = data.github;

    modalTags.innerHTML = '';
    data.tags.forEach(tag => modalTags.appendChild(makeBadge(tag)));

    // ── Storytelling body ─────────────────────────────
    modalDesc.innerHTML = `
        <div class="modal-story-block">
            <h3 class="modal-story-label">🔍 The Why</h3>
            <p class="modal-story-text">${data.why}</p>
        </div>
        <div class="modal-story-block">
            <h3 class="modal-story-label">⚙️ The How &amp; My Role</h3>
            <p class="modal-story-text">${data.how}</p>
        </div>
        <div class="modal-story-block">
            <h3 class="modal-story-label">🚀 The Impact</h3>
            <p class="modal-story-text">${data.impact}</p>
        </div>
    `;

    // ── Tech stack ────────────────────────────────────
    modalTech.innerHTML = '';
    data.tech.forEach(t => modalTech.appendChild(makeBadge(t)));

    // Show
    modalOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
}

/** Close and reset the modal. */
function closeModal() {
    modalOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
}

// Wire up "View Details" buttons (event delegation not needed since
// buttons are static, but we use querySelectorAll for simplicity).
document.querySelectorAll('.view-details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(btn.dataset.project);
    });
});

// Close on X button
modalClose.addEventListener('click', closeModal);

// Close when clicking the dark overlay outside the panel
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('is-open')) {
        closeModal();
    }
});
