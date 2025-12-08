document.addEventListener('DOMContentLoaded', () => {
    // Initialize GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    // Initial Reveal Animation
    animateCards();
    
    // Setup Filter Logic
    initFilters();

    // Setup Wobble Toggle
    initWobbleToggle();
});

function animateCards() {
    gsap.fromTo(".project-card", 
        { 
            y: 50, 
            opacity: 0, 
            scale: 0.9,
            filter: "blur(5px)"
        },
        {
            y: 0,
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            clearProps: "all" // Clear styles to allow hover effects
        }
    );
}

function initFilters() {
    const buttons = document.querySelectorAll('.btn-glitch-filter');
    const cards = document.querySelectorAll('.project-card');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. Update Active State
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 2. Get Filter Value
            const filterValue = btn.getAttribute('data-filter');

            // 3. Glitch/Filter Animation Logic
            const timeline = gsap.timeline();

            // Step A: "Despawn" all cards briefly with a flash effect
            timeline.to(cards, {
                duration: 0.2,
                opacity: 0,
                scale: 0.95,
                filter: "brightness(2) blur(10px)", 
                ease: "power1.in",
                onComplete: () => {
                    // Step B: Toggle visibility
                    cards.forEach(card => {
                        const cardCategory = card.getAttribute('data-category');
                        if (filterValue === 'all' || filterValue === cardCategory) {
                            card.style.display = 'flex';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                }
            });

            // Step C: "Respawn" visible cards
            timeline.to(cards, {
                duration: 0.4,
                opacity: 1,
                scale: 1,
                filter: "brightness(1) blur(0px)",
                ease: "back.out(1.7)",
                stagger: {
                    amount: 0.2,
                    from: "random" // Random spawn order for hacker feel
                },
                clearProps: "filter, opacity, scale"
            });
        });
    });
}

function initWobbleToggle() {
    const toggle = document.getElementById('wobble-toggle');
    const card = document.getElementById('wocs-card');
    
    if (toggle && card) {
        toggle.addEventListener('change', () => {
            if (toggle.checked) {
                card.classList.add('wobbling');
            } else {
                card.classList.remove('wobbling');
            }
        });
    }
}

// =========================================
// INTEGRATE QUICK FILTERS WITH EXISTING GSAP ANIMATIONS
// =========================================

// Override the initFilters function to work with quick filters
const originalInitFilters = window.initFilters;

window.initFilters = function() {
    // Load the quick filters script
    if (typeof window.projectFilters === 'undefined') {
        console.warn('Quick filters not loaded. Loading now...');
        
        // Create script element and load it
        const script = document.createElement('script');
        script.src = 'js/projects-filters.js';
        script.onload = function() {
            console.log('Quick filters loaded successfully');
            window.projectFilters.initQuickFilters();
            window.projectFilters.initSearch();
            window.projectFilters.initMobileFilters();
            window.projectFilters.updateFilterCounts();
        };
        document.head.appendChild(script);
    } else {
        // Quick filters already loaded, just initialize them
        window.projectFilters.initQuickFilters();
        window.projectFilters.initSearch();
        window.projectFilters.initMobileFilters();
        window.projectFilters.updateFilterCounts();
    }
    
    // Also run the original filter initialization
    if (originalInitFilters) {
        originalInitFilters();
    }
};

// Override the animateCards function to include filter counts
const originalAnimateCards = window.animateCards;

window.animateCards = function() {
    if (originalAnimateCards) {
        originalAnimateCards();
    }
    
    // Update filter counts after animation
    setTimeout(() => {
        if (window.projectFilters && window.projectFilters.updateFilterCounts) {
            window.projectFilters.updateFilterCounts();
        }
    }, 1000);
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize GSAP ScrollTrigger
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }
    
    // Run animations
    if (window.animateCards) {
        window.animateCards();
    }
    
    // Setup Wobble Toggle
    if (window.initWobbleToggle) {
        window.initWobbleToggle();
    }
    
    // Setup Filters (including quick filters)
    if (window.initFilters) {
        window.initFilters();
    }
    
    console.log('Projects page fully initialized with quick filters');
});