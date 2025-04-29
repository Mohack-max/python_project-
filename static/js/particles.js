document.addEventListener('DOMContentLoaded', function() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);

    // Create stars with different sizes and animations
    for(let i = 0; i < 100; i++) {
        createStar(particlesContainer);
    }

    // Create shooting stars periodically
    setInterval(() => {
        createShootingStar(particlesContainer);
    }, 4000);
});

function createStar(container) {
    const star = document.createElement('div');
    const size = Math.random() * 3 + 1;
    
    star.style.position = 'absolute';
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.background = 'white';
    star.style.borderRadius = '50%';
    star.style.boxShadow = '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    
    // Twinkling animation
    star.animate([
        { opacity: 0.2, boxShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff' },
        { opacity: 1, boxShadow: '0 0 20px #fff, 0 0 30px #fff, 0 0 40px #fff' },
        { opacity: 0.2, boxShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff' }
    ], {
        duration: Math.random() * 3000 + 2000,
        iterations: Infinity
    });
    
    container.appendChild(star);
}

function createShootingStar(container) {
    const star = document.createElement('div');
    const startX = Math.random() * 100;
    
    star.style.position = 'absolute';
    star.style.width = '2px';
    star.style.height = '2px';
    star.style.background = 'white';
    star.style.borderRadius = '50%';
    star.style.boxShadow = '0 0 20px #fff, 0 0 40px #fff';
    
    const animation = star.animate([
        { 
            transform: `translate(${startX}vw, -10px) rotate(-45deg) scale(1)`,
            opacity: 1,
            boxShadow: '0 0 20px #fff, 0 0 40px #fff'
        },
        { 
            transform: `translate(${startX - 20}vw, 20vh) rotate(-45deg) scale(0.2)`,
            opacity: 0,
            boxShadow: '0 0 0 #fff'
        }
    ], {
        duration: 1000,
        easing: 'ease-out'
    });
    
    container.appendChild(star);
    animation.onfinish = () => container.removeChild(star);
}