"use strict";

if ('NodeList' in window && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;

    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

;
/*!
 * @copyright Copyright (c) 2017 IcoMoon.io
 * @license   Licensed under MIT license
 *            See https://github.com/Keyamoon/svgxuse
 * @version   1.2.6
 */

/*jslint browser: true */

/*global XDomainRequest, MutationObserver, window */

(function () {
  "use strict";

  if (typeof window !== "undefined" && window.addEventListener) {
    var cache = Object.create(null); // holds xhr objects to prevent multiple requests

    var checkUseElems;
    var tid; // timeout id

    var debouncedCheck = function debouncedCheck() {
      clearTimeout(tid);
      tid = setTimeout(checkUseElems, 100);
    };

    var unobserveChanges = function unobserveChanges() {
      return;
    };

    var observeChanges = function observeChanges() {
      var observer;
      window.addEventListener("resize", debouncedCheck, false);
      window.addEventListener("orientationchange", debouncedCheck, false);

      if (window.MutationObserver) {
        observer = new MutationObserver(debouncedCheck);
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true
        });

        unobserveChanges = function unobserveChanges() {
          try {
            observer.disconnect();
            window.removeEventListener("resize", debouncedCheck, false);
            window.removeEventListener("orientationchange", debouncedCheck, false);
          } catch (ignore) {}
        };
      } else {
        document.documentElement.addEventListener("DOMSubtreeModified", debouncedCheck, false);

        unobserveChanges = function unobserveChanges() {
          document.documentElement.removeEventListener("DOMSubtreeModified", debouncedCheck, false);
          window.removeEventListener("resize", debouncedCheck, false);
          window.removeEventListener("orientationchange", debouncedCheck, false);
        };
      }
    };

    var createRequest = function createRequest(url) {
      // In IE 9, cross origin requests can only be sent using XDomainRequest.
      // XDomainRequest would fail if CORS headers are not set.
      // Therefore, XDomainRequest should only be used with cross origin requests.
      function getOrigin(loc) {
        var a;

        if (loc.protocol !== undefined) {
          a = loc;
        } else {
          a = document.createElement("a");
          a.href = loc;
        }

        return a.protocol.replace(/:/g, "") + a.host;
      }

      var Request;
      var origin;
      var origin2;

      if (window.XMLHttpRequest) {
        Request = new XMLHttpRequest();
        origin = getOrigin(location);
        origin2 = getOrigin(url);

        if (Request.withCredentials === undefined && origin2 !== "" && origin2 !== origin) {
          Request = XDomainRequest || undefined;
        } else {
          Request = XMLHttpRequest;
        }
      }

      return Request;
    };

    var xlinkNS = "http://www.w3.org/1999/xlink";

    checkUseElems = function checkUseElems() {
      var base;
      var bcr;
      var fallback = ""; // optional fallback URL in case no base path to SVG file was given and no symbol definition was found.

      var hash;
      var href;
      var i;
      var inProgressCount = 0;
      var isHidden;
      var Request;
      var url;
      var uses;
      var xhr;

      function observeIfDone() {
        // If done with making changes, start watching for chagnes in DOM again
        inProgressCount -= 1;

        if (inProgressCount === 0) {
          // if all xhrs were resolved
          unobserveChanges(); // make sure to remove old handlers

          observeChanges(); // watch for changes to DOM
        }
      }

      function attrUpdateFunc(spec) {
        return function () {
          if (cache[spec.base] !== true) {
            spec.useEl.setAttributeNS(xlinkNS, "xlink:href", "#" + spec.hash);

            if (spec.useEl.hasAttribute("href")) {
              spec.useEl.setAttribute("href", "#" + spec.hash);
            }
          }
        };
      }

      function onloadFunc(xhr) {
        return function () {
          var body = document.body;
          var x = document.createElement("x");
          var svg;
          xhr.onload = null;
          x.innerHTML = xhr.responseText;
          svg = x.getElementsByTagName("svg")[0];

          if (svg) {
            svg.setAttribute("aria-hidden", "true");
            svg.style.position = "absolute";
            svg.style.width = 0;
            svg.style.height = 0;
            svg.style.overflow = "hidden";
            body.insertBefore(svg, body.firstChild);
          }

          observeIfDone();
        };
      }

      function onErrorTimeout(xhr) {
        return function () {
          xhr.onerror = null;
          xhr.ontimeout = null;
          observeIfDone();
        };
      }

      unobserveChanges(); // stop watching for changes to DOM
      // find all use elements

      uses = document.getElementsByTagName("use");

      for (i = 0; i < uses.length; i += 1) {
        try {
          bcr = uses[i].getBoundingClientRect();
        } catch (ignore) {
          // failed to get bounding rectangle of the use element
          bcr = false;
        }

        href = uses[i].getAttribute("href") || uses[i].getAttributeNS(xlinkNS, "href") || uses[i].getAttribute("xlink:href");

        if (href && href.split) {
          url = href.split("#");
        } else {
          url = ["", ""];
        }

        base = url[0];
        hash = url[1];
        isHidden = bcr && bcr.left === 0 && bcr.right === 0 && bcr.top === 0 && bcr.bottom === 0;

        if (bcr && bcr.width === 0 && bcr.height === 0 && !isHidden) {
          // the use element is empty
          // if there is a reference to an external SVG, try to fetch it
          // use the optional fallback URL if there is no reference to an external SVG
          if (fallback && !base.length && hash && !document.getElementById(hash)) {
            base = fallback;
          }

          if (uses[i].hasAttribute("href")) {
            uses[i].setAttributeNS(xlinkNS, "xlink:href", href);
          }

          if (base.length) {
            // schedule updating xlink:href
            xhr = cache[base];

            if (xhr !== true) {
              // true signifies that prepending the SVG was not required
              setTimeout(attrUpdateFunc({
                useEl: uses[i],
                base: base,
                hash: hash
              }), 0);
            }

            if (xhr === undefined) {
              Request = createRequest(base);

              if (Request !== undefined) {
                xhr = new Request();
                cache[base] = xhr;
                xhr.onload = onloadFunc(xhr);
                xhr.onerror = onErrorTimeout(xhr);
                xhr.ontimeout = onErrorTimeout(xhr);
                xhr.open("GET", base);
                xhr.send();
                inProgressCount += 1;
              }
            }
          }
        } else {
          if (!isHidden) {
            if (cache[base] === undefined) {
              // remember this URL if the use element was not empty and no request was sent
              cache[base] = true;
            } else if (cache[base].onload) {
              // if it turns out that prepending the SVG is not necessary,
              // abort the in-progress xhr.
              cache[base].abort();
              delete cache[base].onload;
              cache[base] = true;
            }
          } else if (base.length && cache[base]) {
            setTimeout(attrUpdateFunc({
              useEl: uses[i],
              base: base,
              hash: hash
            }), 0);
          }
        }
      }

      uses = "";
      inProgressCount += 1;
      observeIfDone();
    };

    var _winLoad;

    _winLoad = function winLoad() {
      window.removeEventListener("load", _winLoad, false); // to prevent memory leaks

      tid = setTimeout(checkUseElems, 0);
    };

    if (document.readyState !== "complete") {
      // The load event fires when all resources have finished loading, which allows detecting whether SVG use elements are empty.
      window.addEventListener("load", _winLoad, false);
    } else {
      // No need to add a listener if the document is already loaded, initialize immediately.
      _winLoad();
    }
  }
})();

