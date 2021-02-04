const servicesSlider = new Swiper('.js-services-slider', {
  speed: 400,
  spaceBetween: 100,
  watchOverflow: true,
  // loop: true
  hideOnClick: true,
  pagination: {
    el: '.js-services-slider__pagination',
    type: 'bullets',
    clickable: true
  },
  keyboard: {
    enabled: true,
    onlyInViewport: true,
    pageUpDown: true
  },
});

const partnersSlider = new Swiper('.js-partners-slider', {
  watchOverflow: true,
  speed: 400,
  hideOnClick: true,
  loop: true,
  autoplay: {
    delay: 5000
  },
  keyboard: {
    enabled: true,
    onlyInViewport: true,
    pageUpDown: true
  },
  mousewheel: {
    sensitivity: 1
  },
  breakpoints: {

    320: {
      slidesPerView: 1,
      centeredSlides: true,
    },

    370: {
      slidesPerView: 2,
      centeredSlides: false
    },

    428: {
      slidesPerView: 3
    },

    650: {
      slidesPerView: 4
    },

    902: {
      autoplay: false,
      loop: false,
      slidesPerView: 5
    }
  }
});

const resourcesSlider = new Swiper('.js-resources-slider', {
  speed: 400,
  spaceBetween: 100,
  watchOverflow: true,
  hideOnClick: true,
  pagination: {
    el: '.js-resources-slider__pagination',
    type: 'bullets',
    clickable: true
  },
  keyboard: {
    enabled: true,
    onlyInViewport: true,
    pageUpDown: true
  },
  navigation: {
    nextEl: '.js-resources-slider__arrow-next',
    prevEl: '.js-resources-slider__arrow-prev',
  },
});

const testimonialsSlider = new Swiper('.js-testimonials-slider', {
  slidesPerView: 1,
  autoplay: {
    delay: 5000
  },
  centeredSlides: true,
  speed: 400,
  spaceBetween: 100,
  watchOverflow: true,
  roundLengths: true,
  loop: true,
  hideOnClick: true,
  pagination: {
      el: '.js-testimonials-slider__pagination',
      type: 'bullets',
      clickable: true
    },
  keyboard: {
      enabled : true,
      onlyInViewport: true,
      pageUpDown: true
  },
  breakpoints: {
    840: {
      spaceBetween: 150,
      slidesPerView: 2.2,
    },

    1090: {
      slidesPerView: 2.5
    },

    1300: {
      centeredSlides: false,
      slidesPerView: 1.62,
    }
  }      
});


