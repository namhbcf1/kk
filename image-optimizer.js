/**
 * Tối ưu hình ảnh - Hỗ trợ lazy loading và xử lý lỗi
 */

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    initImageOptimizer();
});

// Khởi tạo bộ tối ưu hình ảnh
function initImageOptimizer() {
    // Chuyển đổi tất cả hình ảnh sang chế độ lazy load
    convertToLazyLoad();
    
    // Thiết lập IntersectionObserver để lazy loading
    setupLazyLoading();
    
    // Thêm xử lý lỗi cho tất cả hình ảnh
    setupErrorHandling();
}

// Chuyển đổi tất cả hình ảnh sang chế độ lazy load
function convertToLazyLoad() {
    // Chỉ chuyển đổi hình ảnh chưa có class 'lazy'
    const images = document.querySelectorAll('img:not(.lazy):not([data-no-lazy])');
    
    images.forEach(img => {
        // Lưu src gốc vào data-src
        if (img.src && !img.dataset.src) {
            img.dataset.src = img.src;
            // Thay thế src bằng placeholder trong suốt 1x1 pixel
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            // Thêm class lazy
            img.classList.add('lazy');
            // Thêm style để tránh layout shift
            if (img.width && img.height) {
                img.style.width = img.width + 'px';
                img.style.height = img.height + 'px';
            }
        }
    });
}

// Thiết lập IntersectionObserver cho lazy loading
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    // Tải hình ảnh
                    loadImage(lazyImage);
                    // Ngừng theo dõi hình ảnh này
                    observer.unobserve(lazyImage);
                }
            });
        }, {
            rootMargin: '200px 0px' // Tải trước khi hình ảnh nằm trong vùng hiển thị 200px
        });

        // Theo dõi tất cả hình ảnh lazy
        document.querySelectorAll('img.lazy').forEach(img => {
            lazyImageObserver.observe(img);
        });
    } else {
        // Fallback cho trình duyệt không hỗ trợ IntersectionObserver
        loadAllLazyImages();
    }
}

// Tải tất cả hình ảnh lazy (fallback)
function loadAllLazyImages() {
    const lazyImages = document.querySelectorAll('img.lazy');
    
    lazyImages.forEach(img => {
        loadImage(img);
    });
}

// Tải một hình ảnh lazy
function loadImage(img) {
    if (img.dataset.src) {
        img.src = img.dataset.src;
        if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
        }
        img.classList.remove('lazy');
    }
}

// Thiết lập xử lý lỗi cho tất cả hình ảnh
function setupErrorHandling() {
    // Xử lý lỗi cho hình ảnh hiện tại
    document.querySelectorAll('img').forEach(img => {
        if (!img.dataset.errorHandled) {
            img.onerror = function() {
                handleImageError(img);
            };
        }
    });
    
    // Thiết lập MutationObserver để tự động xử lý lỗi cho hình ảnh mới
    setupImageErrorMutationObserver();
}

// Xử lý lỗi hình ảnh
function handleImageError(img) {
    // Kiểm tra xem hình ảnh đã được xử lý lỗi chưa
    if (img.dataset.errorHandled === 'true') return true;
    
    // Đánh dấu hình ảnh đã được xử lý lỗi
    img.dataset.errorHandled = 'true';
    
    // Nếu có xử lý lỗi toàn cục, sử dụng nó
    if (typeof window.handleImageError === 'function') {
        return window.handleImageError(img);
    }
    
    // Xử lý lỗi mặc định
    let componentType = img.dataset.componentType || 
                    img.getAttribute('alt') || 
                    'component';
    
    // Tạo hình ảnh placeholder đơn giản
    const canvas = document.createElement('canvas');
    canvas.width = 70;
    canvas.height = 70;
    const ctx = canvas.getContext('2d');
    
    // Vẽ nền
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Thêm text
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const displayText = componentType.length > 10 
        ? componentType.substring(0, 10) + '...' 
        : componentType;
    
    ctx.fillText(displayText, canvas.width/2, canvas.height/2);
    
    // Thay thế src
    img.src = canvas.toDataURL('image/png');
    
    // Ngăn xử lý lỗi tiếp theo
    img.onerror = null;
    
    return true;
}

// Thiết lập MutationObserver để theo dõi hình ảnh mới được thêm vào DOM
function setupImageErrorMutationObserver() {
    if ('MutationObserver' in window) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Tìm hình ảnh mới được thêm vào
                    mutation.addedNodes.forEach((node) => {
                        // Kiểm tra nếu node là phần tử và chứa hình ảnh
                        if (node.nodeType === 1) { // ELEMENT_NODE
                            // Kiểm tra nếu node là hình ảnh
                            if (node.tagName === 'IMG') {
                                setupImage(node);
                            } else {
                                // Tìm tất cả hình ảnh bên trong node
                                const images = node.querySelectorAll('img');
                                images.forEach(img => setupImage(img));
                            }
                        }
                    });
                }
            });
        });
        
        // Bắt đầu theo dõi toàn bộ document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Thiết lập một hình ảnh mới (lazy loading + xử lý lỗi)
function setupImage(img) {
    // Thêm xử lý lỗi
    if (!img.dataset.errorHandled) {
        img.onerror = function() {
            handleImageError(img);
        };
    }
    
    // Chuyển đổi sang lazy loading nếu chưa có
    if (!img.classList.contains('lazy') && !img.dataset.noLazy) {
        if (img.src && !img.dataset.src) {
            img.dataset.src = img.src;
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            img.classList.add('lazy');
            
            // Thêm vào observer
            if (window.lazyImageObserver) {
                window.lazyImageObserver.observe(img);
            } else {
                // Fallback
                loadImage(img);
            }
        }
    }
} 