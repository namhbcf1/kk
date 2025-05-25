/**
 * File hỗ trợ tự động chọn cấu hình PC
 * Cung cấp các hàm để tự động chọn cấu hình dựa trên game, ngân sách và loại CPU
 */

// Hàm cập nhật giá trị dropdown với nhiều phương pháp tìm kiếm
function updateDropdownEnhanced(id, value) {
    const dropdown = document.getElementById(id);
    if (!dropdown) {
        console.error(`Dropdown with id ${id} not found`);
        return false;
    }

    // Nếu value không được cung cấp, không làm gì cả
    if (!value) {
        console.warn(`No value provided for dropdown ${id}`);
        return false;
    }

    // In ra tất cả options có sẵn để debug
    const optionsText = Array.from(dropdown.options)
        .map(opt => `${opt.value} (${opt.text})`)
        .join(', ');
    console.log(`Available options for ${id}: ${optionsText}`);

    // Tìm option phù hợp
    let foundOption = false;
    let optionToSelect = null;
    const valueToSearch = value.toString().toLowerCase();

    // Phương pháp 1: Tìm chính xác theo value
    for (let i = 0; i < dropdown.options.length; i++) {
        const option = dropdown.options[i];
        if (option.value && option.value.toLowerCase() === valueToSearch) {
            optionToSelect = option;
            foundOption = true;
            console.log(`Found exact value match for ${id}: ${option.text}`);
            break;
        }
    }

    // Phương pháp 2: Tìm chính xác theo text
    if (!foundOption) {
        for (let i = 0; i < dropdown.options.length; i++) {
            const option = dropdown.options[i];
            if (option.text && option.text.toLowerCase() === valueToSearch) {
                optionToSelect = option;
                foundOption = true;
                console.log(`Found exact text match for ${id}: ${option.text}`);
                break;
            }
        }
    }

    // Phương pháp 3: Tìm option có chứa value
    if (!foundOption) {
        for (let i = 0; i < dropdown.options.length; i++) {
            const option = dropdown.options[i];
            // Kiểm tra nếu value nằm trong option.value hoặc option.text
            if ((option.value && option.value.toLowerCase().includes(valueToSearch)) || 
                (option.text && option.text.toLowerCase().includes(valueToSearch))) {
                optionToSelect = option;
                foundOption = true;
                console.log(`Found partial match for ${id}: ${option.text} (searched for ${value})`);
                break;
            }
        }
    }
    
    // Phương pháp 4: Tìm tương tự với các từ khóa chính
    if (!foundOption) {
        const keywords = valueToSearch.split(/[-_\s.]+/); // Tách theo dấu gạch ngang, gạch dưới, khoảng trắng
        for (let i = 0; i < dropdown.options.length; i++) {
            const option = dropdown.options[i];
            const optionText = (option.text || '').toLowerCase();
            const optionValue = (option.value || '').toLowerCase();
            
            // Kiểm tra nếu text hoặc value chứa bất kỳ từ khóa nào
            const matchingKeywords = keywords.filter(keyword => 
                (keyword.length > 1) && (optionText.includes(keyword) || optionValue.includes(keyword))
            );
            
            if (matchingKeywords.length > 0) {
                optionToSelect = option;
                foundOption = true;
                console.log(`Found keyword match for ${id}: ${option.text} (matched keywords: ${matchingKeywords.join(', ')})`);
                break;
            }
        }
    }

    // Phương pháp 5: Dùng option đầu tiên không phải là disabled & placeholder
    if (!foundOption) {
        for (let i = 0; i < dropdown.options.length; i++) {
            const option = dropdown.options[i];
            if (!option.disabled && option.value && option.value !== "null" && option.value !== "") {
                optionToSelect = option;
                foundOption = true;
                console.log(`Using first available option for ${id}: ${option.text}`);
                break;
            }
        }
    }

    // Cập nhật giá trị dropdown nếu tìm thấy option
    if (foundOption && optionToSelect) {
        // Lưu lại giá trị hiện tại
        const currentValue = dropdown.value;
        
        // Cập nhật dropdown
        dropdown.value = optionToSelect.value;
        
        // Chỉ kích hoạt sự kiện change nếu giá trị thực sự thay đổi
        if (currentValue !== optionToSelect.value) {
            // Kích hoạt sự kiện change để cập nhật giao diện
            const event = new Event('change', { bubbles: true });
            dropdown.dispatchEvent(event);
            console.log(`Updated ${id} dropdown to: ${optionToSelect.text}`);
        } else {
            console.log(`${id} dropdown already set to: ${optionToSelect.text}`);
        }
        
        return true;
    } else {
        console.warn(`Could not find suitable option for ${id} with value ${value}`);
        
        // Nếu tất cả phương pháp đều thất bại, chọn một giá trị mặc định dựa trên loại dropdown
        const defaultSelections = {
            'cpu': selectFirstNonEmptyOption(dropdown),
            'mainboard': selectFirstNonEmptyOption(dropdown),
            'vga': selectFirstNonEmptyOption(dropdown),
            'ram': selectFirstNonEmptyOption(dropdown),
            'ssd': selectFirstNonEmptyOption(dropdown),
            'cpuCooler': selectFirstNonEmptyOption(dropdown),
            'psu': selectFirstNonEmptyOption(dropdown),
            'case': selectFirstNonEmptyOption(dropdown)
        };
        
        if (defaultSelections[id]) {
            console.log(`Selecting default option for ${id}: ${defaultSelections[id].text}`);
            dropdown.value = defaultSelections[id].value;
            const event = new Event('change', { bubbles: true });
            dropdown.dispatchEvent(event);
            return true;
        }
        
        return false;
    }
}

