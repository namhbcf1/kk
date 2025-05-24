/**
 * Modal Handler - Xử lý các popup trong ứng dụng
 */

(function() {
    // Tạo window.modalHandler để các module khác có thể truy cập
    window.modalHandler = {
        showModal: showModal,
        hideModal: hideModal,
        setupConfigDetailModal: setupConfigDetailModal
    };
    
    // Hàm khởi tạo
    function initModalHandlers() {
        console.log('Initializing modal handlers');
        
        // Xử lý popup cấu hình chi tiết
        setupConfigDetailModal();
        
        // Xử lý các popup khác nếu cần
    }
    
    // Thiết lập sự kiện cho popup cấu hình chi tiết
    function setupConfigDetailModal() {
        const modal = document.querySelector('.modal');
        
        if (!modal) {
            console.warn('Modal element not found');
            return;
        }
        
        // Xóa tất cả nút đóng hiện có để tránh trùng lặp
        const existingCloseButtons = modal.querySelectorAll('.close, .close-modal');
        existingCloseButtons.forEach(button => {
            button.remove();
        });
        
        // Thêm nút đóng mới vào header nếu có
        const modalHeader = modal.querySelector('.modal-header');
        if (modalHeader) {
            console.log('Adding close button to modal header');
            
            const closeBtn = document.createElement('span');
            closeBtn.classList.add('close-modal');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.display = 'block'; // Đảm bảo hiển thị
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.position = 'absolute';
            closeBtn.style.right = '15px';
            closeBtn.style.top = '10px';
            closeBtn.style.fontSize = '28px';
            
            closeBtn.onclick = function(e) {
                e.stopPropagation();
                hideModal();
            };
            
            modalHeader.appendChild(closeBtn);
        } else {
            // Nếu không có header, thêm vào content
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                console.log('Adding close button to modal content');
                
                const closeBtn = document.createElement('span');
                closeBtn.classList.add('close-modal');
                closeBtn.innerHTML = '&times;';
                closeBtn.style.display = 'block'; // Đảm bảo hiển thị
                closeBtn.style.cursor = 'pointer';
                closeBtn.style.position = 'absolute';
                closeBtn.style.right = '15px';
                closeBtn.style.top = '10px';
                closeBtn.style.fontSize = '28px';
                
                closeBtn.onclick = function(e) {
                    e.stopPropagation();
                    hideModal();
                };
                
                modalContent.appendChild(closeBtn);
            }
        }
        
        // Thêm sự kiện đóng khi click bên ngoài modal
        modal.onclick = function(event) {
            if (event.target === modal) {
                hideModal();
            }
        };
        
        // Thêm phím tắt ESC để đóng modal
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                hideModal();
            }
        });
        
        // Tìm nút mở modal
        setupDetailViewButtons();
        
        console.log('Config detail modal handler setup complete');
    }
    
    // Thiết lập các nút mở modal xem chi tiết
    function setupDetailViewButtons() {
        // Tìm tất cả các nút có thể mở modal
        const viewButtons = document.querySelectorAll('.view-config-detail, #view-breakdown, #calculate-button');
        
        viewButtons.forEach(button => {
            if (button) {
                // Xóa event listeners cũ
                const newButton = button.cloneNode(true);
                if (button.parentNode) {
                    button.parentNode.replaceChild(newButton, button);
                }
                
                // Thêm event listener mới
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Lấy dữ liệu cấu hình hiện tại
                    const configData = getCurrentConfig();
                    
                    // Hiển thị trong modal
                    if (window.showConfigDetailModal) {
                        // Sử dụng hàm từ buildsan.js nếu có
                        window.showConfigDetailModal(configData);
                    } else {
                        // Fallback to local implementation
                        showConfigDetailModal(configData);
                    }
                });
            }
        });
    }
    
    // Lấy cấu hình hiện tại từ bảng
    function getCurrentConfig() {
        const config = {};
        
        // Lấy thông tin từ bảng
        const componentRows = [
            'cpu', 'mainboard', 'ram', 'vga', 'ssd', 
            'cpu-cooler', 'psu', 'case', 'additional-component', 'monitor'
        ];
        
        componentRows.forEach(component => {
            const nameCell = document.getElementById(`${component}-name`);
            const priceCell = document.getElementById(`${component}-price`);
            const totalCell = document.getElementById(`${component}-total`);
            
            if (nameCell && priceCell) {
                config[component] = {
                    name: nameCell.textContent || '',
                    price: priceCell.textContent || '',
                    total: totalCell ? totalCell.textContent || '' : ''
                };
            }
        });
        
        // Lấy tổng giá
        const totalPriceCell = document.getElementById('total-price-cell');
        if (totalPriceCell) {
            config.totalPrice = totalPriceCell.textContent || '';
        }
        
        return config;
    }
    
    // Hiển thị modal chi tiết cấu hình
    function showConfigDetailModal(configData) {
        // Tìm modal
        const modal = document.querySelector('.modal');
        const modalContent = modal ? modal.querySelector('.modal-content') : null;
        
        if (!modal || !modalContent) {
            console.error('Modal elements not found');
            return;
        }
        
        // Chuẩn bị nội dung
        let content = `
            <div class="modal-header">
                <h2><i class="fas fa-clipboard-list"></i> Cấu hình chi tiết</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <table class="config-detail-table config-table">
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
        `;
        
        // Các loại linh kiện và biểu tượng tương ứng
        const componentTypes = [
            {key: 'cpu', label: 'CPU', componentKey: 'cpu'},
            {key: 'mainboard', label: 'MAINBOARD', componentKey: 'mainboard'},
            {key: 'vga', label: 'VGA', componentKey: 'vga'},
            {key: 'ram', label: 'RAM', componentKey: 'ram'},
            {key: 'ssd', label: 'SSD', componentKey: 'ssd'},
            {key: 'cpuCooler', label: 'CPUCOOLER', componentKey: 'cpuCooler'},
            {key: 'psu', label: 'PSU', componentKey: 'psu'},
            {key: 'case', label: 'CASE', componentKey: 'case'},
            {key: 'hdd', label: 'HDD', componentKey: 'hdd'},
            {key: 'monitor', label: 'MÀN HÌNH', componentKey: 'monitor'}
        ];
        
        // Giá trị mặc định cho bảo hành và tình trạng
        const defaultWarranty = {
            'vga': '3T',
            'cpuCooler': '12T',
            'case': '12T',
            'default': '36T'
        };
        
        // Tính tổng tiền
        let totalPrice = 0;
        let addedComponents = 0;
        
        // Lặp qua từng loại linh kiện
        for (const component of componentTypes) {
            // Lấy giá trị select của loại linh kiện
            const selectElement = document.getElementById(component.key);
            if (!selectElement || !selectElement.value) continue;
            
            // Lấy thông tin linh kiện từ select
            const selectedOption = selectElement.options[selectElement.selectedIndex];
            if (!selectedOption || !selectedOption.text || selectedOption.text.trim() === '') continue;
            
            const componentName = selectedOption.text;
            const selectedValue = selectElement.value;
            
            // Không hiển thị các component là placeholder hoặc rỗng
            if (componentName.includes('Chọn') || componentName === '' || !selectedValue) continue;
            
            // Lấy dữ liệu component từ danh sách components
            let componentData = null;
            const componentSource = window[component.key + 'Data'];
            if (componentSource && componentSource[selectedValue]) {
                componentData = componentSource[selectedValue];
            }
            
            // Xác định giá
            let price = 0;
            try {
                if (componentData && componentData.price) {
                    price = componentData.price;
                } else if (selectedOption.dataset && selectedOption.dataset.price) {
                    price = parseInt(selectedOption.dataset.price);
                } else {
                    // Trích xuất giá từ text nếu có định dạng "Tên - XXX,XXX VNĐ"
                    const text = selectedOption.text || '';
                    const priceMatch = text.match(/(\d[\d\s,\.]*)\s*VNĐ/);
                    if (priceMatch && priceMatch[1]) {
                        price = parseInt(priceMatch[1].replace(/[\s,\.]/g, ''), 10);
                    }
                }
            } catch (error) {
                console.warn('Error getting price for ' + component.key, error);
            }
            
            // Nếu giá = 0, có thể là placeholder, bỏ qua
            if (price === 0) continue;
            
            // Xác định bảo hành
            const warranty = (componentData && componentData.warranty) || 
                            defaultWarranty[component.key] || 
                            defaultWarranty.default;
            
            // Xác định tình trạng (GHI CHÚ)
            const condition = (componentData && componentData.condition) ||
                             (componentName.toLowerCase().includes('cũ') ? 'CŨ' : 'NEW');
            
            // Tạo HTML cho hình ảnh với fallback
            let imgSrc = '';
            if (componentData && componentData.image) {
                imgSrc = componentData.image;
            }
            
            const imgHtml = `
                <div class="component-image-wrapper">
                    <img src="${imgSrc}" alt="${component.label}" 
                         data-component-type="${component.key}" 
                         onerror="handleImageError(this, '${component.label}')" />
                </div>
            `;
            
            // Tăng số thứ tự
            addedComponents++;
            
            // Xác định tên hiển thị
            let displayName = componentName;
            
            // Thêm dòng vào bảng
            content += `
                <tr>
                    <td>${addedComponents}</td>
                    <td>${imgHtml}</td>
                    <td>${displayName}</td>
                    <td>Chiếc</td>
                    <td>1</td>
                    <td>${price.toLocaleString()}</td>
                    <td>${price.toLocaleString()}</td>
                    <td>${warranty}</td>
                    <td>${condition}</td>
                </tr>
            `;
            
            // Tính tổng
            totalPrice += price;
        }
        
        // Nếu không có component nào, hiển thị thông báo
        if (addedComponents === 0) {
            content += `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 20px;">
                        Không có linh kiện nào được chọn. Vui lòng chọn ít nhất một linh kiện.
                    </td>
                </tr>
            `;
        }
        
        // Thêm dòng trống
        content += `
            <tr>
                <td colspan="9" style="height: 10px; border: none !important; background-color: #191919 !important;"></td>
            </tr>
        `;
        
        // Thêm dòng tổng cộng
        content += `
            <tr class="total-row">
                <td colspan="6" style="text-align: right; font-weight: bold;">Tổng cộng:</td>
                <td>${totalPrice.toLocaleString()}</td>
                <td colspan="2"></td>
            </tr>
        `;
        
        // Thêm các dòng khác
        content += `
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
                <td>${totalPrice.toLocaleString()}</td>
                <td colspan="2"></td>
            </tr>
        `;
        
        // Hoàn thành bảng
        content += `
                </tbody>
            </table>
            <div class="share-options">
                <button id="share-facebook" class="share-button"><i class="fab fa-facebook"></i> Chia sẻ Facebook</button>
                <button id="copy-link" class="share-button"><i class="fas fa-link"></i> Sao chép liên kết</button>
                <button id="download-config" class="share-button luu-cau-hinh"><i class="fas fa-download"></i> Tải cấu hình</button>
            </div>
        </div>
    `;
        
        // Cập nhật nội dung modal
        modalContent.innerHTML = content;
        
        // Thêm CSS trực tiếp để đảm bảo bảng hiển thị đúng màu sắc
        const style = document.createElement('style');
        style.textContent = `
            .modal-content {
                background-color: #242424 !important;
                color: #f5f5f5 !important;
            }
            
            .config-detail-table {
                background-color: #242424 !important;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
            }
            
            .config-detail-table thead tr th {
                background-color: #2196F3 !important;
                color: white !important;
                text-align: center !important;
                border: 1px solid #222 !important;
            }
            
            .config-detail-table tbody tr td {
                background-color: #222 !important;
                border: 1px solid #333 !important;
                color: #f5f5f5 !important;
            }
            
            .config-detail-table tbody tr:nth-child(odd) td {
                background-color: #2a2a2a !important;
            }
            
            .config-detail-table tbody tr:hover td {
                background-color: #333 !important;
            }
            
            .config-detail-table .total-row td {
                background-color: #1a1a1a !important;
                border-top: 1px solid #444 !important;
                font-weight: bold !important;
            }
            
            .config-detail-table td:nth-child(6),
            .config-detail-table td:nth-child(7) {
                color: #4fc3f7 !important;
                text-align: right !important;
            }
            
            .config-detail-table td:nth-child(8) {
                color: #2ecc71 !important;
                text-align: center !important;
            }
            
            .config-detail-table td:nth-child(9) {
                color: #2ecc71 !important;
                text-align: center !important;
            }
        `;
        document.head.appendChild(style);
        
        // Thiết lập nút đóng
        const closeBtn = modalContent.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.onclick = function(e) {
                e.stopPropagation();
                modal.style.display = 'none';
                return false;
            };
        }
        
        // Hiển thị modal
        modal.style.display = 'block';
    }
    
    // Hiển thị modal
    function showModal() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
    
    // Ẩn modal
    function hideModal() {
        console.log('Hiding modal');
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    // Khởi tạo khi tài liệu đã tải xong
    document.addEventListener('DOMContentLoaded', initModalHandlers);
})(); 