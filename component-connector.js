/**
 * Component Connector - kết nối tất cả các thành phần của trang web
 */

// Định dạng giá tiền
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Function to get component data from the data files
function getComponentData(componentType, componentId) {
    if (!componentId) return null;
    
    // Map componentType đến đúng đối tượng dữ liệu toàn cục
    const dataMap = {
        'CPU': window.cpuData,
        'Mainboard': window.mainboardData,
        'RAM': window.ramData,
        'VGA': window.vgaData,
        'SSD': window.ssdData,
        'PSU': window.psuData,
        'Case': window.caseData,
        'Cooler': window.cpuCoolerData,
        'HDD': window.hddData,
        'Monitor': window.monitorData
    };
    
    // Lấy đối tượng dữ liệu
    const dataObj = dataMap[componentType];
    if (!dataObj) return null;
    
    // Trả về dữ liệu component
    return dataObj[componentId];
}

// Function to get component specs from component data
function getComponentSpecs(componentType, componentId) {
    const component = getComponentData(componentType, componentId);
    if (!component) return {};
    
    // Trả về thuộc tính specs của component nếu có
    return component.specs || {};
}

// Lấy URL hình ảnh linh kiện (mặc định)
function getComponentImageUrl(componentType, componentId) {
    const component = getComponentData(componentType, componentId);
    if (!component || !component.image) {
        // Trả về đường dẫn hình ảnh mặc định nếu không tìm thấy hình ảnh
        return 'images/placeholder.jpg';
    }
    
    return component.image;
}

// Thu thập dữ liệu cấu hình
function collectConfigData() {
    const configData = {};
    
    // CPU
    const cpuSelect = document.getElementById('cpu');
    if (cpuSelect && cpuSelect.value) {
        const cpuData = getComponentData('CPU', cpuSelect.value);
        if (cpuData) {
            configData.CPU = {
                name: cpuData.name,
                price: cpuData.price,
                specs: getComponentSpecs('CPU', cpuSelect.value),
                image: cpuData.image
            };
        }
    }
    
    // Mainboard
    const mainboardSelect = document.getElementById('mainboard');
    if (mainboardSelect && mainboardSelect.value) {
        const mainboardData = getComponentData('Mainboard', mainboardSelect.value);
        if (mainboardData) {
            configData.Mainboard = {
                name: mainboardData.name,
                price: mainboardData.price,
                specs: getComponentSpecs('Mainboard', mainboardSelect.value),
                image: mainboardData.image
            };
        }
    }
    
    // RAM
    const ramSelect = document.getElementById('ram');
    if (ramSelect && ramSelect.value) {
        const ramData = getComponentData('RAM', ramSelect.value);
        if (ramData) {
            configData.RAM = {
                name: ramData.name,
                price: ramData.price,
                specs: getComponentSpecs('RAM', ramSelect.value),
                image: ramData.image
            };
        }
    }
    
    // VGA
    const vgaSelect = document.getElementById('vga');
    if (vgaSelect && vgaSelect.value) {
        const vgaData = getComponentData('VGA', vgaSelect.value);
        if (vgaData) {
            configData.VGA = {
                name: vgaData.name,
                price: vgaData.price,
                specs: getComponentSpecs('VGA', vgaSelect.value),
                image: vgaData.image
            };
        }
    }
    
    // SSD
    const ssdSelect = document.getElementById('ssd');
    if (ssdSelect && ssdSelect.value) {
        const ssdData = getComponentData('SSD', ssdSelect.value);
        if (ssdData) {
            configData.SSD = {
                name: ssdData.name,
                price: ssdData.price,
                specs: getComponentSpecs('SSD', ssdSelect.value),
                image: ssdData.image
            };
        }
    }
    
    // PSU
    const psuSelect = document.getElementById('psu');
    if (psuSelect && psuSelect.value) {
        const psuData = getComponentData('PSU', psuSelect.value);
        if (psuData) {
            configData.PSU = {
                name: psuData.name,
                price: psuData.price,
                specs: getComponentSpecs('PSU', psuSelect.value),
                image: psuData.image
            };
        }
    }
    
    // Case
    const caseSelect = document.getElementById('case');
    if (caseSelect && caseSelect.value) {
        const caseData = getComponentData('Case', caseSelect.value);
        if (caseData) {
            configData.Case = {
                name: caseData.name,
                price: caseData.price,
                specs: getComponentSpecs('Case', caseSelect.value),
                image: caseData.image
            };
        }
    }
    
    // CPU Cooler
    const coolerSelect = document.getElementById('cpuCooler');
    if (coolerSelect && coolerSelect.value) {
        const coolerData = getComponentData('Cooler', coolerSelect.value);
        if (coolerData) {
            configData.Cooler = {
                name: coolerData.name,
                price: coolerData.price,
                specs: getComponentSpecs('Cooler', coolerSelect.value),
                image: coolerData.image
            };
        }
    }
    
    // HDD
    const hddSelect = document.getElementById('hdd');
    if (hddSelect && hddSelect.value) {
        const hddData = getComponentData('HDD', hddSelect.value);
        if (hddData) {
            configData.HDD = {
                name: hddData.name,
                price: hddData.price,
                specs: getComponentSpecs('HDD', hddSelect.value),
                image: hddData.image
            };
        }
    }
    
    // Monitor
    const monitorSelect = document.getElementById('monitor');
    if (monitorSelect && monitorSelect.value) {
        const monitorData = getComponentData('Monitor', monitorSelect.value);
        if (monitorData) {
            configData.Monitor = {
                name: monitorData.name,
                price: monitorData.price,
                specs: getComponentSpecs('Monitor', monitorSelect.value),
                image: monitorData.image
            };
        }
    }
    
    console.log('Collected config data:', configData);
    return configData;
}

