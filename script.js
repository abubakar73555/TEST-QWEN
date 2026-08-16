// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }
    
    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Fade In Animation on Scroll
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const fadeInOnScroll = () => {
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('visible');
            }
        });
    };
    
    if (fadeElements.length > 0) {
        window.addEventListener('scroll', fadeInOnScroll);
        fadeInOnScroll(); // Check on initial load
    }
    
    // Back to Top Button
    const backToTop = document.querySelector('.back-to-top');
    
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', function() {
                // Close other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        }
    });
    
    // Contact Form Handling
    const contactForm = document.querySelector('.contact-form form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Simple validation
            let isValid = true;
            const requiredFields = this.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#dc2626';
                } else {
                    field.style.borderColor = '#e5e7eb';
                }
            });
            
            if (isValid) {
                // Show success message
                alert('شكراً لتواصلكم معنا! سيتم الرد عليكم خلال 24 ساعة.');
                this.reset();
            }
        });
    }
    
    // Quote Form Handling
    const quoteForm = document.querySelector('.quote-form form');
    
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Validate
            let isValid = true;
            const requiredFields = this.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#dc2626';
                } else {
                    field.style.borderColor = '#e5e7eb';
                }
            });
            
            if (isValid) {
                // Simulate form submission
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'جاري الإرسال...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    alert('تم إرسال طلب عرض السعر بنجاح! سيتواصل معكم فريق المبيعات خلال 24 ساعة.');
                    this.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 1500);
            }
        });
    }
    
    // Dynamic Year in Footer
    const yearElement = document.querySelector('.current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Active Navigation Link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Counter Animation for Stats
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element) => {
        const target = parseInt(element.textContent.replace(/[^0-9]/g, ''));
        const suffix = element.textContent.replace(/[0-9]/g, '');
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString('ar-SA') + suffix;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString('ar-SA') + suffix;
            }
        }, 16);
    };
    
    // Intersection Observer for stat animation
    if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statNumbers.forEach(stat => observer.observe(stat));
    }
    
    // Service Card Hover Effects Enhancement
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            serviceCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.style.opacity = '0.7';
                }
            });
        });
        
        card.addEventListener('mouseleave', function() {
            serviceCards.forEach(otherCard => {
                otherCard.style.opacity = '1';
            });
        });
    });
    
    // Print Functionality for Reports
    const printButtons = document.querySelectorAll('.print-btn');
    
    printButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            window.print();
        });
    });
    
    // Download Report Functionality
    const downloadButtons = document.querySelectorAll('.download-btn');
    
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('سيبدأ تحميل التقرير خلال لحظات...');
            // Add actual download logic here
        });
    });
    
    // Filter Services/Contracts by Category
    const filterButtons = document.querySelectorAll('.filter-btn');
    const filterItems = document.querySelectorAll('.filter-item');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter items
            filterItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Search Functionality
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            if (searchTerm.length < 2) {
                if (searchResults) searchResults.innerHTML = '';
                return;
            }
            
            // Add search logic here
            console.log('Searching for:', searchTerm);
        });
    }
    
    // Lazy Loading Images
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }
    
    // Toast Notification System
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: ${type === 'success' ? '#059669' : '#dc2626'};
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Make showToast available globally
    window.showToast = showToast;
    
    // Add CSS animation for toast
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        
        @keyframes slideDown {
            from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
        }
    `;
    document.head.appendChild(style);
    
    console.log('سلامة website initialized successfully!');
});

// Utility Functions
function formatNumber(num) {
    return num.toLocaleString('ar-SA');
}

function formatDate(date) {
    return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
