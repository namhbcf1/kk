// Add at the beginning of the file, before other code
// Reduced console logging function
const logger = {
    isDebug: false, // Set to true only in development mode
    log: function(message) {
        if (this.isDebug) {
            console.log(message);
        }
    },
    warn: function(message) {
        if (this.isDebug) {
            console.warn(message);
        }
    },
    error: function(message) {
        // Always log errors
        console.error(message);
    }
};

// Expose the logger globally
window.logger = logger;

// Import dữ liệu linh kiện từ các file riêng lẻ
import {
    cpuData as importedCpuData,
    mainboardData as importedMainboardData,
    vgaData as importedVgaData,
    ramData as importedRamData,
    ssdData as importedSsdData,
    psuData as importedPsuData,
    caseData as importedCaseData,
    cpuCoolerData as importedCpuCoolerData,
    monitorData as importedMonitorData,
    hddData as importedHddData
} from './js/data/index.js';

// Import các cấu hình budget từ module configs
import { getConfig, intelConfigs, amdConfigs } from './js/configs/index.js';

// Add global checkSocketCompatibility function at the beginning of the file
// This ensures it's available everywhere before any other code tries to use it
window.checkSocketCompatibility = function(cpuKey, mainboardKey) {
    // Find or create socket message element
    let socketMessage = document.getElementById('socket-message');
    if (!socketMessage) {
        socketMessage = document.createElement('div');
        socketMessage.id = 'socket-message';
        socketMessage.style.margin = '10px 0';
        socketMessage.style.padding = '10px';
        socketMessage.style.borderRadius = '5px';
        socketMessage.style.display = 'none';
        
        // Insert message after socket info
        const socketInfo = document.getElementById('socket-info');
        if (socketInfo && socketInfo.parentNode) {
            socketInfo.parentNode.insertBefore(socketMessage, socketInfo.nextSibling);
        } else {
            // Or insert at the top of components grid
            const componentsGrid = document.querySelector('.components-grid') || document.querySelector('.component-container');
            if (componentsGrid) {
                componentsGrid.insertBefore(socketMessage, componentsGrid.firstChild);
            }
        }
    }
    
    try {
        if (!cpuKey || !mainboardKey || !window.cpuData[cpuKey] || !window.mainboardData[mainboardKey]) {
            socketMessage.style.display = 'none';
            return false;
        }

        const cpu = window.cpuData[cpuKey];
        const mainboard = window.mainboardData[mainboardKey];
        
        // Get socket information from actual data
        const cpuSocket = cpu.socket || getCPUSocketFromName(cpu.name);
        const mbSocket = mainboard.socket || getMainboardSocketFromName(mainboard.name);
        const mbSockets = mainboard.sockets || [mbSocket]; 
        
        console.log(`Enhanced compatibility check: CPU socket = ${cpuSocket}, Mainboard sockets = ${JSON.stringify(mbSockets)}`);
        
        // Check if CPU socket is supported by mainboard
        const isCompatible = Array.isArray(mbSockets) 
            ? mbSockets.includes(cpuSocket)
            : mbSockets === cpuSocket;
        
        // Update UI based on compatibility
        if (!isCompatible) {
            socketMessage.innerHTML = `<strong>Cảnh báo:</strong> CPU (${cpuSocket}) không tương thích với mainboard (${Array.isArray(mbSockets) ? mbSockets.join(', ') : mbSockets}). Vui lòng chọn lại.`;
            socketMessage.style.display = 'block';
            socketMessage.style.color = '#e74c3c';
            socketMessage.style.backgroundColor = '#fadbd8';
            
            // Debug warning
            console.warn(`Socket incompatibility detected: CPU ${cpuKey} (${cpuSocket}) is not compatible with mainboard ${mainboardKey} (${Array.isArray(mbSockets) ? mbSockets.join(', ') : mbSockets})`);
            
            // Highlight problematic dropdowns
            const cpuDropdown = document.getElementById('cpu');
            const mainboardDropdown = document.getElementById('mainboard');
            
            if (cpuDropdown) cpuDropdown.style.borderColor = '#e74c3c';
            if (mainboardDropdown) mainboardDropdown.style.borderColor = '#e74c3c';
            
            // Disable RAM dropdown if CPU and mainboard are incompatible
            const ramDropdown = document.getElementById('ram');
            if (ramDropdown) {
                ramDropdown.disabled = true;
                ramDropdown.value = '';
            }
            
            return false;
        } else {
            socketMessage.style.display = 'none';
            
            // Remove highlights
            const cpuDropdown = document.getElementById('cpu');
            const mainboardDropdown = document.getElementById('mainboard');
            
            if (cpuDropdown) cpuDropdown.style.borderColor = '';
            if (mainboardDropdown) mainboardDropdown.style.borderColor = '';
            
            // After CPU and mainboard are compatible, update RAM options
            updateRamOptionsBasedOnMainboard(mainboardKey);
            
            return true;
        }
    } catch (error) {
        console.error('Error in enhanced socket compatibility check:', error);
        socketMessage.style.display = 'none';
        return false;
    }
};

// Hàm mới: Lọc tùy chọn RAM dựa trên loại mainboard
function updateRamOptionsBasedOnMainboard(mainboardKey) {
    try {
        const ramDropdown = document.getElementById('ram');
        if (!ramDropdown || !mainboardKey || !window.mainboardData[mainboardKey]) return;
        
        const mainboard = window.mainboardData[mainboardKey];
        const memoryType = mainboard.memoryType; // Lấy loại RAM từ mainboard (DDR3, DDR4, DDR5)
        
        // Không hiển thị thông tin RAM type trên UI nữa
        const socketInfoDiv = document.getElementById('socket-info');
        if (socketInfoDiv) {
            // Đảm bảo hiển thị thông tin socket
            socketInfoDiv.style.display = 'block';
        }
        
        // Đảm bảo RAM dropdown được kích hoạt sau khi chọn mainboard
        if (ramDropdown) {
            ramDropdown.disabled = false;
        }
        
        logger.log(`Updating RAM options based on mainboard ${mainboardKey} with memory type: ${memoryType}`);
        
        // Lưu giá trị RAM hiện tại
        const currentRamValue = ramDropdown.value;
        
        // Xóa tất cả tùy chọn trừ tùy chọn đầu tiên (thường là placeholder)
        const placeholderOption = ramDropdown.options[0];
        ramDropdown.innerHTML = '';
        ramDropdown.appendChild(placeholderOption);
        
        // Biến để kiểm tra xem RAM hiện tại có còn tương thích không
        let currentRamIsCompatible = false;
        
        // Thêm các tùy chọn RAM tương thích
        if (window.ramData) {
            Object.keys(window.ramData).forEach(ramKey => {
                const ram = window.ramData[ramKey];
                
                // Hàm xác định loại RAM tương thích với mainboard
                function determineRamCompatibility(ram, mainboard) {
                    if (!ram || !mainboard) return false;
                    
                    // Xác định loại RAM từ nhiều thông tin
                    let ramType = ram.type || '';
                    const ramName = ram.name || '';
                    
                    // Phát hiện loại RAM từ tên
                    if (!ramType) {
                        // Kiểm tra theo thứ tự ưu tiên
                        if (ramName.includes('DDR5') || 
                            ramName.includes('Bus 6000') || 
                            ramName.includes('Bus 5200') ||
                            ramName.match(/Bus\s*[456]\d00/) || // Hỗ trợ bus từ 4000-6999
                            ramName.includes('TridentZ') && !ramName.includes('DDR4')) {
                            ramType = 'DDR5';
                        }
                        else if (ramName.includes('DDR4') || 
                                ramName.includes('Bus 3200') || 
                                ramName.includes('LPX') || 
                                ramName.includes('Fury') ||
                                ramName.match(/Bus\s*[23]\d00/)) { // Hỗ trợ bus từ 2000-3999
                            ramType = 'DDR4';
                        }
                        else if (ramName.includes('DDR3') || 
                                ramName.includes('1600MHz') || 
                                ramName.match(/Bus\s*1\d00/)) { // Hỗ trợ bus từ 1000-1999
                            ramType = 'DDR3';
                        }
                        else {
                            // Default based on name clues
                            if (ramName.toLowerCase().includes('corsair') && !ramName.includes('Bus')) {
                                ramType = 'DDR4'; // Corsair common RAM is usually DDR4 if not specified
                            } else {
                                // Try to detect from price - newer RAM is more expensive
                                const price = ram.price || 0;
                                if (price > 1000000) ramType = 'DDR5';
                                else if (price > 300000) ramType = 'DDR4';
                                else ramType = 'DDR3';
                            }
                        }
                    }
                    
                    // Xác định loại RAM hỗ trợ bởi mainboard
                    let mbRamType = mainboard.memoryType || '';
                    const mbName = mainboard.name || '';
                    const mbSocket = mainboard.socket || '';
                    
                    // Kiểm tra tên mainboard để xác định loại RAM hỗ trợ
                    if (!mbRamType) {
                        // Xác định rõ ràng từ tên trước tiên
                        if (mbName.includes('DDR5')) {
                            mbRamType = 'DDR5';
                        }
                        else if (mbName.includes('DDR4') || mbName.includes('D4')) {
                            mbRamType = 'DDR4';
                        }
                        else if (mbName.includes('DDR3')) {
                            mbRamType = 'DDR3';
                        }
                        // Xác định từ socket hoặc chipset
                        else if (mbName.includes('B650') || mbName.includes('X670') || mbName.includes('Z790')) {
                            mbRamType = 'DDR5';
                        }
                        else if (mbName.includes('B550') || mbName.includes('X570') || mbName.includes('B450') || 
                                mbName.includes('Z590') || mbName.includes('Z690') && mbName.includes('D4')) {
                            mbRamType = 'DDR4';
                        }
                        else if (mbName.includes('H61') || mbName.includes('H81') || mbName.includes('B85')) {
                            mbRamType = 'DDR3';
                        }
                        // Socket-based detection
                        else if (mbSocket === 'AM5') {
                            mbRamType = 'DDR5';
                        }
                        else if (mbSocket === 'AM4') {
                            mbRamType = 'DDR4';
                        }
                        else if (mbSocket === 'LGA1700') {
                            // LGA1700 supports both DDR4 and DDR5 depending on the model
                            if (mbName.includes('D4')) {
                                mbRamType = 'DDR4';
                            } else {
                                mbRamType = 'DDR5'; // Default to DDR5 for modern Intel boards
                            }
                        }
                        else if (mbSocket === 'LGA1200' || mbSocket === 'LGA1151') {
                            mbRamType = 'DDR4';
                        }
                        else if (mbSocket === 'LGA1150' || mbSocket === 'LGA1155') {
                            mbRamType = 'DDR3';
                        }
                        else {
                            // Default based on chipset clues
                            if (mbName.includes('H610') || mbName.includes('B660') || mbName.includes('Z690')) {
                                if (mbName.includes('D4')) {
                                    mbRamType = 'DDR4';
                                } else {
                                    mbRamType = 'DDR5';
                                }
                            } else if (mbName.includes('H510') || mbName.includes('B560') || mbName.includes('Z590')) {
                                mbRamType = 'DDR4';
                            } else if (mbName.includes('H310') || mbName.includes('B360')) {
                                mbRamType = 'DDR4';
                            } else {
                                mbRamType = 'DDR4'; // Default to DDR4 for most modern boards
                            }
                        }
                    }
                    
                    // Lưu lại loại RAM đã xác định
                    ram.type = ramType;
                    mainboard.memoryType = mbRamType;
                    
                    logger.log(`RAM Compatibility Check: ${ramName} (${ramType}) with ${mbName} (${mbRamType})`);
                    
                    // Nếu không có loại RAM rõ ràng, luôn cho phép chọn
                    if (!mbRamType || !ramType) return true;
                    
                    // Return true để luôn cho phép chọn RAM sau khi đã chọn mainboard
                    // Điều này giúp fix vấn đề người dùng không thể chọn RAM sau khi chọn CPU và mainboard
                    return true;
                }
                
                // Kiểm tra tương thích RAM
                const ramCompatible = determineRamCompatibility(ram, mainboard);
                
                if (ramCompatible) {
                    const option = document.createElement('option');
                    option.value = ramKey;
                    option.text = `${ram.name} - ${formatPrice(ram.price)} VNĐ`;
                    option.dataset.price = ram.price;
                    option.dataset.image = ram.image;
                    ramDropdown.appendChild(option);
                    
                    // Kiểm tra xem RAM hiện tại có còn tương thích không
                    if (ramKey === currentRamValue) {
                        currentRamIsCompatible = true;
                    }
                }
            });
        }
        
        // Nếu RAM hiện tại không tương thích, đặt lại về giá trị placeholder
        if (currentRamValue && !currentRamIsCompatible) {
            logger.log(`Current RAM ${currentRamValue} is not compatible with mainboard ${mainboardKey}, resetting selection`);
            ramDropdown.value = '';
            
            // Hiển thị thông báo cho người dùng
            const message = document.createElement('div');
            message.innerHTML = `<strong>Thông báo:</strong> RAM đã chọn không tương thích với mainboard. Vui lòng chọn RAM ${memoryType}.`;
            message.style.color = '#e74c3c';
            message.style.backgroundColor = '#fadbd8';
            message.style.padding = '10px';
            message.style.borderRadius = '5px';
            message.style.margin = '10px 0';
            
            // Hiển thị thông báo và tự động xóa sau 5 giây
            const container = document.querySelector('.components-grid');
            if (container) {
                container.prepend(message);
                setTimeout(() => {
                    message.remove();
                }, 5000);
            }
        } else if (currentRamValue && currentRamIsCompatible) {
            // Giữ nguyên lựa chọn hiện tại
            ramDropdown.value = currentRamValue;
        }
        
        // Enable RAM dropdown after mainboard is selected
        ramDropdown.disabled = false;
        
        // Update style cho dropdown
        ramDropdown.style.borderColor = ramDropdown.options.length > 1 ? '' : '#e74c3c';
        
        // Thêm label hiển thị loại RAM yêu cầu
        const ramComponentHeader = document.querySelector('.component:has(#ram) .component-header');
        if (ramComponentHeader) {
            // Xóa label cũ nếu có
            const existingLabel = ramComponentHeader.querySelector('.memory-type-label');
            if (existingLabel) {
                existingLabel.remove();
            }
            
            // Thêm label mới
            const memoryTypeLabel = document.createElement('span');
            memoryTypeLabel.className = 'memory-type-label';
            memoryTypeLabel.style.fontSize = '12px';
            memoryTypeLabel.style.marginLeft = '8px';
            memoryTypeLabel.style.padding = '2px 6px';
            memoryTypeLabel.style.borderRadius = '3px';
            memoryTypeLabel.style.backgroundColor = '#f1c40f';
            memoryTypeLabel.style.color = '#000';
            memoryTypeLabel.textContent = memoryType;
            ramComponentHeader.appendChild(memoryTypeLabel);
        }
        
        console.log(`RAM dropdown updated with ${ramDropdown.options.length - 1} compatible options`);
    } catch (error) {
        console.error('Error updating RAM options:', error);
    }
}

// Thêm sự kiện change cho mainboard để cập nhật RAM options
document.addEventListener('DOMContentLoaded', function() {
    const mainboardDropdown = document.getElementById('mainboard');
    const cpuDropdown = document.getElementById('cpu');
    
    if (mainboardDropdown) {
        mainboardDropdown.addEventListener('change', function() {
            if (this.value) {
                console.log('Mainboard changed, updating RAM compatibility');
                updateRamOptionsBasedOnMainboard(this.value);
                
                // Kiểm tra tương thích với CPU đã chọn (nếu có)
                if (cpuDropdown && cpuDropdown.value) {
                    checkSocketCompatibility(cpuDropdown.value, this.value);
                }
                
                // Đảm bảo RAM dropdown được kích hoạt
                const ramDropdown = document.getElementById('ram');
                if (ramDropdown) {
                    ramDropdown.disabled = false;
                }
            }
        });
    }
    
    // Vô hiệu hóa mainboard cho đến khi chọn CPU
    if (mainboardDropdown && cpuDropdown) {
        // Đặt mainboard là disabled ban đầu
        mainboardDropdown.disabled = true;
        
        // Thêm sự kiện cho CPU để kích hoạt mainboard khi đã chọn CPU
        cpuDropdown.addEventListener('change', function() {
            if (this.value) {
                // Kích hoạt mainboard khi đã chọn CPU
                mainboardDropdown.disabled = false;
                
                // Lọc các mainboard tương thích với CPU đã chọn
                filterMainboardsByCpu(this.value);
            } else {
                // Nếu không chọn CPU, vô hiệu hóa mainboard
                mainboardDropdown.disabled = true;
                mainboardDropdown.value = '';
            }
        });
    }
});

