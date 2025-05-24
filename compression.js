/**
 * Compression Utilities
 * Cung cấp các hàm để nén và giải nén dữ liệu giúp giảm kích thước
 * dữ liệu được lưu trữ và truyền tải.
 */

// Namespace
window.Compression = window.Compression || {};

/**
 * Nén một chuỗi JSON thành chuỗi ngắn hơn
 * @param {Object} jsonData - Đối tượng dữ liệu cần nén
 * @returns {string} - Chuỗi đã nén
 */
Compression.compressJSON = function(jsonData) {
    try {
        // Chuyển đối tượng thành chuỗi JSON
        const jsonString = JSON.stringify(jsonData);
        
        // Nén chuỗi bằng LZString (nếu có)
        if (typeof LZString !== 'undefined') {
            return LZString.compressToBase64(jsonString);
        }
        
        // Fallback nếu không có LZString: mã hóa Base64
        return btoa(jsonString);
    } catch (e) {
        console.error('Lỗi khi nén JSON:', e);
        return null;
    }
};

/**
 * Giải nén một chuỗi JSON đã nén
 * @param {string} compressedData - Chuỗi đã nén
 * @returns {Object} - Đối tượng JSON gốc
 */
Compression.decompressJSON = function(compressedData) {
    try {
        // Kiểm tra nếu là Base64 đơn giản hoặc LZString
        let jsonString;
        
        if (typeof LZString !== 'undefined') {
            try {
                // Thử giải nén với LZString
                jsonString = LZString.decompressFromBase64(compressedData);
                if (!jsonString) throw new Error('LZString decompression failed');
            } catch (e) {
                // Fallback to base64 decode
                jsonString = atob(compressedData);
            }
        } else {
            // Chỉ giải mã Base64
            jsonString = atob(compressedData);
        }
        
        // Parse chuỗi JSON thành đối tượng
        return JSON.parse(jsonString);
    } catch (e) {
        console.error('Lỗi khi giải nén JSON:', e);
        return null;
    }
};

/**
 * Nén một hình ảnh
 * @param {HTMLImageElement} img - Phần tử hình ảnh cần nén
 * @param {number} quality - Chất lượng (0-1)
 * @param {Function} callback - Hàm callback với chuỗi DataURL đã nén
 */
Compression.compressImage = function(img, quality, callback) {
    try {
        // Tạo canvas để nén hình ảnh
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Đặt kích thước canvas bằng với hình ảnh
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        
        // Vẽ hình ảnh lên canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Nén hình ảnh với chất lượng cho trước
        canvas.toBlob(function(blob) {
            // Chuyển blob thành dataURL
            const reader = new FileReader();
            reader.onloadend = function() {
                callback(reader.result);
            };
            reader.readAsDataURL(blob);
        }, 'image/jpeg', quality || 0.7);
    } catch (e) {
        console.error('Lỗi khi nén hình ảnh:', e);
        callback(img.src); // Trả về src gốc nếu có lỗi
    }
};

/**
 * Nén tất cả hình ảnh trong một phần tử DOM
 * @param {HTMLElement} container - Phần tử chứa các hình ảnh cần nén
 * @param {number} quality - Chất lượng (0-1)
 */
Compression.compressAllImages = function(container, quality) {
    // Tìm tất cả hình ảnh trong container
    const images = container.querySelectorAll('img:not([data-compressed])');
    
    // Nén từng hình ảnh
    images.forEach(function(img) {
        // Đánh dấu hình ảnh đang được nén
        img.setAttribute('data-compressed', 'pending');
        
        // Đảm bảo hình ảnh đã tải
        if (img.complete && img.naturalWidth > 0) {
            processImage(img);
        } else {
            img.onload = function() {
                processImage(img);
            };
        }
    });
    
    function processImage(img) {
        // Bỏ qua hình ảnh nhỏ và SVG
        if ((img.naturalWidth < 100 && img.naturalHeight < 100) || 
            img.src.includes('svg')) {
            img.setAttribute('data-compressed', 'skipped');
            return;
        }
        
        // Nén hình ảnh
        Compression.compressImage(img, quality, function(compressedSrc) {
            // Thay thế src với phiên bản đã nén
            img.src = compressedSrc;
            img.setAttribute('data-compressed', 'done');
        });
    }
};

/**
 * Tối ưu dữ liệu lưu trữ bằng cách nén
 * @param {string} key - Khóa lưu trữ
 * @param {Object} value - Giá trị cần lưu trữ
 */
Compression.setStorageItem = function(key, value) {
    try {
        // Nén dữ liệu
        const compressed = Compression.compressJSON(value);
        
        // Lưu vào localStorage
        localStorage.setItem(key, compressed);
        
        return true;
    } catch (e) {
        console.error('Lỗi khi lưu dữ liệu đã nén:', e);
        
        // Fallback: lưu dữ liệu không nén
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e2) {
            console.error('Lỗi khi lưu dữ liệu không nén:', e2);
            return false;
        }
    }
};

/**
 * Lấy và giải nén dữ liệu từ localStorage
 * @param {string} key - Khóa lưu trữ
 * @returns {Object|null} - Dữ liệu đã giải nén hoặc null nếu không tìm thấy
 */
Compression.getStorageItem = function(key) {
    try {
        // Lấy dữ liệu đã nén
        const compressed = localStorage.getItem(key);
        if (!compressed) return null;
        
        // Giải nén dữ liệu
        return Compression.decompressJSON(compressed);
    } catch (e) {
        console.error('Lỗi khi lấy dữ liệu đã nén:', e);
        
        // Fallback: thử parse dữ liệu như JSON thông thường
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (e2) {
            console.error('Lỗi khi parse dữ liệu:', e2);
            return null;
        }
    }
};

// Tải thư viện LZString để hỗ trợ nén tốt hơn
(function loadLZString() {
    if (typeof LZString !== 'undefined') return;
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js';
    script.async = true;
    document.head.appendChild(script);
})(); 