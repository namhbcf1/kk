/**
 * CSS Optimizer - Tối ưu hóa việc tải CSS
 * 
 * Script này giúp:
 * 1. Tách các CSS quan trọng để tải trước
 * 2. Tải không đồng bộ CSS ít quan trọng hơn
 * 3. Loại bỏ các CSS không sử dụng
 */

// Thực thi khi trang đã tải
document.addEventListener('DOMContentLoaded', function() {
    initCssOptimizer();
});

// Khởi tạo bộ tối ưu CSS
function initCssOptimizer() {
    // Tách CSS quan trọng
    extractCriticalCSS();
    
    // Tải không đồng bộ CSS ít quan trọng
    loadNonCriticalCSS();
    
    // Kiểm tra và loại bỏ CSS không sử dụng
    setTimeout(removeUnusedCSS, 2000);
}

// Tách CSS quan trọng cho hiển thị ban đầu
function extractCriticalCSS() {
    // Danh sách selector CSS quan trọng cần được tải ngay
    const criticalSelectors = [
        'body', 'header', '.logo', '.contact-buttons', 
        '.page-title', '.build-progress', '.progress-step',
        '.selection-section', '#budget-range-selection',
        '.slider-container', '.slider', '.budget-value-current'
    ];
    
    // Tìm tất cả các stylesheet đã tải
    const sheets = document.styleSheets;
    let criticalCSS = '';
    
    try {
        // Duyệt qua từng stylesheet
        for (let i = 0; i < sheets.length; i++) {
            const sheet = sheets[i];
            
            // Bỏ qua stylesheet từ domain khác (CORS)
            if (!sheet.href || sheet.href.startsWith(window.location.origin)) {
                try {
                    const rules = sheet.cssRules || sheet.rules;
                    
                    // Duyệt qua từng rule trong stylesheet
                    for (let j = 0; j < rules.length; j++) {
                        const rule = rules[j];
                        
                        // Kiểm tra nếu rule là CSSStyleRule
                        if (rule.type === 1) { // CSSStyleRule
                            const selector = rule.selectorText;
                            
                            // Kiểm tra nếu selector chứa bất kỳ selector quan trọng nào
                            if (criticalSelectors.some(criticalSelector => 
                                selector.includes(criticalSelector))) {
                                criticalCSS += rule.cssText + '\n';
                            }
                        }
                    }
                } catch (e) {
                    console.warn('Không thể đọc rules từ stylesheet:', e);
                }
            }
        }
        
        // Tạo style element cho CSS quan trọng
        if (criticalCSS) {
            const style = document.createElement('style');
            style.textContent = criticalCSS;
            style.setAttribute('id', 'critical-css');
            
            // Chèn vào đầu <head>
            document.head.insertBefore(style, document.head.firstChild);
            
            console.log('Đã tách CSS quan trọng');
        }
    } catch (e) {
        console.error('Lỗi khi tách CSS quan trọng:', e);
    }
}

// Tải không đồng bộ CSS ít quan trọng
function loadNonCriticalCSS() {
    // Danh sách CSS ít quan trọng cần tải không đồng bộ
    const nonCriticalCSS = [
        'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
        'https://cdn.jsdelivr.net/npm/tippy.js@6/dist/tippy.css'
    ];
    
    // Tìm các stylesheet đã tồn tại
    const existingLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map(link => link.href);
    
    // Tải không đồng bộ các CSS ít quan trọng
    nonCriticalCSS.forEach(css => {
        // Bỏ qua nếu CSS đã được tải
        if (existingLinks.some(href => href.includes(css))) {
            return;
        }
        
        // Tạo link element
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = css;
        
        // Tải không đồng bộ
        link.media = 'print';
        link.onload = function() {
            this.media = 'all';
        };
        
        // Thêm vào trang
        document.head.appendChild(link);
    });
}

// Kiểm tra và loại bỏ CSS không sử dụng
function removeUnusedCSS() {
    // Danh sách các selector không sử dụng
    const unusedSelectors = [
        '.unused-class',
        '#unused-id',
        '.temp-',
        '.debug-'
    ];
    
    try {
        // Duyệt qua từng stylesheet
        for (let i = 0; i < document.styleSheets.length; i++) {
            const sheet = document.styleSheets[i];
            
            // Bỏ qua stylesheet từ domain khác (CORS)
            if (!sheet.href || sheet.href.startsWith(window.location.origin)) {
                try {
                    const rules = sheet.cssRules || sheet.rules;
                    
                    // Duyệt qua từng rule theo thứ tự ngược (để có thể xóa an toàn)
                    for (let j = rules.length - 1; j >= 0; j--) {
                        const rule = rules[j];
                        
                        // Kiểm tra nếu rule là CSSStyleRule
                        if (rule.type === 1) { // CSSStyleRule
                            const selector = rule.selectorText;
                            
                            // Kiểm tra nếu selector khớp với bất kỳ selector không sử dụng nào
                            if (unusedSelectors.some(unusedSelector => 
                                selector.includes(unusedSelector))) {
                                
                                // Xóa rule
                                sheet.deleteRule(j);
                            } else {
                                // Kiểm tra xem selector có tồn tại trong DOM không
                                try {
                                    // Nếu không có phần tử nào khớp với selector và không phải là pseudo-class
                                    if (!selector.includes(':') && 
                                        !selector.includes('::') && 
                                        document.querySelectorAll(selector).length === 0) {
                                        // Xóa rule
                                        sheet.deleteRule(j);
                                    }
                                } catch (e) {
                                    // Bỏ qua lỗi với selector không hợp lệ
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.warn('Không thể đọc rules từ stylesheet:', e);
                }
            }
        }
        
        console.log('Đã loại bỏ CSS không sử dụng');
    } catch (e) {
        console.error('Lỗi khi loại bỏ CSS không sử dụng:', e);
    }
} 