/**
 * Trình tải dữ liệu linh kiện - Chuyển dữ liệu từ các file JS module sang đối tượng window toàn cục
 */

// Tạo dữ liệu mẫu trong trường hợp không tải được module
function createFallbackData() {
    console.warn('⚠️ Sử dụng dữ liệu mẫu vì không thể tải được module');
    
    // Dữ liệu CPU mẫu
    window.cpuData = {
        'intel-core-i5-3470': {
            id: 'intel-core-i5-3470',
            name: 'Intel Core i5-3470',
            price: 1500000,
            socket: 'LGA1155',
            cores: 4,
            threads: 4,
            image: 'images/intel-core-i5-3470.jpg',
            specs: {
                'Socket': 'LGA1155',
                'Cores': '4',
                'Threads': '4',
                'Base Clock': '3.2 GHz'
            }
        },
        'amd-ryzen-5-3600': {
            id: 'amd-ryzen-5-3600',
            name: 'AMD Ryzen 5 3600',
            price: 3000000,
            socket: 'AM4',
            cores: 6,
            threads: 12,
            image: 'images/cpu/amd-ryzen-5-3600.jpg',
            specs: {
                'Socket': 'AM4',
                'Cores': '6',
                'Threads': '12',
                'Base Clock': '3.6 GHz'
            }
        }
    };
    
    // Dữ liệu VGA mẫu
    window.vgaData = {
        'gtx-960': {
            id: 'gtx-960',
            name: 'NVIDIA GeForce GTX 960',
            price: 2500000,
            vram: '2GB',
            image: 'images/gtx-960.jpg',
            specs: {
                'VRAM': '2GB',
                'VRAM Type': 'GDDR5',
                'Bus Width': '128-bit'
            }
        },
        'rx-570': {
            id: 'rx-570',
            name: 'AMD Radeon RX 570',
            price: 3000000,
            vram: '4GB',
            image: 'images/rx-570.jpg',
            specs: {
                'VRAM': '4GB',
                'VRAM Type': 'GDDR5',
                'Bus Width': '256-bit'
            }
        }
    };
    
    // Dữ liệu cơ bản cho các loại linh kiện khác
    window.mainboardData = {
        'gigabyte-h61m-ds2': {
            id: 'gigabyte-h61m-ds2',
            name: 'Gigabyte H61M-DS2',
            price: 1200000,
            socket: 'LGA1155',
            image: 'images/gigabyte-h61m-ds2.jpg',
            specs: {
                'Socket': 'LGA1155',
                'Form Factor': 'Micro ATX',
                'Memory Type': 'DDR3'
            }
        }
    };
    
    window.ramData = {
        'kingston-8gb-ddr3': {
            id: 'kingston-8gb-ddr3',
            name: 'Kingston 8GB DDR3',
            price: 800000,
            type: 'DDR3',
            image: 'images/kingston-8gb-ddr3.jpg',
            specs: {
                'Type': 'DDR3',
                'Capacity': '8GB',
                'Speed': '1600MHz'
            }
        }
    };
    
    window.ssdData = {
        'crucial-p3-500gb': {
            id: 'crucial-p3-500gb',
            name: 'Crucial P3 500GB',
            price: 1200000,
            type: 'NVMe',
            image: 'images/crucial-p3-500gb.jpg',
            specs: {
                'Type': 'NVMe',
                'Capacity': '500GB',
                'Read Speed': '3500MB/s'
            }
        }
    };
    
    window.psuData = {
        'corsair-550w': {
            id: 'corsair-550w',
            name: 'Corsair 550W 80+ Bronze',
            price: 1500000,
            power: '550W',
            image: 'images/corsair-550w.jpg',
            specs: {
                'Power': '550W',
                'Certification': '80+ Bronze',
                'Modularity': 'Non-modular'
            }
        }
    };
    
    window.caseData = {
        'gaming-start-ga3fg': {
            id: 'gaming-start-ga3fg',
            name: 'Case Gaming Start GA3FG',
            price: 900000,
            image: 'images/case/gaming-start-ga3fg.jpg',
            specs: {
                'Form Factor': 'ATX, Micro-ATX',
                'Side Panel': 'Tempered Glass',
                'RGB': 'Yes'
            }
        }
    };
    
    window.cpuCoolerData = {
        'deepcool-gammaxx-400': {
            id: 'deepcool-gammaxx-400',
            name: 'DeepCool Gammaxx 400',
            price: 700000,
            image: 'images/deepcool-gammaxx-400.jpg',
            specs: {
                'Socket Support': 'Intel LGA1151/1155/1156, AMD AM4',
                'Fan Size': '120mm',
                'RGB': 'No'
            }
        }
    };
    
    window.hddData = {
        'wd-blue-1tb': {
            id: 'wd-blue-1tb',
            name: 'Western Digital Blue 1TB',
            price: 900000,
            image: 'images/wd-blue-1tb.jpg',
            specs: {
                'Capacity': '1TB',
                'Interface': 'SATA 3',
                'RPM': '7200'
            }
        }
    };
    
    window.monitorData = {
        'lg-24mp59g': {
            id: 'lg-24mp59g',
            name: 'LG 24MP59G 24" IPS',
            price: 3500000,
            image: 'images/lg-24mp59g.jpg',
            specs: {
                'Size': '24 inch',
                'Panel Type': 'IPS',
                'Refresh Rate': '75Hz',
                'Response Time': '5ms'
            }
        }
    };
    
    // Config mẫu
    window.intelConfigs = {
        'valorant': {
            'budget': {
                min: 10000000,
                max: 15000000,
                components: {
                    cpu: 'intel-core-i5-3470',
                    vga: 'gtx-960'
                }
            }
        }
    };
    
    window.amdConfigs = {
        'valorant': {
            'budget': {
                min: 10000000,
                max: 15000000,
                components: {
                    cpu: 'amd-ryzen-5-3600',
                    vga: 'rx-570'
                }
            }
        }
    };
    
    window.getConfig = function(game, budget, cpuType) {
        const configs = cpuType.toLowerCase() === 'intel' ? window.intelConfigs : window.amdConfigs;
        if (configs && configs[game]) {
            return configs[game];
        }
        return null;
    };
    
    return true;
}

