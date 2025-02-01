document.querySelector('.cta-button').addEventListener('click', () => {
    alert('Welcome to Student Score Management!');
});

// Counter animation
const counters = document.querySelectorAll('.counter');

const animateCounter = (counter) => {
    const target = parseInt(counter.parentElement.dataset.count);
    const count = +counter.innerText;
    const increment = target / 200;
    
    if(count < target) {
        counter.innerText = Math.ceil(count + increment);
        setTimeout(() => animateCounter(counter), 1);
    } else {
        counter.innerText = target;
    }
}

// Start animation when element is in viewport
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            animateCounter(entry.target);
        }
    });
});

counters.forEach(counter => observer.observe(counter));