const footerBurger = document.querySelector('.footer__burger');
const footerNav = document.querySelector('.footer__nav')

footerBurger.addEventListener('click', () => {
    addPadding();
    footerBurger.classList.toggle('opened');
    footerNav.classList.toggle('footer__nav--active');
    body.classList.toggle('no-overflow');
    
})

function addPadding(){
    document.body.style.paddingRight = getWidthScroll ();
}

function getWidthScroll ()  {
    let widthScroll = window.innerWidth - document.body.offsetWidth + 'px';
    return widthScroll;
}

