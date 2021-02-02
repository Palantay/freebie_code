const headerBurger = document.querySelector('.header__burger');
const headerNav = document.querySelector('.header__nav');
const body = document.querySelector('body');

headerBurger.addEventListener('click', () => {
    addPadding();
    headerBurger.classList.toggle('opened');
    headerNav.classList.toggle('header__nav--active');
    body.classList.toggle('no-overflow'); 
})




