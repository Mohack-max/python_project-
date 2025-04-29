document.addEventListener('DOMContentLoaded', function() {
    // Create theme containers
    const starsWrapper = document.createElement('div');
    starsWrapper.className = 'stars-wrapper';
    
    const oceanWrapper = document.createElement('div');
    oceanWrapper.className = 'ocean-wrapper';
    
    // Add ocean waves
    for(let i = 0; i < 3; i++) {
        const wave = document.createElement('div');
        wave.className = 'wave';
        oceanWrapper.appendChild(wave);
    }
    
    document.body.appendChild(starsWrapper);
    document.body.appendChild(oceanWrapper);
    
    // Create theme toggle in settings menu
    const settingsMenu = document.getElementById('settingsMenu');
    if (settingsMenu) {
        const themeSection = document.createElement('div');
        themeSection.className = 'settings-item';
        themeSection.innerHTML = `
            <div class="d-flex align-items-center mb-3">
                <i class="fas fa-moon me-3 settings-icon"></i>
                <span>Theme Selection</span>
            </div>
            <div class="theme-buttons d-flex gap-2">
                <button class="btn btn-outline-primary flex-grow-1 theme-btn" data-theme="stars">
                    <i class="fas fa-stars me-2"></i>Stars
                </button>
                <button class="btn btn-outline-primary flex-grow-1 theme-btn" data-theme="ocean">
                    <i class="fas fa-water me-2"></i>Ocean
                </button>
            </div>
        `;
        
        // Insert at the beginning of settings menu
        const firstSettingsItem = settingsMenu.querySelector('.settings-item');
        if (firstSettingsItem) {
            firstSettingsItem.parentNode.insertBefore(themeSection, firstSettingsItem);
        } else {
            settingsMenu.querySelector('.offcanvas-body').appendChild(themeSection);
        }
        
        // Add click handlers
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                setTheme(btn.dataset.theme);
                themeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    
    // Set initial theme
    setTheme('stars');
});

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    document.querySelector('.stars-wrapper').classList.toggle('active', theme === 'stars');
    document.querySelector('.ocean-wrapper').classList.toggle('active', theme === 'ocean');
    
    // Save theme preference
    localStorage.setItem('preferred-theme', theme);
    
    // Update active state of theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
}