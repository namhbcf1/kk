/**
 * Component Connector - kết nối tất cả các thành phần của trang web
 */

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
    
    // Thu thập dữ liệu cấu hình
    function collectConfigData() {
        const configData = {};
        
        // CPU
        const cpuSelect = document.getElementById('cpu');
        if (cpuSelect && cpuSelect.value) {
            const cpuName = cpuSelect.options[cpuSelect.selectedIndex].text;
            const cpuPrice = parseInt(cpuSelect.dataset.price || 0);
            configData.CPU = {
                name: cpuName,
                price: cpuPrice,
                specs: getCPUSpecs(cpuSelect.value)
            };
        }
        
        // Mainboard
        const mainboardSelect = document.getElementById('mainboard');
        if (mainboardSelect && mainboardSelect.value) {
            const mainboardName = mainboardSelect.options[mainboardSelect.selectedIndex].text;
            const mainboardPrice = parseInt(mainboardSelect.dataset.price || 0);
            configData.Mainboard = {
                name: mainboardName,
                price: mainboardPrice,
                specs: getMainboardSpecs(mainboardSelect.value)
            };
        }
        
        // RAM
        const ramSelect = document.getElementById('ram');
        if (ramSelect && ramSelect.value) {
            const ramName = ramSelect.options[ramSelect.selectedIndex].text;
            const ramPrice = parseInt(ramSelect.dataset.price || 0);
            configData.RAM = {
                name: ramName,
                price: ramPrice,
                specs: getRAMSpecs(ramSelect.value)
            };
        }
        
        // VGA
        const vgaSelect = document.getElementById('vga');
        if (vgaSelect && vgaSelect.value) {
            const vgaName = vgaSelect.options[vgaSelect.selectedIndex].text;
            const vgaPrice = parseInt(vgaSelect.dataset.price || 0);
            configData.VGA = {
                name: vgaName,
                price: vgaPrice,
                specs: getVGASpecs(vgaSelect.value)
            };
        }
        
        // SSD
        const ssdSelect = document.getElementById('ssd');
        if (ssdSelect && ssdSelect.value) {
            const ssdName = ssdSelect.options[ssdSelect.selectedIndex].text;
            const ssdPrice = parseInt(ssdSelect.dataset.price || 0);
            configData.SSD = {
                name: ssdName,
                price: ssdPrice,
                specs: getSSDSpecs(ssdSelect.value)
            };
        }
        
        // PSU
        const psuSelect = document.getElementById('psu');
        if (psuSelect && psuSelect.value) {
            const psuName = psuSelect.options[psuSelect.selectedIndex].text;
            const psuPrice = parseInt(psuSelect.dataset.price || 0);
            configData.PSU = {
                name: psuName,
                price: psuPrice,
                specs: getPSUSpecs(psuSelect.value)
            };
        }
        
        // Case
        const caseSelect = document.getElementById('case');
        if (caseSelect && caseSelect.value) {
            const caseName = caseSelect.options[caseSelect.selectedIndex].text;
            const casePrice = parseInt(caseSelect.dataset.price || 0);
            configData.Case = {
                name: caseName,
                price: casePrice,
                specs: getCaseSpecs(caseSelect.value)
            };
        }
        
        // CPU Cooler
        const coolerSelect = document.getElementById('cpuCooler');
        if (coolerSelect && coolerSelect.value) {
            const coolerName = coolerSelect.options[coolerSelect.selectedIndex].text;
            const coolerPrice = parseInt(coolerSelect.dataset.price || 0);
            configData.Cooler = {
                name: coolerName,
                price: coolerPrice,
                specs: getCoolerSpecs(coolerSelect.value)
            };
        }
        
        console.log('Collected config data:', configData);
        return configData;
    }
    
    // Lấy thông số kỹ thuật các linh kiện
    function getCPUSpecs(cpuId) {
        // Mẫu dữ liệu
        return {
            'Socket': 'AM4',
            'Cores': '6',
            'Threads': '12',
            'Technology': '7nm',
            'RAM Support': 'DDR4',
            'RAM Bus': '3200MHz'
        };
    }
    
    function getMainboardSpecs(mainboardId) {
        return {
            'Loại RAM': 'DDR4',
            'NVMe Slots': '1',
            'PCIe Version': '3.0',
            'Form Factor': 'Micro-ATX',
            'Sockets hỗ trợ': 'AM4'
        };
    }
    
    function getRAMSpecs(ramId) {
        return {
            'Type': 'DDR4',
            'Speed': '3200MHz',
            'Size': '16GB'
        };
    }
    
    function getVGASpecs(vgaId) {
        return {
            'VRAM': '8GB',
            'VRAM Type': 'GDDR6',
            'Card Type': 'NVIDIA'
        };
    }
    
    function getSSDSpecs(ssdId) {
        return {
            'Type': 'NVMe PCIe Gen4 x4',
            'Speed': 'Read 4700MB/s, Write 1900MB/s'
        };
    }
    
    function getPSUSpecs(psuId) {
        return {
            'Power': '750W',
            'Connectors': 'MB: 1x 24-pin, CPU: 1x 8-pin, PCIe: 2x, SATA: 6, Molex: 3'
        };
    }
    
    function getCaseSpecs(caseId) {
        return {
            'Mainboard hỗ trợ': 'ATX, M-ATX, ITX',
            'Kích thước': '410mm x 200mm x 460mm'
        };
    }
    
    function getCoolerSpecs(coolerId) {
        return {
            'Sockets hỗ trợ': 'Intel & AMD',
            'Đèn': 'RGB'
        };
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
            };
            
            // Thêm các hàng
            for (const key in componentTypes) {
                if (configData[key]) {
                    const component = configData[key];
                    const imageUrl = getComponentImageUrl(key);
                    
                    tableHtml += `
                        <tr>
                            <td>${componentTypes[key]}</td>
                            <td><img src="${imageUrl}" alt="${key}" style="width:50px;height:auto;"></td>
                            <td>${component.name || 'Chưa chọn'}</td>
                            <td>${formatPrice(component.price)} VNĐ</td>
                            <td>36T</td>
                            <td>Mới</td>
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
    
    // Định dạng giá tiền
    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    
    // Lấy URL hình ảnh linh kiện (mặc định)
    function getComponentImageUrl(componentType) {
        const defaultImages = {
            CPU: 'images/components/cpu.jpg',
            Mainboard: 'images/components/mainboard.jpg',
            RAM: 'images/components/ram.jpg',
            VGA: 'images/components/vga.jpg',
            SSD: 'images/components/ssd.jpg',
            PSU: 'images/components/psu.jpg',
            Case: 'images/components/case.jpg',
            Cooler: 'images/components/cooler.jpg'
        };
        
        return defaultImages[componentType] || 'images/components/placeholder.jpg';
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