// Hàm chọn option đầu tiên không rỗng
function selectFirstNonEmptyOption(dropdown) {
    for (let i = 1; i < dropdown.options.length; i++) { // Bắt đầu từ 1 để bỏ qua option đầu tiên (thường là placeholder)
        const option = dropdown.options[i];
        if (option && !option.disabled && option.value && option.value !== "null" && option.value !== "") {
            return option;
        }
    }
    return null;
}

// Cập nhật giá sau khi chọn cấu hình
function updateComponentPricesFixed() {
    // Kiểm tra xem hàm updateComponentPrices có tồn tại trong window không
    if (typeof window.updateComponentPrices === 'function') {
        window.updateComponentPrices();
    } else {
        console.log('Sử dụng hàm cập nhật giá thay thế');
        
        // Cập nhật giá và thành tiền cho các linh kiện
        const componentTypes = ['cpu', 'mainboard', 'ram', 'vga', 'ssd', 'cpuCooler', 'psu', 'case', 'hdd', 'monitor'];
        let totalPrice = 0;
        
        componentTypes.forEach(type => {
            const element = document.getElementById(type);
            const priceEl = document.getElementById(`${type}-price`);
            const totalEl = document.getElementById(`${type}-total`);
            
            if (element && element.value && priceEl && totalEl) {
                const option = element.options[element.selectedIndex];
                if (option) {
                    let price = 0;
                    
                    // Trích xuất giá từ text nếu có định dạng như "Tên - XXX,XXX VNĐ"
                    const text = option.text || '';
                    const priceMatch = text.match(/(\d[\d\s,\.]*)\s*VNĐ/);
                    if (priceMatch && priceMatch[1]) {
                        price = parseInt(priceMatch[1].replace(/[\s,\.]/g, ''), 10);
                    }
                    
                    priceEl.textContent = formatPriceFixed(price);
                    totalEl.textContent = formatPriceFixed(price);
                    totalPrice += price;
                }
            }
        });
        
        // Cập nhật tổng tiền trên trang
        const totalPriceDisplay = document.querySelector('#total-price p');
        if (totalPriceDisplay) {
            totalPriceDisplay.textContent = formatPriceFixed(totalPrice) + ' VNĐ';
        }
        
        // Cập nhật tổng tiền trong bảng
        const totalPriceCell = document.getElementById('total-price-cell');
        if (totalPriceCell) {
            totalPriceCell.textContent = formatPriceFixed(totalPrice);
        }
    }
}

