// CPU data
const cpuData = {
    "1220v3": {
        name: "Intel Xeon E3-1220 v3",
        price: 300000,
        image: "https://via.placeholder.com/150x150.png?text=Xeon+E3-1220v3",
        brand: "Intel",
        warranty: "12 tháng",
        socket: "LGA1150",
        cores: 4,
        threads: 4,
        technology: "22nm",
        ram_support: "DDR3",
        ram_bus: "1600MHz",
        condition: "2ND",
        score: 2
    },
    "9100f": {
        name: "Intel Core i3-9100f",
        price: 500000,
        image: "https://via.placeholder.com/150x150.png?text=Core+i3-9100f",
        brand: "Intel",
        warranty: "12 tháng",
        socket: "LGA1151-v2",
        cores: 4,
        threads: 4,
        technology: "14nm",
        ram_support: "DDR4",
        ram_bus: "2400MHz",
        condition: "2ND",
        score: 3
    },
    "10400f": {
        name: "Intel Core i5-10400F",
        price: 1500000,
        image: "https://via.placeholder.com/150x150.png?text=Core+i5-10400F",
        brand: "Intel",
        warranty: "36 tháng",
        socket: "LGA1200",
        cores: 6,
        threads: 12,
        technology: "14nm",
        ram_support: "DDR4",
        ram_bus: "2666MHz",
        condition: "New",
        score: 5
    },
    "12400f": {
        name: "Intel Core i5-12400F",
        price: 3500000,
        image: "https://via.placeholder.com/150x150.png?text=Core+i5-12400F",
        brand: "Intel",
        warranty: "36 tháng",
        socket: "LGA1700",
        cores: 6,
        threads: 12,
        technology: "10nm",
        ram_support: "DDR4/DDR5",
        ram_bus: "3200MHz",
        condition: "New",
        score: 7
    },
    "13400f": {
        name: "Intel Core i5-13400F",
        price: 4900000,
        image: "https://via.placeholder.com/150x150.png?text=Core+i5-13400F",
        brand: "Intel",
        warranty: "36 tháng",
        socket: "LGA1700",
        cores: 10,
        threads: 16,
        technology: "10nm",
        ram_support: "DDR4/DDR5",
        ram_bus: "3200MHz",
        condition: "New",
        score: 8
    },
    "13600k": {
        name: "Intel Core i5-13600K",
        price: 8500000,
        image: "https://via.placeholder.com/150x150.png?text=Core+i5-13600K",
        brand: "Intel",
        warranty: "36 tháng",
        socket: "LGA1700",
        cores: 14,
        threads: 20,
        technology: "10nm",
        ram_support: "DDR4/DDR5",
        ram_bus: "3200MHz",
        condition: "New",
        score: 9
    }
};

// Mainboard data
const mainboardData = {
    "H81": {
        name: "ASUS H81M-E (LGA1150 - Cũ)",
        price: 450000,
        image: "https://via.placeholder.com/150x150.png?text=H81M-E",
        brand: "ASUS (Cũ)",
        warranty: "1 tháng",
        sockets: ["LGA1150"],
        memoryType: "DDR3",
        condition: "2ND",
        nvmeSlots: 0,
        pcieVersion: "2.0",
        formFactor: "Micro-ATX",
        score: 2
    },
    "H510": {
        name: "MSI H510M PRO (LGA1200)",
        price: 1800000,
        image: "https://via.placeholder.com/150x150.png?text=H510M+PRO",
        brand: "MSI",
        warranty: "36 tháng",
        sockets: ["LGA1200"],
        memoryType: "DDR4",
        condition: "New",
        nvmeSlots: 1,
        pcieVersion: "4.0",
        formFactor: "Micro-ATX",
        score: 5
    },
    "HNZ-B760": {
        name: "ASUS PRIME B760M-K D4 (LGA1700)",
        price: 3500000,
        image: "https://via.placeholder.com/150x150.png?text=PRIME+B760M-K+D4",
        brand: "ASUS",
        warranty: "36 tháng",
        sockets: ["LGA1700"],
        memoryType: "DDR4",
        condition: "New",
        nvmeSlots: 2,
        pcieVersion: "4.0",
        formFactor: "Micro-ATX",
        score: 7
    },
    "MSI-Z690": {
        name: "MSI PRO Z690-A DDR4 (LGA1700)",
        price: 5000000,
        image: "https://via.placeholder.com/150x150.png?text=PRO+Z690-A+DDR4",
        brand: "MSI",
        warranty: "36 tháng",
        sockets: ["LGA1700"],
        memoryType: "DDR4",
        condition: "New",
        nvmeSlots: 3,
        pcieVersion: "5.0",
        formFactor: "ATX",
        score: 8
    },
    "B450": {
        name: "MSI B450M-A PRO MAX (AM4)",
        price: 1100000,
        image: "https://via.placeholder.com/150x150.png?text=B450M-A+PRO+MAX",
        brand: "MSI",
        warranty: "36 tháng",
        sockets: ["AM4"],
        memoryType: "DDR4",
        condition: "New",
        nvmeSlots: 1,
        pcieVersion: "3.0",
        formFactor: "Micro-ATX",
        score: 4
    }
};