// Function to update total price
function updateTotalPrice() {
    // Calculate total price
    let totalPrice = 0;
    const configData = collectConfigData();
    
    for (const key in configData) {
        if (configData[key] && configData[key].price) {
            totalPrice += configData[key].price;
        }
    }
    
    // Update total price cells
    const totalPriceCell = document.getElementById('total-price-cell');
    const remainingPriceCell = document.getElementById('remaining-price-cell');
    
    if (totalPriceCell) {
        totalPriceCell.textContent = formatPrice(totalPrice) + ' VNĐ';
    }
    
    if (remainingPriceCell) {
        remainingPriceCell.textContent = formatPrice(totalPrice) + ' VNĐ';
    }
    
    // Also update main total price section
    const totalPriceSection = document.querySelector('#total-price p');
    if (totalPriceSection) {
        totalPriceSection.textContent = formatPrice(totalPrice) + ' VNĐ';
    }
}

// Add the function to update table images
function updateConfigTableImages() {
    // Component types and their corresponding table cells
    const componentImageCells = {
        'cpu': 'cpu-image',
        'mainboard': 'mainboard-image',
        'ram': 'ram-image',
        'vga': 'vga-image',
        'ssd': 'ssd-image',
        'cpuCooler': 'cpu-cooler-image',
        'psu': 'psu-image',
        'case': 'case-image',
        'hdd': 'hdd-image',
        'monitor': 'monitor-image'
    };
    
    // Component names and price cells
    const componentNameCells = {
        'cpu': ['cpu-name', 'cpu-price', 'cpu-total'],
        'mainboard': ['mainboard-name', 'mainboard-price', 'mainboard-total'],
        'ram': ['ram-name', 'ram-price', 'ram-total'],
        'vga': ['vga-name', 'vga-price', 'vga-total'],
        'ssd': ['ssd-name', 'ssd-price', 'ssd-total'],
        'cpuCooler': ['cpu-cooler-name', 'cpu-cooler-price', 'cpu-cooler-total'],
        'psu': ['psu-name', 'psu-price', 'psu-total'],
        'case': ['case-name', 'case-price', 'case-total'],
        'hdd': ['additional-component-name', 'additional-component-price', 'additional-component-total'],
        'monitor': ['monitor-name', 'monitor-price', 'monitor-total']
    };
    
    // Update images and text for each component
    for (const [componentId, cellId] of Object.entries(componentImageCells)) {
        const select = document.getElementById(componentId);
        const cell = document.getElementById(cellId);
        
        if (select && cell && select.value) {
            // Get component data
            const typeMap = {
                'cpu': 'CPU',
                'mainboard': 'Mainboard',
                'ram': 'RAM',
                'vga': 'VGA',
                'ssd': 'SSD',
                'cpuCooler': 'Cooler',
                'psu': 'PSU',
                'case': 'Case',
                'hdd': 'HDD',
                'monitor': 'Monitor'
            };
            
            const componentType = typeMap[componentId];
            const componentData = getComponentData(componentType, select.value);
            
            if (componentData) {
                // Create an image element
                const img = document.createElement('img');
                img.src = componentData.image || getComponentImageUrl(componentType, select.value);
                img.alt = componentData.name;
                img.style.maxWidth = '50px';
                img.style.maxHeight = '50px';
                img.onerror = function() {
                    this.src = getComponentImageUrl(componentType, select.value); // Fallback image
                };
                
                // Clear cell and append the image
                cell.innerHTML = '';
                cell.appendChild(img);
                
                // Update name and price cells
                const namePriceCells = componentNameCells[componentId];
                if (namePriceCells && namePriceCells.length === 3) {
                    const nameCell = document.getElementById(namePriceCells[0]);
                    const priceCell = document.getElementById(namePriceCells[1]);
                    const totalCell = document.getElementById(namePriceCells[2]);
                    
                    if (nameCell) nameCell.textContent = componentData.name;
                    if (priceCell) {
                        const price = componentData.price;
                        priceCell.textContent = formatPrice(price) + ' VNĐ';
                    }
                    if (totalCell && priceCell) {
                        totalCell.textContent = priceCell.textContent;
                    }
                }
            }
        } else if (cell) {
            // Clear the cell if no component selected
            cell.innerHTML = '';
        }
    }
    
    // Update total price
    updateTotalPrice();
}