// Định dạng giá tiền
function formatPriceFixed(price) {
    return price ? price.toLocaleString() : "0";
}

// Hàm tự động chọn cấu hình dựa trên game, ngân sách và loại CPU
function autoSelectConfigEnhanced(gameId, budget, cpuType) {
    console.log(`Enhanced autoSelectConfig with: gameId=${gameId}, budget=${budget}, cpuType=${cpuType}`);
    
    if (!gameId || !budget || !cpuType) {
        console.warn('Missing required parameters for autoSelectConfig');
        return null;
    }

    // Đảm bảo cấu hình mặc định đã được tải
    try {
        if (typeof window.intelConfigs === 'undefined') {
            // Tạo cấu hình mặc định cho Intel với các ID đúng từ js/data
            window.intelConfigs = {
                'valorant': {
                    '8M': { cpu: '10400f', mainboard: 'H510', vga: '1660s', ram: 'fury-16gb', ssd: 'sstc-256', case: 'GA', cpuCooler: 'STOCK', psu: 'DT660' },
                    '16M': { cpu: '12400f', mainboard: 'ASUS-B760', vga: '3070', ram: 'cosair-16', ssd: 'crucial-500', case: 'GA3', cpuCooler: 'CR1000', psu: 'VSP750' }
                },
                'csgo': {
                    '8M': { cpu: '10400f', mainboard: 'H510', vga: '1660s', ram: 'fury-16gb', ssd: 'sstc-256', case: 'GA', cpuCooler: 'STOCK', psu: 'DT660' },
                    '16M': { cpu: '12400f', mainboard: 'ASUS-B760', vga: '3070', ram: 'cosair-16', ssd: 'crucial-500', case: 'GA3', cpuCooler: 'CR1000', psu: 'VSP750' }
                },
                'pubg': {
                    '8M': { cpu: '10400f', mainboard: 'H510', vga: '3060', ram: 'fury-16gb', ssd: 'sstc-256', case: 'GA', cpuCooler: 'STOCK', psu: 'DT660' },
                    '16M': { cpu: '12600kf', mainboard: 'ASUS-B760', vga: '3070', ram: 'cosair-16', ssd: 'crucial-500', case: 'GA3', cpuCooler: 'CR1000', psu: 'VSP750' }
                },
                'lol': {
                    '8M': { cpu: '10400f', mainboard: 'H510', vga: '1660s', ram: 'fury-16gb', ssd: 'sstc-256', case: 'GA', cpuCooler: 'STOCK', psu: 'DT660' },
                    '16M': { cpu: '12400f', mainboard: 'ASUS-B760', vga: '3070', ram: 'cosair-16', ssd: 'crucial-500', case: 'GA3', cpuCooler: 'CR1000', psu: 'VSP750' }
                }
            };
            
            // Thêm các trò chơi còn lại cùng cấu hình cơ bản
            const otherGames = ['gta-v', 'elden-ring', 'naraka', 'genshin', 'fo4', 'black-myth-wukong', 'god-of-war', 'battle-teams-2', 'delta-force', 'audition', 'mu-origin', 'crossfire'];
            otherGames.forEach(game => {
                window.intelConfigs[game] = {
                    '8M': { cpu: '10400f', mainboard: 'H510', vga: '1660s', ram: 'fury-16gb', ssd: 'sstc-256', case: 'GA', cpuCooler: 'STOCK', psu: 'DT660' },
                    '16M': { cpu: '12400f', mainboard: 'ASUS-B760', vga: '3070', ram: 'cosair-16', ssd: 'crucial-500', case: 'GA3', cpuCooler: 'CR1000', psu: 'VSP750' }
                };
            });
            
            console.log('Created default Intel configurations');
        }
        
        if (typeof window.amdConfigs === 'undefined') {
            // Tạo cấu hình mặc định cho AMD
            window.amdConfigs = {
                'valorant': {
                    '8M': { cpu: '5600x', mainboard: 'GIGA-B450', vga: '1660s', ram: 'fury-16gb', ssd: 'sstc-256', case: 'GA', cpuCooler: 'STOCK', psu: 'DT660' },
                    '16M': { cpu: '5800x', mainboard: 'gigabyte-b550', vga: '3070', ram: 'corsair-16gb', ssd: 'crucial-500', case: 'coolermaster', cpuCooler: 'deepcool', psu: 'corsair-750' }
                },
                'csgo': {
                    '8M': { cpu: '5600x', mainboard: 'GIGA-B450', vga: '1660s', ram: 'fury-16gb', ssd: 'sstc-256', case: 'GA', cpuCooler: 'STOCK', psu: 'DT660' },
                    '16M': { cpu: '5800x', mainboard: 'gigabyte-b550', vga: '3070', ram: 'corsair-16gb', ssd: 'crucial-500', case: 'coolermaster', cpuCooler: 'deepcool', psu: 'corsair-750' }
                },
                'pubg': {
                    '8M': { cpu: '5600x', mainboard: 'GIGA-B450', vga: '3060', ram: 'fury-16gb', ssd: 'sstc-256', case: 'GA', cpuCooler: 'STOCK', psu: 'DT660' },
                    '16M': { cpu: '5800x', mainboard: 'gigabyte-b550', vga: '3070', ram: 'corsair-16gb', ssd: 'crucial-500', case: 'coolermaster', cpuCooler: 'deepcool', psu: 'corsair-750' }
                },
                'lol': {
                    '8M': { cpu: '5600x', mainboard: 'GIGA-B450', vga: '1660s', ram: 'fury-16gb', ssd: 'sstc-256', case: 'GA', cpuCooler: 'STOCK', psu: 'DT660' },
                    '16M': { cpu: '5800x', mainboard: 'gigabyte-b550', vga: '3070', ram: 'corsair-16gb', ssd: 'crucial-500', case: 'coolermaster', cpuCooler: 'deepcool', psu: 'corsair-750' }
                }
            };
            
            // Thêm các trò chơi còn lại cùng cấu hình cơ bản
            const otherGames = ['gta-v', 'elden-ring', 'naraka', 'genshin', 'fo4', 'black-myth-wukong', 'god-of-war', 'battle-teams-2', 'delta-force', 'audition', 'mu-origin', 'crossfire'];
            otherGames.forEach(game => {
                window.amdConfigs[game] = {
                    '8M': { cpu: '5600x', mainboard: 'GIGA-B450', vga: '1660s', ram: 'fury-16gb', ssd: 'sstc-256', case: 'GA', cpuCooler: 'STOCK', psu: 'DT660' },
                    '16M': { cpu: '5800x', mainboard: 'gigabyte-b550', vga: '3070', ram: 'corsair-16gb', ssd: 'crucial-500', case: 'coolermaster', cpuCooler: 'deepcool', psu: 'corsair-750' }
                };
            });
            
            console.log('Created default AMD configurations');
        }
    } catch (error) {
        console.error('Error initializing configurations:', error);
    }
    
    // Lấy cấu hình phù hợp
    const configs = cpuType.toLowerCase() === 'intel' ? window.intelConfigs : window.amdConfigs;
    
    if (!configs || !configs[gameId]) {
        console.warn(`No configuration found for ${cpuType} ${gameId}`);
        console.log('Available configs:', configs ? Object.keys(configs) : 'None');
        return null;
    }
    
    // Định dạng budget key
    const budgetInMillions = Math.floor(budget / 1000000);
    console.log(`Budget value in millions: ${budgetInMillions}M`);
    
    // Lấy các mức ngân sách có sẵn và tìm mức gần nhất
    const availableBudgets = Object.keys(configs[gameId])
        .map(budgetKey => parseInt(budgetKey.replace('M', '')));
    
    console.log(`Available budgets for ${gameId}:`, availableBudgets);
    
    // Tìm mức ngân sách gần nhất
    let closestBudget = availableBudgets.reduce((prev, curr) => 
        Math.abs(curr - budgetInMillions) < Math.abs(prev - budgetInMillions) ? curr : prev
    );
    
    const closestBudgetKey = `${closestBudget}M`;
    console.log(`Using closest available budget: ${closestBudgetKey} for requested budget: ${budgetInMillions}M`);
    
    const config = configs[gameId][closestBudgetKey];
    console.log('⚙️ Config found:', config);
    
    // Cập nhật các dropdown theo cấu hình
    if (config.cpu) updateDropdownEnhanced('cpu', config.cpu);
    if (config.mainboard) updateDropdownEnhanced('mainboard', config.mainboard);
    if (config.vga) updateDropdownEnhanced('vga', config.vga);
    if (config.ram) updateDropdownEnhanced('ram', config.ram);
    if (config.ssd) updateDropdownEnhanced('ssd', config.ssd);
    if (config.case) updateDropdownEnhanced('case', config.case);
    if (config.cpuCooler) updateDropdownEnhanced('cpuCooler', config.cpuCooler);
    if (config.psu) updateDropdownEnhanced('psu', config.psu);
    
    // Cập nhật giá và tổng tiền sau khi tất cả các dropdown được cập nhật
    setTimeout(function() {
        try {
            updateComponentPricesFixed();
            console.log('Price table updated after auto-selection');
            
            // Hiển thị bảng cấu hình sau khi chọn tất cả linh kiện
            const configTable = document.getElementById('config-table');
            if (configTable) {
                configTable.style.display = 'block';
                // Cập nhật hình ảnh và thông tin trong bảng nếu có hàm updateConfigTableImages
                if (typeof window.updateConfigTableImages === 'function') {
                    try {
                        window.updateConfigTableImages();
                        console.log('Configuration table images updated successfully');
                    } catch (error) {
                        console.error('Error updating configuration table images:', error);
                    }
                }
            }
            
            // Nếu có hàm showConfigDetailModal, gọi nó để hiển thị modal
            if (typeof window.showConfigDetailModal === 'function') {
                console.log('Showing configuration detail modal');
                window.showConfigDetailModal();
            }
        } catch (error) {
            console.error('Error updating prices after auto-selection:', error);
        }
    }, 500);
    
    // Kiểm tra tương thích socket giữa CPU và Mainboard
    function ensureCompatibleComponents() {
        const cpuSelect = document.getElementById('cpu');
        const mainboardSelect = document.getElementById('mainboard');
        
        if (!cpuSelect || !mainboardSelect || !cpuSelect.value || !mainboardSelect.value) {
            return; // Không đủ thông tin để kiểm tra
        }
        
        // Lấy thông tin CPU
        const cpuData = getComponentData ? getComponentData('CPU', cpuSelect.value) : null;
        // Lấy thông tin Mainboard
        const mainboardData = getComponentData ? getComponentData('Mainboard', mainboardSelect.value) : null;
        
        if (!cpuData || !mainboardData) {
            return; // Không đủ dữ liệu để kiểm tra
        }
        
        // Kiểm tra socket tương thích
        const cpuSocket = cpuData.socket || '';
        const mainboardSocket = mainboardData.socket || '';
        
        if (cpuSocket && mainboardSocket && cpuSocket !== mainboardSocket) {
            console.warn(`Socket không tương thích: CPU (${cpuSocket}) và Mainboard (${mainboardSocket})`);
            
            // Tìm mainboard tương thích với CPU đã chọn
            if (cpuSocket.includes('AM4')) {
                // Chọn mainboard AMD
                const amdMainboards = ['GIGA-B450', 'JGINYUE-B450', 'GIGA-B550', 'asrock-b550m-se', 'gigabyte-b550m-gaming-wifi'];
                for (const mainboardId of amdMainboards) {
                    updateDropdownEnhanced('mainboard', mainboardId);
                    break;
                }
            } else if (cpuSocket.includes('AM5')) {
                // Chọn mainboard AMD mới
                const amdMainboards = ['JGINYUE-B650', 'JGINYUE-B650-PRO', 'ASROCK-B650M-HDV-M2', 'MSI-PRO-B650M-P'];
                for (const mainboardId of amdMainboards) {
                    updateDropdownEnhanced('mainboard', mainboardId);
                    break;
                }
            } else if (cpuSocket.includes('LGA1151') || cpuSocket.includes('LGA1200')) {
                // Chọn mainboard Intel cũ
                const intelMainboards = ['H310', 'B360', 'B365', 'H410', 'B460'];
                for (const mainboardId of intelMainboards) {
                    updateDropdownEnhanced('mainboard', mainboardId);
                    break;
                }
            } else if (cpuSocket.includes('LGA1700')) {
                // Chọn mainboard Intel mới
                const intelMainboards = ['ASUS-H610', 'MSI-H610', 'HNZ-H610', 'ASUS-B760', 'MSI-B760', 'B760M-E'];
                for (const mainboardId of intelMainboards) {
                    updateDropdownEnhanced('mainboard', mainboardId);
                    break;
                }
            }
        }
    }

    // Gọi hàm kiểm tra tương thích sau khi chọn cấu hình
    setTimeout(ensureCompatibleComponents, 600);

    return config;
}