// VGA data
const vgaData = {
    "1050ti": {
        name: "NVIDIA GeForce GTX 1050Ti 4GB",
        price: 1500000,
        image: "https://via.placeholder.com/150x150.png?text=GTX+1050Ti",
        brand: "NVIDIA",
        warranty: "12 tháng",
        memory: "4GB GDDR5",
        bus: "PCI-Express 3.0",
        condition: "2ND",
        score: 3
    },
    "1660s": {
        name: "NVIDIA GeForce GTX 1660 Super",
        price: 3500000,
        image: "https://via.placeholder.com/150x150.png?text=GTX+1660+Super",
        brand: "NVIDIA",
        warranty: "36 tháng",
        memory: "6GB GDDR6",
        bus: "PCI-Express 3.0",
        condition: "New",
        score: 5
    },
    "3060": {
        name: "NVIDIA GeForce RTX 3060",
        price: 7000000,
        image: "https://via.placeholder.com/150x150.png?text=RTX+3060",
        brand: "NVIDIA",
        warranty: "36 tháng",
        memory: "12GB GDDR6",
        bus: "PCI-Express 4.0",
        condition: "New",
        score: 7
    },
    "3070ti": {
        name: "NVIDIA GeForce RTX 3070 Ti",
        price: 11000000,
        image: "https://via.placeholder.com/150x150.png?text=RTX+3070+Ti",
        brand: "NVIDIA",
        warranty: "36 tháng",
        memory: "8GB GDDR6X",
        bus: "PCI-Express 4.0",
        condition: "New",
        score: 8
    },
    "4070": {
        name: "NVIDIA GeForce RTX 4070",
        price: 15000000,
        image: "https://via.placeholder.com/150x150.png?text=RTX+4070",
        brand: "NVIDIA",
        warranty: "36 tháng",
        memory: "12GB GDDR6X",
        bus: "PCI-Express 4.0",
        condition: "New",
        score: 9
    }
};

