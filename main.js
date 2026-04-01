// ===================================
// معدات السلامة - ملف الجافاسكريبت
// ===================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ تم تحميل موقع معدات السلامة بنجاح!');

  // ===================================
  // القائمة المحمولة (Mobile Menu)
  // ===================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const nav = document.querySelector('nav');

  if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener('click', () => {
      nav.classList.toggle('active');
      mobileMenuBtn.textContent = nav.classList.contains('active') ? '✕' : '☰';
    });
  }

  // ===================================
  // التمرير السلس للروابط (Smooth Scroll)
  // ===================================
  document.querySelectorAll('nav a, .hero a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // تجاهل الروابط الخارجية
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
          // إغلاق القائمة المحمولة إذا كانت مفتوحة
          nav.classList.remove('active');
          mobileMenuBtn.textContent = '☰';

          targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // ===================================
  // تحديث الرابط النشط عند التمرير (Active Link on Scroll)
  // ===================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a');

  function updateActiveLink() {
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink);

  // ===================================
  // سلة التسوق (Shopping Cart)
  // ===================================
  let cartCount = 0;
  const cartCountElement = document.getElementById('cart-count');
  const addToCartButtons = document.querySelectorAll('.btn-add-cart');
  const cartFloat = document.getElementById('cart-float');

  // تحديث عداد السلة
  function updateCartCount() {
    if (cartCountElement) {
      cartCountElement.textContent = cartCount;
      
      // تأثير حركي عند التحديث
      cartCountElement.style.transform = 'scale(1.3)';
      setTimeout(() => {
        cartCountElement.style.transform = 'scale(1)';
      }, 200);
    }
  }

  // إضافة منتج للسلة
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productCard = this.closest('.product-card');
      const productName = productCard.querySelector('h3').textContent;
      
      cartCount++;
      updateCartCount();
      
      // عرض إشعار
      showNotification(`✅ تم إضافة "${productName}" إلى السلة`);
      
      // تأثير حركي للزر
      this.textContent = '✓ تم الإضافة';
      this.style.backgroundColor = '#27ae60';
      
      setTimeout(() => {
        this.textContent = 'أضف للسلة';
        this.style.backgroundColor = '';
      }, 1500);
    });
  });

  // النقر على أيقونة السلة
  if (cartFloat) {
    cartFloat.addEventListener('click', () => {
      if (cartCount === 0) {
        showNotification('⚠️ السلة فارغة حالياً');
      } else {
        showNotification(`🛒 لديك ${cartCount} منتجات في السلة`);
        // هنا يمكن تطويره لفتح صفحة السلة
      }
    });
  }

  // ===================================
  // نظام الإشعارات (Notification System)
  // ===================================
  function showNotification(message) {
    // إزالة الإشعارات القديمة
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // إنشاء إشعار جديد
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 1rem;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #1a5f7a, #2c3e50);
      color: white;
      padding: 1rem 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      z-index: 10000;
      font-weight: 600;
      animation: slideDown 0.3s ease;
    `;

    document.body.appendChild(notification);

    // إزالة الإشعار بعد 3 ثواني
    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  // إضافة أنيميشن للإشعارات
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
    @keyframes slideUp {
      from {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      to {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
    }
  `;
  document.head.appendChild(style);

  // ===================================
  // نموذج الاتصال (Contact Form)
  // ===================================
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // جمع بيانات النموذج
      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
      };

      // التحقق من البيانات
      if (!formData.name || !formData.email || !formData.message) {
        showNotification('⚠️ يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      // محاكاة إرسال البيانات
      console.log('📧 بيانات النموذج:', formData);
      
      // عرض رسالة النجاح
      showNotification('✅ شكراً لتواصلك معنا! سنرد عليك قريباً.');
      
      // إعادة تعيين النموذج
      contactForm.reset();
    });
  }

  // ===================================
  // تصفية المنتجات (Product Filter)
  // ===================================
  // يمكن إضافة وظيفة تصفية المنتجات حسب التصنيف مستقبلاً

  // ===================================
  // تأثير ظهور العناصر عند التمرير (Scroll Reveal)
  // ===================================
  const revealElements = document.querySelectorAll('.product-card, .category-card, .stat-card');

  function revealOnScroll() {
    const triggerBottom = window.innerHeight * 0.85;

    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;

      if (elementTop < triggerBottom) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }
    });
  }

  // تطبيق الأنيميشن الأولي
  revealElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });

  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // تشغيل مرة واحدة عند التحميل

  // ===================================
  // عداد الأرقام المتحرك (Animated Counter)
  // ===================================
  function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = '+' + Math.floor(current);
      }
    }, 16);
  }

  // تشغيل العداد عند ظهور قسم "من نحن"
  const aboutSection = document.getElementById('about');
  let counterAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counterAnimated) {
        counterAnimated = true;
        document.querySelectorAll('.stat-number').forEach((stat, index) => {
          const text = stat.textContent;
          const number = parseInt(text.replace(/\D/g, ''));
          if (number) {
            setTimeout(() => {
              animateCounter(stat, number);
            }, index * 200);
          }
        });
      }
    });
  }, { threshold: 0.5 });

  if (aboutSection) {
    observer.observe(aboutSection);
  }

  // ===================================
  // زر الصعود للأعلى (Back to Top)
  // ===================================
  const backToTopBtn = document.createElement('button');
  backToTopBtn.innerHTML = '↑';
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.style.cssText = `
    position: fixed;
    bottom: 5rem;
    left: 2rem;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #1a5f7a;
    color: white;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 998;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  `;

  document.body.appendChild(backToTopBtn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTopBtn.style.opacity = '1';
      backToTopBtn.style.visibility = 'visible';
    } else {
      backToTopBtn.style.opacity = '0';
      backToTopBtn.style.visibility = 'hidden';
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // ===================================
  // رسالة الترحيب في الكونسول
  // ===================================
  console.log('%c🛡️ معدات السلامة', 'font-size: 24px; font-weight: bold; color: #1a5f7a;');
  console.log('%cشريكك الموثوق لحماية بيئة العمل', 'font-size: 14px; color: #666;');
  console.log('%cتم التطوير بواسطة ❤️', 'font-size: 12px; color: #999;');
});