// Kiểm tra và chạy tự động chọn cấu hình khi đủ 3 tiêu chí
function checkAndRunAutoSelectEnhanced() {
    const gameGenre = document.getElementById('game-genre').value;
    const budget = parseInt(document.getElementById('budget-range').value);
    const cpuType = document.getElementById('cpu-type').value;
    
    console.log('Checking criteria for auto-selection:');
    console.log('- Game:', gameGenre);
    console.log('- Budget:', budget);
    console.log('- CPU Type:', cpuType);
    
    if (gameGenre && budget && cpuType) {
        console.log('✅ All criteria met. Running enhanced autoSelectConfig.');
        try {
            // Chạy hàm tự động chọn cấu hình nâng cao
            autoSelectConfigEnhanced(gameGenre, budget, cpuType);
        } catch (error) {
            console.error('Error in enhanced autoSelectConfig:', error);
        }
    } else {
        console.log('❌ Not all criteria are met for auto-selection.');
    }
}

// Xuất các hàm để sử dụng trong các module khác
if (typeof window !== 'undefined') {
    window.updateDropdownEnhanced = updateDropdownEnhanced;
    window.autoSelectConfigEnhanced = autoSelectConfigEnhanced;
    window.checkAndRunAutoSelectEnhanced = checkAndRunAutoSelectEnhanced;
    
    // Ghi đè lên các hàm cũ để cải thiện chức năng
    window.updateDropdown = updateDropdownEnhanced;
    window.autoSelectConfig = autoSelectConfigEnhanced;
    window.checkAndRunAutoSelect = checkAndRunAutoSelectEnhanced;
    
    console.log('Enhanced auto-config functions registered successfully');
}