// RAM data
const ramData = {
    "ddr3-4": {
        name: "RAM DDR3 4GB (Bus 1600)",
        price: 120000,
        image: "https://via.placeholder.com/150x150.png?text=RAM+DDR3+4GB",
        brand: "Kingston", 
        warranty: "12 tháng",
        type: "DDR3",
        capacity: "4GB",
        speed: "1600MHz",
        condition: "2ND",
        score: 2
    },
    "adata-8": {
        name: "ADATA 8GB DDR4 2666MHz",
        price: 500000,
        image: "https://via.placeholder.com/150x150.png?text=RAM+DDR4+8GB",
        brand: "ADATA",
        warranty: "Lifetime",
        type: "DDR4",
        capacity: "8GB",
        speed: "2666MHz",
        condition: "New",
        score: 3
    },
    "gskill-16": {
        name: "G.SKILL Ripjaws V 16GB (2x8GB) DDR4 3200MHz",
        price: 990000,
        image: "https://via.placeholder.com/150x150.png?text=RAM+16GB+DDR4",
        brand: "G.SKILL",
        warranty: "Lifetime",
        type: "DDR4",
        capacity: "16GB (2x8GB)",
        speed: "3200MHz",
        condition: "New",
        score: 5
    },
    "corsair-16": {
        name: "Corsair Vengeance LPX 16GB (2x8GB) DDR4 3600MHz",
        price: 1300000,
        image: "https://via.placeholder.com/150x150.png?text=RAM+16GB+DDR4-3600",
        brand: "Corsair",
        warranty: "Lifetime",
        type: "DDR4",
        capacity: "16GB (2x8GB)",
        speed: "3600MHz",
        condition: "New",
        score: 6
    },
    "sstc-16": {
        name: "Team T-FORCE VULCAN Z 16GB (2x8GB) DDR4 3600MHz",
        price: 1300000,
        image: "https://via.placeholder.com/150x150.png?text=RAM+16GB+T-FORCE",
        brand: "Team Group",
        warranty: "Lifetime",
        type: "DDR4",
        capacity: "16GB (2x8GB)",
        speed: "3600MHz",
        condition: "New",
        score: 7
    },
    "corsair-32": {
        name: "Corsair Vengeance RGB PRO 32GB (2x16GB) DDR4 3600MHz",
        price: 2500000,
        image: "https://via.placeholder.com/150x150.png?text=RAM+32GB+Corsair",
        brand: "Corsair",
        warranty: "Lifetime",
        type: "DDR4",
        capacity: "32GB (2x16GB)",
        speed: "3600MHz",
        condition: "New",
        score: 8
    }
};

// SSD data
const ssdData = {
    "crucial-256": {
        name: "Crucial BX500 256GB SATA SSD",
        price: 550000,
        image: "https://via.placeholder.com/150x150.png?text=SSD+256GB",
        brand: "Crucial",
        warranty: "36 tháng",
        capacity: "256GB",
        interface: "SATA",
        read_speed: "540 MB/s",
        write_speed: "500 MB/s",
        condition: "New",
        score: 3
    },
    "crucial-500": {
        name: "Crucial P2 500GB NVMe PCIe SSD",
        price: 1050000,
        image: "https://via.placeholder.com/150x150.png?text=SSD+500GB",
        brand: "Crucial",
        warranty: "60 tháng",
        capacity: "500GB",
        interface: "NVMe PCIe",
        read_speed: "2400 MB/s",
        write_speed: "1800 MB/s",
        condition: "New",
        score: 5
    },
    "samsung-1TB": {
        name: "Samsung 970 EVO Plus 1TB NVMe PCIe SSD",
        price: 2200000,
        image: "https://via.placeholder.com/150x150.png?text=SSD+1TB",
        brand: "Samsung",
        warranty: "60 tháng",
        capacity: "1TB",
        interface: "NVMe PCIe",
        read_speed: "3500 MB/s",
        write_speed: "3300 MB/s",
        condition: "New",
        score: 7
    },
    "samsung-2TB": {
        name: "Samsung 980 PRO 2TB NVMe PCIe 4.0 SSD",
        price: 4500000,
        image: "https://via.placeholder.com/150x150.png?text=SSD+2TB",
        brand: "Samsung",
        warranty: "60 tháng",
        capacity: "2TB",
        interface: "NVMe PCIe 4.0",
        read_speed: "7000 MB/s",
        write_speed: "5100 MB/s",
        condition: "New",
        score: 9
    }
};