// Make functions available globally
window.updateConfigTableImages = updateConfigTableImages;
window.updateTotalPrice = updateTotalPrice;
window.collectConfigData = collectConfigData;
window.getComponentData = getComponentData;
window.getComponentSpecs = getComponentSpecs;
window.getComponentImageUrl = getComponentImageUrl;
window.formatPrice = formatPrice;

(function() {
    // Kiểm tra DOM đã sẵn sàng chưa
    document.addEventListener('DOMContentLoaded', initConnector);
    
    // Khởi tạo tất cả các kết nối
    function initConnector() {
        console.log('Initializing component connector');
        
        // Đảm bảo dữ liệu linh kiện được tải
        ensureComponentsDataLoaded();
        
        // Sửa lỗi exportToExcel
        fixExportToExcel();
        
        // Kết nối modal
        connectModalHandlers();
        
        // Sửa lỗi dropdown
        enhanceDropdowns();
        
        // Sửa lỗi Component ID mapping
        enhanceComponentIDMapping();
        
        console.log('Component connector initialized');
    }
    
    // Đảm bảo dữ liệu linh kiện được tải
    function ensureComponentsDataLoaded() {
        // Kiểm tra xem dữ liệu đã được tải chưa
        const componentsData = {
            'cpuData': window.cpuData,
            'mainboardData': window.mainboardData,
            'vgaData': window.vgaData,
            'ramData': window.ramData,
            'ssdData': window.ssdData,
            'psuData': window.psuData,
            'caseData': window.caseData,
            'cpuCoolerData': window.cpuCoolerData,
            'hddData': window.hddData,
            'monitorData': window.monitorData
        };
        
        // Kiểm tra xem tất cả dữ liệu đã tồn tại chưa
        const allDataLoaded = Object.values(componentsData).every(data => data !== undefined);
        
        if (!allDataLoaded) {
            console.log('Components data not fully loaded, attempting to load from components-data.js');
            
            // Nếu script chưa được tải, thêm vào
            if (!document.querySelector('script[src="./components-data.js"]')) {
                const script = document.createElement('script');
                script.src = './components-data.js';
                script.onload = function() {
                    console.log('components-data.js loaded successfully');
                    // Sau khi tải xong, gọi lại hàm populateDropdowns nếu có
                    if (typeof window.populateDropdowns === 'function') {
                        window.populateDropdowns();
                    }
                };
                document.head.appendChild(script);
            }
        } else {
            console.log('Components data already loaded');
        }
    }
    
    // Sửa lỗi exportToExcel không hoạt động
    function fixExportToExcel() {
        // Đảm bảo window.XLSX tồn tại
        if (typeof XLSX !== 'undefined' && !window.XLSX) {
            window.XLSX = XLSX;
            console.log('Fixed XLSX reference in window object');
        }
        
        // Kiểm tra và đảm bảo nút "Lưu cấu hình" hoạt động
        setTimeout(() => {
            const downloadButton = document.getElementById('download-config');
            if (downloadButton) {
                console.log('Found download-config button, ensuring it works');
                
                // Loại bỏ tất cả event listeners cũ
                const newButton = downloadButton.cloneNode(true);
                downloadButton.parentNode.replaceChild(newButton, downloadButton);
                
                // Thêm event listener mới
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Download config button clicked');
                    
                    // Thu thập dữ liệu cấu hình
                    const configData = collectConfigData();
                    
                    // Xuất ra Excel
                    if (typeof window.exportToExcel === 'function') {
                        window.exportToExcel(configData);
                    } else {
                        console.error('exportToExcel function not found');
                        alert('Chức năng xuất Excel không hoạt động. Vui lòng làm mới trang và thử lại.');
                    }
                });
            }
        }, 2000);
    }
    
    // Kết nối modal handlers
    function connectModalHandlers() {
        // Đảm bảo rằng modal handlers đã được khởi tạo
        if (typeof window.modalHandler !== 'undefined') {
            console.log('Connecting modal handlers');
            
            // Tìm nút mở modal
            const viewDetailButtons = document.querySelectorAll('.view-config-detail, #view-breakdown, #calculate-button');
            viewDetailButtons.forEach(button => {
                if (button) {
                    // Xóa event listeners cũ
                    const newButton = button.cloneNode(true);
                    button.parentNode.replaceChild(newButton, button);
                    
                    newButton.addEventListener('click', function(e) {
                        console.log('View detail button clicked');
                        e.preventDefault();
                        
                        // Hiển thị modal
                        const modal = document.querySelector('.modal');
                        if (modal) {
                            // Thêm dữ liệu vào modal nếu cần
                            updateModalContent(modal);
                            
                            // Hiển thị modal
                            modal.style.display = 'block';
                            
                            // Đảm bảo nút đóng hoạt động
                            window.modalHandler.setupConfigDetailModal();
                        }
                    });
                }
            });
            
            // Kiểm tra xem đã có modal handler chưa
            setTimeout(() => {
                window.modalHandler.setupConfigDetailModal();
            }, 1000);
        } else {
            console.warn('Modal handler not found, will try again later');
            setTimeout(connectModalHandlers, 1000);
        }
    }
    
    // Cập nhật nội dung modal
    function updateModalContent(modal) {
        // Lấy dữ liệu từ bảng chính
        const configData = collectConfigData();
        
        // Tính tổng tiền
        let totalPrice = 0;
        for (const key in configData) {
            if (configData[key] && configData[key].price) {
                totalPrice += configData[key].price;
            }
        }
        
        // Cập nhật tổng tiền
        const totalPriceElement = modal.querySelector('#modal-total-price');
        if (totalPriceElement) {
            totalPriceElement.textContent = `Tổng cộng: ${formatPrice(totalPrice)} VNĐ`;
        }
        
        // Cập nhật danh sách linh kiện
        const componentsList = modal.querySelector('#modal-components-list');
        if (componentsList) {
            // Tạo bảng
            let tableHtml = `
                <table>
                    <thead>
                        <tr>
                            <th>LOẠI</th>
                            <th>HÌNH ẢNH</th>
                            <th>TÊN LINH KIỆN</th>
                            <th>GIÁ TIỀN</th>
                            <th>BẢO HÀNH</th>
                            <th>TÌNH TRẠNG</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            // Component types
            const componentTypes = {
                CPU: 'CPU',
                Mainboard: 'Mainboard',
                RAM: 'RAM',
                VGA: 'VGA',
                SSD: 'SSD',
                PSU: 'Nguồn',
                Case: 'Vỏ case',
                Cooler: 'Tản nhiệt',
                HDD: 'Ổ cứng HDD',
                Monitor: 'Màn hình'
            };
            
            // Thêm các hàng
            for (const key in componentTypes) {
                if (configData[key]) {
                    const component = configData[key];
                    const componentData = getComponentData(key, document.getElementById(key.toLowerCase()).value);
                    
                    tableHtml += `
                        <tr>
                            <td>${componentTypes[key]}</td>
                            <td><img src="${component.image || getComponentImageUrl(key)}" alt="${key}" style="width:50px;height:auto;"></td>
                            <td>${component.name || 'Chưa chọn'}</td>
                            <td>${formatPrice(component.price)} VNĐ</td>
                            <td>${componentData?.warranty || '36T'}</td>
                            <td>${componentData?.condition || 'Mới'}</td>
                        </tr>
                    `;
                }
            }
            
            tableHtml += `
                    </tbody>
                </table>
            `;
            
            componentsList.innerHTML = tableHtml;
        }
    }
    
    // Cải thiện dropdowns
    function enhanceDropdowns() {
        // Đảm bảo rằng khi dropdown thay đổi, data-price được cập nhật
        const dropdowns = document.querySelectorAll('select[id^="cpu"], select[id="mainboard"], select[id="ram"], select[id="vga"], select[id="ssd"], select[id="psu"], select[id="case"], select[id="cpuCooler"]');
        
        dropdowns.forEach(dropdown => {
            // Clone để loại bỏ event listeners cũ
            const newDropdown = dropdown.cloneNode(true);
            dropdown.parentNode.replaceChild(newDropdown, dropdown);
            
            newDropdown.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                if (selectedOption) {
                    // Cập nhật data-price
                    const priceText = selectedOption.getAttribute('data-price') || '0';
                    const price = parseInt(priceText.replace(/\D/g, ''));
                    this.dataset.price = price;
                    
                    console.log(`Updated ${this.id} price to: ${price}`);
                }
            });
        });
    }
    
    // Cải thiện component ID mapping
    function enhanceComponentIDMapping() {
        // Kiểm tra xem hàm autoSelectConfig đã tồn tại chưa
        if (typeof window.autoSelectConfig === 'function') {
            console.log('Enhancing component ID mapping in autoSelectConfig');
            
            const originalAutoSelectConfig = window.autoSelectConfig;
            
            // Override hàm autoSelectConfig
            window.autoSelectConfig = function(gameId, budget, cpuType) {
                console.log('Enhanced autoSelectConfig intercepted:', gameId, budget, cpuType);
                
                // Đảm bảo ID được ánh xạ tới đúng ID trong dropdown
                const result = originalAutoSelectConfig(gameId, budget, cpuType);
                
                // Thêm xử lý sau khi đã chọn cấu hình
                setTimeout(() => {
                    updateDropdownsWithAvailableValues();
                }, 500);
                
                return result;
            };
        } else {
            console.warn('autoSelectConfig not found, will try again later');
            setTimeout(enhanceComponentIDMapping, 1000);
        }
    }
    
    // Cập nhật các dropdown với giá trị có sẵn
    function updateDropdownsWithAvailableValues() {
        const dropdowns = {
            'cpu': document.getElementById('cpu'),
            'mainboard': document.getElementById('mainboard'),
            'ram': document.getElementById('ram'),
            'vga': document.getElementById('vga'),
            'ssd': document.getElementById('ssd'),
            'case': document.getElementById('case'),
            'cpuCooler': document.getElementById('cpuCooler'),
            'psu': document.getElementById('psu')
        };
        
        // Kiểm tra xem dropdown đã có giá trị chưa
        for (const [key, dropdown] of Object.entries(dropdowns)) {
            if (dropdown && !dropdown.value && dropdown.options.length > 0) {
                // Chọn phần tử đầu tiên không phải placeholder
                for (let i = 0; i < dropdown.options.length; i++) {
                    if (dropdown.options[i].value && !dropdown.options[i].value.includes('Chọn')) {
                        dropdown.selectedIndex = i;
                        dropdown.dispatchEvent(new Event('change'));
                        console.log(`Auto-selected first valid option for ${key}: ${dropdown.options[i].text}`);
                        break;
                    }
                }
            }
        }
    }
})();

// Auto-trigger configuration table display when all selections are made
document.addEventListener('DOMContentLoaded', function() {
    // Function to check if all main components are selected
    const checkAllComponentsSelected = () => {
        const requiredComponents = ['cpu', 'mainboard', 'vga', 'ram', 'ssd'];
        let allSelected = true;
        
        for (const component of requiredComponents) {
            const select = document.getElementById(component);
            if (!select || !select.value || select.value === '') {
                allSelected = false;
                break;
            }
        }
        
        return allSelected;
    };
    
    // Function to show the configuration table
    const showConfigTable = () => {
        if (typeof window.showConfigDetailModal === 'function') {
            console.log('All main components selected, auto-triggering config display');
            window.showConfigDetailModal();
        }
    };
    
    // Add event listeners to all component dropdowns
    const componentDropdowns = [
        'cpu', 'mainboard', 'vga', 'ram', 'ssd', 'cpuCooler', 'psu', 'case', 'hdd', 'monitor'
    ];
    
    componentDropdowns.forEach(component => {
        const dropdown = document.getElementById(component);
        if (dropdown) {
            dropdown.addEventListener('change', function() {
                if (checkAllComponentsSelected()) {
                    setTimeout(showConfigTable, 500);
                }
            });
        }
    });
});

// Setup event listener for "XEM CHI TIẾT VÀ ĐÁNH GIÁ" button
document.addEventListener('DOMContentLoaded', function() {
    const calculateButton = document.getElementById('calculate-button');
    const configTable = document.getElementById('config-table');
    
    if (calculateButton && configTable) {
        calculateButton.addEventListener('click', function() {
            // Check if any components are selected
            const componentIds = ['cpu', 'mainboard', 'ram', 'vga', 'ssd', 'cpuCooler', 'psu', 'case', 'hdd', 'monitor'];
            let anyComponentSelected = false;
            
            for (const id of componentIds) {
                const select = document.getElementById(id);
                if (select && select.value) {
                    anyComponentSelected = true;
                    break;
                }
            }
            
            if (anyComponentSelected) {
                // Update the config table images and text
                updateConfigTableImages();
                
                // Show the config table
                configTable.style.display = 'block';
                console.log('Configuration table shown with updated component data');
            } else {
                // No components selected
                alert('Vui lòng chọn ít nhất một linh kiện trước khi xem chi tiết.');
                console.log('No components selected, not showing table');
            }
        });
        
        console.log('✅ Calculate button handler configured to update component images');
    }
    
    // Add event listeners to all component select elements
    const componentIds = ['cpu', 'mainboard', 'ram', 'vga', 'ssd', 'cpuCooler', 'psu', 'case', 'hdd', 'monitor'];
    for (const id of componentIds) {
        const select = document.getElementById(id);
        if (select) {
            select.addEventListener('change', function() {
                if (configTable.style.display === 'block') {
                    // If table is already visible, update it
                    updateConfigTableImages();
                }
                
                // Also update price display
                updateTotalPrice();
            });
        }
    }
}); 