;
$('[data-fancybox="video"]').fancybox({});
$('[data-fancybox="images"]').fancybox({});
;

function ibg() {
  var ibg = document.querySelectorAll(".ibg");

  for (var i = 0; i < ibg.length; i++) {
    if (ibg[i].querySelector('img')) {
      ibg[i].style.backgroundImage = 'url(' + ibg[i].querySelector('img').getAttribute('src') + ')';
    }
  }
}

if (/MSIE \d|Trident.*rv:/.test(navigator.userAgent)) {
  ibg();
}

;
var questions = document.querySelectorAll('.question');
questions.forEach(function (item) {
  item.addEventListener('click', function () {
    item.querySelector('.question__text').classList.toggle('question__text--active');
    item.querySelector('.question__arrow').classList.toggle('question__arrow--active');
    item.nextElementSibling.classList.toggle('answer--active');
    item.classList.toggle('no-focus');
  });
});
var headerBurger = document.querySelector('.header__burger');
var headerNav = document.querySelector('.header__nav');
var body = document.querySelector('body');
headerBurger.addEventListener('click', function () {
  addPadding();
  headerBurger.classList.toggle('opened');
  headerNav.classList.toggle('header__nav--active');
  body.classList.toggle('no-overflow');
});
var footerBurger = document.querySelector('.footer__burger');
var footerNav = document.querySelector('.footer__nav');
footerBurger.addEventListener('click', function () {
  addPadding();
  footerBurger.classList.toggle('opened');
  footerNav.classList.toggle('footer__nav--active');
  body.classList.toggle('no-overflow');
});

function addPadding() {
  document.body.style.paddingRight = getWidthScroll();
}

function getWidthScroll() {
  var widthScroll = window.innerWidth - document.body.offsetWidth + 'px';
  return widthScroll;
}

;
var servicesSlider = new Swiper('.js-services-slider', {
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
  }
});
var partnersSlider = new Swiper('.js-partners-slider', {
  watchOverflow: true,
  hideOnClick: true,
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
      speed: 400,
      loop: true,
      slidesPerView: 1,
      autoplay: {
        delay: 500
      },
      centeredSlides: true,
      watchOverflow: true,
      hideOnClick: true,
      keyboard: {
        enabled: true,
        onlyInViewport: true,
        pageUpDown: true
      },
      mousewheel: {
        sensitivity: 1
      }
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
var resourcesSlider = new Swiper('.js-resources-slider', {
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
    prevEl: '.js-resources-slider__arrow-prev'
  }
});
var testimonialsSlider = new Swiper('.js-testimonials-slider', {
  slidesPerView: 1,
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
    enabled: true,
    onlyInViewport: true,
    pageUpDown: true
  },
  breakpoints: {
    840: {
      slidesPerView: 2
    },
    1300: {
      slidesPerView: 1.62
    }
  }
});
;