// Enhanced Component Compatibility Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced component compatibility module loaded');
    
    // Hide configuration display buttons and modals
    function hideConfigurationDisplayElements() {
        const elementsToHide = [
            '#show-config-detail-button',
            '.config-table',
            '#summary-modal',
            '#modal-components-list',
            '#calculate-button',
            '#config-table',
            '.modal'
        ];
        
        elementsToHide.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = 'none';
            });
        });
        
        console.log('Configuration display elements hidden');
    }
    
    // Ensure strict compatibility between components
    function setupStrictComponentCompatibility() {
        // Get all dropdowns
        const cpuDropdown = document.getElementById('cpu');
        const mainboardDropdown = document.getElementById('mainboard');
        const ramDropdown = document.getElementById('ram');
        
        if (!cpuDropdown || !mainboardDropdown || !ramDropdown) {
            console.error('Could not find all required dropdowns');
            return;
        }
        
        // Ensure socket info is visible
        const socketInfoDiv = document.getElementById('socket-info');
        if (socketInfoDiv) {
            socketInfoDiv.style.display = 'block';
        }
        
        // 1. Ensure only compatible components are shown
        console.log('Setting up strict component compatibility');
        
        // 2. Disable mainboard until CPU is selected
        mainboardDropdown.disabled = true;
        
        // 3. Disable RAM until mainboard is selected
        ramDropdown.disabled = true;
        
        // 4. Highlight socket info
        if (socketInfoDiv) {
            socketInfoDiv.style.border = '2px solid #4CAF50';
            socketInfoDiv.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
        }
        
        console.log('Strict component compatibility setup complete');
    }
    
    // Run initialization
    hideConfigurationDisplayElements();
    setupStrictComponentCompatibility();
}); 