// Hàm mới: Lọc các mainboard tương thích với CPU đã chọn
function filterMainboardsByCpu(cpuKey) {
    try {
        const mainboardDropdown = document.getElementById('mainboard');
        if (!mainboardDropdown || !cpuKey || !window.cpuData[cpuKey]) return;
        
        const cpu = window.cpuData[cpuKey];
        const cpuSocket = cpu.socket;
        
        // Hiển thị thông tin socket trên UI
        const socketInfoDiv = document.getElementById('socket-info');
        if (!socketInfoDiv) {
            // Tạo div hiển thị thông tin socket nếu chưa có
            const newSocketInfoDiv = document.createElement('div');
            newSocketInfoDiv.id = 'socket-info';
            newSocketInfoDiv.style.backgroundColor = '#e3f2fd';
            newSocketInfoDiv.style.padding = '10px';
            newSocketInfoDiv.style.borderRadius = '5px';
            newSocketInfoDiv.style.marginBottom = '15px';
            newSocketInfoDiv.style.fontSize = '14px';
            newSocketInfoDiv.style.fontWeight = 'bold';
            
            // Chèn vào trước dòng đầu tiên của component grid
            const componentsGrid = document.querySelector('.components-grid') || document.querySelector('.component-container');
            if (componentsGrid && componentsGrid.firstChild) {
                componentsGrid.insertBefore(newSocketInfoDiv, componentsGrid.firstChild);
            } else if (componentsGrid) {
                componentsGrid.appendChild(newSocketInfoDiv);
            }
        }
        
        // Cập nhật thông tin socket
        const socketInfoDivUpdated = document.getElementById('socket-info');
        if (socketInfoDivUpdated) {
            // Lấy socket từ CPU được chọn
            const detectedCpuSocket = getCPUSocketFromName(cpu.name);
            const finalCpuSocket = cpuSocket || detectedCpuSocket;
            
            // Hiển thị với màu nổi bật - đã xóa phần RAM Type
            socketInfoDivUpdated.innerHTML = `
                <span style="color:#1e88e5; font-weight:bold;">CPU Socket: ${finalCpuSocket}</span> | 
                <span style="color:#43a047; font-weight:bold;">Mainboard Socket: ${finalCpuSocket}</span>
            `;
            
            // Thêm style cho div
            socketInfoDivUpdated.style.backgroundColor = '#e3f2fd';
            socketInfoDivUpdated.style.padding = '15px';
            socketInfoDivUpdated.style.borderRadius = '5px';
            socketInfoDivUpdated.style.margin = '10px 0';
            socketInfoDivUpdated.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            socketInfoDivUpdated.style.fontSize = '16px';
            
            // Đảm bảo hiển thị thông tin socket
            socketInfoDivUpdated.style.display = 'block';
        }
        
        console.log(`Filtering mainboards by CPU socket: ${cpuSocket}`);
        
        // Lưu giá trị mainboard hiện tại
        const currentMainboardValue = mainboardDropdown.value;
        
        // Xóa tất cả tùy chọn trừ tùy chọn đầu tiên (thường là placeholder)
        const placeholderOption = mainboardDropdown.options[0];
        mainboardDropdown.innerHTML = '';
        mainboardDropdown.appendChild(placeholderOption);
        
        // Biến để kiểm tra xem mainboard hiện tại có còn tương thích không
        let currentMainboardIsCompatible = false;
        
        // Thêm các tùy chọn mainboard tương thích
        if (window.mainboardData) {
            Object.keys(window.mainboardData).forEach(mainboardKey => {
                const mainboard = window.mainboardData[mainboardKey];
                const mbSockets = mainboard.sockets || [mainboard.socket];
                
                // Kiểm tra tương thích nghiêm ngặt dựa trên socket chính xác
                let isCompatible = false;
                
                // Hàm tự tạo xác định tương thích giữa CPU và mainboard
                function determineCpuMainboardCompatibility(cpu, mainboard) {
                    // Đảm bảo có dữ liệu
                    if (!cpu || !mainboard) return false;
                    
                    // Xác định socket CPU
                    let cpuSocket = cpu.socket;
                    if (!cpuSocket && cpu.name) {
                        cpuSocket = getCPUSocketFromName(cpu.name);
                    }
                    
                    // Xác định socket mainboard
                    let mbSocket = mainboard.socket;
                    if (!mbSocket && mainboard.name) {
                        mbSocket = getMainboardSocketFromName(mainboard.name);
                    }
                    
                    // Xử lý trường hợp mainboard hỗ trợ nhiều socket
                    const mbSockets = mainboard.sockets || [mbSocket];
                    
                    // Lưu socket vào đối tượng để sử dụng sau này
                    cpu.socket = cpuSocket;
                    mainboard.socket = mbSocket;
                    
                    // Kiểm tra tương thích
                    if (!cpuSocket || !mbSocket) return false;
                    
                    // Đặc biệt kiểm tra CPU Ryzen 5/7/9 cho socket AM5
                    if (cpu.name.includes('Ryzen') && 
                        (cpu.name.includes('7500f') || cpu.name.includes('7600') || cpu.name.includes('7700') || 
                         cpu.name.includes('7800') || cpu.name.includes('7900') || cpu.name.includes('7950') ||
                         cpu.name.includes('9600') || cpu.name.includes('9700') || cpu.name.includes('9800') || 
                         cpu.name.includes('9900') || cpu.name.includes('9950'))) {
                        
                        // Các CPU này cần mainboard AM5
                        const isCompatible = mbSocket === 'AM5' || mbSockets.includes('AM5');
                        console.log(`AMD Ryzen 7000/9000 series CPU (${cpu.name}) compatibility with ${mainboard.name}: ${isCompatible ? 'Compatible (AM5)' : 'Not compatible (requires AM5)'}`);
                        return isCompatible;
                    }
                    
                    // Kiểm tra tương thích CPU Ryzen 3/5/7/9 thế hệ 3000-5000 với mainboard AM4
                    if (cpu.name.includes('Ryzen') && 
                        (cpu.name.includes('3600') || cpu.name.includes('3700') || cpu.name.includes('3800') || 
                         cpu.name.includes('3900') || cpu.name.includes('5600') || cpu.name.includes('5700') || 
                         cpu.name.includes('5800') || cpu.name.includes('5900') || cpu.name.includes('5950'))) {
                        
                        // Các CPU này cần mainboard AM4
                        const isCompatible = mbSocket === 'AM4' || mbSockets.includes('AM4');
                        console.log(`AMD Ryzen 3000-5000 series CPU (${cpu.name}) compatibility with ${mainboard.name}: ${isCompatible ? 'Compatible (AM4)' : 'Not compatible (requires AM4)'}`);
                        return isCompatible;
                    }
                    
                    // Kiểm tra tương thích CPU Intel 12/13/14th Gen với mainboard LGA1700
                    if ((cpu.name.includes('Intel') || cpu.name.includes('Core i')) && 
                        (cpu.name.includes('12') || cpu.name.includes('13') || cpu.name.includes('14') || 
                         cpu.name.includes('12100') || cpu.name.includes('12400') || cpu.name.includes('12600') || 
                         cpu.name.includes('12700') || cpu.name.includes('12900') || cpu.name.includes('13100') || 
                         cpu.name.includes('13400') || cpu.name.includes('13600') || cpu.name.includes('13700') || 
                         cpu.name.includes('13900') || cpu.name.includes('14100') || cpu.name.includes('14400') ||
                         cpu.name.includes('14600') || cpu.name.includes('14700') || cpu.name.includes('14900'))) {
                        
                        // Các CPU này cần mainboard LGA1700
                        const isCompatible = mbSocket === 'LGA1700' || mbSockets.includes('LGA1700');
                        console.log(`Intel 12-14th Gen CPU (${cpu.name}) compatibility with ${mainboard.name}: ${isCompatible ? 'Compatible (LGA1700)' : 'Not compatible (requires LGA1700)'}`);
                        return isCompatible;
                    }
                    
                    // Kiểm tra tương thích CPU Intel 10/11th Gen với mainboard LGA1200
                    if ((cpu.name.includes('Intel') || cpu.name.includes('Core i')) && 
                        (cpu.name.includes('10') || cpu.name.includes('11') || 
                         cpu.name.includes('10100') || cpu.name.includes('10400') || cpu.name.includes('10600') || 
                         cpu.name.includes('10700') || cpu.name.includes('10900') || cpu.name.includes('11100') || 
                         cpu.name.includes('11400') || cpu.name.includes('11600') || cpu.name.includes('11700') || 
                         cpu.name.includes('11900'))) {
                        
                        // Các CPU này cần mainboard LGA1200
                        const isCompatible = mbSocket === 'LGA1200' || mbSockets.includes('LGA1200');
                        console.log(`Intel 10-11th Gen CPU (${cpu.name}) compatibility with ${mainboard.name}: ${isCompatible ? 'Compatible (LGA1200)' : 'Not compatible (requires LGA1200)'}`);
                        return isCompatible;
                    }
                    
                    // Kiểm tra tương thích CPU Intel 8/9th Gen với mainboard LGA1151
                    if ((cpu.name.includes('Intel') || cpu.name.includes('Core i')) && 
                        (cpu.name.includes('8') || cpu.name.includes('9') || 
                         cpu.name.includes('8100') || cpu.name.includes('8400') || cpu.name.includes('8600') || 
                         cpu.name.includes('8700') || cpu.name.includes('9100') || cpu.name.includes('9400') || 
                         cpu.name.includes('9600') || cpu.name.includes('9700') || cpu.name.includes('9900'))) {
                        
                        // Các CPU này cần mainboard LGA1151 300-series
                        const isCompatible = mbSocket === 'LGA1151' || mbSockets.includes('LGA1151');
                        console.log(`Intel 8-9th Gen CPU (${cpu.name}) compatibility with ${mainboard.name}: ${isCompatible ? 'Compatible (LGA1151)' : 'Not compatible (requires LGA1151)'}`);
                        return isCompatible;
                    }
                    
                    // Kiểm tra tương thích CPU Intel 6/7th Gen với mainboard LGA1151
                    if ((cpu.name.includes('Intel') || cpu.name.includes('Core i')) && 
                        (cpu.name.includes('6') || cpu.name.includes('7') || 
                         cpu.name.includes('6100') || cpu.name.includes('6400') || cpu.name.includes('6500') || 
                         cpu.name.includes('6600') || cpu.name.includes('6700') || cpu.name.includes('7100') || 
                         cpu.name.includes('7400') || cpu.name.includes('7600') || cpu.name.includes('7700'))) {
                        
                        // Các CPU này cần mainboard LGA1151 100/200-series
                        const isCompatible = mbSocket === 'LGA1151' || mbSockets.includes('LGA1151');
                        console.log(`Intel 6-7th Gen CPU (${cpu.name}) compatibility with ${mainboard.name}: ${isCompatible ? 'Compatible (LGA1151)' : 'Not compatible (requires LGA1151)'}`);
                        return isCompatible;
                    }
                    
                    // Kiểm tra tương thích chung
                    let isCompatible = false;
                    if (Array.isArray(mbSockets)) {
                        isCompatible = mbSockets.includes(cpuSocket);
                    } else {
                        isCompatible = mbSocket === cpuSocket;
                    }
                    
                    console.log(`General CPU-Mainboard compatibility check: ${cpu.name} (${cpuSocket}) with ${mainboard.name} (${mbSocket}): ${isCompatible ? 'Compatible' : 'Not compatible'}`);
                    return isCompatible;
                }
                
                // Xác định tương thích
                isCompatible = determineCpuMainboardCompatibility(cpu, mainboard);
                
                console.log(`Compatibility check for ${cpu.name} (${cpuSocket}) with ${mainboard.name}: ${isCompatible ? 'Compatible' : 'Not compatible'}`);
                
                if (isCompatible) {
                    const option = document.createElement('option');
                    option.value = mainboardKey;
                    option.text = `${mainboard.name} - ${formatPrice(mainboard.price)} VNĐ`;
                    option.dataset.price = mainboard.price;
                    option.dataset.image = mainboard.image;
                    mainboardDropdown.appendChild(option);
                    
                    // Kiểm tra xem mainboard hiện tại có còn tương thích không
                    if (mainboardKey === currentMainboardValue) {
                        currentMainboardIsCompatible = true;
                    }
                }
            });
        }
        
        // Enable mainboard after CPU is selected
        mainboardDropdown.disabled = false;
        
        // Nếu mainboard hiện tại không tương thích, đặt lại về giá trị placeholder
        if (currentMainboardValue && !currentMainboardIsCompatible) {
            console.log(`Current mainboard ${currentMainboardValue} is not compatible with CPU ${cpuKey}, resetting selection`);
            mainboardDropdown.value = '';
            
            // Reset RAM selection since mainboard is reset
            const ramDropdown = document.getElementById('ram');
            if (ramDropdown) {
                ramDropdown.value = '';
                ramDropdown.disabled = true;
            }
            
            // Hiển thị thông báo cho người dùng
            const message = document.createElement('div');
            message.innerHTML = `<strong>Thông báo:</strong> Mainboard đã chọn không tương thích với CPU socket ${cpuSocket}. Vui lòng chọn lại.`;
            message.style.color = '#e74c3c';
            message.style.backgroundColor = '#fadbd8';
            message.style.padding = '10px';
            message.style.borderRadius = '5px';
            message.style.margin = '10px 0';
            
            // Hiển thị thông báo và tự động xóa sau 5 giây
            const container = document.querySelector('.components-grid');
            if (container) {
                container.prepend(message);
                setTimeout(() => {
                    message.remove();
                }, 5000);
            }
        } else if (currentMainboardValue && currentMainboardIsCompatible) {
            // Giữ nguyên lựa chọn hiện tại
            mainboardDropdown.value = currentMainboardValue;
            
            // Update RAM options
            updateRamOptionsBasedOnMainboard(currentMainboardValue);
        }
        
        // Update style cho dropdown
        mainboardDropdown.style.borderColor = mainboardDropdown.options.length > 1 ? '' : '#e74c3c';
        
        // Thêm label hiển thị socket yêu cầu
        const mainboardComponentHeader = document.querySelector('.component:has(#mainboard) .component-header');
        if (mainboardComponentHeader) {
            // Xóa label cũ nếu có
            const existingLabel = mainboardComponentHeader.querySelector('.socket-type-label');
            if (existingLabel) {
                existingLabel.remove();
            }
            
            // Thêm label mới
            const socketTypeLabel = document.createElement('span');
            socketTypeLabel.className = 'socket-type-label';
            socketTypeLabel.style.fontSize = '12px';
            socketTypeLabel.style.marginLeft = '8px';
            socketTypeLabel.style.padding = '2px 6px';
            socketTypeLabel.style.borderRadius = '3px';
            socketTypeLabel.style.backgroundColor = '#2ecc71';
            socketTypeLabel.style.color = '#fff';
            socketTypeLabel.textContent = cpuSocket;
            mainboardComponentHeader.appendChild(socketTypeLabel);
        }
        
        console.log(`Mainboard dropdown updated with ${mainboardDropdown.options.length - 1} compatible options`);
    } catch (error) {
        console.error('Error filtering mainboards by CPU:', error);
    }
}

// Kết hợp dữ liệu từ import và dữ liệu từ components-data.js nếu có
const cpuData = window.cpuData || importedCpuData || {};
const mainboardData = window.mainboardData || importedMainboardData || {};
const vgaData = window.vgaData || importedVgaData || {};
const ramData = window.ramData || importedRamData || {};
const ssdData = window.ssdData || importedSsdData || {};
const psuData = window.psuData || importedPsuData || {};
const caseData = window.caseData || importedCaseData || {};
const cpuCoolerData = window.cpuCoolerData || importedCpuCoolerData || {};
const hddData = window.hddData || importedHddData || {};
const monitorData = window.monitorData || importedMonitorData || {};

// Chia sẻ dữ liệu toàn cục nếu không có sẵn
if (!window.cpuData) window.cpuData = cpuData;
if (!window.mainboardData) window.mainboardData = mainboardData;
if (!window.vgaData) window.vgaData = vgaData;
if (!window.ramData) window.ramData = ramData;
if (!window.ssdData) window.ssdData = ssdData;
if (!window.psuData) window.psuData = psuData;
if (!window.caseData) window.caseData = caseData;
if (!window.cpuCoolerData) window.cpuCoolerData = cpuCoolerData;
if (!window.hddData) window.hddData = hddData;
if (!window.monitorData) window.monitorData = monitorData;

