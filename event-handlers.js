// Event handlers for the PC builder application

// Define the handleCpuTypeSelection function first
function handleCpuTypeSelection(type) {
    // CRITICAL: Tạo debug element rất nổi bật để theo dõi quá trình chọn CPU
    const debugElement = document.createElement('div');
    debugElement.style.position = 'fixed';
    debugElement.style.top = '10px';
    debugElement.style.right = '10px';
    debugElement.style.padding = '15px';
    debugElement.style.backgroundColor = 'rgba(0,0,0,0.8)';
    debugElement.style.color = 'white';
    debugElement.style.fontSize = '18px';
    debugElement.style.fontWeight = 'bold';
    debugElement.style.zIndex = '10000';
    debugElement.style.borderRadius = '5px';
    debugElement.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
    debugElement.id = 'cpu-debug-info';
    
    // CRITICAL: Xác định chính xác giá trị CPU type
    // Đảm bảo tuyệt đối giá trị được truyền vào dropdown là chính xác
    const normalizedType = type.toLowerCase().includes('amd') ? 'Amd' : 'Intel';
    
    // Ghi log rõ ràng với màu sắc nổi bật
    console.log(`%c 🛑 CPU TYPE SELECTION: ${normalizedType} 🛑`, 
                'background: ' + (normalizedType === 'Intel' ? '#0071c5' : '#ED1C24') + 
                '; color: white; font-size: 16px; font-weight: bold; padding: 5px 10px; border-radius: 3px;');
    
    // Update visual selection
    const intelOption = document.getElementById('intel-option');
    const amdOption = document.getElementById('amd-option');
    const cpuTypeDropdown = document.getElementById('cpu-type');
    
    if (normalizedType === 'Intel') {
        if (intelOption) intelOption.classList.add('selected');
        if (amdOption) amdOption.classList.remove('selected');
        debugElement.style.backgroundColor = '#0071c5';
        debugElement.textContent = '✅ ĐANG CHỌN: INTEL';
        
        // Thêm visual cue cho trang
        document.body.style.border = '5px solid #0071c5';
        setTimeout(() => { document.body.style.border = ''; }, 2000);
    } else {
        if (amdOption) amdOption.classList.add('selected');
        if (intelOption) intelOption.classList.remove('selected');
        debugElement.style.backgroundColor = '#ED1C24';
        debugElement.textContent = '✅ ĐANG CHỌN: AMD';
        
        // Thêm visual cue cho trang
        document.body.style.border = '5px solid #ED1C24';
        setTimeout(() => { document.body.style.border = ''; }, 2000);
    }
    
    // Thêm debug element vào body
    document.body.appendChild(debugElement);
    
    // Xóa sau 5 giây
    setTimeout(() => {
        if (document.getElementById('cpu-debug-info')) {
            document.getElementById('cpu-debug-info').remove();
        }
    }, 5000);
    
    // CRITICAL FIX: Đồng bộ tất cả các nơi lưu trữ thông tin CPU type
    
    // 1. Set giá trị dropdown
    if (cpuTypeDropdown) {
        cpuTypeDropdown.value = normalizedType;
        console.log(`%c CPU type dropdown đã được cập nhật: "${normalizedType}" ✅`, 
                   'background: #4CAF50; color: white; font-weight: bold;');
    }
    
    // 2. Đặt thuộc tính data-* trên body để các hàm khác có thể truy cập
    document.body.setAttribute('data-selected-cpu-type', normalizedType);
    document.body.setAttribute('data-current-cpu-type', normalizedType);
    
    // 3. Lưu vào localStorage để giữ lại giữa các phiên
    localStorage.setItem('selectedCpuType', normalizedType);
    
    // 4. Set class cho body để CSS có thể phản ánh trạng thái
    document.body.classList.remove('intel-mode', 'amd-mode');
    document.body.classList.add(normalizedType.toLowerCase() + '-mode');
    
    // Hiển thị thông báo
    const notification = document.createElement('div');
    notification.textContent = `✓ Đã chọn CPU ${normalizedType === 'Intel' ? 'INTEL' : 'AMD'}`;
    notification.style.position = 'fixed';
    notification.style.top = '80px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = normalizedType === 'Intel' ? '#0071c5' : '#ED1C24';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.fontWeight = 'bold';
    notification.style.fontSize = '16px';
    document.body.appendChild(notification);
    
    // Remove after 2 seconds
    setTimeout(() => {
        notification.remove();
    }, 2000);
    
    // CRITICAL: Kích hoạt sự kiện change trên dropdown để kích hoạt mọi listener
    const event = new Event('change', { bubbles: true });
    cpuTypeDropdown.dispatchEvent(event);
    
    // Reset component selections
    const componentSelects = [
        'cpu', 'mainboard', 'vga', 'ram', 'ssd', 
        'cpuCooler', 'case', 'psu', 'hdd', 'monitor'
    ];
    
    componentSelects.forEach(id => {
        const select = document.getElementById(id);
        if (select && select.options.length > 0) {
            select.selectedIndex = 0;
        }
    });
    
    // Clear selected components display
    const selectedComponentsList = document.getElementById('selected-components-list');
    if (selectedComponentsList) {
        selectedComponentsList.innerHTML = '';
    }
    
    // Update price display
    const totalPriceDisplay = document.querySelector('#total-price p');
    if (totalPriceDisplay) {
        totalPriceDisplay.textContent = '0 VNĐ';
    }
    
    // CRITICAL: Hiển thị chỉ báo CPU type cố định trên màn hình
    const existingIndicator = document.getElementById('permanent-cpu-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    const cpuIndicator = document.createElement('div');
    cpuIndicator.style.position = 'fixed';
    cpuIndicator.style.bottom = '20px';
    cpuIndicator.style.right = '20px';
    cpuIndicator.style.padding = '15px 20px';
    cpuIndicator.style.backgroundColor = normalizedType === 'Intel' ? '#0071c5' : '#ED1C24';
    cpuIndicator.style.color = 'white';
    cpuIndicator.style.fontWeight = 'bold';
    cpuIndicator.style.fontSize = '18px';
    cpuIndicator.style.zIndex = '10000';
    cpuIndicator.style.borderRadius = '5px';
    cpuIndicator.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
    cpuIndicator.id = 'permanent-cpu-indicator';
    cpuIndicator.textContent = `${normalizedType.toUpperCase()} MODE`;
    
    document.body.appendChild(cpuIndicator);
    
    // Run auto select with new CPU type after a short delay
    setTimeout(() => {
        const gameId = document.getElementById('game-genre').value;
        const budget = parseInt(document.getElementById('budget-range').value);
        
        // CRITICAL: Lấy giá trị mới nhất từ dropdown và xác minh lại
        const currentCpuType = document.getElementById('cpu-type').value;
        if (currentCpuType !== normalizedType) {
            console.error(`[CRITICAL ERROR] CPU type mismatch! Dropdown: ${currentCpuType}, Selection: ${normalizedType}`);
            // Sửa lỗi không khớp
            document.getElementById('cpu-type').value = normalizedType;
            console.log(`✅ Fixed: CPU type synchronized to ${normalizedType}`);
        }
        
        if (typeof window.autoSelectConfig === 'function' && gameId && budget) {
            console.log(`🔄 Gọi autoSelectConfig với CPU ${normalizedType}, game ${gameId}, budget ${budget}`);
            window.autoSelectConfig(gameId, budget, normalizedType);
        }
    }, 500);
}

// Now export it to window and create the safe version
window.handleCpuTypeSelection = handleCpuTypeSelection;

// Ensure handleCpuTypeSelection function is available
// This is a dynamic version of the function that waits for it to be defined
window.handleCpuTypeSelectionSafe = function(cpuType) {
    console.log(`CPU selection requested: ${cpuType}`);
    
    // If window.handleCpuTypeSelection is already defined, use it
    if (typeof window.handleCpuTypeSelection === 'function') {
        console.log('Using predefined handleCpuTypeSelection');
        window.handleCpuTypeSelection(cpuType);
        return;
    }
    
    // Otherwise use this implementation
    console.log('Using fallback handleCpuTypeSelection');
    
    // Update dropdown first
    const cpuTypeDropdown = document.getElementById('cpu-type');
    if (cpuTypeDropdown) {
        cpuTypeDropdown.value = cpuType;
        
        // Trigger change event
        try {
            const event = new Event('change', { bubbles: true });
            cpuTypeDropdown.dispatchEvent(event);
        } catch (e) {
            console.error('Error dispatching change event:', e);
            
            // Manual update
            document.body.setAttribute('data-selected-cpu-type', cpuType);
            document.body.classList.remove('intel-mode', 'amd-mode');
            document.body.classList.add(cpuType.toLowerCase() + '-mode');
            localStorage.setItem('selectedCpuType', cpuType);
        }
    } else {
        console.error('CPU type dropdown not found');
        
        // Direct update
        document.body.setAttribute('data-selected-cpu-type', cpuType);
        document.body.classList.remove('intel-mode', 'amd-mode');
        document.body.classList.add(cpuType.toLowerCase() + '-mode');
        localStorage.setItem('selectedCpuType', cpuType);
    }
    
    // Update visual indicators
    const intelOption = document.getElementById('intel-option');
    const amdOption = document.getElementById('amd-option');
    
    if (cpuType === 'Intel') {
        intelOption?.classList.add('selected');
        amdOption?.classList.remove('selected');
    } else {
        amdOption?.classList.add('selected');
        intelOption?.classList.remove('selected');
    }
    
    // Create permanent indicator
    const existingIndicator = document.getElementById('permanent-cpu-indicator');
    if (existingIndicator) {
        existingIndicator.textContent = `${cpuType.toUpperCase()} MODE`;
        existingIndicator.style.backgroundColor = cpuType === 'Intel' ? '#0071c5' : '#ED1C24';
    } else {
        const cpuIndicator = document.createElement('div');
        cpuIndicator.style.position = 'fixed';
        cpuIndicator.style.bottom = '20px';
        cpuIndicator.style.right = '20px';
        cpuIndicator.style.padding = '15px 20px';
        cpuIndicator.style.backgroundColor = cpuType === 'Intel' ? '#0071c5' : '#ED1C24';
        cpuIndicator.style.color = 'white';
        cpuIndicator.style.fontWeight = 'bold';
        cpuIndicator.style.fontSize = '18px';
        cpuIndicator.style.zIndex = '10000';
        cpuIndicator.style.borderRadius = '5px';
        cpuIndicator.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
        cpuIndicator.id = 'permanent-cpu-indicator';
        cpuIndicator.textContent = `${cpuType.toUpperCase()} MODE`;
        document.body.appendChild(cpuIndicator);
    }
    
    // If the game dropdown and budget have values, try to autoSelectConfig
    const gameId = document.getElementById('game-genre')?.value;
    const budget = parseInt(document.getElementById('budget-range')?.value);
    
    if (gameId && !isNaN(budget) && typeof window.autoSelectConfig === 'function') {
        console.log(`Auto-selecting config after CPU type change: game=${gameId}, budget=${budget}, cpu=${cpuType}`);
        window.autoSelectConfig(gameId, budget, cpuType);
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Add budget slider change event
    const budgetSlider = document.getElementById('budget-range');
    if (budgetSlider) {
        budgetSlider.addEventListener('change', function() {
            console.log('Budget slider changed to:', this.value);
            // Always get the latest CPU type value
            const gameId = document.getElementById('game-genre').value;
            const cpuType = document.getElementById('cpu-type').value;
            const budget = parseInt(this.value);
            if (gameId && cpuType && budget) {
                console.log('Auto-selecting config after budget change, CPU type:', cpuType);
                if (typeof window.autoSelectConfig === 'function') {
                    window.autoSelectConfig(gameId, budget, cpuType);
                    
                    // Add a short delay and then trigger the calculate button to show the table
                    setTimeout(() => {
                        const calculateButton = document.getElementById('calculate-button');
                        if (calculateButton) {
                            console.log('Triggering calculate button to show configuration table after budget change');
                            calculateButton.click();
                        } else if (typeof window.showConfigDetailModal === 'function') {
                            // Alternative method
                            window.showConfigDetailModal();
                        }
                    }, 800); // Slightly longer delay to ensure configurations are loaded
                }
            }
        });
    }
    
    // Handle CPU brand selection
    const intelOption = document.getElementById('intel-option');
    const amdOption = document.getElementById('amd-option');
    const cpuTypeDropdown = document.getElementById('cpu-type');
    
    // Debug CPU type selection
    console.log('Initial CPU type dropdown value:', cpuTypeDropdown ? cpuTypeDropdown.value : 'not found');
    
    // Set default value to Intel
    if (cpuTypeDropdown) {
        cpuTypeDropdown.value = 'Intel';
        intelOption.classList.add('selected');
        console.log('CPU type set to default: Intel');
    }
    
    // Update click handlers if elements exist
    if (intelOption) {
        intelOption.onclick = function() {
            window.handleCpuTypeSelectionSafe('Intel');
        };
    }
    
    if (amdOption) {
        amdOption.onclick = function() {
            window.handleCpuTypeSelectionSafe('Amd');
        };
    }
    
    console.log('CPU selection handlers updated to use safe version');
    
    // Handle game card clicks
    const gameCards = document.querySelectorAll('.game-card');
    const gameGenreDropdown = document.getElementById('game-genre');
    
    gameCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected class from all cards
            gameCards.forEach(c => c.classList.remove('selected'));
            
            // Add selected class to clicked card
            this.classList.add('selected');
            
            // Update dropdown value
            const gameId = this.getAttribute('data-game');
            if (gameGenreDropdown && gameId) {
                gameGenreDropdown.value = gameId;
                
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                gameGenreDropdown.dispatchEvent(event);
                
                // Always get the latest CPU type value
                const cpuType = document.getElementById('cpu-type').value;
                const budget = parseInt(document.getElementById('budget-range').value);
                if (typeof window.autoSelectConfig === 'function' && cpuType && budget && gameId) {
                    window.autoSelectConfig(gameId, budget, cpuType);
                    
                    // Add a delay and then ensure the configuration table is shown
                    setTimeout(() => {
                        // Hiển thị bảng cấu hình
                        const configTable = document.getElementById('config-table');
                        if (configTable) {
                            configTable.style.display = 'block';
                            
                            // Cập nhật hình ảnh và thông tin
                            if (typeof window.updateConfigTableImages === 'function') {
                                try {
                                    window.updateConfigTableImages();
                                } catch (error) {
                                    console.error('Error updating table images:', error);
                                }
                            }
                            
                            // Cuộn đến bảng
                            configTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                        
                        // Hiển thị modal chi tiết cấu hình nếu cần
                        if (typeof window.showConfigDetailModal === 'function') {
                            try {
                                window.showConfigDetailModal();
                            } catch (error) {
                                console.error('Error showing config detail modal:', error);
                                
                                // Nếu có lỗi khi hiển thị modal, thử nhấn nút calculate
                                const calculateButton = document.getElementById('calculate-button');
                                if (calculateButton) {
                                    calculateButton.click();
                                }
                            }
                        } else if (configTable && configTable.style.display !== 'block') {
                            // Nếu không có hàm showConfigDetailModal nhưng bảng chưa hiển thị, nhấn nút calculate
                            const calculateButton = document.getElementById('calculate-button');
                            if (calculateButton) {
                                calculateButton.click();
                            }
                        }
                    }, 1000); // Tăng delay để đảm bảo cấu hình đã được tải đầy đủ
                }
            }
        });
    });

    // Add event listener for auto-showing the config
    const calculateButton = document.getElementById('calculate-button');
    if (calculateButton) {
        console.log('Found calculate button, setting up auto-trigger');
        
        // Track when all components have been selected to auto-trigger the button
        let componentsSelected = false;
        
        // Check components every second after auto-selection
        const checkInterval = setInterval(() => {
            const cpu = document.getElementById('cpu');
            const vga = document.getElementById('vga');
            const mainboard = document.getElementById('mainboard');
            
            // If the main components are selected, auto-show the config
            if (cpu && vga && mainboard && 
                cpu.value && cpu.value !== '' && 
                vga.value && vga.value !== '' && 
                mainboard.value && mainboard.value !== '') {
                
                if (!componentsSelected) {
                    console.log('All main components selected, auto-triggering config display');
                    componentsSelected = true;
                    calculateButton.click();
                    
                    // Clear interval after showing once
                    clearInterval(checkInterval);
                }
            }
        }, 1000);
    }
}); 