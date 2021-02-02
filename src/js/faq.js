const questions = document.querySelectorAll('.question');

questions.forEach(function (item) {
    item.addEventListener('click', () => {
        item.querySelector('.question__text').classList.toggle('question__text--active');
        item.querySelector('.question__arrow').classList.toggle('question__arrow--active');
        item.nextElementSibling.classList.toggle('answer--active');
        item.classList.toggle('no-focus');
    });
})

