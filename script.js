document.addEventListener('DOMContentLoaded', () => {
    console.log("Website script loaded successfully!");

    // --- Set current year in footer ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Smooth Scrolling for Navigation Links ---
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = document.querySelector('header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - headerOffset - 20; // Adjusted offset

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });

                // When a link is clicked, immediately set it as active and remove from others
                document.querySelectorAll('nav a').forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // --- Intersection Observer for Active Nav Link on Scroll ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');

    // Root margin adjusted to activate link when section is more prominently in view
    const observerOptions = {
        root: null, // viewport
        rootMargin: '-30% 0% -30% 0%', // section becomes active when ~40% of it is in the middle of viewport
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentSectionId = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentSectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // --- FAQ Expand/Collapse ---
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const icon = question.querySelector('.faq-icon');

            // Close all other open answers
            document.querySelectorAll('.faq-answer').forEach(ans => {
                if (ans !== answer && ans.style.display === 'block') {
                    ans.style.display = 'none';
                    const otherIcon = ans.previousElementSibling.querySelector('.faq-icon');
                    if (otherIcon) {
                        otherIcon.classList.remove('fa-chevron-up');
                        otherIcon.classList.add('fa-chevron-down');
                    }
                }
            });

            // Toggle the clicked answer
            if (answer.style.display === 'block') {
                answer.style.display = 'none';
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            } else {
                answer.style.display = 'block';
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        });
        // Initially ensure all FAQ answers are hidden on page load
        question.nextElementSibling.style.display = 'none';
    });

    // --- Carousel Functionality (for Videos only) ---
    const setupCarousel = (carouselId) => {
        const carousel = document.getElementById(carouselId);
        if (!carousel) return;

        // Arrows are now siblings of the carousel-wrapper, not carousel itself
        const carouselWrapper = carousel.parentElement;
        const leftArrow = carouselWrapper.querySelector('.left-arrow[data-carousel-id="' + carouselId + '"]');
        const rightArrow = carouselWrapper.querySelector('.right-arrow[data-carousel-id="' + carouselId + '"]');

        if (!leftArrow || !rightArrow) {
            console.warn(`Arrows not found for carousel ${carouselId}`);
            return;
        }

        // Calculate scroll amount based on visible cards
        const updateScrollAmount = () => {
            const firstCard = carousel.querySelector('.video-card');
            if (!firstCard) return 0;

            const cardWidth = firstCard.offsetWidth;
            const carouselStyle = window.getComputedStyle(carousel);
            const gap = parseFloat(carouselStyle.getPropertyValue('gap')) || 0;

            // Calculate how many *full* cards fit in the current carousel view
            // This ensures we scroll by complete cards.
            const totalCardPlusGapWidth = cardWidth + gap;
            const cardsInView = Math.floor((carousel.clientWidth + gap) / totalCardPlusGapWidth);

            // Return the scroll distance for 'cardsInView' number of items
            return totalCardPlusGapWidth * Math.max(1, cardsInView); // Ensures at least 1 card scroll
        };

        leftArrow.addEventListener('click', () => {
            const scrollAmount = updateScrollAmount();
            carousel.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });

        rightArrow.addEventListener('click', () => {
            const scrollAmount = updateScrollAmount();
            carousel.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });

        const updateArrowVisibility = () => {
            // Add a small buffer for comparison to account for fractional pixels
            const scrollLeftMax = carousel.scrollWidth - carousel.clientWidth;
            leftArrow.style.display = carousel.scrollLeft <= 5 ? 'none' : 'block';
            rightArrow.style.display = carousel.scrollLeft >= scrollLeftMax - 5 ? 'none' : 'block';
        };

        carousel.addEventListener('scroll', updateArrowVisibility);
        window.addEventListener('resize', () => {
            // Re-calculate scroll amount and update visibility on resize
            // Debounce or throttle this in production for performance
            setTimeout(() => {
                updateScrollAmount(); // Update the calculation
                updateArrowVisibility(); // Update visibility based on new dimensions
            }, 100);
        });
        updateArrowVisibility(); // Initial call to set arrow visibility
    };

    // Setup each carousel
    setupCarousel('dos-videos');
    setupCarousel('donts-videos');
});