// Add image error handling function globally
window.handleImageError = function(img, componentType) {
    // Kiểm tra xem hình ảnh đã được xử lý lỗi chưa
    if (img.dataset.errorHandled === 'true') return true;
    
    // Đánh dấu hình ảnh đã được xử lý lỗi
    img.dataset.errorHandled = 'true';
    
    // Determine component type if not provided
    if (!componentType) {
        componentType = img.dataset.componentType || 
                        img.getAttribute('alt') || 
                        'component';
    }

    // Define background colors for different component types
    const bgColors = {
        'cpu': '#3498db',
        'mainboard': '#2ecc71',
        'vga': '#e74c3c',
        'ram': '#f39c12',
        'ssd': '#9b59b6',
        'hdd': '#34495e',
        'case': '#1abc9c',
        'psu': '#d35400',
        'cpuCooler': '#7f8c8d',
        'cpucooler': '#7f8c8d',
        'monitor': '#2c3e50',
        'component': '#95a5a6'
    };

    // Get component type in lowercase for matching
    const type = componentType.toLowerCase();
    
    // Find the appropriate color
    let bgColor = '#333';
    for (const [key, color] of Object.entries(bgColors)) {
        if (type.includes(key.toLowerCase())) {
            bgColor = color;
            break;
        }
    }

    // Sử dụng một canvas cache toàn cục để tránh tạo quá nhiều canvas
    if (!window.canvasCache) window.canvasCache = {};
    
    // Tạo key cache dựa trên loại component và màu nền
    const cacheKey = `${type}_${bgColor}`;
    
    // Sử dụng cache nếu có thể
    if (window.canvasCache[cacheKey]) {
        img.src = window.canvasCache[cacheKey];
        return true;
    }

    // Create a canvas for the fallback image
    const canvas = document.createElement('canvas');
    canvas.width = 70;
    canvas.height = 70;
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw component icon - simplified icon based on component type
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    
    if (type.includes('cpu')) {
        // CPU - square with cutout corner
        ctx.fillRect(15, 15, 40, 40);
        ctx.fillStyle = bgColor;
        ctx.fillRect(45, 45, 10, 10);
    } 
    else if (type.includes('main') || type.includes('board')) {
        // Mainboard - rectangle with smaller rectangles
        ctx.fillRect(10, 10, 50, 50);
        ctx.fillStyle = bgColor;
        ctx.fillRect(15, 15, 15, 15);
        ctx.fillRect(40, 15, 15, 15);
        ctx.fillRect(15, 40, 15, 15);
        ctx.fillRect(40, 40, 15, 15);
    }
    else if (type.includes('vga') || type.includes('card')) {
        // GPU - long rectangle with fans
        ctx.fillRect(10, 25, 50, 20);
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.arc(25, 35, 7, 0, Math.PI * 2);
        ctx.arc(45, 35, 7, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (type.includes('ram')) {
        // RAM - thin rectangle
        ctx.fillRect(15, 15, 40, 10);
        ctx.fillRect(15, 35, 40, 10);
        ctx.fillRect(15, 55, 40, 10);
    }
    else if (type.includes('ssd') || type.includes('hdd')) {
        // Storage - rectangle with line
        ctx.fillRect(15, 15, 40, 40);
        ctx.fillStyle = bgColor;
        ctx.fillRect(25, 25, 20, 20);
    }
    else if (type.includes('cool')) {
        // CPU Cooler - fan shape
        ctx.beginPath();
        ctx.arc(35, 35, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.arc(35, 35, 7, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (type.includes('case')) {
        // Case - case shape
        ctx.fillRect(15, 10, 40, 50);
        ctx.fillStyle = bgColor;
        ctx.fillRect(20, 15, 30, 7);
    }
    else if (type.includes('psu') || type.includes('power')) {
        // PSU - square with cables
        ctx.fillRect(15, 15, 40, 40);
        ctx.fillStyle = bgColor;
        ctx.fillRect(55, 20, 5, 5);
        ctx.fillRect(55, 35, 5, 5);
        ctx.fillRect(55, 50, 5, 5);
    }
    else if (type.includes('monitor')) {
        // Monitor - monitor shape
        ctx.fillRect(10, 15, 50, 30);
        ctx.fillRect(25, 45, 20, 10);
    }
    else {
        // Default - just draw text
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const displayText = componentType.length > 8 
            ? componentType.substring(0, 8) 
            : componentType;
        ctx.fillText(displayText, canvas.width/2, canvas.height/2);
    }

    // Add text with component type
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const displayText = componentType.length > 10 
        ? componentType.substring(0, 10) 
        : componentType;
    ctx.fillText(displayText, canvas.width/2, canvas.height - 5);

    // Save to canvas cache
    const dataUrl = canvas.toDataURL('image/png');
    window.canvasCache[cacheKey] = dataUrl;
    
    // Replace the img src with the canvas data
    img.src = dataUrl;

    // Prevent further error handling
    img.onerror = null;
    
    return true;
};

// Đảm bảo các biến đánh giá hiệu năng là biến toàn cục - Fix cho Chrome

// Define GAME_FPS_ESTIMATES object

const components = {
    cpu: cpuData,
    mainboard: mainboardData,
    vga: vgaData,
    ram: ramData,
    ssd: ssdData,
    psu: psuData,
    case: caseData,
    cpuCooler: cpuCoolerData,
    hdd: hddData,
    monitor: monitorData
};

// Khai báo biến toàn cục
let isAutoSelecting = false;

// Add event listener for the game-genre dropdown as soon as the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const gameGenreDropdown = document.getElementById('game-genre');
    if (gameGenreDropdown) {
        gameGenreDropdown.addEventListener('change', function() {
            console.log("🎮 Game genre changed to:", this.value);
            console.log("Calling autoSelectConfig after game change");
            // Call the debug function first
            debugSelections();
            // Then try to auto-select with proper parameters
            const gameId = document.getElementById("game-genre").value;
            const budget = parseInt(document.getElementById("budget-range").value);
            const cpuType = document.getElementById("cpu-type").value;
            
            // Check if we have all required values
            if (gameId && cpuType && !isNaN(budget)) {
                console.log(`Auto-selecting config after game change: game=${gameId}, budget=${budget}, cpu=${cpuType}`);
                
                // Auto-select configuration
                autoSelectConfig(gameId, budget, cpuType);
                
                // Only show table if user hasn't manually closed it
                if (!window.userClosedConfigModal) {
                    setTimeout(() => {
                        if (typeof showConfigDetailModal === 'function') {
                            console.log('Showing configuration table after game change');
                            showConfigDetailModal();
                        }
                    }, 500);
                }
            }
        });
        console.log("✅ Successfully attached event listener to game-genre dropdown");
    } else {
        console.error("❌ Could not find game-genre dropdown on page load");
    }
    
    // Add event listener for CPU type change
    const cpuTypeDropdown = document.getElementById('cpu-type');
    if (cpuTypeDropdown) {
        cpuTypeDropdown.addEventListener('change', function() {
            console.log("🔄 CPU type changed to:", this.value);
            
            // Update body attributes
            document.body.setAttribute('data-selected-cpu-type', this.value);
            document.body.setAttribute('data-current-cpu-type', this.value);
            
            // Update body classes
            document.body.classList.remove('intel-mode', 'amd-mode');
            document.body.classList.add(this.value.toLowerCase() + '-mode');
            
            // Update localStorage
            localStorage.setItem('selectedCpuType', this.value);
            
            // Update visual indicators
            const intelOption = document.getElementById('intel-option');
            const amdOption = document.getElementById('amd-option');
            
            if (this.value === 'Intel') {
                intelOption?.classList.add('selected');
                amdOption?.classList.remove('selected');
            } else {
                amdOption?.classList.add('selected');
                intelOption?.classList.remove('selected');
            }
            
            // Update permanent indicator
            const existingIndicator = document.getElementById('permanent-cpu-indicator');
            if (existingIndicator) {
                existingIndicator.textContent = `${this.value.toUpperCase()} MODE`;
                existingIndicator.style.backgroundColor = this.value === 'Intel' ? '#0071c5' : '#ED1C24';
            } else {
                // Create new indicator if not exists
                const cpuIndicator = document.createElement('div');
                cpuIndicator.style.position = 'fixed';
                cpuIndicator.style.bottom = '20px';
                cpuIndicator.style.right = '20px';
                cpuIndicator.style.padding = '15px 20px';
                cpuIndicator.style.backgroundColor = this.value === 'Intel' ? '#0071c5' : '#ED1C24';
                cpuIndicator.style.color = 'white';
                cpuIndicator.style.fontWeight = 'bold';
                cpuIndicator.style.fontSize = '18px';
                cpuIndicator.style.zIndex = '10000';
                cpuIndicator.style.borderRadius = '5px';
                cpuIndicator.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
                cpuIndicator.id = 'permanent-cpu-indicator';
                cpuIndicator.textContent = `${this.value.toUpperCase()} MODE`;
                document.body.appendChild(cpuIndicator);
            }
            
            // Add flash effect to show the change
            const flashEffect = document.createElement('div');
            flashEffect.style.position = 'fixed';
            flashEffect.style.top = '0';
            flashEffect.style.left = '0';
            flashEffect.style.width = '100%';
            flashEffect.style.height = '100%';
            flashEffect.style.backgroundColor = this.value === 'Intel' ? 'rgba(0, 113, 197, 0.2)' : 'rgba(237, 28, 36, 0.2)';
            flashEffect.style.zIndex = '9998';
            flashEffect.style.opacity = '0.8';
            flashEffect.style.pointerEvents = 'none';
            flashEffect.id = 'cpu-type-flash-effect';
            
            document.body.appendChild(flashEffect);
            setTimeout(() => {
                if (document.getElementById('cpu-type-flash-effect')) {
                    document.getElementById('cpu-type-flash-effect').style.opacity = '0';
                    setTimeout(() => {
                        document.getElementById('cpu-type-flash-effect')?.remove();
                    }, 500);
                }
            }, 300);
            
            // Check if we should auto-select based on current values
            debugSelections();
            
            // Only auto-select if we have game and budget
            const gameId = document.getElementById("game-genre")?.value;
            const budget = parseInt(document.getElementById("budget-range")?.value);
            if (gameId && !isNaN(budget)) {
                console.log("Auto-selecting config after CPU type change");
                autoSelectConfig(gameId, budget, this.value);
                
                // Only show table if user hasn't manually closed it
                if (!window.userClosedConfigModal) {
                    setTimeout(() => {
                        if (typeof showConfigDetailModal === 'function') {
                            console.log('Showing configuration table after CPU type change');
                            showConfigDetailModal();
                        }
                    }, 500);
                }
            } else {
                console.log("Not auto-selecting because game or budget is missing");
            }
        });
        console.log("✅ Successfully attached event listener to CPU type dropdown");
    } else {
        console.error("❌ Could not find CPU type dropdown on page load");
    }
    
    // Debug function to check all necessary selections
    window.debugSelections = function() {
        console.log("--------- DEBUG SELECTIONS ---------");
        const gameDropdown = document.getElementById('game-genre');
        const budgetRange = document.getElementById('budget-range');
        const cpuTypeDropdown = document.getElementById('cpu-type');
        
        console.log("Elements found:");
        console.log("- Game dropdown:", gameDropdown ? "✅" : "❌");
        console.log("- Budget range:", budgetRange ? "✅" : "❌");
        console.log("- CPU type dropdown:", cpuTypeDropdown ? "✅" : "❌");
        
        if (gameDropdown && budgetRange && cpuTypeDropdown) {
            console.log("Current values:");
            console.log("- Game:", gameDropdown.value || "not selected");
            console.log("- Budget:", budgetRange.value ? `${parseInt(budgetRange.value)/1000000}M` : "not set");
            console.log("- CPU type:", cpuTypeDropdown.value || "not selected");
            
            // Check if all values are valid for auto-selection
            const gameValid = gameDropdown.value && gameDropdown.value.trim() !== "";
            const budgetValid = budgetRange.value && !isNaN(parseInt(budgetRange.value));
            const cpuTypeValid = cpuTypeDropdown.value && cpuTypeDropdown.value.trim() !== "";
            
            console.log("Values valid for auto-selection:");
            console.log("- Game:", gameValid ? "✅" : "❌");
            console.log("- Budget:", budgetValid ? "✅" : "❌");
            console.log("- CPU type:", cpuTypeValid ? "✅" : "❌");
            
            if (gameValid && budgetValid && cpuTypeValid) {
                console.log("✅ All values are valid for auto-selection");
                
                // Check if configuration exists
                const cpuType = cpuTypeDropdown.value.trim();
                const game = gameDropdown.value.trim();
                const budgetInMillions = parseInt(budgetRange.value) / 1000000;
                
                // Check in configs
                let configExists = false;
                if (cpuType === 'Intel' && intelConfigs[game]) {
                    const budgetKey = `${budgetInMillions}M`;
                    if (intelConfigs[game][budgetKey]) {
                        configExists = true;
                        console.log(`✅ Configuration found for Intel, ${game}, ${budgetKey}`);
                    } else {
                        console.log(`❌ No configuration found for Intel, ${game}, ${budgetKey}`);
                        console.log("Available budgets:", Object.keys(intelConfigs[game]));
                    }
                } else if (cpuType === 'Amd' && amdConfigs[game]) {
                    const budgetKey = `${budgetInMillions}M`;
                    if (amdConfigs[game][budgetKey]) {
                        configExists = true;
                        console.log(`✅ Configuration found for AMD, ${game}, ${budgetKey}`);
                    } else {
                        console.log(`❌ No configuration found for AMD, ${game}, ${budgetKey}`);
                        console.log("Available budgets:", Object.keys(amdConfigs[game]));
                    }
                } else {
                    console.log(`❌ No configurations found for ${cpuType}, ${game}`);
                    if (cpuType === 'Intel') {
                        console.log("Available Intel games:", Object.keys(intelConfigs));
                    } else if (cpuType === 'Amd') {
                        console.log("Available AMD games:", Object.keys(amdConfigs));
                    }
                }
            } else {
                console.log("❌ Some values are not valid for auto-selection");
            }
        }
        console.log("-------- END DEBUG --------");
    };
});

// Fallback function for images that fail to load
function handleImageError(img) {
    // Set a default color based on component type
    const componentType = img.dataset.componentType || 'default';
    const bgColors = {
        cpu: '#3498db',
        mainboard: '#2ecc71',
        vga: '#e74c3c',
        ram: '#f39c12',
        ssd: '#9b59b6',
        hdd: '#34495e',
        case: '#1abc9c',
        psu: '#d35400',
        cpuCooler: '#7f8c8d',
        monitor: '#2c3e50',
        default: '#95a5a6'
    };
    
    // Create a canvas to use as the img src
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = bgColors[componentType];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(img.alt || componentType, canvas.width/2, canvas.height/2);
    
    // Replace the img src with the canvas data
    img.src = canvas.toDataURL('image/png');
    
    // Prevent further error handling
    img.onerror = null;
}

// Giả sử các dữ liệu components đã được định nghĩa đầy đủ




document.addEventListener('DOMContentLoaded', function () {
    // Initialize userClosedConfigModal to false
    window.userClosedConfigModal = false;
    
    // Add event listeners to reset the closed state when components change
    const componentDropdowns = [
        'cpu', 'mainboard', 'vga', 'ram', 'ssd', 'cpuCooler', 'psu', 'case', 'hdd', 'monitor'
    ];
    
    componentDropdowns.forEach(id => {
        const dropdown = document.getElementById(id);
        if (dropdown) {
            dropdown.addEventListener('change', function() {
                // When a new component is selected, allow modal to show again
                window.userClosedConfigModal = false;
                console.log(`Component ${id} changed, resetting modal closed state`);
            });
        }
    });
    
    // Add listeners for game, budget, and CPU type changes
    const gameDropdown = document.getElementById('game-genre');
    const budgetRange = document.getElementById('budget-range');
    const cpuType = document.getElementById('cpu-type');
    
    if (gameDropdown) {
        gameDropdown.addEventListener('change', function() {
            window.userClosedConfigModal = false;
            console.log('Game changed, resetting modal closed state');
        });
    }
    
    if (budgetRange) {
        budgetRange.addEventListener('change', function() {
            window.userClosedConfigModal = false;
            console.log('Budget changed, resetting modal closed state');
        });
    }
    
    if (cpuType) {
        cpuType.addEventListener('change', function() {
            window.userClosedConfigModal = false;
            console.log('CPU type changed, resetting modal closed state');
        });
    }
    
    // Add global image error handler for all images in the document
    function setupImageErrorHandlers() {
        document.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('data-error-handler-attached')) {
                img.setAttribute('data-error-handler-attached', 'true');
                img.onerror = function() {
                    window.handleImageError(this);
                    return true;
                };
            }
        });
        
        // Use MutationObserver to handle dynamically added images
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // ELEMENT_NODE
                            const images = node.querySelectorAll('img');
                            images.forEach(img => {
                                if (!img.hasAttribute('data-error-handler-attached')) {
                                    img.setAttribute('data-error-handler-attached', 'true');
                                    img.onerror = function() {
                                        window.handleImageError(this);
                                        return true;
                                    };
                                }
                            });
                            
                            // Check if the node itself is an image
                            if (node.tagName === 'IMG' && !node.hasAttribute('data-error-handler-attached')) {
                                node.setAttribute('data-error-handler-attached', 'true');
                                node.onerror = function() {
                                    window.handleImageError(this);
                                    return true;
                                };
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('Global image error handlers have been set up');
    }
    
    // Call the setup function when the page loads
    setupImageErrorHandlers();
    
    document.getElementById("budget-range").addEventListener("input", function () {
        let value = parseInt(this.value);
        let formattedValue = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
        document.getElementById("budget-value").innerText = formattedValue.replace("₫", "") + " triệu";
    });

    // Add event handler for budget-range change event
    document.getElementById("budget-range").addEventListener("change", function() {
        console.log("Budget changed to:", this.value);
        
        // Get current selections
        const gameId = document.getElementById("game-genre").value;
        const cpuType = document.getElementById("cpu-type").value;
        const budget = parseInt(this.value);
        
        // Only auto-select if we have all required values
        if (gameId && cpuType && !isNaN(budget)) {
            console.log(`Auto-selecting config after budget change: game=${gameId}, budget=${budget}, cpu=${cpuType}`);
            
            // Auto-select configuration
            autoSelectConfig(gameId, budget, cpuType);
            
            // Only show table if user hasn't manually closed it
            if (!window.userClosedConfigModal) {
                setTimeout(() => {
                    if (typeof showConfigDetailModal === 'function') {
                        console.log('Showing configuration table after budget change');
                        showConfigDetailModal();
                    }
                }, 500);
            }
        }
    });
    
    // Khai báo các phần tử DOM
    const componentSelects = {
        cpu: document.getElementById('cpu'),
        mainboard: document.getElementById('mainboard'),
        vga: document.getElementById('vga'),
        ram: document.getElementById('ram'),
        ssd: document.getElementById('ssd'),
        psu: document.getElementById('psu'),
        case: document.getElementById('case'),
        cpuCooler: document.getElementById('cpuCooler'),
        hdd: document.getElementById('hdd'),     // <-- Đảm bảo có dòng này
        monitor: document.getElementById('monitor')    // <-- Đảm bảo có dòng này
    };
    Object.entries(componentSelects).forEach(([name, element]) => {
        if (!element) {
            console.error(`Không tìm thấy phần tử #${name}`);
        }
    });
    populateDropdowns('cpu', 'cpu', cpuData);
    populateDropdowns('mainboard', 'mainboard', mainboardData);
    populateDropdowns('vga', 'vga', vgaData);
    populateDropdowns('ram', 'ram', ramData);
    populateDropdowns('ssd', 'ssd', ssdData);
    populateDropdowns('psu', 'psu', psuData);
    populateDropdowns('case', 'case', caseData);
    populateDropdowns('cpuCooler', 'cpuCooler', cpuCoolerData);
    populateDropdowns('hdd', 'hdd', hddData);     // <-- Đảm bảo có dòng này
    populateDropdowns('monitor', 'monitor', monitorData); // <-- Đảm bảo có dòng này

    // Các phần tử hiển thị
    const totalPriceDisplay = document.getElementById('total-price');
    const selectedComponentsList = document.getElementById('selected-components-list');
    const summaryModal = document.getElementById('summary-modal');
    const modalSummaryContent = document.getElementById('modal-components-list'); // SỬA ĐỔI ID CHO ĐÚNG
    const modalTotalPriceDisplay = document.getElementById('modal-total-price');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const calculateButton = document.getElementById('calculate-button');


    // Thêm CSS
    const style = document.createElement('style');
    style.textContent = `
        .component-card {
            border: 1px solid #ddd;
            padding: 15px;
            margin: 10px 0;
            display: flex;
            align-items: center;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .component-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .component-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                120deg,
                transparent,
                rgba(255, 255, 255, 0.3),
                transparent
            );
            transition: 0.5s;
        }

        .component-card:hover::before {
            left: 100%;
        }

        /* FIXED IMAGE SIZING - Added !important to override any other styles */
        .component-image, 
        .component-image-wrapper img,
        .component-table img,
        img.component-image {
            max-width: 70px !important;
            max-height: 70px !important;
            width: auto !important;
            height: auto !important;
            object-fit: contain !important;
            transition: transform 0.3s ease;
        }

        /* Additional image size constraints for specific contexts */
        td img, th img, .modal-content img {
            max-width: 70px !important;
            max-height: 70px !important;
            width: auto !important;
            height: auto !important;
        }

        /* Special case for table cell images */
        .component-table td img {
            max-width: 50px !important;
            max-height: 50px !important;
        }

        .component-card:hover .component-image {
            transform: scale(1.1);
        }

        #total-price {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 15px;
            margin-top: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            animation: priceGlow 2s infinite alternate;
        }

        @keyframes priceGlow {
            from {
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            to {
                box-shadow: 0 2px 20px rgba(0,128,255,0.2);
            }
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            animation: modalFade 0.3s ease;
        }

        @keyframes modalFade {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .modal-content {
            background: white;
            padding: 20px;
            width: 90%;
            max-width: 800px;
            margin: 50px auto;
            border-radius: 10px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.2);
            animation: modalSlide 0.3s ease;
        }

        @keyframes modalSlide {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .component-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            animation: tableAppear 0.5s ease;
        }

        @keyframes tableAppear {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .component-table th {
            background: linear-gradient(135deg, #f4f4f4 0%, #e8e8e8 100%);
            font-weight: bold;
            padding: 12px;
            text-align: left;
            border: 1px solid #ddd;
            transition: background-color 0.3s ease;
        }

        .component-table th:hover {
            background: linear-gradient(135deg, #e8e8e8 0%, #f4f4f4 100%);
        }

        .component-table td {
            padding: 12px;
            border: 1px solid #ddd;
            transition: background-color 0.3s ease;
        }

        .component-table tr:hover td {
            background-color: #f8f9fa;
        }

        .component-table img {
            max-width: 50px !important;
            max-height: 50px !important;
            display: block;
            margin: auto;
            transition: transform 0.3s ease;
        }

        .component-table img:hover {
            transform: scale(1.2);
        }

        .score-message, .upgrade-message {
            padding: 10px 15px;
            border-radius: 5px;
            margin: 10px 0;
            animation: messageSlide 0.5s ease;
        }

        @keyframes messageSlide {
            from {
                transform: translateX(-20px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        .score-message {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            box-shadow: 0 2px 10px rgba(40,167,69,0.2);
        }

        .upgrade-message {
            background: linear-gradient(135deg, #fd7e14 0%, #ffc107 100%);
            color: white;
            box-shadow: 0 2px 10px rgba(253,126,20,0.2);
        }

        .graphics-quality-container {
            display: flex;
            gap: 10px;
            margin: 15px 0;
            animation: qualityAppear 0.5s ease;
        }

        @keyframes qualityAppear {
            from {
                transform: translateY(10px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .fps-estimate-container {
            background: linear-gradient(135deg, #007bff 0%, #6610f2 100%);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            animation: fpsGlow 2s infinite alternate;
        }

        @keyframes fpsGlow {
            from {
                box-shadow: 0 2px 10px rgba(0,123,255,0.2);
            }
            to {
                box-shadow: 0 2px 20px rgba(102,16,242,0.4);
            }
        }

        #game-specific-performance {
            padding: 15px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 8px;
            margin: 15px 0;
            animation: performanceSlide 0.5s ease;
        }

        @keyframes performanceSlide {
            from {
                transform: translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    function updateSelectedComponents() {
        updateScores()
        selectedComponentsList.innerHTML = '';
        let total = 0;
        const selectedComponentsDetails = []; // Khởi tạo mảng để chứa thông tin chi tiết linh kiện

        // Tính toán tổng giá và tạo card
        for (const [type, select] of Object.entries(componentSelects)) {
            const value = select.value;
            if (value && components[type]?.[value]) {
                const component = components[type][value];
                total += component.price;

                const card = document.createElement('div');
                card.className = 'component-card';

                // Create image HTML with error handling
                const imageHtml = component.image 
                    ? `<img src="${component.image}" class="component-image" alt="${component.name}" data-component-type="${type}" onerror="handleImageError(this)">`
                    : `<div class="component-image-placeholder" style="background-color: #f0f0f0; height: 150px; display: flex; align-items: center; justify-content: center;">${component.name}</div>`;

                card.innerHTML = `
                    ${imageHtml}
                    <h3>${component.name} - ${component.price.toLocaleString()} VNĐ</h3>
                    <div class="component-info" style="display: none;">
                        ${component.socket ? `<p>Socket: ${component.socket}</p>` : ''}
                        ${component.memoryType ? `<p>Loại RAM: ${component.memoryType}</p>` : ''}
                        ${component.cores ? `<p>Cores: ${component.cores}</p>` : ''}
                        ${component.threads ? `<p>Threads: ${component.threads}</p>` : ''}
                        ${component.technology ? `<p>Technology: ${component.technology}</p>` : ''}
                        ${component.ram_support ? `<p>RAM Support: ${component.ram_support}</p>` : ''}
                        ${component.ram_bus ? `<p>RAM Bus: ${component.ram_bus}</p>` : ''}
                        ${component.vram ? `<p>VRAM: ${component.vram}</p>` : ''}
                        ${component.vram_type ? `<p>VRAM Type: ${component.vram_type}</p>` : ''}
                        ${component.card_type ? `<p>Card Type: ${component.card_type}</p>` : ''}
                        ${component.type ? `<p>Type: ${component.type}</p>` : ''}
                        ${component.speed ? `<p>Speed: ${component.speed}</p>` : ''}
                        ${component.size ? `<p>Size: ${component.size}</p>` : ''}
                        ${component.nvmeSlots ? `<p>NVMe Slots: ${component.nvmeSlots}</p>` : ''}
                        ${component.pcieVersion ? `<p>PCIe Version: ${component.pcieVersion}</p>` : ''}
                        ${component.formFactor ? `<p>Form Factor: ${component.formFactor}</p>` : ''} <!-- Đã thêm dòng này -->
                        ${component.panelType ? `<p>Panel Type: ${component.panelType}</p>` : ''}
                        ${component.refreshRate ? `<p>Refresh Rate: ${component.refreshRate}</p>` : ''}
                        ${component.screenSize ? `<p>Screen Size: ${component.screenSize}</p>` : ''}
        
                        ${component.sockets ? `<p>Sockets hỗ trợ: ${component.sockets.join(', ')}</p>` : ''}
                        ${component.sync ? `<p>Đồng bộ LED: ${component.sync}</p>` : ''}
        
                        ${component.supportedMainboards ? `<p>Mainboard hỗ trợ: ${component.supportedMainboards.join(', ')}</p>` : ''}
                        ${component.dimensions ? `<p>Kích thước Case: ${component.dimensions}</p>` : ''}
        
                        ${component.connectors ? `<div class="connectors">
                            <p>Connectors:</p>
                            <ul>
                                ${component.connectors.mainboard ? `<li>Mainboard: ${component.connectors.mainboard}</li>` : ''}
                                ${component.connectors.cpu ? `<li>CPU: ${Array.isArray(component.connectors.cpu) ? component.connectors.cpu.join(', ') : component.connectors.cpu}</li>` : ''}
                                ${component.connectors.pcie ? `<li>PCIe: ${Array.isArray(component.connectors.pcie) ? component.connectors.pcie.join(', ') : component.connectors.pcie}</li>` : ''}
                                ${component.connectors.sata ? `<li>SATA: ${component.connectors.sata}</li>` : ''}
                                ${component.connectors.molex ? `<li>Molex: ${component.connectors.molex}</li>` : ''}
                            </ul>
                        </div>` : ''}
        
                        ${component.power ? `<p>Power: ${component.power}</p>` : ''}
                    </div>
                `;

                // Thêm sự kiện click để hiển thị thông tin chi tiết
                card.addEventListener("click", function () {
                    const info = card.querySelector(".component-info");
                    info.style.display = info.style.display === "none" ? "block" : "none";
                });

                selectedComponentsList.appendChild(card);
                selectedComponentsDetails.push(component);
            }
        }


        // Cập nhật tổng giá - FIX CHÍNH
        const priceElement = totalPriceDisplay.querySelector('p');
        if (priceElement) {
            priceElement.textContent = `${total.toLocaleString()} VNĐ`;
        } else {
            console.error('Không tìm thấy phần tử hiển thị giá');
        }

        return { total, selectedComponentsDetails }; // Trả về object chứa cả tổng tiền và danh sách chi tiết
    }

    function calculateTotalPriceAndSummary() {
        // Tìm modal elements
        const summaryModal = document.getElementById('summary-modal');
        const modalSummaryContent = document.getElementById('modal-components-list');
        const modalTotalPriceDisplay = document.getElementById('modal-total-price');
        const imagePreviewContainer = document.getElementById('image-preview-container');
        
        if (!summaryModal || !modalSummaryContent || !modalTotalPriceDisplay || !imagePreviewContainer) {
            console.error("Missing modal elements:", {
                summaryModal: !!summaryModal,
                modalSummaryContent: !!modalSummaryContent,
                modalTotalPriceDisplay: !!modalTotalPriceDisplay,
                imagePreviewContainer: !!imagePreviewContainer
            });
            
            // Tạo modal nếu không tồn tại
            if (!summaryModal) {
                createModalElements();
                return calculateTotalPriceAndSummary(); // Gọi lại hàm sau khi tạo modal
            }
            return;
        }

        const calculationResult = updateSelectedComponents(); // Get the return value
        const total = calculationResult.total;         // Extract total
        const selectedComponentsDetails = calculationResult.selectedComponentsDetails; // Extract selectedComponentsDetails

        // Đảm bảo modal hiển thị ở giữa màn hình
        summaryModal.style.display = 'block';
        summaryModal.style.position = 'fixed';
        summaryModal.style.zIndex = '9999';
        summaryModal.style.left = '0';
        summaryModal.style.top = '0';
        summaryModal.style.width = '100%';
        summaryModal.style.height = '100%';
        summaryModal.style.overflow = 'auto';
        summaryModal.style.backgroundColor = 'rgba(0,0,0,0.7)';
        
        // Đảm bảo modal content có style phù hợp
        const modalContent = summaryModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.backgroundColor = '#fff';
            modalContent.style.margin = '50px auto';
            modalContent.style.padding = '20px';
            modalContent.style.width = '80%';
            modalContent.style.maxWidth = '900px';
            modalContent.style.borderRadius = '5px';
            modalContent.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
        }
        
        modalSummaryContent.innerHTML = ''; // Xóa nội dung cũ của modal
        imagePreviewContainer.innerHTML = ''; // Xóa ảnh cũ nếu có

        // Hiển thị phần tổng tiền
        modalTotalPriceDisplay.style.display = 'block';
        modalTotalPriceDisplay.style.marginTop = '20px';
        modalTotalPriceDisplay.style.fontWeight = 'bold';
        modalTotalPriceDisplay.style.fontSize = '18px';

        // Tạo bảng HTML để hiển thị thông tin chi tiết
        const table = document.createElement('table');
        table.className = 'component-table'; // Thêm class để CSS (tùy chọn)

        // Tạo hàng tiêu đề bảng
        const headerRow = table.insertRow();
        const headers = ['STT', 'HÌNH ẢNH', 'TÊN LINH KIỆN', 'GIÁ TIỀN', 'BẢO HÀNH', 'TÌNH TRẠNG']; // Thêm "STT" và "HÌNH ẢNH"
        headers.forEach(headerText => {
            const headerCell = document.createElement('th');
            headerCell.textContent = headerText;
            headerRow.appendChild(headerCell);
        });

        // Thêm dữ liệu linh kiện vào bảng
        selectedComponentsDetails.forEach((component, index) => {
            const dataRow = table.insertRow();

            // Ô STT
            const sttCell = dataRow.insertCell();
            sttCell.textContent = index + 1; // STT từ 1 đến n

            // Ô Hình ảnh
            const imageCell = dataRow.insertCell();
            if (component.image) {
                const img = document.createElement('img');
                img.src = component.image;
                img.alt = component.name;
                img.setAttribute('data-component-type', ''); // Để fallback hoạt động
                img.style.maxWidth = '70px'; // Điều chỉnh kích thước ảnh trong bảng
                img.onerror = function() {
                    // Tìm loại linh kiện từ component
                    let componentType = '';
                    for (const [type, select] of Object.entries(componentSelects)) {
                        if (select.value === Object.keys(components[type]).find(key => components[type][key] === component)) {
                            componentType = type;
                            break;
                        }
                    }
                    
                    // Sử dụng handleImageError global
                    window.handleImageError(this, componentType);
                };
                
                // Tạo wrapper cho ảnh
                const wrapper = document.createElement('div');
                wrapper.className = 'component-image-wrapper';
                wrapper.appendChild(img);
                
                // Thêm vào cell
                imageCell.appendChild(wrapper);
            } else {
                // Tạo fallback cho các component không có ảnh
                let componentType = '';
                for (const [type, select] of Object.entries(componentSelects)) {
                    if (select.value === Object.keys(components[type]).find(key => components[type][key] === component)) {
                        componentType = type;
                        break;
                    }
                }
                
                // Tạo canvas để tạo fallback image
                const canvas = document.createElement('canvas');
                canvas.width = 70;
                canvas.height = 70;
                const ctx = canvas.getContext('2d');
                
                // Tô màu nền
                ctx.fillStyle = '#333';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Vẽ chữ
                ctx.fillStyle = '#fff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(componentType.toUpperCase(), canvas.width/2, canvas.height/2);
                
                // Tạo img element từ canvas
                const img = document.createElement('img');
                img.src = canvas.toDataURL('image/png');
                img.alt = componentType;
                img.style.maxWidth = '70px';
                
                // Tạo wrapper 
                const wrapper = document.createElement('div');
                wrapper.className = 'component-image-wrapper';
                wrapper.appendChild(img);
                
                // Thêm vào cell
                imageCell.appendChild(wrapper);
            }

            // Ô Tên linh kiện
            const nameCell = dataRow.insertCell();
            nameCell.textContent = component.name;

            // Ô Giá
            const priceCell = dataRow.insertCell();
            priceCell.textContent = `${component.price.toLocaleString()} VNĐ`;

            // Ô Bảo hành
            const warrantyCell = dataRow.insertCell();
            warrantyCell.textContent = component.warranty || '36T';

            // Ô Tình trạng
            const conditionCell = dataRow.insertCell();
            conditionCell.textContent = component.condition || 'NEW';
        });

        modalSummaryContent.appendChild(table); // Thêm bảng vào modal
        summaryModal.style.display = 'block'; // Hiển thị modal
        modalTotalPriceDisplay.style.display = 'block'; // Đảm bảo phần tử hiển thị
        modalTotalPriceDisplay.textContent = `Tổng cộng: ${total.toLocaleString()} VNĐ`; // Cập nhật giá tiền
    }

    // Cập nhật điểm cho các thành phần
    function updateScores() {
        console.log('Updating component scores...');
        
        try {
            // Lấy các thành phần đã chọn
            const cpuSelect = document.getElementById('cpu');
            const vgaSelect = document.getElementById('vga');
            
            let cpuValue = cpuSelect ? cpuSelect.value : '';
            let vgaValue = vgaSelect ? vgaSelect.value : '';
            
            // Nếu chưa có CPU hoặc VGA được chọn, tự động chọn một giá trị
            if (!cpuValue && cpuSelect && cpuSelect.options.length > 1) {
                // Chọn CPU thứ 2 (bỏ qua option đầu tiên thường là placeholder)
                cpuSelect.selectedIndex = 1;
                cpuValue = cpuSelect.value;
                console.log('Auto-selected CPU:', cpuValue);
            }
            
            if (!vgaValue && vgaSelect && vgaSelect.options.length > 1) {
                // Chọn VGA thứ 2
                vgaSelect.selectedIndex = 1;
                vgaValue = vgaSelect.value;
                console.log('Auto-selected VGA:', vgaValue);
            }
            
            // Lấy các thành phần khác
            const ramSelect = document.getElementById('ram');
            const ssdSelect = document.getElementById('ssd');
            const mainboardSelect = document.getElementById('mainboard');
            const caseSelect = document.getElementById('case');
            const psuSelect = document.getElementById('psu');
            const cpuCoolerSelect = document.getElementById('cpuCooler');
            
            const ramValue = ramSelect ? ramSelect.value : '';
            const ssdValue = ssdSelect ? ssdSelect.value : '';
            const mainboardValue = mainboardSelect ? mainboardSelect.value : '';
            const caseValue = caseSelect ? caseSelect.value : '';
            const psuValue = psuSelect ? psuSelect.value : '';
            const cpuCoolerValue = cpuCoolerSelect ? cpuCoolerSelect.value : '';
            
            // Gọi hàm cập nhật bảng nếu có giá trị
            if (cpuValue || vgaValue) {
                updateComponentTable(
                    cpuValue,
                    mainboardValue,
                    vgaValue,
                    ramValue,
                    ssdValue,
                    psuValue,
                    caseValue,
                    cpuCoolerValue
                );
            }
            
            // Nếu có CPU và VGA, hiển thị thông tin hiệu năng
            if (cpuValue && vgaValue) {
                // Tính điểm RAM và SSD
                let ramScore = 50; // Giá trị mặc định
                let ssdScore = 50; // Giá trị mặc định
                
                if (ramValue && window.ramData[ramValue]) {
                    const ram = window.ramData[ramValue];
                    if (ram.name.includes('32GB')) {
                        ramScore = 90;
                    } else if (ram.name.includes('16GB')) {
                        ramScore = 75;
                    } else if (ram.name.includes('8GB')) {
                        ramScore = 60;
                    }
                }
                
                if (ssdValue && window.ssdData[ssdValue]) {
                    const ssd = window.ssdData[ssdValue];
                    if (ssd.name.includes('1TB') || ssd.name.includes('1000GB')) {
                        ssdScore = 85;
                    } else if (ssd.name.includes('512GB') || ssd.name.includes('500GB')) {
                        ssdScore = 70;
                    } else if (ssd.name.includes('256GB') || ssd.name.includes('250GB')) {
                        ssdScore = 60;
                    }
                }
                
                // Hiển thị hiệu năng
                showPerformanceMetrics(cpuValue, vgaValue, ramScore, ssdScore);
                
                // Hiển thị thông báo socket nếu cần
                checkSocketCompatibility(cpuValue, mainboardValue);
            }
            
            console.log('Component scores updated successfully');
        } catch (error) {
            console.error('Error updating component scores:', error);
        }
    }
    
    // Kiểm tra tính tương thích của socket
    function checkSocketCompatibility(cpuKey, mainboardKey) {
        const socketMessage = document.getElementById('socket-message');
        if (!socketMessage) return;
        
        try {
            if (!cpuKey || !mainboardKey || !window.cpuData[cpuKey] || !window.mainboardData[mainboardKey]) {
                socketMessage.style.display = 'none';
                return;
            }

            const cpu = window.cpuData[cpuKey];
            const mainboard = window.mainboardData[mainboardKey];
            
            // Lấy thông tin socket từ dữ liệu thực tế
            const cpuSocket = cpu.socket;
            const mbSockets = mainboard.sockets || [mainboard.socket]; // Hỗ trợ cả trường hợp sockets là mảng và socket là string
            
            console.log(`Checking compatibility: CPU socket = ${cpuSocket}, Mainboard sockets = ${JSON.stringify(mbSockets)}`);
            
            // Kiểm tra xem socket CPU có được hỗ trợ bởi mainboard không
            const isCompatible = Array.isArray(mbSockets) 
                ? mbSockets.includes(cpuSocket)
                : mbSockets === cpuSocket;
            
            if (!isCompatible) {
                socketMessage.innerHTML = `<strong>Cảnh báo:</strong> CPU (${cpuSocket}) không tương thích với mainboard (${Array.isArray(mbSockets) ? mbSockets.join(', ') : mbSockets}). Vui lòng chọn lại.`;
                socketMessage.style.display = 'block';
                socketMessage.style.color = '#e74c3c';
                socketMessage.style.backgroundColor = '#fadbd8';
                socketMessage.style.padding = '10px';
                socketMessage.style.borderRadius = '5px';
                socketMessage.style.margin = '10px 0';
                
                // Hiển thị cảnh báo và log cho debug
                logger.warn(`Socket incompatibility detected: CPU ${cpuKey} (${cpuSocket}) is not compatible with mainboard ${mainboardKey} (${Array.isArray(mbSockets) ? mbSockets.join(', ') : mbSockets})`);
                
                // Highlight các dropdown có vấn đề
                const cpuDropdown = document.getElementById('cpu');
                const mainboardDropdown = document.getElementById('mainboard');
                
                if (cpuDropdown) cpuDropdown.style.borderColor = '#e74c3c';
                if (mainboardDropdown) mainboardDropdown.style.borderColor = '#e74c3c';
            } else {
                socketMessage.style.display = 'none';
                
                // Remove highlight nếu có
                const cpuDropdown = document.getElementById('cpu');
                const mainboardDropdown = document.getElementById('mainboard');
                
                if (cpuDropdown) cpuDropdown.style.borderColor = '';
                if (mainboardDropdown) mainboardDropdown.style.borderColor = '';
            }
        } catch (error) {
            logger.error('Error checking socket compatibility: ' + error.message);
            socketMessage.style.display = 'none';
        }
    }
    
    // Store a reference to this function globally
    window.originalCheckSocketCompatibility = checkSocketCompatibility;
    
    // Đảm bảo sử dụng phiên bản chính xác của hàm kiểm tra tương thích
    if (!window.checkSocketCompatibility) {
        window.checkSocketCompatibility = checkSocketCompatibility;
    }
    
    // Lấy socket CPU từ tên
    function getCPUSocketFromName(name) {
        if (!name) return '';
        
        // Xác định socket chính xác từ tên CPU
        
        // Ryzen 9000 series dùng AM5
        if (name.includes('Ryzen') && (name.includes('9600') || name.includes('9700') || 
                                      name.includes('9800') || name.includes('9900') || 
                                      name.includes('9950') || name.includes('9000'))) {
            return 'AM5';
        }
        
        // Ryzen 7000 series dùng AM5
        if (name.includes('Ryzen') && (name.includes('7500f') || name.includes('7600') || 
                                      name.includes('7700') || name.includes('7800') || 
                                      name.includes('7900') || name.includes('7950') || 
                                      name.includes('7000'))) {
            return 'AM5';
        }
        
        // Ryzen 5000 series dùng AM4
        if (name.includes('Ryzen') && (name.includes('5600') || name.includes('5700') || 
                                      name.includes('5800') || name.includes('5900') || 
                                      name.includes('5950') || name.includes('5000'))) {
            return 'AM4';
        }
        
        // Ryzen 3000 series dùng AM4
        if (name.includes('Ryzen') && (name.includes('3600') || name.includes('3700') || 
                                      name.includes('3800') || name.includes('3900') || 
                                      name.includes('3950') || name.includes('3000'))) {
            return 'AM4';
        }
        
        // AMD Ryzen cũ dùng AM4 (default)
        if (name.includes('Ryzen') || (name.includes('AMD') && !name.includes('Xeon'))) {
            return 'AM4';
        }
        
        // Intel thế hệ 14 dùng LGA1700
        if ((name.includes('i3') || name.includes('i5') || name.includes('i7') || name.includes('i9') || 
             name.includes('Intel') || name.includes('Core')) && 
            (name.includes('14100') || name.includes('14400') || name.includes('14500') || 
             name.includes('14600') || name.includes('14700') || name.includes('14900') || 
             name.includes('14th'))) {
            return 'LGA1700';
        }
        
        // Intel thế hệ 13 dùng LGA1700
        if ((name.includes('i3') || name.includes('i5') || name.includes('i7') || name.includes('i9') || 
             name.includes('Intel') || name.includes('Core')) && 
            (name.includes('13100') || name.includes('13400') || name.includes('13500') || 
             name.includes('13600') || name.includes('13700') || name.includes('13900') || 
             name.includes('13th'))) {
            return 'LGA1700';
        }
        
        // Intel thế hệ 12 dùng LGA1700
        if ((name.includes('i3') || name.includes('i5') || name.includes('i7') || name.includes('i9') || 
             name.includes('Intel') || name.includes('Core')) && 
            (name.includes('12100') || name.includes('12400') || name.includes('12500') || 
             name.includes('12600') || name.includes('12700') || name.includes('12900') || 
             name.includes('12th'))) {
            return 'LGA1700';
        }
        
        // Intel thế hệ 11 dùng LGA1200
        if ((name.includes('i3') || name.includes('i5') || name.includes('i7') || name.includes('i9') || 
             name.includes('Intel') || name.includes('Core')) && 
            (name.includes('11100') || name.includes('11400') || name.includes('11500') || 
             name.includes('11600') || name.includes('11700') || name.includes('11900') || 
             name.includes('11th'))) {
            return 'LGA1200';
        }
        
        // Intel thế hệ 10 dùng LGA1200
        if ((name.includes('i3') || name.includes('i5') || name.includes('i7') || name.includes('i9') || 
             name.includes('Intel') || name.includes('Core')) && 
            (name.includes('10100') || name.includes('10400') || name.includes('10500') || 
             name.includes('10600') || name.includes('10700') || name.includes('10900') || 
             name.includes('10th'))) {
            return 'LGA1200';
        }
        
        // Intel thế hệ 9 dùng LGA1151
        if ((name.includes('i3') || name.includes('i5') || name.includes('i7') || name.includes('i9') || 
             name.includes('Intel') || name.includes('Core')) && 
            (name.includes('9100') || name.includes('9400') || name.includes('9500') || 
             name.includes('9600') || name.includes('9700') || name.includes('9900') || 
             name.includes('9th'))) {
            return 'LGA1151';
        }
        
        // Intel thế hệ 8 dùng LGA1151
        if ((name.includes('i3') || name.includes('i5') || name.includes('i7') || name.includes('i9') || 
             name.includes('Intel') || name.includes('Core')) && 
            (name.includes('8100') || name.includes('8400') || name.includes('8500') || 
             name.includes('8600') || name.includes('8700') || name.includes('8th'))) {
            return 'LGA1151';
        }
        
        // Intel Xeon E3 v3, v4 dùng LGA1150
        if (name.includes('Xeon') && (name.includes('v3') || name.includes('v4') || name.includes('1220'))) {
            return 'LGA1150';
        }
        
        // Intel thế hệ 4, 5 dùng LGA1150
        if ((name.includes('i3') || name.includes('i5') || name.includes('i7') || 
             name.includes('Intel') || name.includes('Core')) && 
            (name.includes('4570') || name.includes('4460') || name.includes('4590') || 
             name.includes('4690') || name.includes('4770') || name.includes('4790') || 
             name.includes('5775') || name.includes('4th') || name.includes('5th'))) {
            return 'LGA1150';
        }
        
        // Intel thế hệ 2, 3 dùng LGA1155
        if ((name.includes('i3') || name.includes('i5') || name.includes('i7') || 
             name.includes('Intel') || name.includes('Core')) && 
            (name.includes('2100') || name.includes('2400') || name.includes('2500') || 
             name.includes('2600') || name.includes('2700') || name.includes('3470') || 
             name.includes('3570') || name.includes('3770') || name.includes('2nd') || 
             name.includes('3rd'))) {
            return 'LGA1155';
        }
        
        // Dự đoán dựa trên số đầu tiên trong tên model Intel
        if ((name.includes('i3-') || name.includes('i5-') || name.includes('i7-') || 
             name.includes('i9-') || name.includes('Intel Core')) && name.match(/\d+/)) {
            const modelNumber = name.match(/\d+/)[0];
            if (modelNumber.startsWith('12') || modelNumber.startsWith('13') || modelNumber.startsWith('14')) {
                return 'LGA1700';
            } else if (modelNumber.startsWith('10') || modelNumber.startsWith('11')) {
                return 'LGA1200';
            } else if (modelNumber.startsWith('8') || modelNumber.startsWith('9')) {
                return 'LGA1151';
            } else if (modelNumber.startsWith('4') || modelNumber.startsWith('5')) {
                return 'LGA1150';
            } else if (modelNumber.startsWith('2') || modelNumber.startsWith('3')) {
                return 'LGA1155';
            }
        }
        
        // Kiểm tra rõ ràng socket trong tên
        if (name.includes('LGA1700')) return 'LGA1700';
        if (name.includes('LGA1200')) return 'LGA1200';
        if (name.includes('LGA1151')) return 'LGA1151';
        if (name.includes('LGA1150')) return 'LGA1150';
        if (name.includes('LGA1155')) return 'LGA1155';
        if (name.includes('AM5')) return 'AM5';
        if (name.includes('AM4')) return 'AM4';
        
        logger.log(`Socket detection: Could not determine socket for CPU: ${name}`);
        
        // Nếu không thể xác định, trả về rỗng
        return '';
    }
    
    // Expose the function globally
    window.getCPUSocketFromName = getCPUSocketFromName;
    
    // Lấy socket mainboard từ tên
    function getMainboardSocketFromName(name) {
        if (!name) return '';
        
        const lowerName = name.toLowerCase();
        
        // Xác định rõ ràng socket từ tên
        if (lowerName.includes('am5')) return 'AM5';
        if (lowerName.includes('am4')) return 'AM4';
        if (lowerName.includes('lga1700')) return 'LGA1700';
        if (lowerName.includes('lga1200')) return 'LGA1200';
        if (lowerName.includes('lga1151')) return 'LGA1151';
        if (lowerName.includes('lga1150')) return 'LGA1150';
        if (lowerName.includes('lga1155')) return 'LGA1155';
        
        // AMD AM5 chipsets (Ryzen 7000, 9000)
        if (name.includes('X670') || name.includes('B650') || 
            name.includes('X870') || name.includes('B850')) {
            return 'AM5';
        }
        
        // AMD AM4 chipsets (Ryzen 3000, 5000)
        if (name.includes('X570') || name.includes('B550') || name.includes('A520') || 
            name.includes('X470') || name.includes('B450') || name.includes('A420') || 
            name.includes('X370') || name.includes('B350') || name.includes('A320')) {
            return 'AM4';
        }
        
        // Intel LGA1700 chipsets (12th, 13th, 14th gen)
        if (name.includes('Z790') || name.includes('H770') || name.includes('B760') || 
            name.includes('Z690') || name.includes('H670') || name.includes('B660') || 
            name.includes('H610')) {
            return 'LGA1700';
        }
        
        // Intel LGA1200 chipsets (10th, 11th gen)
        if (name.includes('Z590') || name.includes('H570') || name.includes('B560') || 
            name.includes('H510') || name.includes('Z490') || name.includes('H470') || 
            name.includes('B460') || name.includes('H410')) {
            return 'LGA1200';
        }
        
        // Intel LGA1151 chipsets (8th, 9th gen)
        if (name.includes('Z390') || name.includes('H370') || name.includes('B360') || 
            name.includes('H310') || name.includes('Z370')) {
            return 'LGA1151';
        }
        
        // Intel LGA1151 chipsets (6th, 7th gen)
        if (name.includes('Z270') || name.includes('H270') || name.includes('B250') || 
            name.includes('Z170') || name.includes('H170') || name.includes('B150') || 
            name.includes('H110')) {
            return 'LGA1151';
        }
        
        // Intel LGA1150 chipsets (4th, 5th gen)
        if (name.includes('Z97') || name.includes('H97') || name.includes('B85') || 
            name.includes('H81') || name.includes('Z87') || name.includes('H87')) {
            return 'LGA1150';
        }
        
        // Intel LGA1155 chipsets (2nd, 3rd gen)
        if (name.includes('Z77') || name.includes('H77') || name.includes('B75') || 
            name.includes('Z68') || name.includes('H67') || name.includes('H61')) {
            return 'LGA1155';
        }
        
        // Kiểm tra tên model phổ biến
        if (name.includes('B450M-TI') || name.includes('B450M DS3H')) {
            return 'AM4';
        }
        
        logger.log(`Socket detection: Could not determine socket for mainboard: ${name}`);
        
        // Nếu không thể xác định, trả về rỗng
        return '';
    }
    
    // Expose the function globally
    window.getMainboardSocketFromName = getMainboardSocketFromName;

    // Cập nhật bảng linh kiện chi tiết
    function updateComponentTable(cpuKey, mainboardKey, vgaKey, ramKey, ssdKey, psuKey, caseKey, cpuCoolerKey) {
        console.log('Updating component table with:', { cpuKey, mainboardKey, vgaKey, ramKey, ssdKey, psuKey, caseKey, cpuCoolerKey });
        
        try {
            // Lấy dữ liệu của từng linh kiện
            const cpu = cpuKey ? window.cpuData[cpuKey] : null;
            const mainboard = mainboardKey ? window.mainboardData[mainboardKey] : null;
            const vga = vgaKey ? window.vgaData[vgaKey] : null;
            const ram = ramKey ? window.ramData[ramKey] : null;
            const ssd = ssdKey ? window.ssdData[ssdKey] : null;
            const psu = psuKey ? window.psuData[psuKey] : null;
            const caseItem = caseKey ? window.caseData[caseKey] : null;
            const cpuCooler = cpuCoolerKey ? window.cpuCoolerData[cpuCoolerKey] : null;
            
            // Also get HDD and monitor data if available
            const hddKey = document.getElementById('hdd')?.value;
            const monitorKey = document.getElementById('monitor')?.value;
            const hdd = hddKey ? window.hddData[hddKey] : null;
            const monitor = monitorKey ? window.monitorData[monitorKey] : null;
            
            // Tạo nội dung tĩnh cho bảng nếu chưa tồn tại
            const tableContainer = document.querySelector('.config-table');
            if (!tableContainer) {
                console.error('Configuration table container not found');
                
                // Try to find alternative container or create one
                const modalBody = document.querySelector('.modal-body');
                if (modalBody) {
                    const newTableContainer = document.createElement('div');
                    newTableContainer.className = 'config-table';
                    modalBody.appendChild(newTableContainer);
                    console.log('Created new configuration table container');
                } else {
                    console.error('Could not find or create table container');
                    return;
                }
            }
            
            // Refresh container reference in case we created a new one
            const tableContainerRef = document.querySelector('.config-table');
            if (tableContainerRef) {
                // Kiểm tra xem bảng đã tồn tại chưa
                let tableExists = tableContainerRef.querySelector('table');
                if (!tableExists) {
                    // Tạo bảng mới nếu chưa tồn tại
                    const tableHTML = `
                        <table>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>HÌNH ẢNH</th>
                                    <th>TÊN, MÃ, LOẠI LINH KIỆN</th>
                                    <th>ĐVT</th>
                                    <th>SỐ LƯỢNG</th>
                                    <th>ĐƠN GIÁ</th>
                                    <th>THÀNH TIỀN</th>
                                    <th>BẢO HÀNH</th>
                                    <th>GHI CHÚ</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr id="cpu-row">
                                    <td>1</td>
                                    <td id="cpu-image"></td>
                                    <td id="cpu-name"></td>
                                    <td>Chiếc</td>
                                    <td>1</td>
                                    <td id="cpu-price"></td>
                                    <td id="cpu-total"></td>
                                    <td>36T</td>
                                    <td>NEW</td>
                                </tr>
                                <tr id="mainboard-row">
                                    <td>2</td>
                                    <td id="mainboard-image"></td>
                                    <td id="mainboard-name"></td>
                                    <td>Chiếc</td>
                                    <td>1</td>
                                    <td id="mainboard-price"></td>
                                    <td id="mainboard-total"></td>
                                    <td>36T</td>
                                    <td>NEW</td>
                                </tr>
                                <tr id="ram-row">
                                    <td>3</td>
                                    <td id="ram-image"></td>
                                    <td id="ram-name"></td>
                                    <td>Chiếc</td>
                                    <td>1</td>
                                    <td id="ram-price"></td>
                                    <td id="ram-total"></td>
                                    <td>36T</td>
                                    <td>NEW</td>
                                </tr>
                                <tr id="vga-row">
                                    <td>4</td>
                                    <td id="vga-image"></td>
                                    <td id="vga-name"></td>
                                    <td>Chiếc</td>
                                    <td>1</td>
                                    <td id="vga-price"></td>
                                    <td id="vga-total"></td>
                                    <td>3T</td>
                                    <td>NEW</td>
                                </tr>
                                <tr id="ssd-row">
                                    <td>5</td>
                                    <td id="ssd-image"></td>
                                    <td id="ssd-name"></td>
                                    <td>Chiếc</td>
                                    <td>1</td>
                                    <td id="ssd-price"></td>
                                    <td id="ssd-total"></td>
                                    <td>36T</td>
                                    <td>NEW</td>
                                </tr>
                                <tr id="cpu-cooler-row">
                                    <td>6</td>
                                    <td id="cpu-cooler-image"></td>
                                    <td id="cpu-cooler-name"></td>
                                    <td>Chiếc</td>
                                    <td>1</td>
                                    <td id="cpu-cooler-price"></td>
                                    <td id="cpu-cooler-total"></td>
                                    <td>12T</td>
                                    <td>NEW</td>
                                </tr>
                                <tr id="psu-row">
                                    <td>7</td>
                                    <td id="psu-image"></td>
                                    <td id="psu-name"></td>
                                    <td>Chiếc</td>
                                    <td>1</td>
                                    <td id="psu-price"></td>
                                    <td id="psu-total"></td>
                                    <td>36T</td>
                                    <td>NEW</td>
                                </tr>
                                <tr id="case-row">
                                    <td>8</td>
                                    <td id="case-image"></td>
                                    <td id="case-name"></td>
                                    <td>Chiếc</td>
                                    <td>1</td>
                                    <td id="case-price"></td>
                                    <td id="case-total"></td>
                                    <td>12T</td>
                                    <td>NEW</td>
                                </tr>
                                <tr id="hdd-row">
                                    <td>9</td>
                                    <td id="hdd-image"></td>
                                    <td id="hdd-name"></td>
                                    <td>Chiếc</td>
                                    <td>1</td>
                                    <td id="hdd-price"></td>
                                    <td id="hdd-total"></td>
                                    <td>12T</td>
                                    <td>NEW</td>
                                </tr>
                                <tr id="monitor-row">
                                    <td>10</td>
                                    <td id="monitor-image"></td>
                                    <td id="monitor-name"></td>
                                    <td>Chiếc</td>
                                    <td>1</td>
                                    <td id="monitor-price"></td>
                                    <td id="monitor-total"></td>
                                    <td>36T</td>
                                    <td>NEW</td>
                                </tr>
                                <tr>
                                    <td colspan="9" style="height: 10px; border: none !important; background-color: #191919 !important;"></td>
                                </tr>
                                <tr class="total-row">
                                    <td colspan="6" style="text-align: right; font-weight: bold;">Tổng cộng:</td>
                                    <td id="total-price-cell"></td>
                                    <td colspan="2"></td>
                                </tr>
                                <tr class="total-row">
                                    <td colspan="6" style="text-align: right; font-weight: bold;">Chiết khấu:</td>
                                    <td></td>
                                    <td colspan="2"></td>
                                </tr>
                                <tr class="total-row">
                                    <td colspan="6" style="text-align: right; font-weight: bold;">Đã thanh toán:</td>
                                    <td></td>
                                    <td colspan="2"></td>
                                </tr>
                                <tr class="total-row">
                                    <td colspan="6" style="text-align: right; font-weight: bold;">Còn lại:</td>
                                    <td id="remaining-price-cell"></td>
                                    <td colspan="2"></td>
                                </tr>
                            </tbody>
                        </table>
                    `;
                    tableContainerRef.innerHTML = tableHTML;
                    console.log('Created new configuration table');
                } else {
                    console.log('Configuration table already exists, updating cells');
                }
            } else {
                console.error('Could not find or create table container after attempt');
                return;
            }
            
            // Ensure table is visible - fix any display issues
            const tableElement = document.querySelector('.config-table table');
            if (tableElement) {
                tableElement.style.display = 'table';
                tableElement.style.width = '100%';
                tableElement.style.borderCollapse = 'collapse';
            }
            
            // Cập nhật từng cell của bảng và hình ảnh
            if (cpu) {
                updateTableCell('cpu-name', cpu.name);
                updateTableCell('cpu-price', formatPrice(cpu.price));
                updateTableCell('cpu-total', formatPrice(cpu.price));
                updateTableImage('cpu-image', cpu.image, 'CPU');
                const cpuRow = document.getElementById('cpu-row');
                if (cpuRow) cpuRow.style.display = '';
            } else {
                const cpuRow = document.getElementById('cpu-row');
                if (cpuRow) cpuRow.style.display = 'none';
            }
            
            if (mainboard) {
                updateTableCell('mainboard-name', mainboard.name);
                updateTableCell('mainboard-price', formatPrice(mainboard.price));
                updateTableCell('mainboard-total', formatPrice(mainboard.price));
                updateTableImage('mainboard-image', mainboard.image, 'MAINBOARD');
                const mainboardRow = document.getElementById('mainboard-row');
                if (mainboardRow) mainboardRow.style.display = '';
            } else {
                const mainboardRow = document.getElementById('mainboard-row');
                if (mainboardRow) mainboardRow.style.display = 'none';
            }
            
            if (ram) {
                updateTableCell('ram-name', ram.name);
                updateTableCell('ram-price', formatPrice(ram.price));
                updateTableCell('ram-total', formatPrice(ram.price));
                updateTableImage('ram-image', ram.image, 'RAM');
                const ramRow = document.getElementById('ram-row');
                if (ramRow) ramRow.style.display = '';
            } else {
                const ramRow = document.getElementById('ram-row');
                if (ramRow) ramRow.style.display = 'none';
            }
            
            if (vga) {
                updateTableCell('vga-name', vga.name);
                updateTableCell('vga-price', formatPrice(vga.price));
                updateTableCell('vga-total', formatPrice(vga.price));
                updateTableImage('vga-image', vga.image, 'VGA');
                const vgaRow = document.getElementById('vga-row');
                if (vgaRow) vgaRow.style.display = '';
            } else {
                const vgaRow = document.getElementById('vga-row');
                if (vgaRow) vgaRow.style.display = 'none';
            }
            
            if (ssd) {
                updateTableCell('ssd-name', ssd.name);
                updateTableCell('ssd-price', formatPrice(ssd.price));
                updateTableCell('ssd-total', formatPrice(ssd.price));
                updateTableImage('ssd-image', ssd.image, 'SSD');
                const ssdRow = document.getElementById('ssd-row');
                if (ssdRow) ssdRow.style.display = '';
            } else {
                const ssdRow = document.getElementById('ssd-row');
                if (ssdRow) ssdRow.style.display = 'none';
            }
            
            if (cpuCooler) {
                updateTableCell('cpu-cooler-name', cpuCooler.name);
                updateTableCell('cpu-cooler-price', formatPrice(cpuCooler.price));
                updateTableCell('cpu-cooler-total', formatPrice(cpuCooler.price));
                updateTableImage('cpu-cooler-image', cpuCooler.image, 'CPUCOOLER');
                const cpuCoolerRow = document.getElementById('cpu-cooler-row');
                if (cpuCoolerRow) cpuCoolerRow.style.display = '';
            } else {
                const cpuCoolerRow = document.getElementById('cpu-cooler-row');
                if (cpuCoolerRow) cpuCoolerRow.style.display = 'none';
            }
            
            if (psu) {
                updateTableCell('psu-name', psu.name);
                updateTableCell('psu-price', formatPrice(psu.price));
                updateTableCell('psu-total', formatPrice(psu.price));
                updateTableImage('psu-image', psu.image, 'PSU');
                const psuRow = document.getElementById('psu-row');
                if (psuRow) psuRow.style.display = '';
            } else {
                const psuRow = document.getElementById('psu-row');
                if (psuRow) psuRow.style.display = 'none';
            }
            
            if (caseItem) {
                updateTableCell('case-name', caseItem.name);
                updateTableCell('case-price', formatPrice(caseItem.price));
                updateTableCell('case-total', formatPrice(caseItem.price));
                updateTableImage('case-image', caseItem.image, 'CASE');
                const caseRow = document.getElementById('case-row');
                if (caseRow) caseRow.style.display = '';
            } else {
                const caseRow = document.getElementById('case-row');
                if (caseRow) caseRow.style.display = 'none';
            }
            
            // Update HDD row if available
            if (hdd) {
                updateTableCell('hdd-name', hdd.name);
                updateTableCell('hdd-price', formatPrice(hdd.price));
                updateTableCell('hdd-total', formatPrice(hdd.price));
                updateTableImage('hdd-image', hdd.image, 'HDD');
                const hddRow = document.getElementById('hdd-row');
                if (hddRow) hddRow.style.display = '';
            } else {
                const hddRow = document.getElementById('hdd-row');
                if (hddRow) hddRow.style.display = 'none';
            }
            
            // Update Monitor row if available
            if (monitor) {
                updateTableCell('monitor-name', monitor.name);
                updateTableCell('monitor-price', formatPrice(monitor.price));
                updateTableCell('monitor-total', formatPrice(monitor.price));
                updateTableImage('monitor-image', monitor.image, 'MONITOR');
                const monitorRow = document.getElementById('monitor-row');
                if (monitorRow) monitorRow.style.display = '';
            } else {
                const monitorRow = document.getElementById('monitor-row');
                if (monitorRow) monitorRow.style.display = 'none';
            }
            
            // Tính tổng tiền
            let totalPrice = 0;
            if (cpu) totalPrice += cpu.price;
            if (mainboard) totalPrice += mainboard.price;
            if (vga) totalPrice += vga.price;
            if (ram) totalPrice += ram.price;
            if (ssd) totalPrice += ssd.price;
            if (cpuCooler) totalPrice += cpuCooler.price;
            if (psu) totalPrice += psu.price;
            if (caseItem) totalPrice += caseItem.price;
            if (hdd) totalPrice += hdd.price;
            if (monitor) totalPrice += monitor.price;
            
            // Cập nhật tổng tiền
            updateTableCell('total-price-cell', formatPrice(totalPrice));
            updateTableCell('remaining-price-cell', formatPrice(totalPrice));
            
            // Make sure the table is visible
            const configTable = document.querySelector('.config-table');
            if (configTable) {
                configTable.style.display = 'block';
            }
            
            // Also update the total price display in the UI
            const totalPriceDisplay = document.getElementById('total-price');
            if (totalPriceDisplay) {
                const priceElement = totalPriceDisplay.querySelector('p');
                if (priceElement) {
                    priceElement.textContent = `${totalPrice.toLocaleString()} VNĐ`;
                }
            }
            
            // Hiển thị các chỉ số hiệu năng nếu có CPU và VGA
            if (cpu && vga) {
                showPerformanceMetrics(cpuKey, vgaKey, ram ? 70 : 50, ssd ? 60 : 40);
            }
            
            console.log('Component table updated successfully with total price:', totalPrice);
        } catch (error) {
            console.error('Error updating component table:', error);
        }
    }
    
    // Hàm cập nhật cell trong bảng
    function updateTableCell(cellId, value) {
        const cell = document.getElementById(cellId);
        if (cell) {
            cell.textContent = value;
        }
    }

    // Hàm cập nhật hình ảnh trong bảng
    function updateTableImage(cellId, imageSrc, componentType) {
        const cell = document.getElementById(cellId);
        if (cell) {
            // Xóa nội dung cũ
            cell.innerHTML = '';
            
            // Tạo phần tử img với fallback
            const img = document.createElement('img');
            img.src = imageSrc || '';
            img.alt = componentType || '';
            img.setAttribute('data-component-type', componentType || '');
            img.onerror = function() {
                handleImageError(this, componentType);
            };
            
            // Tạo wrapper cho ảnh
            const wrapper = document.createElement('div');
            wrapper.className = 'component-image-wrapper';
            wrapper.appendChild(img);
            
            // Thêm vào cell
            cell.appendChild(wrapper);
        }
    }

    // Gọi hàm updateScores() lần đầu để hiển thị giá trị mặc định hoặc khi trang tải xong
    setTimeout(updateScores, 0);

    // Hàm tự động chọn cấu hình dựa trên game, ngân sách và loại CPU
    function autoSelectConfig(gameId, budget, cpuType) {
        console.log(`%c 🟠 autoSelectConfig được gọi với params: gameId=${gameId}, budget=${budget}, cpuType=${cpuType}`, 
                   'background: #FFA500; color: white; font-weight: bold; font-size: 14px; padding: 5px;');
        
        // CRITICAL: LUÔN lấy giá trị CPU type từ dropdown - đây là giá trị chuẩn
        const dropdownCpuType = document.getElementById('cpu-type')?.value;
        
        // CRITICAL CHECK: So sánh tất cả các nguồn CPU type
        const displayedIndicator = document.querySelector('#permanent-cpu-indicator')?.textContent || '';
        const displayedCpuType = displayedIndicator.includes('AMD') ? 'Amd' : 'Intel';
        const bodyCpuType = document.body.getAttribute('data-selected-cpu-type');
        const bodyClassType = document.body.classList.contains('amd-mode') ? 'Amd' : 'Intel';
        const storedCpuType = localStorage.getItem('selectedCpuType');
        
        // Log tất cả các nguồn để debug
        console.log(`%c [AUTO CONFIG] CPU TYPE SOURCES:`, 'background: #333; color: #FFF; font-weight: bold;');
        console.log(`- Param: ${cpuType}`);
        console.log(`- Dropdown: ${dropdownCpuType}`);
        console.log(`- Body attribute: ${bodyCpuType}`);
        console.log(`- Body class: ${bodyClassType}`);
        console.log(`- UI indicator: ${displayedCpuType}`);
        console.log(`- localStorage: ${storedCpuType}`);
        
        // CRITICAL: LUÔN ưu tiên giá trị từ dropdown - đây là nguồn chính xác nhất
        // Nếu dropdown không có giá trị hoặc giá trị không phải là Intel/Amd, thì mới dùng các nguồn khác
        let finalCpuType;
        
        if (dropdownCpuType === 'Intel' || dropdownCpuType === 'Amd') {
            finalCpuType = dropdownCpuType;
            console.log(`%c ✅ Sử dụng CPU type từ dropdown: ${finalCpuType}`, 'color: green; font-weight: bold;');
        } else if (bodyCpuType === 'Intel' || bodyCpuType === 'Amd') {
            finalCpuType = bodyCpuType;
            console.warn(`❌ Dropdown CPU type không hợp lệ, dùng body attribute: ${finalCpuType}`);
        } else if (displayedCpuType === 'Intel' || displayedCpuType === 'Amd') {
            finalCpuType = displayedCpuType;
            console.warn(`❌ Body attribute không hợp lệ, dùng hiển thị UI: ${finalCpuType}`);
        } else if (bodyClassType === 'Intel' || bodyClassType === 'Amd') {
            finalCpuType = bodyClassType;
            console.warn(`❌ UI indicator không hợp lệ, dùng body class: ${finalCpuType}`);
        } else if (storedCpuType === 'Intel' || storedCpuType === 'Amd') {
            finalCpuType = storedCpuType;
            console.warn(`❌ Body class không hợp lệ, dùng localStorage: ${finalCpuType}`);
        } else if (cpuType === 'Intel' || cpuType === 'Amd') {
            finalCpuType = cpuType;
            console.warn(`❌ Tất cả các nguồn đều không hợp lệ, dùng tham số: ${finalCpuType}`);
        } else {
            // Mặc định cuối cùng là Intel nếu tất cả đều thất bại
            finalCpuType = 'Intel';
            console.error(`❌ CRITICAL: Không thể xác định CPU type, mặc định dùng Intel`);
        }
        
        // ====== CRITICAL: ĐỒNG BỘ HÓA LẠI TẤT CẢ CÁC TRẠNG THÁI ======
        
        // 1. Cập nhật dropdown
        const cpuTypeDropdown = document.getElementById('cpu-type');
        if (cpuTypeDropdown && cpuTypeDropdown.value !== finalCpuType) {
            cpuTypeDropdown.value = finalCpuType;
            console.log(`✅ Đã cập nhật dropdown value: ${finalCpuType}`);
            // Không kích hoạt sự kiện change ở đây vì có thể gây loop vô hạn
        }
        
        // 2. Cập nhật data attributes trên body
        document.body.setAttribute('data-selected-cpu-type', finalCpuType);
        document.body.setAttribute('data-current-cpu-type', finalCpuType);
        
        // 3. Cập nhật class trên body
        document.body.classList.remove('intel-mode', 'amd-mode');
        document.body.classList.add(finalCpuType.toLowerCase() + '-mode');
        
        // 4. Cập nhật localStorage
        localStorage.setItem('selectedCpuType', finalCpuType);
        
        // 5. Cập nhật visual UI
        const intelOption = document.getElementById('intel-option');
        const amdOption = document.getElementById('amd-option');
        
        if (finalCpuType === 'Intel') {
            intelOption?.classList.add('selected');
            amdOption?.classList.remove('selected');
        } else {
            amdOption?.classList.add('selected');
            intelOption?.classList.remove('selected');
        }
        
        // 6. Tạo/cập nhật indicator cố định
        const existingIndicator = document.getElementById('permanent-cpu-indicator');
        if (existingIndicator) {
            existingIndicator.textContent = `${finalCpuType.toUpperCase()} MODE`;
            existingIndicator.style.backgroundColor = finalCpuType === 'Intel' ? '#0071c5' : '#ED1C24';
        } else {
            // Tạo mới indicator nếu chưa tồn tại
            const cpuIndicator = document.createElement('div');
            cpuIndicator.style.position = 'fixed';
            cpuIndicator.style.bottom = '20px';
            cpuIndicator.style.right = '20px';
            cpuIndicator.style.padding = '15px 20px';
            cpuIndicator.style.backgroundColor = finalCpuType === 'Intel' ? '#0071c5' : '#ED1C24';
            cpuIndicator.style.color = 'white';
            cpuIndicator.style.fontWeight = 'bold';
            cpuIndicator.style.fontSize = '18px';
            cpuIndicator.style.zIndex = '10000';
            cpuIndicator.style.borderRadius = '5px';
            cpuIndicator.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
            cpuIndicator.id = 'permanent-cpu-indicator';
            cpuIndicator.textContent = `${finalCpuType.toUpperCase()} MODE`;
            document.body.appendChild(cpuIndicator);
        }
        
        // 7. Hiển thị notification to về quá trình đồng bộ hóa
        const syncNotification = document.createElement('div');
        syncNotification.style.position = 'fixed';
        syncNotification.style.top = '100px';
        syncNotification.style.right = '10px';
        syncNotification.style.padding = '15px 20px';
        syncNotification.style.backgroundColor = '#4CAF50';
        syncNotification.style.color = 'white';
        syncNotification.style.zIndex = '10000';
        syncNotification.style.borderRadius = '5px';
        syncNotification.style.boxShadow = '0 0 15px rgba(0,0,0,0.3)';
        syncNotification.style.fontWeight = 'bold';
        syncNotification.style.fontSize = '16px';
        syncNotification.id = 'sync-notification';
        syncNotification.textContent = `✓ Đã đồng bộ CPU Type: ${finalCpuType}`;
        
        // Xóa notification cũ nếu có
        if (document.getElementById('sync-notification')) {
            document.getElementById('sync-notification').remove();
        }
        
        document.body.appendChild(syncNotification);
        setTimeout(() => {
            if (document.getElementById('sync-notification')) {
                document.getElementById('sync-notification').remove();
            }
        }, 3000);
        
        // ====== TIẾP TỤC LOGIC CHỌN CẤU HÌNH ======
        
        // Kiểm tra các tham số bắt buộc
        if (!gameId || !budget) {
            console.error('❌ Thiếu tham số bắt buộc: gameId hoặc budget');
            return null;
        }

        try {
            // Hiển thị loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.style.position = 'fixed';
            loadingIndicator.style.top = '50%';
            loadingIndicator.style.left = '50%';
            loadingIndicator.style.transform = 'translate(-50%, -50%)';
            loadingIndicator.style.padding = '20px 30px';
            loadingIndicator.style.backgroundColor = finalCpuType === 'Intel' ? '#0071c5' : '#ED1C24';
            loadingIndicator.style.color = 'white';
            loadingIndicator.style.borderRadius = '10px';
            loadingIndicator.style.zIndex = '10001';
            loadingIndicator.style.fontWeight = 'bold';
            loadingIndicator.style.fontSize = '24px';
            loadingIndicator.style.textAlign = 'center';
            loadingIndicator.style.boxShadow = '0 0 30px rgba(0,0,0,0.5)';
            loadingIndicator.id = 'config-loading-indicator';
            loadingIndicator.innerHTML = `<div>ĐANG TẢI CẤU HÌNH</div><div style="font-size: 32px; margin: 10px 0;">${finalCpuType.toUpperCase()}</div>`;
            
            // Xóa indicator cũ nếu có
            if (document.getElementById('config-loading-indicator')) {
                document.getElementById('config-loading-indicator').remove();
            }
            
            document.body.appendChild(loadingIndicator);
            
            // Chuyển đổi budget sang định dạng chuẩn
            const budgetInMillions = Math.floor(budget / 1000000);
            const budgetKey = `${budgetInMillions}M`;
            
            // CRITICAL: Gọi getConfig với finalCpuType đã được đồng bộ hóa
            console.log(`%c CALLING getConfig(${finalCpuType}, ${gameId}, ${budgetKey})`, 
                       'background: #333; color: #FFA500; font-weight: bold; padding: 5px;');
                       
            // CRITICAL CHECK: Xác minh rằng getConfig function tồn tại
            if (typeof window.getConfig !== 'function') {
                console.error('❌ CRITICAL ERROR: window.getConfig không phải là hàm!');
                console.log('window.getConfig =', window.getConfig);
                
                // Kiểm tra xem getConfig có trong phạm vi toàn cục không
                if (typeof getConfig === 'function') {
                    console.log('✅ Tìm thấy getConfig trong phạm vi toàn cục, gán vào window');
                    window.getConfig = getConfig;
                } else {
                    console.error('❌ getConfig không được tìm thấy trong phạm vi toàn cục');
                    
                    // Cập nhật loading indicator thành lỗi
                    if (document.getElementById('config-loading-indicator')) {
                        document.getElementById('config-loading-indicator').innerHTML = 
                            `❌ LỖI: Không thể tìm thấy hàm getConfig`;
                        document.getElementById('config-loading-indicator').style.backgroundColor = '#F44336';
                        
                        // Tự động xóa sau 3 giây
                        setTimeout(() => {
                            document.getElementById('config-loading-indicator')?.remove();
                        }, 3000);
                    }
                    
                    return null;
                }
            }
            
            // CRITICAL CHECK: Xác minh rằng các đối tượng cấu hình tồn tại
            console.log('Intel configs available:', window.intelConfigs ? Object.keys(window.intelConfigs).length : 'No');
            console.log('AMD configs available:', window.amdConfigs ? Object.keys(window.amdConfigs).length : 'No');
            
            // Gọi getConfig với tham số đã được xác minh
            const configResult = window.getConfig(finalCpuType, gameId, budgetKey);
            
            // Cập nhật loading indicator
            if (document.getElementById('config-loading-indicator')) {
                if (configResult) {
                    document.getElementById('config-loading-indicator').innerHTML = 
                        `✅ ĐÃ TẢI XONG CẤU HÌNH<br><strong>${finalCpuType.toUpperCase()}</strong>`;
                    document.getElementById('config-loading-indicator').style.backgroundColor = '#4CAF50';
                } else {
                    document.getElementById('config-loading-indicator').innerHTML = 
                        `❌ KHÔNG TÌM THẤY CẤU HÌNH<br>${finalCpuType.toUpperCase()}`;
                    document.getElementById('config-loading-indicator').style.backgroundColor = '#F44336';
                }
                
                // Tự động xóa sau 3 giây
                setTimeout(() => {
                    document.getElementById('config-loading-indicator')?.remove();
                }, 3000);
            }
            
            // Kiểm tra kết quả
            if (!configResult) {
                console.error(`❌ Không tìm thấy cấu hình cho ${finalCpuType} ${gameId} ${budgetKey}`);
                return null;
            }
            
            console.log(`%c ✅ Đã tìm thấy cấu hình cho ${finalCpuType} ${gameId} ${budgetKey}:`, 
                       'color: green; font-weight: bold;', configResult);
            
            // Xóa các lựa chọn hiện tại
            clearAllDropdowns();
            
            // Áp dụng cấu hình mới
            setTimeout(() => {
                // Áp dụng các lựa chọn thành phần từ cấu hình
                if (configResult.cpu) updateDropdown('cpu', configResult.cpu);
                if (configResult.mainboard) updateDropdown('mainboard', configResult.mainboard);
                if (configResult.vga) updateDropdown('vga', configResult.vga);
                if (configResult.ram) updateDropdown('ram', configResult.ram);
                if (configResult.ssd) updateDropdown('ssd', configResult.ssd);
                if (configResult.case) updateDropdown('case', configResult.case);
                if (configResult.cpuCooler) updateDropdown('cpuCooler', configResult.cpuCooler);
                if (configResult.psu) updateDropdown('psu', configResult.psu);
                
                // Check CPU-Mainboard compatibility
                const cpuDropdown = document.getElementById('cpu');
                const mainboardDropdown = document.getElementById('mainboard');
                
                if (cpuDropdown && mainboardDropdown && cpuDropdown.value && mainboardDropdown.value) {
                    checkSocketCompatibility(cpuDropdown.value, mainboardDropdown.value);
                }
                
                // Update prices and summary
                if (typeof updateComponentPrices === 'function') {
                    updateComponentPrices();
                }
                
                // Nếu có hàm calculateTotalPriceAndSummary, gọi nó
                if (typeof calculateTotalPriceAndSummary === 'function') {
                    calculateTotalPriceAndSummary();
                }
                
                console.log(`%c Configuration for ${finalCpuType} applied successfully`, 'color: green; font-weight: bold;');
                
                // CRITICAL FIX: LUÔN hiển thị bảng cấu hình chi tiết sau khi cập nhật
                // Chỉ hiển thị bảng nếu người dùng chưa đóng
                if (!window.userClosedConfigModal) {
                    // Click vào nút calculate để hiển thị bảng
                    const calculateButton = document.getElementById('calculate-button');
                    if (calculateButton) {
                        console.log('Triggering calculate button click to show configuration table');
                        calculateButton.click();
                    } else {
                        console.error('Calculate button not found, trying alternative method to show config');
                        
                        // Phương pháp thay thế: Gọi trực tiếp hàm showConfigDetailModal nếu có
                        if (typeof window.showConfigDetailModal === 'function') {
                            window.showConfigDetailModal();
                        }
                    }
                } else {
                    console.log('Not showing table because user manually closed it');
                }
                
                // REPLACED WITH:
                // Hiển thị bảng cấu hình sau khi auto-select chỉ khi người dùng chưa đóng nó
                console.log('Checking if we should show configuration table after auto-select');
                
                // Chỉ hiển thị nếu người dùng chưa đóng bảng
                if (!window.userClosedConfigModal) {
                    setTimeout(() => {
                        if (typeof window.showConfigDetailModal === 'function') {
                            window.showConfigDetailModal();
                        } else {
                            console.error('showConfigDetailModal function not available');
                            // Fallback to clicking the calculate button
                            const calculateButton = document.getElementById('calculate-button');
                            if (calculateButton) {
                                calculateButton.click();
                            }
                        }
                    }, 500); // Thêm một chút delay để đảm bảo các component đã được cập nhật
                } else {
                    console.log('Not showing table because user manually closed it');
                }
                
                // Thêm thông báo rằng bảng chi tiết đã hiển thị
                const tableNotification = document.createElement('div');
                tableNotification.style.position = 'fixed';
                tableNotification.style.bottom = '70px';
                tableNotification.style.left = '50%';
                tableNotification.style.transform = 'translateX(-50%)';
                tableNotification.style.padding = '10px 15px';
                tableNotification.style.backgroundColor = '#2196F3';
                tableNotification.style.color = 'white';
                tableNotification.style.zIndex = '10000';
                tableNotification.style.borderRadius = '5px';
                tableNotification.style.fontWeight = 'bold';
                tableNotification.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
                tableNotification.id = 'table-notification';
                tableNotification.textContent = `Bảng cấu hình chi tiết đã được cập nhật`;
                
                // Xóa thông báo cũ nếu có
                if (document.getElementById('table-notification')) {
                    document.getElementById('table-notification').remove();
                }
                
                document.body.appendChild(tableNotification);
                setTimeout(() => {
                    if (document.getElementById('table-notification')) {
                        document.getElementById('table-notification').remove();
                    }
                }, 3000);
                
            }, 300);
            
            return configResult;
        } catch (error) {
            console.error('Error in autoSelectConfig:', error);
            
            // Hiển thị lỗi cho người dùng
            const errorIndicator = document.createElement('div');
            errorIndicator.style.position = 'fixed';
            errorIndicator.style.top = '50%';
            errorIndicator.style.left = '50%';
            errorIndicator.style.transform = 'translate(-50%, -50%)';
            errorIndicator.style.padding = '20px 30px';
            errorIndicator.style.backgroundColor = '#F44336';
            errorIndicator.style.color = 'white';
            errorIndicator.style.zIndex = '10001';
            errorIndicator.style.fontWeight = 'bold';
            errorIndicator.style.fontSize = '16px';
            errorIndicator.style.borderRadius = '5px';
            errorIndicator.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
            errorIndicator.id = 'error-indicator';
            errorIndicator.innerHTML = `❌ LỖI: ${error.message || 'Không thể tải cấu hình'}`;
            
            // Xóa indicator cũ nếu có
            if (document.getElementById('error-indicator')) {
                document.getElementById('error-indicator').remove();
            }
            
            document.body.appendChild(errorIndicator);
            setTimeout(() => {
                if (document.getElementById('error-indicator')) {
                    document.getElementById('error-indicator').remove();
                }
            }, 5000);
            
            return null;
        }
    }

    // Helper function to clear all dropdown selections
    function clearAllDropdowns() {
        console.log('Clearing all component dropdowns...');
        
        const dropdowns = [
            'cpu', 'mainboard', 'vga', 'ram', 'ssd', 'case', 'cpuCooler', 'psu', 'hdd', 'monitor'
        ];
        
        // Reset all dropdowns to first option
        dropdowns.forEach(id => {
            const dropdown = document.getElementById(id);
            if (dropdown && dropdown.options.length > 0) {
                dropdown.selectedIndex = 0;
                
                try {
                    // Trigger change event to update UI
                    dropdown.dispatchEvent(new Event('change'));
                } catch (e) {
                    console.error(`Error dispatching change event for ${id}:`, e);
                }
            }
        });
        
        // Clear any compatibility warnings
        const socketMessage = document.getElementById('socket-message');
        if (socketMessage) {
            socketMessage.style.display = 'none';
        }
        
        // Reset any highlighted dropdowns
        dropdowns.forEach(id => {
            const dropdown = document.getElementById(id);
            if (dropdown) {
                dropdown.style.borderColor = '';
            }
        });
        
        // Update prices
        updateComponentPrices();
        
        console.log('All dropdowns cleared successfully');
    }

    // Định dạng giá tiền
    function formatPrice(price) {
        return price ? price.toLocaleString() : "0";
    }

    // Gọi hàm cập nhật giá khi có thay đổi trong các dropdown
    function setupPriceUpdateListeners() {
        const componentIds = ['cpu', 'mainboard', 'ram', 'vga', 'ssd', 'cpuCooler', 'psu', 'case', 'hdd', 'monitor'];
        
        componentIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // Xử lý sự kiện khi giá trị thay đổi
                element.addEventListener('change', function() {
                    console.log(`Component ${id} changed to ${this.value}`);
                    // Cập nhật bảng giá thời gian thực
                    updateComponentPrices();
                });
            }
        });
        
        console.log('Price update listeners set up successfully');
    }

    // Khởi tạo khi trang đã tải xong
    document.addEventListener('DOMContentLoaded', function() {
        // Thiết lập các sự kiện lắng nghe cho việc cập nhật giá
        setupPriceUpdateListeners();
        
        // Đảm bảo rằng bảng linh kiện trống khi mới tải trang
        const priceCells = document.querySelectorAll('[id$="-price"], [id$="-total"], [id$="-name"]');
        priceCells.forEach(cell => {
            if (cell) cell.textContent = '';
        });
        
        console.log('Component table initialized with empty values');
        
        // Cập nhật giá nếu đã có component được chọn (cho trường hợp refresh trang)
        setTimeout(updateComponentPrices, 1000);
    });

    // Hàm cập nhật giá trị dropdown
    function updateDropdown(id, value) {
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

        console.log(`Attempting to set ${id} dropdown to value: ${value}`);

        // Tìm option phù hợp
        let foundOption = false;
        let optionToSelect = null;

        // Phương pháp 1: Tìm chính xác theo value
        for (let i = 0; i < dropdown.options.length; i++) {
            const option = dropdown.options[i];
            if (option.value.toLowerCase() === value.toLowerCase()) {
                optionToSelect = option;
                foundOption = true;
                console.log(`Found exact match for ${id}: ${option.text}`);
            break;
        }
    }
    
        // Phương pháp 2: Tìm option có chứa value
        if (!foundOption) {
            for (let i = 0; i < dropdown.options.length; i++) {
                const option = dropdown.options[i];
                // Kiểm tra nếu value nằm trong option.value hoặc option.text
                if (option.value.toLowerCase().includes(value.toLowerCase()) || 
                    option.text.toLowerCase().includes(value.toLowerCase())) {
                    optionToSelect = option;
                    foundOption = true;
                    console.log(`Found partial match for ${id}: ${option.text}`);
            break;
        }
    }
        }

        // Phương pháp 3: Dùng option đầu tiên không phải là disabled & placeholder
        if (!foundOption) {
            for (let i = 0; i < dropdown.options.length; i++) {
                const option = dropdown.options[i];
                if (!option.disabled && option.value) {
                    optionToSelect = option;
                    foundOption = true;
                    console.log(`Using first available option for ${id}: ${option.text}`);
            break;
        }
            }
        }

        // Cập nhật giá trị dropdown nếu tìm thấy option
        if (foundOption && optionToSelect) {
            dropdown.value = optionToSelect.value;
            // Kích hoạt sự kiện change để cập nhật giao diện
            const event = new Event('change', { bubbles: true });
            dropdown.dispatchEvent(event);
            return true;
        } else {
            console.warn(`Could not find suitable option for ${id} with value ${value}`);
            return false;
        }
    }

    // Hàm lấy thế hệ CPU dựa trên ID (cần thêm vì bị thiếu)
    function getCPUGeneration(cpuId) {
        // Hàm xác định thế hệ CPU dựa trên ID
        if (!cpuId) return null;
        
        console.log('Getting CPU generation for:', cpuId);
        
        // ID có thể chứa một số mô tả thế hệ
        const cpuIdLower = cpuId.toLowerCase();
        
        // Intel
        if (cpuIdLower.includes('intel') || cpuIdLower.includes('i3') || 
            cpuIdLower.includes('i5') || cpuIdLower.includes('i7') || 
            cpuIdLower.includes('i9')) {
            
            // Thế hệ Intel
            if (cpuIdLower.includes('12') || cpuIdLower.includes('13')) {
                return 'latest'; // 12th/13th Gen
            } else if (cpuIdLower.includes('10') || cpuIdLower.includes('11')) {
                return 'current'; // 10th/11th Gen
            } else if (cpuIdLower.includes('8') || cpuIdLower.includes('9')) {
                return 'previous'; // 8th/9th Gen
        } else {
                return 'older'; // Thế hệ cũ hơn
            }
        }
        
        // AMD
        if (cpuIdLower.includes('amd') || cpuIdLower.includes('ryzen')) {
            // Thế hệ Ryzen
            if (cpuIdLower.includes('7000') || cpuIdLower.includes('7') || cpuIdLower.includes('zen4')) {
                return 'latest'; // Zen 4
            } else if (cpuIdLower.includes('5000') || cpuIdLower.includes('5') || cpuIdLower.includes('zen3')) {
                return 'current'; // Zen 3
            } else if (cpuIdLower.includes('3000') || cpuIdLower.includes('3') || cpuIdLower.includes('zen2')) {
                return 'previous'; // Zen 2
        } else {
                return 'older'; // Thế hệ cũ hơn
            }
        }
        
        // Mặc định nếu không thể xác định
        return 'unknown';
    }


    // Hiển thị chỉ số hiệu năng của hệ thống
    function showPerformanceMetrics(cpuKey, vgaKey, ramScore, ssdScore) {
        console.log('Showing performance metrics for:', cpuKey, vgaKey);
        
        try {
            // Tính toán điểm CPU
            let cpuScore = 50;  // Giá trị mặc định
            const cpu = window.cpuData[cpuKey];
            if (cpu) {
                if (cpu.name.includes('i9') || cpu.name.includes('Ryzen 9')) {
                    cpuScore = 95;
                } else if (cpu.name.includes('i7') || cpu.name.includes('Ryzen 7')) {
                    cpuScore = 85;
                } else if (cpu.name.includes('i5') || cpu.name.includes('Ryzen 5')) {
                    cpuScore = 75;
                } else if (cpu.name.includes('i3') || cpu.name.includes('Ryzen 3')) {
                    cpuScore = 60;
                }
            }
            
            // Tính toán điểm GPU
            let gpuScore = 50;  // Giá trị mặc định
            const vga = window.vgaData[vgaKey];
            if (vga) {
                if (vga.name.includes('4090') || vga.name.includes('4080')) {
                    gpuScore = 98;
                } else if (vga.name.includes('4070') || vga.name.includes('3090')) {
                    gpuScore = 92;
                } else if (vga.name.includes('3080') || vga.name.includes('6800')) {
                    gpuScore = 88;
                } else if (vga.name.includes('3070') || vga.name.includes('6700')) {
                    gpuScore = 80;
                } else if (vga.name.includes('3060') || vga.name.includes('6600')) {
                    gpuScore = 70;
                } else if (vga.name.includes('1660') || vga.name.includes('5500')) {
                    gpuScore = 60;
                } else if (vga.name.includes('1650') || vga.name.includes('5300')) {
                    gpuScore = 50;
                }
            }
            
            // Tính toán điểm tổng hợp cho các loại tác vụ
            const gamingScore = Math.round((gpuScore * 0.7 + cpuScore * 0.2 + ramScore * 0.1));
            const graphicsScore = Math.round((gpuScore * 0.6 + cpuScore * 0.3 + ramScore * 0.1));
            const officeScore = Math.round((cpuScore * 0.4 + ramScore * 0.3 + ssdScore * 0.3));
            const streamingScore = Math.round((cpuScore * 0.5 + gpuScore * 0.3 + ramScore * 0.2));
            const renderingScore = Math.round((cpuScore * 0.6 + gpuScore * 0.3 + ramScore * 0.1));
            const multitaskingScore = Math.round((cpuScore * 0.4 + ramScore * 0.4 + ssdScore * 0.2));
            
            // Cập nhật hiển thị điểm
            if (window.performanceChartInstance) {
                window.performanceChartInstance.data.datasets[0].data = [
                    gamingScore,
                    graphicsScore,
                    officeScore,
                    streamingScore,
                    renderingScore,
                    multitaskingScore
                ];
                window.performanceChartInstance.update();
            }
            
            // Tính điểm tổng hợp
            const overallScore = Math.round((gamingScore + graphicsScore + officeScore + streamingScore + renderingScore + multitaskingScore) / 6);
            
            // Cập nhật thông báo
            const scoreMessage = document.getElementById('score-message');
            if (scoreMessage) {
                let performanceLevel = "Trung bình";
                let color = "#f39c12";
                
                if (overallScore >= 90) {
                    performanceLevel = "Xuất sắc";
                    color = "#2ecc71";
                } else if (overallScore >= 80) {
                    performanceLevel = "Rất tốt";
                    color = "#27ae60";
                } else if (overallScore >= 70) {
                    performanceLevel = "Tốt";
                    color = "#3498db";
                } else if (overallScore >= 60) {
                    performanceLevel = "Khá";
                    color = "#f39c12";
                } else if (overallScore >= 50) {
                    performanceLevel = "Trung bình";
                    color = "#e67e22";
                } else {
                    performanceLevel = "Cơ bản";
                    color = "#e74c3c";
                }
                
                scoreMessage.innerHTML = `<strong>Đánh giá hiệu năng:</strong> Hệ thống của bạn đạt mức <span style="color:${color};font-weight:bold;">${performanceLevel}</span> với điểm tổng hợp ${overallScore}/100.`;
                scoreMessage.style.display = 'block';
            }
            
            // Hiển thị đề xuất nâng cấp nếu cần
            showUpgradeRecommendations(cpuScore, gpuScore, ramScore, ssdScore);
            
            console.log('Performance metrics updated successfully');
    } catch (error) {
            console.error('Error showing performance metrics:', error);
        }
    }
    
    // Hiển thị đề xuất nâng cấp
    function showUpgradeRecommendations(cpuScore, gpuScore, ramScore, ssdScore) {
        const upgradeMessage = document.getElementById('upgrade-message');
        if (!upgradeMessage) return;
        
        let recommendations = [];
        
        if (gpuScore < 60) {
            recommendations.push("nâng cấp card đồ họa");
        }
        
        if (cpuScore < 60) {
            recommendations.push("nâng cấp CPU");
        }
        
        if (ramScore < 60) {
            recommendations.push("thêm RAM");
        }
        
        if (ssdScore < 60) {
            recommendations.push("nâng cấp SSD nhanh hơn");
        }
        
        if (recommendations.length > 0) {
            upgradeMessage.innerHTML = `<strong>Đề xuất nâng cấp:</strong> Bạn nên cân nhắc ${recommendations.join(", ")} để có trải nghiệm tốt hơn.`;
            upgradeMessage.style.display = 'block';
        } else {
            upgradeMessage.style.display = 'none';
        }
    }

    // Cập nhật thanh tiến trình
    function updateProgressBar(id, value) {
        const progressBar = document.getElementById(id);
        if (progressBar) {
            progressBar.style.width = `${value}%`;
            progressBar.setAttribute('aria-valuenow', value);
            
            // Cập nhật màu sắc dựa trên giá trị
            if (value < 30) {
                progressBar.className = 'progress-bar bg-danger';
            } else if (value < 60) {
                progressBar.className = 'progress-bar bg-warning';
            } else if (value < 85) {
                progressBar.className = 'progress-bar bg-info';
            } else {
                progressBar.className = 'progress-bar bg-success';
            }
        }
    }

    // Hiển thị modal chi tiết cấu hình
    function showConfigDetailModal(configData) {
        // Completely disable this function to hide the modal
        return; // Early return prevents modal display
    }

    // Đảm bảo window.showConfigDetailModal luôn tham chiếu đến hàm mới nhất
    window.showConfigDetailModal = showConfigDetailModal;

    // Handle all images in the document
    document.querySelectorAll('img').forEach(img => {
        if (!img.complete || img.naturalHeight === 0) {
            img.onerror = function() {
                handleImageError(this);
            };
        }
    });

    // Hàm cập nhật dropdown
    function updateDropdown(componentType, value) {
        if (!componentType || !value) {
            console.warn(`Missing required parameters for updateDropdown: componentType=${componentType}, value=${value}`);
            return;
        }
        
        console.log(`Updating ${componentType} dropdown to value: ${value}`);
        
        const dropdown = document.getElementById(componentType);
        if (!dropdown) {
            console.error(`Cannot find dropdown with ID: ${componentType}`);
            return;
        }
        
        // Kiểm tra xem giá trị có tồn tại trong dropdown không
        let optionFound = false;
        
        // Xử lý đặc biệt cho tên giá trị CPU và mainboard
        let lookupValue = value;
        
        // Kiểm tra giá trị trong các tùy chọn và chọn nếu có
        for (let i = 0; i < dropdown.options.length; i++) {
            const option = dropdown.options[i];
            
            if (option.value === lookupValue) {
                dropdown.selectedIndex = i;
                optionFound = true;
                console.log(`✅ Found exact match for ${componentType}: ${lookupValue} at index ${i}`);
                break;
            }
        }
        
        // Nếu không tìm thấy giá trị chính xác, tìm kiếm một giá trị gần đúng
        if (!optionFound) {
            for (let i = 0; i < dropdown.options.length; i++) {
                const option = dropdown.options[i];
                
                // Tìm kiếm một giá trị chứa chuỗi tìm kiếm
                if (option.value.includes(lookupValue) || lookupValue.includes(option.value)) {
                    dropdown.selectedIndex = i;
                    optionFound = true;
                    console.log(`⚠️ Found partial match for ${componentType}: ${option.value} instead of ${lookupValue}`);
                    break;
                }
            }
        }
        
        // Nếu vẫn không tìm thấy, tìm kiếm trong text của option
        if (!optionFound) {
            for (let i = 0; i < dropdown.options.length; i++) {
                const option = dropdown.options[i];
                const optionText = option.text.toLowerCase();
                
                if (optionText.includes(lookupValue.toLowerCase())) {
                    dropdown.selectedIndex = i;
                    optionFound = true;
                    console.log(`⚠️ Found match in option text for ${componentType}: "${option.text}" contains "${lookupValue}"`);
                    break;
                }
            }
        }
        
        if (!optionFound) {
            console.warn(`⛔ No matching option found for ${componentType} with value: ${lookupValue}`);
            return;
        }
        
        // Kích hoạt sự kiện thay đổi để cập nhật giao diện
        dropdown.dispatchEvent(new Event('change'));
    }
});

// Add code to initialize socket compatibility check
document.addEventListener('DOMContentLoaded', function() {
    // Setup event listeners for CPU and mainboard changes to check compatibility
    const cpuDropdown = document.getElementById('cpu');
    const mainboardDropdown = document.getElementById('mainboard');
    
    if (cpuDropdown && mainboardDropdown) {
        cpuDropdown.addEventListener('change', function() {
            if (this.value && mainboardDropdown.value) {
                checkSocketCompatibility(this.value, mainboardDropdown.value);
            }
        });
        
        mainboardDropdown.addEventListener('change', function() {
            if (this.value && cpuDropdown.value) {
                checkSocketCompatibility(cpuDropdown.value, this.value);
            }
        });
        
        console.log('Socket compatibility check event listeners added');
    }
});

// Make autoSelectConfig globally available
window.autoSelectConfig = autoSelectConfig;

// Make checkSocketCompatibility globally available
window.checkSocketCompatibility = checkSocketCompatibility;

// Function to update component prices - Adding this function which was missing
function updateComponentPrices() {
    console.log('Updating component prices...');
    
    try {
        // Get all selected components
        const cpuSelect = document.getElementById('cpu');
        const mainboardSelect = document.getElementById('mainboard');
        const vgaSelect = document.getElementById('vga');
        const ramSelect = document.getElementById('ram');
        const ssdSelect = document.getElementById('ssd');
        const cpuCoolerSelect = document.getElementById('cpuCooler');
        const psuSelect = document.getElementById('psu');
        const caseSelect = document.getElementById('case');
        const hddSelect = document.getElementById('hdd');
        const monitorSelect = document.getElementById('monitor');
        
        // Calculate total price
        let totalPrice = 0;
        
        // CPU
        if (cpuSelect && cpuSelect.value && window.cpuData[cpuSelect.value]) {
            totalPrice += window.cpuData[cpuSelect.value].price;
        }
        
        // Mainboard
        if (mainboardSelect && mainboardSelect.value && window.mainboardData[mainboardSelect.value]) {
            totalPrice += window.mainboardData[mainboardSelect.value].price;
        }
        
        // VGA
        if (vgaSelect && vgaSelect.value && window.vgaData[vgaSelect.value]) {
            totalPrice += window.vgaData[vgaSelect.value].price;
        }
        
        // RAM
        if (ramSelect && ramSelect.value && window.ramData[ramSelect.value]) {
            totalPrice += window.ramData[ramSelect.value].price;
        }
        
        // SSD
        if (ssdSelect && ssdSelect.value && window.ssdData[ssdSelect.value]) {
            totalPrice += window.ssdData[ssdSelect.value].price;
        }
        
        // CPU Cooler
        if (cpuCoolerSelect && cpuCoolerSelect.value && window.cpuCoolerData[cpuCoolerSelect.value]) {
            totalPrice += window.cpuCoolerData[cpuCoolerSelect.value].price;
        }
        
        // PSU
        if (psuSelect && psuSelect.value && window.psuData[psuSelect.value]) {
            totalPrice += window.psuData[psuSelect.value].price;
        }
        
        // Case
        if (caseSelect && caseSelect.value && window.caseData[caseSelect.value]) {
            totalPrice += window.caseData[caseSelect.value].price;
        }
        
        // HDD
        if (hddSelect && hddSelect.value && window.hddData[hddSelect.value]) {
            totalPrice += window.hddData[hddSelect.value].price;
        }
        
        // Monitor
        if (monitorSelect && monitorSelect.value && window.monitorData[monitorSelect.value]) {
            totalPrice += window.monitorData[monitorSelect.value].price;
        }
        
        // Update total price display
        const totalPriceDisplay = document.getElementById('total-price');
        if (totalPriceDisplay) {
            const priceElement = totalPriceDisplay.querySelector('p');
            if (priceElement) {
                priceElement.textContent = `${totalPrice.toLocaleString()} VNĐ`;
            } else {
                console.warn('Price element not found in total-price display');
            }
        } else {
            console.warn('Total price display element not found');
        }
        
        // Update table total if it exists
        const totalPriceCell = document.getElementById('total-price-cell');
        if (totalPriceCell) {
            totalPriceCell.textContent = `${totalPrice.toLocaleString()} VNĐ`;
        }
        
        const remainingPriceCell = document.getElementById('remaining-price-cell');
        if (remainingPriceCell) {
            remainingPriceCell.textContent = `${totalPrice.toLocaleString()} VNĐ`;
        }
        
        console.log(`Total price updated: ${totalPrice.toLocaleString()} VNĐ`);
        return totalPrice;
    } catch (error) {
        console.error('Error updating component prices:', error);
        return 0;
    }
}

// Make updateComponentPrices globally available
window.updateComponentPrices = updateComponentPrices;

// Socket compatibility enhancement
window.extendedCheckSocketCompatibility = function(cpuKey, mainboardKey) {
    try {
        const socketMessage = document.getElementById('socket-message');
        if (!socketMessage) {
            // Tạo message div nếu chưa tồn tại
            const newSocketMessage = document.createElement('div');
            newSocketMessage.id = 'socket-message';
            newSocketMessage.style.padding = '10px';
            newSocketMessage.style.borderRadius = '5px';
            newSocketMessage.style.margin = '10px 0';
            newSocketMessage.style.fontWeight = 'bold';
            
            // Tìm vị trí để chèn
            const componentsGrid = document.querySelector('.components-grid') || document.querySelector('.component-container');
            const socketInfo = document.getElementById('socket-info');
            
            if (componentsGrid) {
                if (socketInfo) {
                    componentsGrid.insertBefore(newSocketMessage, socketInfo.nextSibling);
                } else {
                    componentsGrid.insertBefore(newSocketMessage, componentsGrid.firstChild);
                }
            }
        }
        
        if (!cpuKey || !mainboardKey || !window.cpuData || !window.cpuData[cpuKey] || !window.mainboardData || !window.mainboardData[mainboardKey]) {
            // Ẩn thông báo nếu không đủ dữ liệu
            const socketMessageUpdated = document.getElementById('socket-message');
            if (socketMessageUpdated) socketMessageUpdated.style.display = 'none';
            return false;
        }

        const cpu = window.cpuData[cpuKey];
        const mainboard = window.mainboardData[mainboardKey];
        
        // Lấy thông tin socket từ dữ liệu thực tế
        const cpuSocket = cpu.socket;
        const mbSockets = mainboard.sockets || [mainboard.socket]; // Hỗ trợ cả trường hợp sockets là mảng và socket là string
        
        console.log(`Checking compatibility: CPU socket = ${cpuSocket}, Mainboard sockets = ${JSON.stringify(mbSockets)}`);
        
        // Kiểm tra xem socket CPU có được hỗ trợ bởi mainboard không
        const isCompatible = Array.isArray(mbSockets) 
            ? mbSockets.includes(cpuSocket)
            : mbSockets === cpuSocket;
        
        // Lấy hoặc tạo socket message element
        const socketMessageElement = document.getElementById('socket-message');
        
        if (!isCompatible) {
            if (socketMessageElement) {
                socketMessageElement.innerHTML = `<strong>Cảnh báo:</strong> CPU (${cpuSocket}) không tương thích với mainboard (${Array.isArray(mbSockets) ? mbSockets.join(', ') : mbSockets}). Vui lòng chọn lại.`;
                socketMessageElement.style.display = 'block';
                socketMessageElement.style.color = '#e74c3c';
                socketMessageElement.style.backgroundColor = '#fadbd8';
            }
            
            // Hiển thị cảnh báo và log cho debug
            console.warn(`Socket incompatibility detected: CPU ${cpuKey} (${cpuSocket}) is not compatible with mainboard ${mainboardKey} (${Array.isArray(mbSockets) ? mbSockets.join(', ') : mbSockets})`);
            
            // Highlight các dropdown có vấn đề
            const cpuDropdown = document.getElementById('cpu');
            const mainboardDropdown = document.getElementById('mainboard');
            
            if (cpuDropdown) cpuDropdown.style.borderColor = '#e74c3c';
            if (mainboardDropdown) mainboardDropdown.style.borderColor = '#e74c3c';
            
            return false;
        } else {
            if (socketMessageElement) {
                socketMessageElement.style.display = 'none';
            }
            
            // Remove highlight nếu có
            const cpuDropdown = document.getElementById('cpu');
            const mainboardDropdown = document.getElementById('mainboard');
            
            if (cpuDropdown) cpuDropdown.style.borderColor = '';
            if (mainboardDropdown) mainboardDropdown.style.borderColor = '';
            
            // Sau khi CPU và mainboard đã tương thích, thiết lập giới hạn RAM
            updateRamOptionsBasedOnMainboard(mainboardKey);
            
            return true;
        }
    } catch (error) {
        console.error('Error checking socket compatibility:', error);
        return false;
    }
}

// Add event listeners for socket compatibility check
document.addEventListener('DOMContentLoaded', function() {
    const cpuDropdown = document.getElementById('cpu');
    const mainboardDropdown = document.getElementById('mainboard');
    
    if (cpuDropdown && mainboardDropdown) {
        cpuDropdown.addEventListener('change', function() {
            if (mainboardDropdown.value) {
                window.checkSocketCompatibility(this.value, mainboardDropdown.value);
            }
        });
        
        mainboardDropdown.addEventListener('change', function() {
            if (cpuDropdown.value) {
                window.checkSocketCompatibility(cpuDropdown.value, this.value);
            }
        });
        
        console.log('Socket compatibility check event listeners added');
    }
});

// Enhanced the budget range change handler
const enhanceBudgetHandler = () => {
    const budgetRange = document.getElementById('budget-range');
    if (budgetRange) {
        // Keep existing handlers but add our new one
        budgetRange.addEventListener('change', function() {
            console.log('Enhanced budget handler triggered');
            
            // Always try to show the configuration table after a delay
            setTimeout(() => {
                if (typeof window.showConfigDetailModal === 'function') {
                    console.log('Showing configuration table after budget change');
                    window.showConfigDetailModal();
                }
            }, 500);
        });
    }
};

// Enhance game selection handler
const enhanceGameSelectionHandler = () => {
    const gameGenre = document.getElementById('game-genre');
    if (gameGenre) {
        gameGenre.addEventListener('change', function() {
            console.log('Enhanced game selection handler triggered');
            
            // Always try to show the configuration table after a delay
            setTimeout(() => {
                if (typeof window.showConfigDetailModal === 'function') {
                    console.log('Showing configuration table after game selection change');
                    window.showConfigDetailModal();
                }
            }, 500);
        });
    }
};

// Initialize our enhanced handlers
document.addEventListener('DOMContentLoaded', function() {
    enhanceBudgetHandler();
    enhanceGameSelectionHandler();
    
    // Also add a global button to force show the configuration table
    const createShowTableButton = () => {
        const existingButton = document.getElementById('force-show-table-button');
        if (!existingButton) {
            const button = document.createElement('button');
            button.id = 'force-show-table-button';
            button.textContent = 'Hiển thị bảng cấu hình';
            button.style.position = 'fixed';
            button.style.bottom = '20px';
            button.style.left = '20px';
            button.style.zIndex = '9999';
            button.style.padding = '10px 15px';
            button.style.backgroundColor = '#4CAF50';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '5px';
            button.style.cursor = 'pointer';
            button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
            
            button.addEventListener('click', function() {
                if (typeof window.showConfigDetailModal === 'function') {
                    window.showConfigDetailModal();
                }
            });
            
            document.body.appendChild(button);
        }
    };
    
    // Create the button after a delay to ensure the page is fully loaded
    setTimeout(createShowTableButton, 1000);
});

// Remove the automatic interval check that was showing the modal every 2 seconds
// We'll only show the modal when user explicitly takes actions
// No automatic checking interval
                        
// Add code at the end of the file to fix both issues
// 1. Fix socket compatibility issue
// 2. Ensure configuration table is always displayed after any change

// Fix the missing checkSocketCompatibility global reference
// Đảm bảo chỉ có một bản của hàm kiểm tra tương thích socket
window.checkSocketCompatibility = function(cpuKey, mainboardKey) {
    const socketMessage = document.getElementById('socket-message');
    if (!socketMessage) return;
    
    try {
        if (!cpuKey || !mainboardKey || !window.cpuData || !window.cpuData[cpuKey] || !window.mainboardData || !window.mainboardData[mainboardKey]) {
            socketMessage.style.display = 'none';
            return;
        }

        const cpu = window.cpuData[cpuKey];
        const mainboard = window.mainboardData[mainboardKey];
        
        // Lấy thông tin socket từ dữ liệu thực tế
        const cpuSocket = cpu.socket;
        const mbSockets = mainboard.sockets || [mainboard.socket]; // Hỗ trợ cả trường hợp sockets là mảng và socket là string
        
        console.log(`Checking compatibility: CPU socket = ${cpuSocket}, Mainboard sockets = ${JSON.stringify(mbSockets)}`);
        
        // Kiểm tra xem socket CPU có được hỗ trợ bởi mainboard không
        const isCompatible = Array.isArray(mbSockets) 
            ? mbSockets.includes(cpuSocket)
            : mbSockets === cpuSocket;
        
        if (!isCompatible) {
            socketMessage.innerHTML = `<strong>Cảnh báo:</strong> CPU (${cpuSocket}) không tương thích với mainboard (${Array.isArray(mbSockets) ? mbSockets.join(', ') : mbSockets}). Vui lòng chọn lại.`;
            socketMessage.style.display = 'block';
            socketMessage.style.color = '#e74c3c';
            socketMessage.style.backgroundColor = '#fadbd8';
            socketMessage.style.padding = '10px';
            socketMessage.style.borderRadius = '5px';
            socketMessage.style.margin = '10px 0';
            
            // Hiển thị cảnh báo và log cho debug
            console.warn(`Socket incompatibility detected: CPU ${cpuKey} (${cpuSocket}) is not compatible with mainboard ${mainboardKey} (${Array.isArray(mbSockets) ? mbSockets.join(', ') : mbSockets})`);
            
            // Highlight các dropdown có vấn đề
            const cpuDropdown = document.getElementById('cpu');
            const mainboardDropdown = document.getElementById('mainboard');
            
            if (cpuDropdown) cpuDropdown.style.borderColor = '#e74c3c';
            if (mainboardDropdown) mainboardDropdown.style.borderColor = '#e74c3c';
        } else {
            socketMessage.style.display = 'none';
            
            // Remove highlight nếu có
            const cpuDropdown = document.getElementById('cpu');
            const mainboardDropdown = document.getElementById('mainboard');
            
            if (cpuDropdown) cpuDropdown.style.borderColor = '';
            if (mainboardDropdown) mainboardDropdown.style.borderColor = '';
        }
    } catch (error) {
        console.error('Error checking socket compatibility:', error);
        socketMessage.style.display = 'none';
    }
};

// Add a direct trigger to show the configuration table after component changes, but only when appropriate
document.addEventListener('DOMContentLoaded', function() {
    // List of all component dropdowns to monitor
    const componentDropdowns = [
        'cpu', 'mainboard', 'vga', 'ram', 'ssd', 'cpuCooler', 'psu', 'case', 'hdd', 'monitor',
        'game-genre', 'budget-range', 'cpu-type'
    ];
    
    // Biến để kiểm soát hiển thị bảng
    window.userClosedConfigModal = false;
    window.hasRequiredSelections = false;
    
    // Hàm kiểm tra đã đủ điều kiện hiển thị bảng chưa
    function checkRequiredSelections() {
        const cpu = document.getElementById('cpu');
        const mainboard = document.getElementById('mainboard');
        const gameGenre = document.getElementById('game-genre');
        
        return cpu && cpu.value && cpu.value !== '' && 
               mainboard && mainboard.value && mainboard.value !== '' &&
               gameGenre && gameGenre.value && gameGenre.value !== '';
    }
    
    // Add change listeners to all dropdowns
    componentDropdowns.forEach(id => {
        const dropdown = document.getElementById(id);
        if (dropdown) {
            dropdown.addEventListener('change', function() {
                console.log(`Component ${id} changed, checking if should display table`);
                
                // Delay a bit to let other handlers run first
                setTimeout(() => {
                    // Kiểm tra xem có đủ điều kiện để hiển thị và người dùng chưa đóng bảng
                    window.hasRequiredSelections = checkRequiredSelections();
                    
                    if (window.hasRequiredSelections && !window.userClosedConfigModal) {
                        if (typeof window.showConfigDetailModal === 'function') {
                            console.log(`Showing configuration table after ${id} change`);
                            window.showConfigDetailModal();
                        }
                    } else {
                        console.log(`Not showing table: hasRequiredSelections=${window.hasRequiredSelections}, userClosedModal=${window.userClosedConfigModal}`);
                    }
                }, 800);
            });
        }
    });
    
    console.log('Added conditional table display triggers to all component dropdowns');
    
    // Create a button to manually show the configuration table
    const showTableButtonContainer = document.createElement('div');
    showTableButtonContainer.style.position = 'fixed';
    showTableButtonContainer.style.bottom = '20px';
    showTableButtonContainer.style.left = '20px';
    showTableButtonContainer.style.zIndex = '9999';
    
    const showTableButton = document.createElement('button');
    showTableButton.textContent = 'Hiển thị bảng cấu hình';
    showTableButton.style.padding = '10px 15px';
    showTableButton.style.backgroundColor = '#4CAF50';
    showTableButton.style.color = 'white';
    showTableButton.style.border = 'none';
    showTableButton.style.borderRadius = '5px';
    showTableButton.style.cursor = 'pointer';
    showTableButton.style.fontWeight = 'bold';
    showTableButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    
    showTableButton.addEventListener('click', function() {
        // When the button is clicked, it's an explicit user action
        // So we reset the closed state and show the table
        window.userClosedConfigModal = false;
        if (typeof window.showConfigDetailModal === 'function') {
            window.showConfigDetailModal();
        }
    });
    
    showTableButtonContainer.appendChild(showTableButton);
    document.body.appendChild(showTableButtonContainer);
    
    // Không tự động hiển thị bảng khi tải trang - phải đợi người dùng chọn
    console.log('Auto-display of configuration table on page load is disabled - waiting for user selection');
});
                        
// Add code for manual display button and conditional display after selections
document.addEventListener('DOMContentLoaded', function() {
    // Create a centralized function to display the configuration table only when appropriate
    window.showConfigTable = function(forceShow = false) {
        // Validate component compatibility
        if (typeof window.validateComponentCompatibility === 'function') {
            const isValid = window.validateComponentCompatibility();
            if (!isValid && !forceShow) {
                alert('Có lỗi tương thích giữa các linh kiện. Vui lòng kiểm tra và sửa lỗi trước khi tiếp tục.');
                return;
            }
        }
        
        // Kiểm tra xem có đủ các thành phần quan trọng đã được chọn
        function hasRequiredComponents() {
            const cpu = document.getElementById('cpu');
            const vga = document.getElementById('vga');
            return cpu && cpu.value && cpu.value !== '' && 
                   vga && vga.value && vga.value !== '';
        }
        
        if (!hasRequiredComponents() && !forceShow) {
            alert('Vui lòng chọn ít nhất CPU và VGA để xem bảng cấu hình chi tiết');
            return;
        }
        
        if (typeof window.showConfigDetailModal === 'function') {
            // Reset đóng modal
            window.userClosedConfigModal = false;
            // Khi gọi hàm với force = true, chúng ta sẽ luôn hiển thị bảng
            window.showConfigDetailModal({forceShow: true});
        } else {
            console.log('Not showing configuration table - missing showConfigDetailModal function');
        }
    };
    
    // Attach listeners to important controls, but use more restraint in showing the table
    
    // 1. CPU Type dropdown
    const cpuTypeDropdown = document.getElementById('cpu-type');
    if (cpuTypeDropdown) {
        cpuTypeDropdown.addEventListener('change', function() {
            console.log('CPU type changed, not auto-showing table');
            // Không tự động hiển thị khi thay đổi loại CPU
        });
    }
    
    // 2. Game selection dropdown
    const gameDropdown = document.getElementById('game-genre');
    if (gameDropdown) {
        gameDropdown.addEventListener('change', function() {
            console.log('Game selection changed');
            // Chỉ cập nhật dữ liệu, không tự động hiển thị
        });
    }
    
    // 3. Budget slider
    const budgetSlider = document.getElementById('budget-slider');
    if (budgetSlider) {
        budgetSlider.addEventListener('change', function() {
            console.log('Budget changed');
            // Chỉ cập nhật dữ liệu, không tự động hiển thị
        });
    }
    
    // 4. Component dropdowns - all of them
    const componentDropdowns = [
        'cpu', 'mainboard', 'vga', 'ram', 'ssd', 'cpuCooler', 'psu', 'case', 'hdd', 'monitor'
    ];
    
    // Theo dõi những lần thay đổi thành phần liên tiếp
    let lastChangeTime = 0;
    let changeCount = 0;
    
    componentDropdowns.forEach(component => {
        const dropdown = document.getElementById(component);
        if (dropdown) {
            dropdown.addEventListener('change', function() {
                console.log(`${component} selection changed`);
                
                // Theo dõi thay đổi nhanh liên tiếp - chỉ hiển thị bảng sau khi người dùng đã chọn xong
                const now = new Date().getTime();
                if (now - lastChangeTime < 2000) {
                    changeCount++;
                } else {
                    changeCount = 1;
                }
                lastChangeTime = now;
                
                // Nếu đã thay đổi 3 thành phần trở lên và đã chọn đủ CPU và VGA
                if (changeCount >= 3) {
                    setTimeout(() => {
                        showConfigTable(false);
                        changeCount = 0;
                    }, 1000);
                }
            });
        }
    });
    
    console.log('Added manual table display button and component change listeners');
});
                        
// Enhanced version of checkSocketCompatibility to ensure RAM works with mainboard
// Sử dụng wrapper function thay vì khai báo lại
window.enhancedCheckSocketCompatibility = function(cpuKey, mainboardKey) {
    const socketMessage = document.getElementById('socket-message');
    if (!socketMessage) return false;
    
    try {
        if (!cpuKey || !mainboardKey || !window.cpuData[cpuKey] || !window.mainboardData[mainboardKey]) {
            socketMessage.style.display = 'none';
            return false;
        }

        const cpu = window.cpuData[cpuKey];
        const mainboard = window.mainboardData[mainboardKey];
        
        // Get socket information from actual data
        const cpuSocket = cpu.socket || getCPUSocketFromName(cpu.name);
        const mbSocket = mainboard.socket || getMainboardSocketFromName(mainboard.name);
        
        // Sử dụng hàm determineCpuMainboardCompatibility để kiểm tra tương thích
        const isCompatible = determineCpuMainboardCompatibility(cpu, mainboard);
        
        // Cập nhật thông tin socket ở phần đầu trang
        const socketInfoDiv = document.getElementById('socket-info');
        if (socketInfoDiv) {
            // Xác định RAM Type
            let ramType = 'DDR4'; // Mặc định
            if (cpu.memoryType) {
                ramType = cpu.memoryType;
            } else if (mainboard.memoryType) {
                ramType = mainboard.memoryType;
            } else if (mainboard.name.includes('DDR5') || cpuSocket === 'AM5' || 
                      (cpuSocket === 'LGA1700' && !mainboard.name.includes('DDR4'))) {
                ramType = 'DDR5';
            }
            
            // Hiển thị với màu nổi bật
            socketInfoDiv.innerHTML = `
                <span style="color:#1e88e5; font-weight:bold;">CPU Socket: ${cpuSocket}</span> | 
                <span style="color:#43a047; font-weight:bold;">Mainboard Socket: ${mbSocket}</span> | 
                <span style="color:#e53935; font-weight:bold;">RAM Type: ${ramType}</span>
            `;
        }
        
        // Update UI based on compatibility
        if (isCompatible) {
            socketMessage.textContent = "✅ CPU và Mainboard tương thích.";
            socketMessage.style.color = "green";
            socketMessage.style.display = 'block';
        } else {
            socketMessage.textContent = "⚠️ CPU và Mainboard không tương thích!";
            socketMessage.style.color = "red";
            socketMessage.style.display = 'block';
        }
        
        return isCompatible;
    } catch (error) {
        console.error("Error checking socket compatibility:", error);
        socketMessage.style.display = 'none';
        return false;
    }
};

// Force show component table when user has selected components
function forceShowComponentTable() {
    // Completely disable this function to prevent force-showing the table
    return; // Early return prevents table display
}

// Add this function to the window load event
window.addEventListener('load', function() {
    // Add event listeners to validate components and only show table when components are compatible
    const dropdowns = ['cpu', 'mainboard', 'vga', 'ram', 'ssd', 'psu', 'case', 'cpuCooler'];
    
    // Validate all components on page load
    if (typeof window.validateComponentCompatibility === 'function') {
        setTimeout(window.validateComponentCompatibility, 1000);
    }
    
    // Add listeners to dropdowns
    for (let i = 0; i < dropdowns.length; i++) {
        const id = dropdowns[i];
        const dropdown = document.getElementById(id);
        if (dropdown) {
            dropdown.addEventListener('change', function() {
                // Kiểm tra tương thích trước khi hiển thị bảng
                if (typeof window.validateComponentCompatibility === 'function') {
                    const isValid = window.validateComponentCompatibility();
                    
                    // Chỉ hiển thị bảng nếu tất cả đều tương thích
                    if (isValid) {
                        setTimeout(forceShowComponentTable, 100); // Short delay to ensure other handlers run first
                    }
                }
            });
        }
    }
    
    // Button removed
});
                        
document.addEventListener('DOMContentLoaded', function() {
    // Tạo nút hiển thị bảng cấu hình chi tiết
    function createShowConfigButton() {
        // Completely disable this function to remove the button
        return; // Early return prevents button creation
    }
    
    // Tạo nút khi trang đã tải xong
    setTimeout(createShowConfigButton, 500);
    
    // Theo dõi các thay đổi DOM để thêm nút khi cần
    const observer = new MutationObserver(function(mutations) {
        if (!document.getElementById('show-config-detail-button')) {
            createShowConfigButton();
        }
    });
    
    // Bắt đầu quan sát DOM
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Rest of existing code...
});
                        
// Thêm sự kiện để hiển thị bảng cấu hình khi nút tính toán được nhấn
document.addEventListener('DOMContentLoaded', function() {
    const calculateButton = document.getElementById('calculate-button');
    if (calculateButton) {
        calculateButton.addEventListener('click', function() {
            console.log('Calculate button clicked, showing configuration table');
            
            // Reset trạng thái đóng bảng vì đây là hành động rõ ràng của người dùng
            window.userClosedConfigModal = false;
            
            // Đảm bảo rằng các thành phần đã được cập nhật trước khi hiển thị bảng
            setTimeout(() => {
                // Tính tổng giá và hiển thị thông tin
                if (typeof calculateTotalPriceAndSummary === 'function') {
                    calculateTotalPriceAndSummary();
                }
                
                // Hiển thị bảng chi tiết
                if (typeof window.showConfigDetailModal === 'function') {
                    window.showConfigDetailModal();
                }
            }, 300);
        });
        console.log('Added listener to calculate button for showing config table');
    }
    
    // Đảm bảo nút hiển thị bảng cấu hình chi tiết luôn được thêm vào
    setTimeout(function() {
        // Tìm vùng chọn linh kiện
        const componentsArea = document.querySelector('.components-selection') || 
                              document.querySelector('.components-grid') || 
                              document.querySelector('.component-container');
        
        if (componentsArea && !document.getElementById('config-detail-button')) {
            // Configuration detail button completely removed
        }
    }, 1000);
});
                        
// Hàm tạo modal elements nếu chưa tồn tại
function createModalElements() {
    console.log('Creating modal elements');
    
    // Kiểm tra xem modal đã tồn tại chưa
    if (document.getElementById('summary-modal')) return;
    
    // Tạo modal container
    const summaryModal = document.createElement('div');
    summaryModal.id = 'summary-modal';
    summaryModal.className = 'modal';
    summaryModal.style.display = 'none';
    summaryModal.style.position = 'fixed';
    summaryModal.style.zIndex = '9999';
    summaryModal.style.left = '0';
    summaryModal.style.top = '0';
    summaryModal.style.width = '100%';
    summaryModal.style.height = '100%';
    summaryModal.style.overflow = 'auto';
    summaryModal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    
    // Tạo modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.margin = '50px auto';
    modalContent.style.padding = '20px';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '900px';
    modalContent.style.borderRadius = '5px';
    modalContent.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
    
    // Tạo modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.style.borderBottom = '1px solid #eee';
    modalHeader.style.padding = '10px 0';
    modalHeader.style.marginBottom = '20px';
    modalHeader.style.display = 'flex';
    modalHeader.style.justifyContent = 'space-between';
    modalHeader.style.alignItems = 'center';
    
    // Tạo tiêu đề
    const modalTitle = document.createElement('h2');
    modalTitle.innerHTML = '<i class="fas fa-clipboard-list"></i> Cấu hình chi tiết';
    modalTitle.style.margin = '0';
    modalTitle.style.fontSize = '24px';
    modalTitle.style.color = '#333';
    
    // Tạo nút đóng
    const closeButton = document.createElement('span');
    closeButton.className = 'close-modal';
    closeButton.innerHTML = '&times;';
    closeButton.style.fontSize = '28px';
    closeButton.style.fontWeight = 'bold';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#333';
    
    // Thêm sự kiện click cho nút đóng
    closeButton.addEventListener('click', function() {
        summaryModal.style.display = 'none';
        // Đánh dấu là người dùng đã đóng modal
        window.userClosedConfigModal = true;
    });
    
    // Tạo modal body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    
    // Tạo container cho danh sách thành phần
    const componentsList = document.createElement('div');
    componentsList.id = 'modal-components-list';
    
    // Tạo container cho tổng giá
    const totalPrice = document.createElement('div');
    totalPrice.id = 'modal-total-price';
    totalPrice.textContent = 'Tổng cộng: 0 VNĐ';
    totalPrice.style.marginTop = '20px';
    totalPrice.style.fontWeight = 'bold';
    totalPrice.style.fontSize = '18px';
    
    // Tạo container cho hình ảnh xem trước
    const imagePreview = document.createElement('div');
    imagePreview.id = 'image-preview-container';
    
    // Tạo container cho các tùy chọn chia sẻ
    const shareOptions = document.createElement('div');
    shareOptions.className = 'share-options';
    shareOptions.style.marginTop = '20px';
    shareOptions.style.display = 'flex';
    shareOptions.style.gap = '10px';
    shareOptions.style.justifyContent = 'center';
    
    // Tạo các nút chia sẻ
    const shareFacebook = document.createElement('button');
    shareFacebook.id = 'share-facebook';
    shareFacebook.className = 'share-button';
    shareFacebook.innerHTML = '<i class="fab fa-facebook"></i> Chia sẻ Facebook';
    shareFacebook.style.padding = '10px 15px';
    shareFacebook.style.backgroundColor = '#3b5998';
    shareFacebook.style.color = 'white';
    shareFacebook.style.border = 'none';
    shareFacebook.style.borderRadius = '5px';
    shareFacebook.style.cursor = 'pointer';
    
    const copyLink = document.createElement('button');
    copyLink.id = 'copy-link';
    copyLink.className = 'share-button';
    copyLink.innerHTML = '<i class="fas fa-link"></i> Sao chép liên kết';
    copyLink.style.padding = '10px 15px';
    copyLink.style.backgroundColor = '#607d8b';
    copyLink.style.color = 'white';
    copyLink.style.border = 'none';
    copyLink.style.borderRadius = '5px';
    copyLink.style.cursor = 'pointer';
    
    const downloadConfig = document.createElement('button');
    downloadConfig.id = 'download-config';
    downloadConfig.className = 'share-button luu-cau-hinh';
    downloadConfig.innerHTML = '<i class="fas fa-download"></i> Tải cấu hình';
    downloadConfig.style.padding = '10px 15px';
    downloadConfig.style.backgroundColor = '#4caf50';
    downloadConfig.style.color = 'white';
    downloadConfig.style.border = 'none';
    downloadConfig.style.borderRadius = '5px';
    downloadConfig.style.cursor = 'pointer';
    
    // Xây dựng cấu trúc DOM
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    shareOptions.appendChild(shareFacebook);
    shareOptions.appendChild(copyLink);
    shareOptions.appendChild(downloadConfig);
    
    modalBody.appendChild(componentsList);
    modalBody.appendChild(totalPrice);
    modalBody.appendChild(imagePreview);
    modalBody.appendChild(shareOptions);
    
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    
    summaryModal.appendChild(modalContent);
    
    // Thêm modal vào body
    document.body.appendChild(summaryModal);
    
    console.log('Modal elements created successfully');
    
    return summaryModal;
}
                        
// Thêm nút hiển thị bảng cấu hình chính ở cuối trang sau khi đã chọn các thành phần
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        // Đã loại bỏ hoàn toàn việc tạo nút hiển thị bảng cấu hình chi tiết
        console.log('Config detail button creation disabled');
    }, 1000);
});
                        
// Thêm hàm global thống nhất để kiểm tra tương thích
window.validateComponentCompatibility = function() {
    // Lấy các giá trị đã chọn
    const cpuValue = document.getElementById('cpu')?.value;
    const mainboardValue = document.getElementById('mainboard')?.value;
    const ramValue = document.getElementById('ram')?.value;
    const vgaValue = document.getElementById('vga')?.value;
    
    // Biến để kiểm tra tất cả các thành phần đều tương thích
    let allComponentsValid = true;
    let errorMessages = [];
    
    // Reset border colors
    const resetBorderColors = () => {
        const dropdowns = ['cpu', 'mainboard', 'ram', 'vga', 'ssd', 'psu', 'case', 'cpuCooler', 'hdd', 'monitor'];
        dropdowns.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.borderColor = '';
        });
    };
    resetBorderColors();
    
    // Xóa thông báo cũ
    const clearOldMessages = () => {
        const container = document.querySelector('.components-grid');
        if (container) {
            const oldMessages = container.querySelectorAll('.compatibility-error');
            oldMessages.forEach(m => m.remove());
        }
    };
    clearOldMessages();
    
    // Kiểm tra tương thích CPU-Mainboard
    if (cpuValue && mainboardValue) {
        const cpu = window.cpuData[cpuValue];
        const mainboard = window.mainboardData[mainboardValue];
        
        if (cpu && mainboard) {
            // Đảm bảo socket đã được xác định
            if (!cpu.socket) {
                cpu.socket = getCPUSocketFromName(cpu.name);
                logger.log(`Detected CPU socket for ${cpu.name}: ${cpu.socket}`);
            }
            
            if (!mainboard.socket) {
                mainboard.socket = getMainboardSocketFromName(mainboard.name);
                logger.log(`Detected Mainboard socket for ${mainboard.name}: ${mainboard.socket}`);
            }
            
            const isCpuMbCompatible = determineCpuMainboardCompatibility(cpu, mainboard);
            
            if (!isCpuMbCompatible) {
                // Lấy tên socket để hiển thị
                const cpuSocket = cpu.socket || getCPUSocketFromName(cpu.name) || 'Unknown';
                const mbSocket = mainboard.socket || getMainboardSocketFromName(mainboard.name) || 'Unknown';
                
                errorMessages.push(`CPU ${cpu.name} (Socket ${cpuSocket}) không tương thích với Mainboard ${mainboard.name} (Socket ${mbSocket})`);
                
                // Highlight dropdown lỗi
                const cpuDropdown = document.getElementById('cpu');
                const mainboardDropdown = document.getElementById('mainboard');
                if (cpuDropdown) cpuDropdown.style.borderColor = '#e74c3c';
                if (mainboardDropdown) mainboardDropdown.style.borderColor = '#e74c3c';
                
                allComponentsValid = false;
            }
            
            // Kiểm tra tương thích RAM-Mainboard nếu đã chọn RAM
            if (ramValue) {
                const ram = window.ramData[ramValue];
                
                // Đảm bảo ram có dữ liệu đầy đủ
                if (ram) {
                    if (!ram.type) {
                        // Nhận dạng tốt hơn cho loại RAM
                        if (ram.name.includes('DDR5') || 
                            ram.name.includes('Bus 6000') || 
                            ram.name.includes('Bus 5200') ||
                            ram.name.includes('TridentZ') && !ram.name.includes('DDR4')) {
                            ram.type = 'DDR5';
                        }
                        else if (ram.name.includes('DDR4') || 
                                ram.name.includes('Bus 3200') || 
                                ram.name.includes('LPX') || 
                                ram.name.includes('Fury') ||
                                ram.name.includes('Vengeance') && !ram.name.includes('5200')) {
                            ram.type = 'DDR4';
                        }
                        else if (ram.name.includes('DDR3') || 
                                ram.name.includes('1600MHz')) {
                            ram.type = 'DDR3';
                        }
                        else {
                            // Dự đoán dựa trên giá cả nếu không thể nhận dạng
                            const price = ram.price || 0;
                            if (price > 1000000) ram.type = 'DDR5';
                            else if (price > 300000) ram.type = 'DDR4';
                            else ram.type = 'DDR3';
                        }
                        logger.log(`Detected RAM type for ${ram.name}: ${ram.type}`);
                    }
                    
                    // Xác định loại RAM hỗ trợ bởi mainboard nếu chưa có
                    if (!mainboard.memoryType) {
                        if (mainboard.socket === 'AM5') {
                            mainboard.memoryType = 'DDR5';
                        } 
                        else if (mainboard.socket === 'AM4') {
                            mainboard.memoryType = 'DDR4';
                        }
                        else if (mainboard.socket === 'LGA1700') {
                            // LGA1700 hỗ trợ cả DDR4 và DDR5 tùy model
                            if (mainboard.name.includes('D4') || mainboard.name.includes('DDR4')) {
                                mainboard.memoryType = 'DDR4';
                            } else {
                                mainboard.memoryType = 'DDR5';
                            }
                        }
                        else if (mainboard.socket === 'LGA1200' || mainboard.socket === 'LGA1151') {
                            mainboard.memoryType = 'DDR4';
                        }
                        else if (mainboard.socket === 'LGA1150' || mainboard.socket === 'LGA1155') {
                            mainboard.memoryType = 'DDR3';
                        }
                        else {
                            // Xác định từ chipset trong tên
                            if (mainboard.name.includes('B650') || mainboard.name.includes('X670')) {
                                mainboard.memoryType = 'DDR5';
                            }
                            else if (mainboard.name.includes('B550') || mainboard.name.includes('B450') || 
                                    mainboard.name.includes('X570')) {
                                mainboard.memoryType = 'DDR4';
                            }
                            else if (mainboard.name.includes('DDR5')) {
                                mainboard.memoryType = 'DDR5';
                            }
                            else if (mainboard.name.includes('DDR4')) {
                                mainboard.memoryType = 'DDR4';
                            }
                            else if (mainboard.name.includes('DDR3')) {
                                mainboard.memoryType = 'DDR3';
                            }
                            else {
                                // Mặc định giả định RAM type dựa trên tên
                                mainboard.memoryType = 'DDR4'; // Mặc định cho phần lớn mainboard hiện đại
                            }
                        }
                        logger.log(`Detected mainboard memory type for ${mainboard.name}: ${mainboard.memoryType}`);
                    }
                    
                    const isRamCompatible = determineRamCompatibility(ram, mainboard);
                    
                    if (!isRamCompatible) {
                        errorMessages.push(`RAM ${ram.name} (${ram.type || 'Unknown Type'}) không tương thích với Mainboard ${mainboard.name} (${mainboard.memoryType || 'Unknown Type'})`);
                        
                        // Highlight dropdown lỗi
                        const ramDropdown = document.getElementById('ram');
                        if (ramDropdown) ramDropdown.style.borderColor = '#e74c3c';
                        
                        allComponentsValid = false;
                    }
                }
            }
        }
    }
    
    // Kiểm tra tương thích nguồn điện với GPU
    if (vgaValue) {
        const vga = window.vgaData[vgaValue];
        const psuValue = document.getElementById('psu')?.value;
        const psu = psuValue ? window.psuData[psuValue] : null;
        
        if (vga && psu) {
            // Ước tính công suất yêu cầu dựa trên GPU
            let estimatedPower = 0;
            
            // Ước tính công suất dựa trên tên GPU
            if (vga.name.includes('4070') || vga.name.includes('3080') || 
                vga.name.includes('3090') || vga.name.includes('4080') || 
                vga.name.includes('4090')) {
                estimatedPower = 750; // Watt
            } else if (vga.name.includes('3070') || vga.name.includes('4060') || 
                       vga.name.includes('6800') || vga.name.includes('2080')) {
                estimatedPower = 650; // Watt
            } else if (vga.name.includes('3060') || vga.name.includes('2070') || 
                       vga.name.includes('6700') || vga.name.includes('1080')) {
                estimatedPower = 550; // Watt
            } else {
                estimatedPower = 450; // Watt mặc định cho các GPU khác
            }
            
            // Trích xuất công suất từ tên PSU
            let psuPower = 0;
            const psuName = psu.name.toLowerCase();
            
            // Tìm số Watt trong tên
            const wattMatch = psuName.match(/(\d+)w/i) || psuName.match(/(\d+)\s*watt/i);
            if (wattMatch) {
                psuPower = parseInt(wattMatch[1]);
            } else {
                // Kiểm tra các giá trị phổ biến
                if (psuName.includes('1000')) psuPower = 1000;
                else if (psuName.includes('850')) psuPower = 850;
                else if (psuName.includes('750')) psuPower = 750;
                else if (psuName.includes('650')) psuPower = 650;
                else if (psuName.includes('550')) psuPower = 550;
                else if (psuName.includes('500')) psuPower = 500;
                else if (psuName.includes('450')) psuPower = 450;
                else if (psuName.includes('400')) psuPower = 400;
                else if (psuName.includes('350')) psuPower = 350;
            }
            
            // Kiểm tra nếu PSU có đủ công suất
            if (psuPower > 0 && psuPower < estimatedPower) {
                errorMessages.push(`Cảnh báo: Nguồn ${psu.name} (${psuPower}W) có thể không đủ cho GPU ${vga.name} (cần tối thiểu ${estimatedPower}W)`);
                
                // Highlight dropdown lỗi (màu cam thay vì đỏ vì đây chỉ là cảnh báo)
                const psuDropdown = document.getElementById('psu');
                if (psuDropdown) psuDropdown.style.borderColor = '#f39c12';
                
                // Đây chỉ là cảnh báo, không làm thay đổi tính hợp lệ
                // allComponentsValid = false;
            }
        }
    }
    
    // Hiển thị các thông báo lỗi
    if (errorMessages.length > 0) {
        const container = document.querySelector('.components-grid');
        if (container) {
            errorMessages.forEach(message => {
                const msgDiv = document.createElement('div');
                msgDiv.className = 'compatibility-error';
                msgDiv.innerHTML = `<strong>Lỗi tương thích:</strong> ${message}`;
                msgDiv.style.color = '#e74c3c';
                msgDiv.style.backgroundColor = '#fadbd8';
                msgDiv.style.padding = '10px';
                msgDiv.style.borderRadius = '5px';
                msgDiv.style.margin = '10px 0';
                msgDiv.style.fontWeight = 'bold';
                msgDiv.style.borderLeft = '5px solid #e74c3c';
                container.prepend(msgDiv);
                
                // Tự động xóa sau 10 giây
                setTimeout(() => {
                    msgDiv.style.transition = 'opacity 1s ease-out';
                    msgDiv.style.opacity = '0';
                    setTimeout(() => msgDiv.remove(), 1000);
                }, 10000);
            });
        }
    }
    
    // Cập nhật trạng thái nút hiển thị bảng cấu hình
    const updateConfigButtonState = () => {
        // Chỉ cho phép hiển thị bảng cấu hình nếu có ít nhất CPU và VGA đã chọn và tất cả thành phần tương thích
        const hasRequiredComponents = cpuValue && vgaValue;
        const canShowConfig = hasRequiredComponents && allComponentsValid;
        
        // Lấy tất cả các nút hiển thị cấu hình
        const configButtons = [
            document.getElementById('show-config-button'),
            document.getElementById('show-config-detail-button'),
            document.getElementById('config-detail-button'),
            document.getElementById('main-config-button')
        ];
        
        configButtons.forEach(button => {
            if (button) {
                button.disabled = !canShowConfig;
                button.style.opacity = canShowConfig ? '1' : '0.5';
                button.title = canShowConfig ? 'Xem bảng cấu hình chi tiết' : 'Vui lòng chọn CPU, VGA và đảm bảo tất cả linh kiện tương thích';
            }
        });
    };
    updateConfigButtonState();
    
    return allComponentsValid;
};

// Thay thế hàm validateAllComponents với tham chiếu đến hàm mới
function validateAllComponents() {
    return window.validateComponentCompatibility();
}
                        
// Ensure compatibility checks are performed when components change
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to all component dropdowns
    const componentDropdowns = [
        'cpu', 'mainboard', 'vga', 'ram', 'ssd', 'cpuCooler', 'psu', 'case', 'hdd', 'monitor'
    ];
    
    componentDropdowns.forEach(component => {
        const dropdown = document.getElementById(component);
        if (dropdown) {
            dropdown.addEventListener('change', function() {
                logger.log(`${component} changed - validating compatibility`);
                // Validate compatibility after a short delay to ensure all data is updated
                setTimeout(() => {
                    if (typeof window.validateComponentCompatibility === 'function') {
                        window.validateComponentCompatibility();
                    }
                }, 100);
            });
        }
    });
    
    // Hide green information sections
    const hideGreenSections = () => {
        // Hide all green info elements
        const greenElements = [
            document.querySelector('div[style*="background-color: #dff0d8"]'),
            document.querySelector('.alert-success'),
            document.querySelector('.bg-success'),
            document.querySelectorAll('.green-info-box'),
            document.querySelectorAll('[style*="background-color: rgb(223, 240, 216)"]'),
            document.querySelectorAll('[style*="background-color: rgb(76, 175, 80)"]'),
            document.querySelectorAll('[style*="background-color: #4CAF50"]'),
            document.querySelectorAll('[style*="background-color: #2e7d32"]'),
            document.querySelectorAll('.alert'),
            document.querySelectorAll('.footer-info')
        ];
        
        greenElements.forEach(elem => {
            if (elem) {
                if (elem.length) {
                    // Handle NodeList
                    for (let i = 0; i < elem.length; i++) {
                        if (elem[i]) elem[i].style.display = 'none';
                    }
                } else {
                    // Handle single element
                    elem.style.display = 'none';
                }
            }
        });
        
        // Hide any footer completely
        const footer = document.querySelector('footer');
        if (footer) {
            footer.style.display = 'none';
            
            // Also hide all divs inside footer
            const allFooterDivs = footer.querySelectorAll('div');
            allFooterDivs.forEach(div => div.style.display = 'none');
        }
        
        // Hide any elements with green background at the bottom of the page
        const allDivs = document.querySelectorAll('div');
        allDivs.forEach(div => {
            const style = window.getComputedStyle(div);
            const bgColor = style.backgroundColor;
            
            // Check for any green-ish color
            if (bgColor.includes('rgb(') && 
                (bgColor.includes('rgb(76, 175, 80)') || 
                 bgColor.includes('rgb(46, 125, 50)') ||
                 bgColor.includes('rgb(0, 128, 0)') ||
                 bgColor.includes('rgb(0, 255, 0)') ||
                 (parseInt(bgColor.split(',')[1]) > parseInt(bgColor.split(',')[0]) && 
                  parseInt(bgColor.split(',')[1]) > parseInt(bgColor.split(',')[2])))) {
                div.style.display = 'none';
            }
        });
    };
    
    // Run initially and after a delay to catch dynamically loaded elements
    hideGreenSections();
    setTimeout(hideGreenSections, 1000);
    setTimeout(hideGreenSections, 3000);
    
    // Validate on page load
    setTimeout(() => {
        if (typeof window.validateComponentCompatibility === 'function') {
            window.validateComponentCompatibility();
        }
    }, 1000);
});
                        
// Function to enhance component compatibility filtering
document.addEventListener('DOMContentLoaded', function() {
    // Add enhanced filtering capabilities
    function enhanceCompatibilityFiltering() {
        logger.log('Enhancing component compatibility filtering');
        
                    // Get all dropdowns
            const cpuDropdown = document.getElementById('cpu');
            const mainboardDropdown = document.getElementById('mainboard');
            const ramDropdown = document.getElementById('ram');
            
            // Ensure mainboard is disabled until CPU is selected
            if (mainboardDropdown && cpuDropdown) {
                mainboardDropdown.disabled = true;
                
                // Make sure RAM is not disabled
                if (ramDropdown) {
                    ramDropdown.disabled = false;
                }
                
                // When CPU changes, aggressively filter mainboards
                cpuDropdown.addEventListener('change', function() {
                    if (this.value) {
                        // Enable mainboard selection
                        mainboardDropdown.disabled = false;
                        
                        // Filter mainboards by CPU
                        filterMainboardsByCpu(this.value);
                        
                        // Reset RAM selection since mainboard might change
                        if (ramDropdown) {
                            ramDropdown.value = '';
                            ramDropdown.disabled = false; // Make sure RAM is not disabled
                        }
                    } else {
                        // If CPU is deselected, disable mainboard and RAM
                        mainboardDropdown.disabled = true;
                        mainboardDropdown.value = '';
                        
                        if (ramDropdown) {
                            ramDropdown.disabled = true;
                            ramDropdown.value = '';
                        }
                    }
                });
        }
        
        // Ensure RAM is disabled until mainboard is selected
        if (ramDropdown && mainboardDropdown) {
            ramDropdown.disabled = true;
            
            // When mainboard changes, aggressively filter RAM
            mainboardDropdown.addEventListener('change', function() {
                if (this.value) {
                    // Update RAM options based on mainboard
                    updateRamOptionsBasedOnMainboard(this.value);
                    
                    // Check compatibility with selected CPU
                    const cpuValue = cpuDropdown ? cpuDropdown.value : null;
                    if (cpuValue) {
                        checkSocketCompatibility(cpuValue, this.value);
                    }
                } else {
                    // If mainboard is deselected, disable RAM
                    ramDropdown.disabled = true;
                    ramDropdown.value = '';
                }
            });
        }
    }
    
    // Call the function to set up enhanced filtering
    enhanceCompatibilityFiltering();
});
                        