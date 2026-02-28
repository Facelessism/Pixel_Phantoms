/**
 * Pixel Phantoms - About Page Logic
 * Handles accessibility interactions for member cards.
 */

document.addEventListener('DOMContentLoaded', function () {
  const memberCards = document.querySelectorAll('.member-card');

  // Add keyboard support for member cards
  memberCards.forEach(card => {
    card.addEventListener('keydown', function (e) {
      // Allow triggering click with Enter or Space
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });

  // Log interactions with social links (for analytics or debugging)
  const socialLinks = document.querySelectorAll('.social-link');
  socialLinks.forEach(link => {
    link.addEventListener('click', function () {
      const label = this.getAttribute('aria-label');
      console.log(`[Interaction] Social link clicked: ${label}`);
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const statsSection = document.getElementById("stats-section");
  const statNumbers = document.querySelectorAll(".stat-number");

  if (!statsSection || statNumbers.length === 0) return;

  let hasAnimated = false;

  const animateCount = (el) => {
    const target = +el.getAttribute("data-target");
    let current = 0;
    const duration = 1500;
    const increment = target / (duration / 16);

    const updateCounter = () => {
      current += increment;

      if (current < target) {
        el.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = target + "+";
        el.classList.add("stat-glow");
      }
    };

    updateCounter();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          statNumbers.forEach((stat) => animateCount(stat));
          hasAnimated = true;
          observer.disconnect();
        }
      });
    },
    {
      threshold: 0.4,
    }
  );

  observer.observe(statsSection);
});