// Cases data
const caseData = {
    "lc120": {
        name: "Case Gaming S9 Pink",
        price: 350000,
        image: "https://via.placeholder.com/150x150.png?text=Case+S9+Pink",
        brand: "S9",
        warranty: "12 tháng",
        size: "Mid Tower",
        material: "SPCC Steel",
        fans_included: 1,
        rgb: "Yes",
        condition: "New",
        score: 3
    },
    "MSI-MAG": {
        name: "MSI MAG FORGE 100M",
        price: 900000,
        image: "https://via.placeholder.com/150x150.png?text=MSI+MAG+Forge",
        brand: "MSI",
        warranty: "12 tháng",
        size: "Mid Tower",
        material: "Steel / Tempered Glass",
        fans_included: 2,
        rgb: "No",
        condition: "New",
        score: 4
    },
    "NZXT-H510": {
        name: "NZXT H510",
        price: 1750000,
        image: "https://via.placeholder.com/150x150.png?text=NZXT+H510",
        brand: "NZXT",
        warranty: "24 tháng",
        size: "Mid Tower",
        material: "Steel / Tempered Glass",
        fans_included: 2,
        rgb: "No",
        condition: "New",
        score: 6
    },
    "GA3": {
        name: "GALAX REVOLUTION-03",
        price: 1850000,
        image: "https://via.placeholder.com/150x150.png?text=GALAX+REV-03",
        brand: "GALAX",
        warranty: "12 tháng",
        size: "Mid Tower",
        material: "Steel / Tempered Glass",
        fans_included: 4,
        rgb: "Yes",
        condition: "New",
        score: 7
    },
    "Corsair-5000D": {
        name: "Corsair 5000D AIRFLOW",
        price: 3300000,
        image: "https://via.placeholder.com/150x150.png?text=Corsair+5000D",
        brand: "Corsair",
        warranty: "24 tháng",
        size: "Mid Tower",
        material: "Steel / Tempered Glass",
        fans_included: 2,
        rgb: "No",
        condition: "New",
        score: 9
    }
};

// CPU Cooler data
const cpuCoolerData = {
    "deepcool": {
        name: "Deepcool GAMMAXX 400",
        price: 500000,
        image: "https://via.placeholder.com/150x150.png?text=Deepcool+GAMMAXX",
        brand: "Deepcool",
        warranty: "12 tháng",
        tdp: "150W",
        fan_speed: "900-1500 RPM",
        rgb: "No",
        condition: "New",
        score: 4
    },
    "ID-SE-224": {
        name: "ID-COOLING SE-224-XT",
        price: 700000,
        image: "https://via.placeholder.com/150x150.png?text=ID-COOLING",
        brand: "ID-COOLING",
        warranty: "24 tháng",
        tdp: "180W",
        fan_speed: "700-1800 RPM",
        rgb: "Yes",
        condition: "New",
        score: 6
    },
    "CR1000": {
        name: "Deepcool AK620",
        price: 1350000,
        image: "https://via.placeholder.com/150x150.png?text=Deepcool+AK620",
        brand: "Deepcool",
        warranty: "36 tháng",
        tdp: "260W",
        fan_speed: "500-1850 RPM",
        rgb: "No",
        condition: "New",
        score: 7
    },
    "NZXT-X63": {
        name: "NZXT Kraken X63",
        price: 3600000,
        image: "https://via.placeholder.com/150x150.png?text=NZXT+Kraken",
        brand: "NZXT",
        warranty: "72 tháng",
        tdp: "300W",
        fan_speed: "500-2000 RPM",
        rgb: "Yes",
        condition: "New",
        score: 9
    }
};

