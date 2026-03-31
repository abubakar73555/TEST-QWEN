// ملف جافاسكريبت الرئيسي

document.addEventListener('DOMContentLoaded', () => {
  console.log('تم تحميل الصفحة بنجاح!');

  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('شكراً لتواصلك معنا! سنرد عليك قريباً.');
      contactForm.reset();
    });
  }

  // إضافة تأثير تمرير سلس للروابط
  document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
});
