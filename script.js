document.addEventListener('DOMContentLoaded', () => {
  // --- Sticky Header Scroll Effect ---
  const header = document.getElementById('header');
  const scrollThreshold = 50;

  function handleScroll() {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial check in case page is loaded mid-scroll

  // --- Mobile Navigation Menu ---
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Close mobile menu when a nav link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });

    // Close mobile menu when clicking outside of it
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target) && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
      }
    });
  }

  // --- Active Nav Scroll Spy ---
  const sections = document.querySelectorAll('section[id], header');
  
  function scrollSpy() {
    const scrollPos = window.scrollY + 120; // offset for header

    sections.forEach(section => {
      if (section.id) {
        const top = section.offsetTop;
        const height = section.offsetHeight;

        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${section.id}` || (section.id === 'home' && link.getAttribute('href') === '#')) {
              link.classList.add('active');
            }
          });
        }
      }
    });
  }

  window.addEventListener('scroll', scrollSpy);
  scrollSpy(); // Initial call

  // --- Gallery Filter ---
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Set active button style
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filterValue = button.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.style.display = 'block';
          // Force a reflow to trigger animation
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.8)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300); // match transition time
        }
      });
    });
  });

  // --- Lightbox Modal ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let currentGalleryIndex = 0;
  let activeGalleryItems = [];

  // Update list of active gallery items (excludes filtered out items)
  function updateActiveGalleryItems() {
    activeGalleryItems = Array.from(galleryItems).filter(item => item.style.display !== 'none');
  }

  function showLightbox(index) {
    updateActiveGalleryItems();
    if (activeGalleryItems.length === 0) return;
    
    currentGalleryIndex = index;
    if (currentGalleryIndex >= activeGalleryItems.length) currentGalleryIndex = 0;
    if (currentGalleryIndex < 0) currentGalleryIndex = activeGalleryItems.length - 1;

    const currentItem = activeGalleryItems[currentGalleryIndex];
    const src = currentItem.getAttribute('data-src');
    const caption = currentItem.getAttribute('data-caption');

    lightboxImage.src = src;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Disable page scrolling
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto'; // Re-enable page scrolling
  }

  // Click on gallery item
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      updateActiveGalleryItems();
      const activeIndex = activeGalleryItems.indexOf(item);
      showLightbox(activeIndex);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => showLightbox(currentGalleryIndex - 1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => showLightbox(currentGalleryIndex + 1));

  // Close when clicking overlay backdrop
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Keyboard navigation for lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      showLightbox(currentGalleryIndex - 1);
    } else if (e.key === 'ArrowRight') {
      showLightbox(currentGalleryIndex + 1);
    }
  });

  // Set default check-in date to tomorrow and check-out to day after tomorrow
  const checkInInput = document.getElementById('check-in-date');
  const checkOutInput = document.getElementById('check-out-date');

  if (checkInInput && checkOutInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2); // default 2 nights stay

    // Format YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    checkInInput.value = formatDate(tomorrow);
    checkInInput.min = formatDate(today);
    
    checkOutInput.value = formatDate(dayAfterTomorrow);
    checkOutInput.min = formatDate(tomorrow);

    checkInInput.addEventListener('change', () => {
      const checkInDate = new Date(checkInInput.value);
      const nextDay = new Date(checkInDate);
      nextDay.setDate(nextDay.getDate() + 1);
      checkOutInput.min = formatDate(nextDay);
      
      if (new Date(checkOutInput.value) <= checkInDate) {
        checkOutInput.value = formatDate(nextDay);
      }
    });
  }

  // --- WhatsApp Inquiry Prefill - Main Booking Inquiry Bar ---
  const bookingForm = document.getElementById('booking-inquiry-form');
  const whatsAppNumber = '27821234567'; // Guest house contact number

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const checkInVal = document.getElementById('check-in-date').value;
      const checkOutVal = document.getElementById('check-out-date').value;
      const guests = document.getElementById('guest-count').value;
      const roomTypeElement = document.getElementById('room-type');
      const roomTypeText = roomTypeElement.options[roomTypeElement.selectedIndex].text;

      // Calculate nights
      const checkInDate = new Date(checkInVal);
      const checkOutDate = new Date(checkOutVal);
      const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (nights <= 0) {
        alert('Check-out date must be after check-in date.');
        return;
      }

      // Generate WhatsApp Prefilled Text
      const textMessage = `Hi Home at 169, I'd like to check availability and rates for:
- Accommodation: ${roomTypeText}
- Check-In: ${checkInVal}
- Check-Out: ${checkOutVal} (${nights} night${nights > 1 ? 's' : ''})
- Guests: ${guests} Guest${guests > 1 ? 's' : ''}

Please let me know if these dates are open. Thank you!`;

      const encodedMessage = encodeURIComponent(textMessage);
      const whatsappUrl = `https://wa.me/${whatsAppNumber}?text=${encodedMessage}`;
      
      // Open in a new tab
      window.open(whatsappUrl, '_blank');
    });
  }

  // --- WhatsApp Inquiry Prefill - Contact Form ---
  const contactForm = document.getElementById('contact-inquiry-form');
  
  if (contactForm) {
    // Fill in dates if selected from top booking bar
    const arrivalInput = document.getElementById('contact-arrival');
    const departureInput = document.getElementById('contact-departure');
    
    if (arrivalInput && departureInput && checkInInput && checkOutInput) {
      arrivalInput.value = checkInInput.value;
      departureInput.value = checkOutInput.value;
      
      // Update limits
      const today = new Date();
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      arrivalInput.min = formatDate(today);
      
      arrivalInput.addEventListener('change', () => {
        const arrDate = new Date(arrivalInput.value);
        const nextDay = new Date(arrDate);
        nextDay.setDate(nextDay.getDate() + 1);
        departureInput.min = formatDate(nextDay);
        if (new Date(departureInput.value) <= arrDate) {
          departureInput.value = formatDate(nextDay);
        }
      });
    }

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const phone = document.getElementById('contact-phone').value || 'Not provided';
      const guests = document.getElementById('contact-guests').value;
      const arrival = document.getElementById('contact-arrival').value || 'Not specified';
      const departure = document.getElementById('contact-departure').value || 'Not specified';
      const userMessage = document.getElementById('contact-message').value;

      // Generate WhatsApp Prefilled Message
      const textMessage = `Hi Home at 169, my name is ${name}. I'd like to submit an inquiry:
- Email: ${email}
- Phone: ${phone}
- Guests: ${guests} Guest${guests > 1 ? 's' : ''}
- Dates: ${arrival} to ${departure}
- Message: ${userMessage}`;

      const encodedMessage = encodeURIComponent(textMessage);
      const whatsappUrl = `https://wa.me/${whatsAppNumber}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
    });
  }
});