// Hàm tải dữ liệu từ tệp JS và gán vào đối tượng window
async function loadComponentData() {
    try {
        // Tải dữ liệu linh kiện từ các tệp
        const cpuModule = await import('./js/data/cpu.js').catch(e => console.error('Failed to load CPU data:', e));
        const mainboardModule = await import('./js/data/mainboard.js').catch(e => console.error('Failed to load mainboard data:', e));
        const ramModule = await import('./js/data/ram.js').catch(e => console.error('Failed to load RAM data:', e));
        const vgaModule = await import('./js/data/vga.js').catch(e => console.error('Failed to load VGA data:', e));
        const ssdModule = await import('./js/data/ssd.js').catch(e => console.error('Failed to load SSD data:', e));
        const psuModule = await import('./js/data/psu.js').catch(e => console.error('Failed to load PSU data:', e));
        const caseModule = await import('./js/data/case.js').catch(e => console.error('Failed to load case data:', e));
        const cpuCoolerModule = await import('./js/data/cpuCooler.js').catch(e => console.error('Failed to load CPU cooler data:', e));
        const hddModule = await import('./js/data/hdd.js').catch(e => console.error('Failed to load HDD data:', e));
        const monitorModule = await import('./js/data/monitor.js').catch(e => console.error('Failed to load monitor data:', e));
        const configsModule = await import('./js/configs/index.js').catch(e => console.error('Failed to load configs:', e));

        // Kiểm tra nếu bất kỳ module nào không tải được
        if (!cpuModule || !vgaModule || !configsModule) {
            console.error('❌ Không thể tải các module dữ liệu quan trọng. Sử dụng dữ liệu mẫu.');
            createFallbackData();
        } else {
            // Gán dữ liệu vào đối tượng window
            window.cpuData = cpuModule && cpuModule.cpuData ? { ...cpuModule.cpuData } : {};
            window.mainboardData = mainboardModule && mainboardModule.mainboardData ? { ...mainboardModule.mainboardData } : {};
            window.ramData = ramModule && ramModule.ramData ? { ...ramModule.ramData } : {};
            window.vgaData = vgaModule && vgaModule.vgaData ? { ...vgaModule.vgaData } : {};
            window.ssdData = ssdModule && ssdModule.ssdData ? { ...ssdModule.ssdData } : {};
            window.psuData = psuModule && psuModule.psuData ? { ...psuModule.psuData } : {};
            window.caseData = caseModule && caseModule.caseData ? { ...caseModule.caseData } : {};
            window.cpuCoolerData = cpuCoolerModule && cpuCoolerModule.cpuCoolerData ? { ...cpuCoolerModule.cpuCoolerData } : {};
            window.hddData = hddModule && hddModule.hddData ? { ...hddModule.hddData } : {};
            window.monitorData = monitorModule && monitorModule.monitorData ? { ...monitorModule.monitorData } : {};
            window.getConfig = configsModule && configsModule.getConfig ? configsModule.getConfig : null;
            window.intelConfigs = configsModule && configsModule.intelConfigs ? { ...configsModule.intelConfigs } : {};
            window.amdConfigs = configsModule && configsModule.amdConfigs ? { ...configsModule.amdConfigs } : {};
            
            console.log('✅ Dữ liệu linh kiện đã được tải thành công');
        }
        
        console.log('✅ Đã tạo bản sao toàn cục của dữ liệu');
        
        // Thông báo sự kiện tải thành công
        const event = new CustomEvent('component-data-loaded');
        document.dispatchEvent(event);
        
        return true;
    } catch (error) {
        console.error('❌ Lỗi khi tải dữ liệu linh kiện:', error);
        // Sử dụng dữ liệu mẫu trong trường hợp lỗi
        createFallbackData();
        
        // Vẫn phát ra sự kiện để UI được cập nhật
        const event = new CustomEvent('component-data-loaded');
        document.dispatchEvent(event);
        
        return false;
    }
}

// Tải dữ liệu khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    console.log('Bắt đầu tải dữ liệu linh kiện...');
    loadComponentData();
});

// Xuất hàm tải dữ liệu để có thể gọi từ bên ngoài
export { loadComponentData }; 