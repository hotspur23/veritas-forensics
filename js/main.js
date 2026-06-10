/* ===== Veritas Forensics - Main JavaScript ===== */

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // ===== Populate centralized contact details =====
  function populateContactDetails() {
    const cfg = VERITAS_CONFIG.firm;

    // Contact section details
    const addrEl = document.getElementById('contact-address');
    const phoneEl = document.getElementById('contact-phone');
    const emailEl = document.getElementById('contact-email');
    if (addrEl) addrEl.textContent = cfg.address.full;
    if (phoneEl) phoneEl.textContent = cfg.phone;
    if (emailEl) emailEl.textContent = cfg.email;

    // Footer details
    const footerAddr = document.getElementById('footer-address');
    const footerPhone = document.getElementById('footer-phone');
    const footerEmail = document.getElementById('footer-email');
    if (footerAddr) footerAddr.querySelector('a').textContent = cfg.address.full;
    if (footerPhone) {
      footerPhone.querySelector('a').textContent = cfg.phone;
      footerPhone.querySelector('a').href = 'tel:' + cfg.phone.replace(/[^\d+]/g, '');
    }
    if (footerEmail) {
      footerEmail.querySelector('a').textContent = cfg.email;
      footerEmail.querySelector('a').href = 'mailto:' + cfg.email;
    }
  }
  populateContactDetails();

  // ===== Mobile menu toggle =====
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.navbar .nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function() {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // ===== Navbar background on scroll =====
  const navbar = document.querySelector('.navbar');

  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(0, 33, 71, 0.98)';
      navbar.style.borderBottom = '1px solid rgba(197, 160, 89, 0.3)';
    } else {
      navbar.style.background = 'rgba(0, 33, 71, 0.97)';
      navbar.style.borderBottom = '1px solid rgba(197, 160, 89, 0.2)';
    }
  });

  // ===== Smooth scroll for anchor links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ===== Functional contact form =====
  const contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    // Remove the default novalidate so HTML5 validation still provides hints,
    // but we override the submit entirely for our own handling.
    contactForm.removeAttribute('novalidate');

    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      // Client-side validation
      let valid = true;
      this.querySelectorAll('input[required], textarea[required]').forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#e74c3c';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (!valid) return;

      // Disable button and show sending state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {
        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => { data[key] = value; });

        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Show success message
          submitBtn.textContent = 'Message Sent ✓';
          submitBtn.style.background = '#27ae60';
          this.reset();

          // Show a brief status message below the button
          let statusEl = this.querySelector('.form-status');
          if (!statusEl) {
            statusEl = document.createElement('p');
            statusEl.className = 'form-status';
            statusEl.style.cssText = 'margin-top:1rem;font-size:0.9rem;color:#27ae60;text-align:center;font-weight:500;';
            submitBtn.parentNode.appendChild(statusEl);
          }
          statusEl.textContent = result.message || 'Thank you! We will be in touch shortly.';

          setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
            submitBtn.disabled = false;
            if (statusEl) statusEl.textContent = '';
          }, 5000);
        } else {
          // Show validation errors from server
          const errorMsg = result.errors ? result.errors.join('. ') : 'Something went wrong. Please try again.';
          let statusEl = this.querySelector('.form-status');
          if (!statusEl) {
            statusEl = document.createElement('p');
            statusEl.className = 'form-status';
            statusEl.style.cssText = 'margin-top:1rem;font-size:0.9rem;color:#e74c3c;text-align:center;';
            submitBtn.parentNode.appendChild(statusEl);
          }
          statusEl.textContent = errorMsg;
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      } catch (err) {
        // Network error
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        let statusEl = this.querySelector('.form-status');
        if (!statusEl) {
          statusEl = document.createElement('p');
          statusEl.className = 'form-status';
          statusEl.style.cssText = 'margin-top:1rem;font-size:0.9rem;color:#e74c3c;text-align:center;';
          submitBtn.parentNode.appendChild(statusEl);
        }
        statusEl.textContent = 'Unable to send message. Please try again later or email us directly.';
      }
    });
  }

  // ===== Intersection Observer for fade-in animations =====
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.service-card, .case-study-card, .value-item, .client-card, .stat-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // ===== Current year in footer =====
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});