// PSU data
const psuData = {
    "Cx1": {
        name: "Extra Power 450W",
        price: 350000,
        image: "https://via.placeholder.com/150x150.png?text=Extra+Power+450W",
        brand: "Extra Power",
        warranty: "12 tháng",
        power: "450W",
        certification: "None",
        modular: "No",
        condition: "New",
        score: 2
    },
    "coolermaster-450": {
        name: "Cooler Master MWE 450W Bronze V2",
        price: 850000,
        image: "https://via.placeholder.com/150x150.png?text=CM+450W",
        brand: "Cooler Master",
        warranty: "60 tháng",
        power: "450W",
        certification: "80+ Bronze",
        modular: "No",
        condition: "New",
        score: 4
    },
    "corsair-550": {
        name: "Corsair CV550 550W",
        price: 1200000,
        image: "https://via.placeholder.com/150x150.png?text=Corsair+550W",
        brand: "Corsair",
        warranty: "36 tháng",
        power: "550W",
        certification: "80+ Bronze",
        modular: "No",
        condition: "New",
        score: 5
    },
    "VSP750": {
        name: "Corsair RM750 750W",
        price: 2250000,
        image: "https://via.placeholder.com/150x150.png?text=Corsair+750W",
        brand: "Corsair",
        warranty: "120 tháng",
        power: "750W",
        certification: "80+ Gold",
        modular: "Full",
        condition: "New",
        score: 8
    },
    "corsair-850": {
        name: "Corsair RM850x 850W",
        price: 3200000,
        image: "https://via.placeholder.com/150x150.png?text=Corsair+850W",
        brand: "Corsair",
        warranty: "120 tháng",
        power: "850W",
        certification: "80+ Gold",
        modular: "Full",
        condition: "New",
        score: 9
    }
};

// HDD data
const hddData = {
    "wd-1tb": {
        name: "Western Digital Blue 1TB",
        price: 850000,
        image: "https://via.placeholder.com/150x150.png?text=WD+1TB",
        brand: "Western Digital",
        warranty: "24 tháng",
        capacity: "1TB",
        interface: "SATA",
        read_speed: "150 MB/s",
        write_speed: "150 MB/s",
        condition: "New",
        score: 5
    },
    "wd-2tb": {
        name: "Western Digital Blue 2TB",
        price: 1450000,
        image: "https://via.placeholder.com/150x150.png?text=WD+2TB",
        brand: "Western Digital",
        warranty: "24 tháng",
        capacity: "2TB",
        interface: "SATA",
        read_speed: "150 MB/s",
        write_speed: "150 MB/s",
        condition: "New",
        score: 6
    },
    "seagate-2tb": {
        name: "Seagate Barracuda 2TB",
        price: 1350000,
        image: "https://via.placeholder.com/150x150.png?text=Seagate+2TB",
        brand: "Seagate",
        warranty: "24 tháng",
        capacity: "2TB",
        interface: "SATA",
        read_speed: "210 MB/s",
        write_speed: "210 MB/s",
        condition: "New",
        score: 6
    },
    "seagate-4tb": {
        name: "Seagate Barracuda 4TB",
        price: 2200000,
        image: "https://via.placeholder.com/150x150.png?text=Seagate+4TB",
        brand: "Seagate",
        warranty: "24 tháng",
        capacity: "4TB",
        interface: "SATA",
        read_speed: "210 MB/s",
        write_speed: "210 MB/s",
        condition: "New",
        score: 7
    }
};

// Monitor data
const monitorData = {
    "acer-24": {
        name: "Acer Nitro VG240Y 24\" Gaming Monitor",
        price: 3300000,
        image: "https://via.placeholder.com/150x150.png?text=Acer+24%22",
        brand: "Acer",
        warranty: "36 tháng",
        panel: "IPS",
        resolution: "1920x1080 (FHD)",
        refresh_rate: "144Hz",
        response_time: "1ms",
        condition: "New",
        score: 7
    },
    "asus-27": {
        name: "ASUS TUF Gaming VG27AQ 27\" Gaming Monitor",
        price: 7200000,
        image: "https://via.placeholder.com/150x150.png?text=ASUS+27%22",
        brand: "ASUS",
        warranty: "36 tháng",
        panel: "IPS",
        resolution: "2560x1440 (QHD)",
        refresh_rate: "165Hz",
        response_time: "1ms",
        condition: "New",
        score: 9
    },
    "samsung-odyssey": {
        name: "Samsung Odyssey G7 27\" Curved Gaming Monitor",
        price: 11500000,
        image: "https://via.placeholder.com/150x150.png?text=Samsung+G7",
        brand: "Samsung",
        warranty: "36 tháng",
        panel: "VA",
        resolution: "2560x1440 (QHD)",
        refresh_rate: "240Hz",
        response_time: "1ms",
        condition: "New",
        score: 10
    }
}; 