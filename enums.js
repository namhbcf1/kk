// THAY THẾ toàn bộ tập tin enums.js
// Giải pháp cho vấn đề thuộc tính chỉ đọc (Read-only properties)
(function() {
    // Create a safe object for storing global variables instead of setting on window directly
    window.globalStore = window.globalStore || {};
    
    // Helper function to safely set values
    function safeSet(obj, prop, value) {
        try {
            // Try to set directly first
            obj[prop] = value;
        } catch (e) {
            console.log(`Property ${prop} is read-only, using globalStore`);
            // If that fails, use our globalStore
            window.globalStore[prop] = value;
        }
    }
    
    // Define safer getters and setters for commonly used global properties
    // Create proper descriptors with both getters and setters
    const readOnlyProps = ['top', 'parent', 'self', 'window', 'frames', 'location'];
    readOnlyProps.forEach(prop => {
        try {
            // Store original value
            const originalValue = window[prop];
            window.globalStore[prop] = originalValue;
            
            // Try to redefine the property
            Object.defineProperty(window, 'safe' + prop.charAt(0).toUpperCase() + prop.slice(1), {
                configurable: true,
                enumerable: true,
                get: function() { 
                    return window.globalStore[prop] !== undefined ? window.globalStore[prop] : originalValue; 
                },
                set: function(val) { window.globalStore[prop] = val; }
            });
            console.log(`Created safe property 'safe${prop.charAt(0).toUpperCase() + prop.slice(1)}' for read-only '${prop}'`);
        } catch (e) {
            console.error(`Failed to create safe property for ${prop}:`, e);
        }
    });
    
    console.log('Safe global property access configured');

    // Mock require for browser environment
    if (typeof window !== 'undefined' && !window.require) {
        window.require = function(moduleName) {
            console.log(`Mock require called for: ${moduleName}`);
            if (moduleName === '@popperjs/core') {
                if (typeof Popper !== 'undefined') {
                    return Popper;
                }
                return {};
            }
            return {};
        };
    }
    
    // Add helper functions
    window.getSafeWindow = function(prop) {
        return window.globalStore[prop] || window[prop];
    };
    
    window.setSafeWindow = function(prop, value) {
        window.globalStore[prop] = value;
        return value;
    };
})(); 