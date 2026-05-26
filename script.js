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
        description: 'Developed a two-wheeled self-balancing robot utilizing PID control algorithms and MPU6050 IMU sensor fusion to maintain vertical stability. Engineered high-precision motor control and programmed feedback loops to achieve a 0.5–0.7s rising time and a steady-state error of only 0.44°. The system continuously reads gyroscope and accelerometer data, applies a complementary filter, and adjusts motor PWM signals in real time to keep the robot upright.',
        tech: ['C/C++', 'STM32', 'MPU6050', 'PID Control', 'Sensor Fusion', 'PWM'],
        github: 'https://github.com/dhiosyh/Autonomous-Self-Balancing-Robot',
    },
    'sar-robot': {
        title: 'Autonomous SAR Robot',
        tags: ['Robotics', 'Sensor Fusion', 'C/C++'],
        description: 'Led a team to design, build, and program an autonomous Search and Rescue (SAR) robot for use in disaster-scenario environments. Implemented multi-sensor fusion (IMU, ultrasonic, LiDAR) with a custom PID controller, achieving an 85% success rate in autonomous navigation through obstacle-dense terrain. The robot competed at a national robotics event and placed in the top 3.',
        tech: ['C/C++', 'STM32', 'Sensor Fusion', 'PID Control', 'ESP32'],
        github: 'https://github.com/dhiosyh',
    },
    'sign-recognition': {
        title: 'Mobile Classroom Sign Recognition',
        tags: ['Android', 'Computer Vision', 'ML'],
        description: 'Engineered an Android application that performs real-time optical character and classroom sign recognition to assist campus navigation. Used Google ML Kit for on-device text detection and a fine-tuned EfficientNet model for sign classification, achieving >90% accuracy in varied lighting conditions. The app includes a map overlay and voice-guided directions feature.',
        tech: ['Android', 'Google ML Kit', 'EfficientNet', 'OpenCV', 'Java'],
        github: 'https://github.com/dhiosyh/BoardDetection_MobileAPP',
    },
    'pet-feeder': {
        title: 'IoT-Based Auto Pet Feeder',
        tags: ['IoT', 'ESP8266', 'Embedded'],
        description: 'Architected an end-to-end IoT solution using ESP8266 and HX711 load cells, enabling remote feeding and real-time monitoring via the Blynk platform. Calibrated precision sensors to ensure 98% weight-based food dispensing accuracy while optimizing power consumption with WIFI_LIGHT_SLEEP mode. The system supports scheduled feeding, manual override via the Blynk mobile app, and real-time weight telemetry streamed to a live dashboard.',
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

    // Populate content
    modalTitle.textContent = data.title;
    modalDesc.textContent = data.description;
    modalGithub.href = data.github;

    modalTags.innerHTML = '';
    data.tags.forEach(tag => modalTags.appendChild(makeBadge(tag)));

    modalTech.innerHTML = '';
    data.tech.forEach(t => modalTech.appendChild(makeBadge(t)));

    // Show
    modalOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden'; // prevent background scroll
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
