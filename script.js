/**
 * Mindplexus - Interactive Webpage Logic
 * Handles navigation, tab switching, lightbox, and email/WhatsApp inquiry integration.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.setAttribute('data-lucide', 'x');
                } else {
                    icon.setAttribute('data-lucide', 'menu');
                }
                lucide.createIcons();
            }
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                    lucide.createIcons();
                }
            });
        });
    }

    // 2. Sticky Navbar on Scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Tab Switching (Bootcamp Offerings)
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            // Set active button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show active content
            tabContents.forEach(content => {
                if (content.id === target) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });

    // 4. Lightbox for Certificates
    const certImages = document.querySelectorAll('.cert-image');
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <button class="lightbox-close">&times;</button>
        <img class="lightbox-content" src="" alt="Certificate Large Preview">
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-content');
    const lightboxClose = lightbox.querySelector('.lightbox-close');

    certImages.forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    // 5. Contact Form Submission Integration
    const contactForm = document.getElementById('inquiryForm');
    const modalOverlay = document.getElementById('successModal');
    const modalClose = document.getElementById('modalClose');
    const modalCloseX = document.getElementById('modalCloseX');
    const modalWhatsAppBtn = document.getElementById('modalWhatsAppBtn');

    if (contactForm && modalOverlay) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Select button and set loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Sending...</span>';
            submitBtn.disabled = true;

            // Extract values
            const parentName = document.getElementById('parentName').value;
            const childName = document.getElementById('childName').value;
            const childAge = document.getElementById('childAge').value;
            const parentEmail = document.getElementById('parentEmail').value;
            const parentPhone = document.getElementById('parentPhone').value;
            const program = document.getElementById('programSelect').value;
            const message = document.getElementById('messageText').value;

            // Payload for automatic background email submission
            const payload = {
                "Parent / Student Name": parentName,
                "Email Address": parentEmail,
                "Phone Number": parentPhone,
                "Subject / Interest Area": program,
                "Child Name": childName || "Not provided",
                "Child Age": childAge || "Not provided",
                "Message": message || "No message provided",
                "_subject": `Mindplexus Inquiry from ${parentName}`
            };

            // Configure WhatsApp redirect parameters for modal
            let waText = `Hello Mansi, I'm interested in Mindplexus bootcamps. My name is ${parentName}.`;
            if (childName && childAge) {
                waText = `Hello Mansi, I'm interested in Mindplexus bootcamps for my child ${childName} (${childAge} yrs). My name is ${parentName}.`;
            } else if (childName) {
                waText = `Hello Mansi, I'm interested in Mindplexus bootcamps for my child ${childName}. My name is ${parentName}.`;
            } else if (childAge) {
                waText = `Hello Mansi, I'm interested in Mindplexus bootcamps for my child (${childAge} yrs). My name is ${parentName}.`;
            }
            const waUrl = `https://wa.me/919167695286?text=${encodeURIComponent(waText)}`;
            modalWhatsAppBtn.href = waUrl;

            // If running as local file (file:///), do native form submit in a new tab to bypass CORS restrictions
            if (window.location.protocol === 'file:') {
                const emailSubjectInput = document.getElementById('emailSubject');
                if (emailSubjectInput) {
                    emailSubjectInput.value = `Mindplexus Inquiry from ${parentName}`;
                }

                // Submit natively in new tab to bypass CORS
                contactForm.target = '_blank';
                contactForm.submit();

                // Show confirmation modal on current page
                modalOverlay.classList.add('active');
                
                // Reset form and restore submit button
                contactForm.reset();
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
                return;
            }

            // Submit using FormSubmit AJAX
            fetch('https://formsubmit.co/ajax/mansi@mind-plexus.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Show confirmation modal
                modalOverlay.classList.add('active');
                // Clear form
                contactForm.reset();
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                alert("There was an error sending your inquiry. Please try again or email us directly at mansi@mind-plexus.com.");
            })
            .finally(() => {
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            });
        });

        // Close Modal Actions
        const closeModal = () => {
            modalOverlay.classList.remove('active');
        };

        modalClose.addEventListener('click', closeModal);
        modalCloseX.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 6. Interactive Canvas Plexus Particle System
    const canvas = document.getElementById('hero-plexus-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, active: false };
        let animationFrameId;

        // Configuration
        const config = {
            maxDistance: 140,           // Connection threshold distance (increased to fill whitespace)
            baseSpeed: 0.9,             // Minimum particle float speed (fast but soft)
            randomSpeed: 0.9,           // Variance in speed
            particleColor: 'rgba(155, 42, 238, 0.36)', // Soft purple particles
            lineColor: 'rgba(155, 42, 238, 0.18)',     // Soft purple connection lines
            mouseLineColor: 'rgba(223, 56, 162, 0.28)' // Muted magenta lines connecting to mouse
        };

        function getParticleCount() {
            // Scale number of particles based on screen width
            const width = window.innerWidth;
            if (width < 480) return 40;     // Increased density for mobile
            if (width < 768) return 70;     // Increased density for tablets
            if (width < 1200) return 110;    // Increased density for laptops
            return 160;                     // High density for wide desktops
        }

        class Particle {
            constructor(width, height) {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.radius = 1 + Math.random() * 2.2; // Tiny and delicate
                
                // Fast directional vectors
                const angle = Math.random() * Math.PI * 2;
                const speed = config.baseSpeed + Math.random() * config.randomSpeed;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
            }

            update(width, height) {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce at boundaries
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Keep in bounds
                if (this.x < 0) this.x = 0;
                if (this.x > width) this.x = width;
                if (this.y < 0) this.y = 0;
                if (this.y > height) this.y = height;
            }

            draw(context) {
                context.beginPath();
                context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                context.fillStyle = config.particleColor;
                context.fill();
            }
        }

        function init() {
            const width = canvas.offsetWidth;
            const height = canvas.offsetHeight;
            canvas.width = width;
            canvas.height = height;

            particles = [];
            const count = getParticleCount();
            for (let i = 0; i < count; i++) {
                particles.push(new Particle(width, height));
            }
        }

        function animate() {
            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            // Update & Draw particles
            for (let i = 0; i < particles.length; i++) {
                particles[i].update(width, height);
                particles[i].draw(ctx);
            }

            // Draw connection lines between particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < config.maxDistance) {
                        // Soft fade-out based on distance
                        const alpha = (1 - dist / config.maxDistance) * 0.16;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(155, 42, 238, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }

                // Interactive connection to user cursor
                if (mouse.active && mouse.x !== null && mouse.y !== null) {
                    const mdx = particles[i].x - mouse.x;
                    const mdy = particles[i].y - mouse.y;
                    const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

                    if (mdist < config.maxDistance * 1.3) {
                        const malpha = (1 - mdist / (config.maxDistance * 1.3)) * 0.22;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = `rgba(223, 56, 162, ${malpha})`;
                        ctx.lineWidth = 1.0;
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        // Mouse listeners (bounding coordinates to handle parent container shifts)
        const parentSection = canvas.parentElement;
        parentSection.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            mouse.active = true;
        });

        parentSection.addEventListener('mouseleave', () => {
            mouse.active = false;
            mouse.x = null;
            mouse.y = null;
        });

        // Resize handler with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                cancelAnimationFrame(animationFrameId);
                init();
                animate();
            }, 150);
        });

        // Start
        init();
        animate();
    }

    // 7. Full-Screen Page Slider Logic
    const sections = Array.from(document.querySelectorAll('.section-page'));
    let currentSlideIndex = 0;
    let lastTransitionTime = 0;
    const transitionDelay = 850; // Optimized lockout to match the 0.7s slide transition animation

    // Helper: update active nav link
    function updateActiveNavLink(targetId) {
        let mappedId = targetId;
        if (targetId === 'solution' || targetId === 'philosophy') {
            mappedId = 'about';
        } else if (targetId === 'pedagogy-steps') {
            mappedId = 'pedagogy';
        }

        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === '#' + mappedId || (mappedId === 'home' && href === '#')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Dynamic Dot Generation
    const paginationContainer = document.getElementById('pagePagination');
    if (paginationContainer && sections.length > 0) {
        sections.forEach((section, index) => {
            const dot = document.createElement('span');
            dot.className = `pagination-dot ${index === 0 ? 'active' : ''}`;
            dot.dataset.index = index;
            
            // Tooltip title mapping based on section IDs
            let sectionTitle = 'Home';
            if (section.id) {
                if (section.id === 'home') sectionTitle = 'Home';
                else if (section.id === 'about') sectionTitle = 'Disruption';
                else if (section.id === 'solution') sectionTitle = 'Mission';
                else if (section.id === 'philosophy') sectionTitle = 'Philosophy';
                else if (section.id === 'pedagogy') sectionTitle = 'Pedagogy';
                else if (section.id === 'pedagogy-steps') sectionTitle = 'Steps';
                else if (section.id === 'founder') sectionTitle = 'Founder';
                else if (section.id === 'bootcamps') sectionTitle = 'Bootcamps';
                else if (section.id === 'testimonials') sectionTitle = 'Feedback';
                else if (section.id === 'contact') sectionTitle = 'Contact';
                else sectionTitle = section.id.charAt(0).toUpperCase() + section.id.slice(1);
            } else {
                sectionTitle = `Page ${index + 1}`;
            }
            dot.title = sectionTitle;
            
            dot.addEventListener('click', () => {
                if (Date.now() - lastTransitionTime < transitionDelay || currentSlideIndex === index) return;
                goToSlide(index);
            });
            
            paginationContainer.appendChild(dot);
        });
    }

    // Primary Slide Navigation Function
    function goToSlide(index) {
        if (index < 0 || index >= sections.length) return;
        lastTransitionTime = Date.now();
        
        // Update active and past classes on sections
        sections.forEach((sec, idx) => {
            if (idx === index) {
                sec.classList.add('active');
                sec.classList.remove('past');
                // Scroll the activated slide to the top
                sec.scrollTop = 0;
            } else if (idx < index) {
                sec.classList.remove('active');
                sec.classList.add('past');
            } else {
                sec.classList.remove('active');
                sec.classList.remove('past');
            }
        });

        // Update pagination dots
        const dots = document.querySelectorAll('.pagination-dot');
        dots.forEach((dot, idx) => {
            if (idx === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Update nav links highlights & sync URL hash without anchor page jumping
        const activeSection = sections[index];
        if (activeSection && activeSection.id) {
            updateActiveNavLink(activeSection.id);
            // Replace url hash smoothly
            history.pushState(null, null, '#' + activeSection.id);
        }

        // Dynamically adjust plexus canvas opacity (subtle on page 1, intense on page 2 onwards)
        const canvas = document.getElementById('hero-plexus-canvas');
        if (canvas) {
            if (index === 0) {
                canvas.style.opacity = '0.35';
                canvas.style.transition = 'opacity 0.7s ease';
            } else {
                canvas.style.opacity = '0.9';
                canvas.style.transition = 'opacity 0.7s ease';
            }
        }

        currentSlideIndex = index;
    }

    // Intercept all anchor link clicks to navigate slide page smoothly
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const hash = link.getAttribute('href');
            if (hash && hash.startsWith('#')) {
                const targetId = hash.substring(1);
                
                // If it is just '#' or empty, target 'home' (Hero slide)
                const finalTargetId = (targetId === '' || targetId === 'home') ? 'home' : targetId;
                
                const targetIndex = sections.findIndex(sec => sec.id === finalTargetId);
                if (targetIndex !== -1) {
                    e.preventDefault();
                    if (currentSlideIndex !== targetIndex) {
                        if (Date.now() - lastTransitionTime < transitionDelay) return;
                        goToSlide(targetIndex);
                    }
                }
            }
        });
    });

    // Handle mouse wheel scrolling
    window.addEventListener('wheel', (e) => {
        const now = Date.now();
        if (now - lastTransitionTime < transitionDelay) {
            e.preventDefault();
            return;
        }

        const activeSlide = sections[currentSlideIndex];
        const isScrollingDown = e.deltaY > 0;
        
        const isDesktop = window.innerWidth >= 1025;
        const isBypass = isDesktop && (activeSlide && (activeSlide.id === 'solution' || activeSlide.id === 'philosophy' || activeSlide.id === 'contact'));

        if (activeSlide && !isBypass) {
            const scrollTop = activeSlide.scrollTop;
            const scrollHeight = activeSlide.scrollHeight;
            const clientHeight = activeSlide.clientHeight;
            
            // Allow internal scrolling if content is taller than viewport
            if (isScrollingDown && scrollTop + clientHeight < scrollHeight - 5) {
                return; // Let native scroll happen inside the slide
            }
            if (!isScrollingDown && scrollTop > 5) {
                return; // Let native scroll happen inside the slide
            }
        }
        
        // If slide is at boundary, execute slide switch (enforcing threshold to filter rebounds)
        const absDelta = Math.abs(e.deltaY);
        if (isScrollingDown) {
            if (currentSlideIndex < sections.length - 1) {
                if (absDelta > 15) {
                    e.preventDefault();
                    goToSlide(currentSlideIndex + 1);
                }
            } else {
                // At the bottom boundary, set a short lock to ignore trackpad rebounds
                lastTransitionTime = Date.now() - (transitionDelay - 300);
            }
        } else {
            if (currentSlideIndex > 0) {
                if (absDelta > 15) {
                    e.preventDefault();
                    goToSlide(currentSlideIndex - 1);
                }
            } else {
                // At the top boundary, set a short lock to ignore trackpad rebounds
                lastTransitionTime = Date.now() - (transitionDelay - 300);
            }
        }
    }, { passive: false });

    // Handle touch swipes on mobile
    let touchStartY = 0;
    let touchEndY = 0;

    window.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (Date.now() - lastTransitionTime < transitionDelay) return;
        touchEndY = e.changedTouches[0].screenY;
        
        const deltaY = touchStartY - touchEndY;
        const activeSlide = sections[currentSlideIndex];
        const scrollTop = activeSlide ? activeSlide.scrollTop : 0;
        const scrollHeight = activeSlide ? activeSlide.scrollHeight : 0;
        const clientHeight = activeSlide ? activeSlide.clientHeight : 0;

        const isDesktop = window.innerWidth >= 1025;
        const isBypass = isDesktop && (activeSlide && (activeSlide.id === 'solution' || activeSlide.id === 'philosophy' || activeSlide.id === 'contact'));

        // Swipe Up (Swipe to next slide)
        if (deltaY > 60) {
            if (isBypass || (activeSlide && scrollTop + clientHeight >= scrollHeight - 8)) {
                if (currentSlideIndex < sections.length - 1) {
                    goToSlide(currentSlideIndex + 1);
                }
            }
        }
        // Swipe Down (Swipe to previous slide)
        else if (deltaY < -60) {
            if (isBypass || (activeSlide && scrollTop <= 8)) {
                if (currentSlideIndex > 0) {
                    goToSlide(currentSlideIndex - 1);
                }
            }
        }
    }, { passive: true });

    // Handle Keyboard navigations (Arrow keys / Page keys)
    window.addEventListener('keydown', (e) => {
        if (Date.now() - lastTransitionTime < transitionDelay) return;
        
        const activeSlide = sections[currentSlideIndex];
        const scrollTop = activeSlide ? activeSlide.scrollTop : 0;
        const scrollHeight = activeSlide ? activeSlide.scrollHeight : 0;
        const clientHeight = activeSlide ? activeSlide.clientHeight : 0;

        const isDesktop = window.innerWidth >= 1025;
        const isBypass = isDesktop && (activeSlide && (activeSlide.id === 'solution' || activeSlide.id === 'philosophy' || activeSlide.id === 'contact'));

        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            if (isBypass || (activeSlide && scrollTop + clientHeight >= scrollHeight - 5)) {
                if (currentSlideIndex < sections.length - 1) {
                    e.preventDefault();
                    goToSlide(currentSlideIndex + 1);
                }
            }
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            if (isBypass || (activeSlide && scrollTop <= 5)) {
                if (currentSlideIndex > 0) {
                    e.preventDefault();
                    goToSlide(currentSlideIndex - 1);
                }
            }
        }
    });

    // Initialize active nav highlight on page load
    const currentHash = window.location.hash.substring(1);
    if (currentHash) {
        const index = sections.findIndex(sec => sec.id === currentHash);
        if (index !== -1) {
            goToSlide(index);
        } else {
            updateActiveNavLink('home');
        }
    } else {
        updateActiveNavLink('home');
    }
});
