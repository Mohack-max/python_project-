document.addEventListener('DOMContentLoaded', function() {
    // Settings sidebar toggle
    const settingsToggle = document.querySelector('.settings-toggle');
    const settingsSidebar = document.querySelector('.settings-sidebar');
    const closeSettings = document.querySelector('.close-settings');

    if (settingsToggle && settingsSidebar) {
        settingsToggle.addEventListener('click', () => {
            settingsSidebar.classList.toggle('active');
            console.log('Settings toggled');  // Debug line
        });
    }

    if (closeSettings) {
        closeSettings.addEventListener('click', () => {
            settingsSidebar.classList.remove('active');
        });
    }

    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Background style toggle
    const backgroundStyle = document.getElementById('backgroundStyle');
    const colorPicker = document.getElementById('colorPicker');
    const backgroundSelector = document.getElementById('backgroundSelector');

    if (backgroundStyle) {
        backgroundStyle.addEventListener('change', function() {
            if (this.value === 'color') {
                colorPicker.style.display = 'block';
                backgroundSelector.style.display = 'none';
            } else {
                colorPicker.style.display = 'none';
                backgroundSelector.style.display = 'block';
            }
        });
    }

    // Add animation classes to elements
    document.querySelectorAll('.todo-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Font size preview
    const fontSizeRange = document.querySelector('input[name="font_size"]');
    const fontSizePreview = document.querySelector('.font-size-preview');
    
    if (fontSizeRange && fontSizePreview) {
        fontSizeRange.addEventListener('input', function() {
            fontSizePreview.textContent = `${this.value}px`;
        });
    }
});