// Khi trang tải xong, chỉ đăng ký sự kiện, không tự động chọn cấu hình
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing enhanced auto-config helper');
    
    // Không tự động chọn cấu hình khi trang tải xong
    // setTimeout(checkAndRunAutoSelectEnhanced, 1500); // Đã tắt tính năng tự động chọn
    
    // Thêm event listeners cho các thay đổi
    const gameGenre = document.getElementById('game-genre');
    const budgetRange = document.getElementById('budget-range');
    const cpuType = document.getElementById('cpu-type');
    
    if (gameGenre) {
        gameGenre.addEventListener('change', checkAndRunAutoSelectEnhanced);
    }
    
    if (budgetRange) {
        budgetRange.addEventListener('change', checkAndRunAutoSelectEnhanced);
        budgetRange.addEventListener('input', function() {
            // Cập nhật hiển thị ngân sách
            const budgetValue = document.getElementById('budget-value');
            if (budgetValue) {
                const budgetInMillion = parseInt(this.value) / 1000000;
                budgetValue.textContent = budgetInMillion + ' triệu';
            }
        });
    }
    
    if (cpuType) {
        cpuType.addEventListener('change', checkAndRunAutoSelectEnhanced);
    }
    
    console.log('Enhanced auto-config event listeners registered successfully');
}); 