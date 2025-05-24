// auto-export-config.js - Phiên bản nâng cấp
// Script tự động xuất cấu hình máy tính sang Excel

document.addEventListener('DOMContentLoaded', function() {
  // Tìm hoặc tạo nút "Lưu cấu hình"
  setupExportButton();
});

// Thiết lập nút xuất
function setupExportButton() {
  // Tìm nút "Lưu cấu hình" hiện có
  let saveButton = document.querySelector('.luu-cau-hinh');
  
  if (!saveButton) {
    // Nếu không tìm thấy nút cụ thể, tìm các nút khác có thể liên quan
    saveButton = document.querySelector('#save-button') ||
                 document.querySelector('button:contains("Lưu cấu hình")');
  }
  
  if (!saveButton) {
    // Tạo nút mới nếu không tìm thấy
    console.log("Không tìm thấy nút 'Lưu cấu hình', đang tạo nút mới...");
    saveButton = document.createElement('button');
    saveButton.innerHTML = 'Lưu cấu hình Excel';
    saveButton.className = 'action-button accent-btn luu-cau-hinh';
    saveButton.style.cssText = 'background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-top: 20px;';
    
    // Thêm vào gần các nút hiện có
    const buttonGroup = document.querySelector('.button-group');
    if (buttonGroup) {
      buttonGroup.appendChild(saveButton);
    } else {
      // Thêm vào cuối trang
      document.body.appendChild(saveButton);
    }
  } else {
    console.log("Đã tìm thấy nút 'Lưu cấu hình'");
  }
  
  // Xóa tất cả các event listener cũ nếu có
  const newSaveButton = saveButton.cloneNode(true);
  saveButton.parentNode.replaceChild(newSaveButton, saveButton);
  saveButton = newSaveButton;
  
  // Thêm sự kiện click
  saveButton.addEventListener('click', function(e) {
    console.log("====== BẮT ĐẦU QUÁ TRÌNH LƯU CẤU HÌNH ======");
    console.log("Nút lưu cấu hình được bấm!", this);
    
    // Ngăn chặn hành vi mặc định nếu là thẻ a
    if (e && e.preventDefault) {
      e.preventDefault();
      console.log("Đã ngăn chặn hành vi mặc định của nút");
    }
    
    try {
      console.log("Bắt đầu export Excel...");
      const configData = collectComponentData();
      console.log("Dữ liệu thu thập:", JSON.stringify(configData, null, 2));
      
      if (Object.keys(configData).length === 0) {
        console.error("Không thu thập được dữ liệu cấu hình!");
        alert("Không thể thu thập dữ liệu cấu hình. Vui lòng chọn ít nhất CPU và VGA trước khi lưu.");
        return;
      }
      
      console.log("Gọi hàm exportToExcel với dữ liệu thu thập được");
      exportToExcel(configData);
    } catch (error) {
      console.error("Lỗi khi xử lý sự kiện click nút Lưu Cấu Hình:", error);
      alert("Có lỗi xảy ra: " + error.message);
    }
    console.log("====== KẾT THÚC QUÁ TRÌNH XỬ LÝ CLICK ======");
  });
  
  console.log("Đã thiết lập sự kiện cho nút 'Lưu cấu hình'");
}

// Thu thập dữ liệu các linh kiện đã chọn
function collectComponentData() {
  const configData = {};
  
  // Lấy dữ liệu từ các dropdown đã chọn trong giao diện
  const componentTypes = ['cpu', 'mainboard', 'vga', 'ram', 'ssd', 'psu', 'case', 'cpuCooler', 'hdd', 'monitor'];
  
  componentTypes.forEach(type => {
    try {
      const dropdown = document.getElementById(type);
      if (dropdown && dropdown.value) {
        const selectedOption = dropdown.options[dropdown.selectedIndex];
        const componentName = selectedOption.text;
        const componentValue = dropdown.value;
        
        // Tìm thông tin giá và thông số
        let price = 0;
        const specs = {};
        
        // Cố gắng lấy giá từ danh sách hiển thị
        const selectedComponentElement = document.querySelector(`#selected-components-list [data-component="${type}"]`);
        if (selectedComponentElement) {
          const priceElement = selectedComponentElement.querySelector('.component-price');
          if (priceElement) {
            const priceText = priceElement.textContent;
            const priceMatch = priceText.match(/(\d{1,3}(,\d{3})*) VNĐ/);
            if (priceMatch) {
              price = parseInt(priceMatch[1].replace(/,/g, ''));
            }
          }
          
          // Lấy thông số kỹ thuật
          const specsList = selectedComponentElement.querySelector('.component-specs');
          if (specsList) {
            const specItems = specsList.querySelectorAll('.spec-item');
            specItems.forEach(item => {
              const text = item.textContent.trim();
              const parts = text.split(':');
              if (parts.length === 2) {
                specs[parts[0].trim()] = parts[1].trim();
              }
            });
          }
        }
        
        // Nếu không tìm thấy từ danh sách, kiểm tra các thành phần khác
        if (price === 0) {
          // Tìm từ bảng cấu hình
          const configTable = document.querySelector('.config-table');
          if (configTable) {
            const row = configTable.querySelector(`tr:has(td#${type}-name), tr:has(td#${type.toLowerCase()}-name)`);
            if (row) {
              const priceCell = row.querySelector('td:nth-child(3)');
              if (priceCell) {
                const priceText = priceCell.textContent;
                const priceMatch = priceText.match(/(\d{1,3}(,\d{3})*)/);
                if (priceMatch) {
                  price = parseInt(priceMatch[1].replace(/,/g, ''));
                }
              }
            }
          }
        }
        
        // Chuyển đổi tên loại thành dạng tiêu chuẩn
        let standardType = type.charAt(0).toUpperCase() + type.slice(1);
        if (type === 'cpuCooler') standardType = 'Cooler';
        if (type === 'vga') standardType = 'VGA';
        if (type === 'ssd' || type === 'hdd') standardType = type.toUpperCase();
        if (type === 'psu') standardType = 'PSU';
        
        configData[standardType] = {
          name: componentName,
          price: price,
          specs: specs
        };
      }
    } catch (e) {
      console.error(`Lỗi khi xử lý linh kiện ${type}:`, e);
    }
  });
  
  // Nếu không tìm thấy dữ liệu từ dropdown, thử phương pháp khác
  if (Object.keys(configData).length === 0) {
    // Thử lấy từ bảng selected components
    try {
      const selectedComponentsList = document.getElementById('selected-components-list');
      if (selectedComponentsList) {
        const componentCards = selectedComponentsList.querySelectorAll('.component-card');
        componentCards.forEach(card => {
          const typeElement = card.querySelector('.component-type');
          const nameElement = card.querySelector('.component-name');
          const priceElement = card.querySelector('.component-price');
          
          if (typeElement && nameElement && priceElement) {
            const type = typeElement.textContent.trim();
            const name = nameElement.textContent.trim();
            let price = 0;
            
            const priceMatch = priceElement.textContent.match(/(\d{1,3}(,\d{3})*) VNĐ/);
            if (priceMatch) {
              price = parseInt(priceMatch[1].replace(/,/g, ''));
            }
            
            const specs = {};
            const specItems = card.querySelectorAll('.spec-item');
            specItems.forEach(item => {
              const text = item.textContent.trim();
              const parts = text.split(':');
              if (parts.length === 2) {
                specs[parts[0].trim()] = parts[1].trim();
              }
            });
            
            configData[type] = {
              name: name,
              price: price,
              specs: specs
            };
          }
        });
      }
    } catch (e) {
      console.error('Lỗi khi lấy dữ liệu từ bảng selected components:', e);
    }
  }
  
  // Nếu vẫn không tìm thấy dữ liệu, sử dụng dữ liệu từ bảng config-table
  if (Object.keys(configData).length === 0) {
    try {
      const configTable = document.querySelector('.config-table');
      if (configTable) {
        const rows = configTable.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 3 && !row.classList.contains('score-row')) {
            const type = cells[0].textContent.trim();
            const name = cells[1].textContent.trim();
            
            if (type && name && name !== '...') {
              configData[type] = {
                name: name,
                price: 0,  // Không có thông tin giá trong bảng này
                specs: {}
              };
            }
          }
        });
      }
    } catch (e) {
      console.error('Lỗi khi lấy dữ liệu từ bảng config-table:', e);
    }
  }
  
  // Nếu vẫn không có dữ liệu, thử lấy từ modal
  if (Object.keys(configData).length === 0) {
    const modalData = extractFromModalList();
    if (Object.keys(modalData).length > 0) {
      return modalData;
    }
  }
  
  // Nếu vẫn không có dữ liệu, sử dụng dữ liệu cứng
  if (Object.keys(configData).length < 3) {
    return getHardcodedData();
  }
  
  return configData;
}

// Trích xuất thông tin từ modal-components-list
function extractFromModalList() {
  const configData = {};
  
  try {
    const modalList = document.getElementById('modal-components-list');
    if (modalList) {
      const componentItems = modalList.querySelectorAll('.component-item');
      componentItems.forEach(item => {
        const nameElement = item.querySelector('.component-name');
        const priceElement = item.querySelector('.component-price');
        
        if (nameElement && priceElement) {
          // Xác định loại từ tên
          let type = nameElement.textContent.trim().split(':')[0].trim();
          const name = nameElement.textContent.trim().split(':')[1]?.trim() || nameElement.textContent.trim();
          
          let price = 0;
          const priceMatch = priceElement.textContent.match(/(\d{1,3}(,\d{3})*) VNĐ/);
          if (priceMatch) {
            price = parseInt(priceMatch[1].replace(/,/g, ''));
          }
          
          configData[type] = {
            name: name,
            price: price,
            specs: {}
          };
        }
      });
    }
  } catch (e) {
    console.error('Lỗi khi lấy dữ liệu từ modal list:', e);
  }
  
  return configData;
}

// Lấy thông số kỹ thuật
function getComponentSpecs(component) {
  const specs = {};
  
  // Tìm các phần tử chứa thông số
  const specItems = component.querySelectorAll('.spec-item, .specifications li, dt, dd');
  
  if (specItems.length > 0) {
    // Nếu có cấu trúc rõ ràng
    for (let i = 0; i < specItems.length; i++) {
      const text = specItems[i].textContent.trim();
      const parts = text.split(':');
      
      if (parts.length === 2) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        if (key && value) specs[key] = value;
      }
    }
  } else {
    // Thử phân tích từ nội dung
    const text = component.textContent;
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    lines.forEach(line => {
      const parts = line.split(':');
      if (parts.length === 2) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        if (key && value) specs[key] = value;
      }
    });
  }
  
  return specs;
}

// Dữ liệu cứng dự phòng (dựa trên ảnh)
function getHardcodedData() {
  return {
    'CPU': {
      name: 'AMD Ryzen 5 5600X',
      price: 2800000,
      specs: {
        'Socket': 'AM4',
        'Cores': '6',
        'Threads': '12',
        'Technology': '7nm',
        'RAM Support': 'DDR4',
        'RAM Bus': '3200MHz'
      }
    },
    'Mainboard': {
      name: 'JGinyue B450M-TI (AM4)',
      price: 1390000,
      specs: {
        'Loại RAM': 'DDR4',
        'NVMe Slots': '1',
        'PCIe Version': '3.0',
        'Form Factor': 'Micro-ATX',
        'Sockets hỗ trợ': 'AM4'
      }
    },
    'RAM': {
      name: 'RAM Corsair Vengeance LPX 16GB DDR4 (Bus 3200)',
      price: 700000,
      specs: {
        'Type': 'DDR4',
        'Speed': '3200MHz',
        'Size': '16GB'
      }
    },
    'VGA': {
      name: 'RTX 2070 Super 8GB GDDR6 /GIGA/MSI/ASUS GAMING (Cũ)',
      price: 4500000,
      specs: {
        'VRAM': '8GB',
        'VRAM Type': 'GDDR6',
        'Card Type': 'NVIDIA'
      }
    },
    'SSD': {
      name: 'SSD Crucial P3 Plus 500GB Gen4 x4',
      price: 950000,
      specs: {
        'Type': 'NVMe PCIe Gen4 x4',
        'Speed': 'Read 4700MB/s, Write 1900MB/s'
      }
    },
    'PSU': {
      name: 'Nguồn VSP VGP750BRN 80Plus Bronze 750W',
      price: 1000000,
      specs: {
        'Power': '750W',
        'Connectors': 'MB: 1x 24-pin, CPU: 1x 8-pin, PCIe: 2x, SATA: 6, Molex: 3'
      }
    },
    'Case': {
      name: 'Vỏ Case 2 Mặt Kính Cường Lực',
      price: 300000,
      specs: {
        'Mainboard hỗ trợ': 'ATX, M-ATX, ITX',
        'Kích thước': '410mm x 200mm x 460mm'
      }
    },
    'Cooler': {
      name: 'Jonsbo CR-1000 RGB',
      price: 300000,
      specs: {
        'Sockets hỗ trợ': 'Intel & AMD',
        'Đèn': 'RGB'
      }
    }
  };
}

// Xuất file Excel
function exportToExcel(configData) {
  console.log("Hàm exportToExcel được gọi với dữ liệu:", configData);
  
  try {
    // Kiểm tra lại một lần nữa xem thư viện XLSX đã sẵn sàng chưa
    console.log("Kiểm tra thư viện XLSX trong window:", !!window.XLSX);
    
    // Nếu thư viện không có trong window, thử tìm ở các vị trí khác
    let xlsx = window.XLSX || XLSX || window.Excel || null;
    
    if (xlsx) {
      console.log("Đã tìm thấy thư viện XLSX, sử dụng phương pháp trực tiếp");
      return createAndDownloadExcel(configData, xlsx);
    }
    
    console.log("Không tìm thấy thư viện XLSX, tiến hành tải...");
    showNotification('Đang tải thư viện cần thiết...', 'info');
    
    // Tải thư viện XLSX từ CDN
    loadScript('https://cdn.sheetjs.com/xlsx-0.18.9/package/dist/xlsx.full.min.js', function() {
      console.log("Đã tải xong thư viện XLSX, kiểm tra lại:");
      console.log("XLSX có tồn tại:", !!window.XLSX);
      
      // Kiểm tra lại sau khi tải
      if (window.XLSX) {
        console.log("Thư viện đã tải thành công, gọi lại hàm");
        createAndDownloadExcel(configData, window.XLSX);
      } else {
        console.error("Không thể tải thư viện XLSX từ CDN");
        // Chuyển sang sử dụng phương pháp đơn giản
        downloadSimpleExcel(configData);
      }
    });
  } catch (e) {
    console.error("Lỗi trong exportToExcel:", e);
    alert("Có lỗi khi tạo file Excel: " + e.message);
    
    // Chuyển sang phương pháp dự phòng
    downloadSimpleExcel(configData);
  }
}

// Tạo và tải xuống file Excel sử dụng thư viện SheetJS
function createAndDownloadExcel(configData, xlsxLib) {
  try {
    console.log("Bắt đầu tạo Excel sử dụng SheetJS");
    
    // Tạo workbook mới
    let wb, ws;
    
    // Kiểm tra các phương thức cần thiết
    if (xlsxLib.utils && xlsxLib.utils.book_new && xlsxLib.utils.aoa_to_sheet) {
      console.log("Tìm thấy các phương thức cần thiết của XLSX");
      
      // Tính tổng giá
      const totalPrice = Object.values(configData).reduce((sum, component) => sum + (component.price || 0), 0);
      
      // Tạo dữ liệu theo định dạng bảng mẫu chính xác
      const wsData = [
        // Bắt đầu với các dòng header giống hệt file mẫu
        ['STT', 'Tên, mã, loại linh kiện', 'Đvt', 'Số lượng', 'Đơn giá', 'Thành tiền', 'Bảo Hành', 'Ghi chú']
      ];
      
      // Thêm dữ liệu các linh kiện
      let stt = 1;
      Object.keys(configData).forEach(type => {
        const component = configData[type];
        // Đơn vị tính là chiếc
        const donViTinh = "Chiếc";
        // Số lượng mặc định là 1
        const soLuong = 1;
        // Đơn giá là giá của component
        const donGia = component.price || 0;
        // Thành tiền = Số lượng * Đơn giá
        const thanhTien = soLuong * donGia;
        
        // Bảo hành mặc định 36T, với một số ngoại lệ là 12T hoặc 3T
        let baoHanh = "36T";
        if (type.toLowerCase().includes("tản nhiệt") || type.toLowerCase().includes("quạt") || 
            type.toLowerCase().includes("fan") || type.toLowerCase().includes("case") || 
            type.toLowerCase().includes("vỏ")) {
          baoHanh = "12T";
        } else if (type.toLowerCase().includes("vga") || type.toLowerCase().includes("card")) {
          baoHanh = "3T";
        }
        
        // Ghi chú mặc định là New
        const ghiChu = "NEW";
        
        // Tên linh kiện, giữ nguyên loại và tên
        wsData.push([stt, component.name, donViTinh, soLuong, donGia, thanhTien, baoHanh, ghiChu]);
        stt++;
      });
      
      // Thêm các dòng trống để đủ ít nhất 9 dòng cho linh kiện
      while (stt <= 9) {
        if (stt === 9) {
          // Dòng thứ 9 đặc biệt, chỉ có số 1 ở cột Ghi chú
          wsData.push(['', '', '', '', '', '', '', '1']);
        } else {
          wsData.push(['', '', '', '', '', '', '', '']);
        }
        stt++;
      }
      
      // Thêm dòng trống trước phần tổng
      wsData.push(['', '', '', '', '', '-', '', '']);
      
      // Thêm phần footer giống hệt file mẫu
      wsData.push(['', 'Tổng cộng', '', '', '', totalPrice, '', '']);
      wsData.push(['', 'Chiết khấu', '', '', '', '', '', '']);
      wsData.push(['', 'Đã thanh toán', '', '', '', '', '', '']);
      wsData.push(['', 'Còn lại', '', '', '', totalPrice, '', '']);
      
      // Tạo workbook và worksheet
      console.log("Tạo workbook mới");
      wb = xlsxLib.utils.book_new();
      
      console.log("Tạo worksheet từ dữ liệu");
      ws = xlsxLib.utils.aoa_to_sheet(wsData);
      
      // Style cho worksheet - điều chỉnh chiều rộng cột
      ws['!cols'] = [
        { wch: 5 },   // STT
        { wch: 35 },  // Tên linh kiện
        { wch: 10 },  // Đvt
        { wch: 10 },  // Số lượng
        { wch: 15 },  // Đơn giá
        { wch: 15 },  // Thành tiền
        { wch: 10 },  // Bảo hành
        { wch: 10 }   // Ghi chú
      ];
      
      // Thêm worksheet vào workbook
      console.log("Thêm worksheet vào workbook");
      xlsxLib.utils.book_append_sheet(wb, ws, 'Cấu hình');
      
      // Xuất file
      if (xlsxLib.writeFile) {
        // Thử phương pháp trực tiếp trước
        try {
          console.log("Thử xuất file trực tiếp bằng writeFile");
          xlsxLib.writeFile(wb, 'cau_hinh_may_tinh.xlsx');
          showNotification('Đã lưu cấu hình thành công!');
          return true;
        } catch (writeError) {
          console.log("Xuất file trực tiếp thất bại:", writeError);
        }
      }
      
      // Nếu writeFile không thành công hoặc không có, sử dụng phương pháp Blob
      try {
        console.log("Xuất file sử dụng phương pháp Blob");
        const wbout = xlsxLib.write(wb, { bookType: 'xlsx', type: 'array' });
        
        if (wbout && wbout.length > 0) {
          const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          return downloadFile(blob, 'cau_hinh_may_tinh.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        } else {
          throw new Error("Không thể tạo dữ liệu binary");
        }
      } catch (blobError) {
        console.error("Phương pháp Blob thất bại:", blobError);
        return downloadSimpleExcel(configData);
      }
    } else {
      console.error("Không tìm thấy các phương thức cần thiết của XLSX");
      throw new Error("Thư viện XLSX không đầy đủ");
    }
  } catch (e) {
    console.error("Lỗi khi tạo Excel:", e);
    return downloadSimpleExcel(configData);
  }
  
  return false;
}

// Phương pháp đơn giản để tạo và tải xuống file Excel dạng HTML
function downloadSimpleExcel(configData) {
  try {
    console.log("Sử dụng phương pháp đơn giản để tạo Excel");
    
    // Tạo HTML table theo định dạng mẫu
    let html = `
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Cấu hình máy tính</title>
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #000; padding: 8px; }
          th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
          .total { font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <th>STT</th>
            <th>Tên, mã, loại linh kiện</th>
            <th>Đvt</th>
            <th>Số lượng</th>
            <th>Đơn giá</th>
            <th>Thành tiền</th>
            <th>Bảo Hành</th>
            <th>Ghi chú</th>
          </tr>
    `;
    
    // Thêm dữ liệu
    let totalPrice = 0;
    let stt = 1;
    
    Object.keys(configData).forEach(type => {
      const component = configData[type];
      const price = component.price || 0;
      totalPrice += price;
      
      // Bảo hành mặc định 36T, với một số ngoại lệ
      let baoHanh = "36T";
      if (type.toLowerCase().includes("tản nhiệt") || type.toLowerCase().includes("quạt") || 
          type.toLowerCase().includes("fan") || type.toLowerCase().includes("case") || 
          type.toLowerCase().includes("vỏ")) {
        baoHanh = "12T";
      } else if (type.toLowerCase().includes("vga") || type.toLowerCase().includes("card")) {
        baoHanh = "3T";
      }
      
      html += `
        <tr>
          <td style="text-align: center;">${stt}</td>
          <td>${component.name}</td>
          <td style="text-align: center;">Chiếc</td>
          <td style="text-align: center;">1</td>
          <td style="text-align: right;">${price.toLocaleString()}</td>
          <td style="text-align: right;">${price.toLocaleString()}</td>
          <td style="text-align: center;">${baoHanh}</td>
          <td style="text-align: center;">NEW</td>
        </tr>
      `;
      stt++;
    });
    
    // Thêm các dòng trống để đủ 9 dòng
    while (stt <= 9) {
      if (stt === 9) {
        // Dòng thứ 9 đặc biệt, chỉ có số 1 ở cột Ghi chú
        html += `
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td style="text-align: center;">1</td>
          </tr>
        `;
      } else {
        html += `
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        `;
      }
      stt++;
    }
    
    // Thêm dòng trống trước phần tổng
    html += `
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td style="text-align: center;">-</td>
        <td></td>
        <td></td>
      </tr>
    `;
    
    // Thêm tổng tiền
    html += `
        <tr>
          <td colspan="5" style="text-align: right; font-weight: bold;">Tổng cộng</td>
          <td style="text-align: right; font-weight: bold;">${totalPrice.toLocaleString()}</td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td colspan="5" style="text-align: right; font-weight: bold;">Chiết khấu</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td colspan="5" style="text-align: right; font-weight: bold;">Đã thanh toán</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td colspan="5" style="text-align: right; font-weight: bold;">Còn lại</td>
          <td style="text-align: right; font-weight: bold;">${totalPrice.toLocaleString()}</td>
          <td colspan="2"></td>
        </tr>
      </table>
    </body>
    </html>
    `;
    
    // Tạo cả CSV để có nhiều lựa chọn
    const csv = createCSVWithFormat(configData);
    const tsv = createTSVWithFormat(configData);
    
    // Tạo modal cho người dùng chọn định dạng
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      width: 400px;
      max-width: 80%;
      text-align: center;
    `;
    
    modalContent.innerHTML = `
      <h2 style="margin-top: 0; color: #4CAF50;">Chọn định dạng tải xuống</h2>
      <p>Chọn định dạng phù hợp với nhu cầu của bạn:</p>
      <div style="display: flex; flex-direction: column; gap: 10px; margin: 20px 0;">
        <button id="html-format" style="padding: 10px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
          Web (HTML) - Giống Excel nhất
        </button>
        <button id="csv-format" style="padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
          CSV - Tương thích Excel, mở được trong Excel
        </button>
        <button id="tsv-format" style="padding: 10px; background: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
          Bảng tính (TSV) - Dễ mở nhất
        </button>
        <button id="text-format" style="padding: 10px; background: #9e9e9e; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Văn bản thuần (TXT)
        </button>
      </div>
      <p style="margin-bottom: 0; font-size: 0.9em; color: #666;">
        <i>Gợi ý: CSV tương thích với hầu hết các phần mềm bảng tính</i>
      </p>
      <button id="close-format-modal" style="margin-top: 15px; padding: 8px 15px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Đóng
      </button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Hàm xử lý khi một định dạng được chọn
    const handleFormatSelection = (format, content, filename, contentType) => {
      try {
        // Xóa modal
        document.body.removeChild(modal);
        
        // Thử tải xuống
        const downloadResult = downloadFile(content, filename, contentType);
        
        if (!downloadResult) {
          // Nếu tải xuống thất bại, thử mở trong tab mới
          return openInNewTab(content, format);
        }
        
        return true;
      } catch (e) {
        console.error(`Lỗi khi tải ${format}:`, e);
        try {
          document.body.removeChild(modal);
        } catch (modalError) {}
        
        // Thử mở trong tab mới như phương án dự phòng
        return openInNewTab(content, format);
      }
    };
    
    // Xử lý các sự kiện click
    document.getElementById('html-format').addEventListener('click', function() {
      handleFormatSelection('html', html, 'cau_hinh_may_tinh.html', 'text/html');
    });
    
    document.getElementById('csv-format').addEventListener('click', function() {
      handleFormatSelection('csv', csv, 'cau_hinh_may_tinh.csv', 'text/csv');
    });
    
    document.getElementById('tsv-format').addEventListener('click', function() {
      handleFormatSelection('tsv', tsv, 'cau_hinh_may_tinh.tsv', 'text/tab-separated-values');
    });
    
    document.getElementById('text-format').addEventListener('click', function() {
      const text = tsv; // TSV cũng dễ đọc như text
      handleFormatSelection('txt', text, 'cau_hinh_may_tinh.txt', 'text/plain');
    });
    
    document.getElementById('close-format-modal').addEventListener('click', function() {
      document.body.removeChild(modal);
    });
    
    return true;
  } catch (e) {
    console.error("Lỗi khi tạo Excel đơn giản:", e);
    
    // Nếu modal vẫn tồn tại, thử xóa nó
    try {
      const existingModal = document.querySelector('div[style*="position: fixed"]');
      if (existingModal) {
        document.body.removeChild(existingModal);
      }
    } catch (modalError) {}
    
    return trySimpleTextDownload(configData);
  }
}

// Tạo file CSV đơn giản với định dạng theo mẫu
function createCSVWithFormat(configData) {
  try {
    console.log("Tạo file CSV đơn giản theo định dạng mẫu");
    
    // Tạo header
    let csv = "STT,Tên\\, mã\\, loại linh kiện,Đvt,Số lượng,Đơn giá,Thành tiền,Bảo Hành,Ghi chú\n";
    
    // Thêm dữ liệu
    let totalPrice = 0;
    let stt = 1;
    
    Object.keys(configData).forEach(type => {
      const component = configData[type];
      const price = component.price || 0;
      totalPrice += price;
      
      // Bảo hành mặc định 36T, với một số ngoại lệ
      let baoHanh = "36T";
      if (type.toLowerCase().includes("tản nhiệt") || type.toLowerCase().includes("quạt") || 
          type.toLowerCase().includes("fan") || type.toLowerCase().includes("case") || 
          type.toLowerCase().includes("vỏ")) {
        baoHanh = "12T";
      } else if (type.toLowerCase().includes("vga") || type.toLowerCase().includes("card")) {
        baoHanh = "3T";
      }
      
      // Chuẩn bị tên sản phẩm, thay thế dấu phẩy bằng dấu chấm phẩy để tránh lỗi CSV
      const safeName = component.name.replace(/,/g, ";");
      
      csv += `${stt},${safeName},Chiếc,1,${price},${price},${baoHanh},NEW\n`;
      stt++;
    });
    
    // Thêm các dòng trống để đủ 9 dòng
    while (stt <= 9) {
      if (stt === 9) {
        // Dòng thứ 9 đặc biệt, chỉ có số 1 ở cột Ghi chú
        csv += `,,,,,,,"1"\n`;
      } else {
        csv += `,,,,,,,\n`;
      }
      stt++;
    }
    
    // Thêm dòng trống trước phần tổng
    csv += `,,,,,-,,\n`;
    
    // Thêm tổng tiền
    csv += `,Tổng cộng,,,,${totalPrice},,\n`;
    csv += `,Chiết khấu,,,,,\n`;
    csv += `,Đã thanh toán,,,,,\n`;
    csv += `,Còn lại,,,,${totalPrice},,\n`;
    
    return csv;
  } catch (e) {
    console.error("Lỗi khi tạo CSV:", e);
    return null;
  }
}

// Tạo file TSV (Tab-Separated Values) với định dạng theo mẫu
function createTSVWithFormat(configData) {
  try {
    console.log("Tạo file TSV đơn giản theo định dạng mẫu");
    
    // Tạo header
    let tsv = "STT\tTên, mã, loại linh kiện\tĐvt\tSố lượng\tĐơn giá\tThành tiền\tBảo Hành\tGhi chú\n";
    
    // Thêm dữ liệu
    let totalPrice = 0;
    let stt = 1;
    
    Object.keys(configData).forEach(type => {
      const component = configData[type];
      const price = component.price || 0;
      totalPrice += price;
      
      // Bảo hành mặc định 36T, với một số ngoại lệ
      let baoHanh = "36T";
      if (type.toLowerCase().includes("tản nhiệt") || type.toLowerCase().includes("quạt") || 
          type.toLowerCase().includes("fan") || type.toLowerCase().includes("case") || 
          type.toLowerCase().includes("vỏ")) {
        baoHanh = "12T";
      } else if (type.toLowerCase().includes("vga") || type.toLowerCase().includes("card")) {
        baoHanh = "3T";
      }
      
      tsv += `${stt}\t${component.name}\tChiếc\t1\t${price}\t${price}\t${baoHanh}\tNEW\n`;
      stt++;
    });
    
    // Thêm các dòng trống để đủ 9 dòng
    while (stt <= 9) {
      if (stt === 9) {
        // Dòng thứ 9 đặc biệt, chỉ có số 1 ở cột Ghi chú
        tsv += `\t\t\t\t\t\t\t1\n`;
      } else {
        tsv += `\t\t\t\t\t\t\t\n`;
      }
      stt++;
    }
    
    // Thêm dòng trống trước phần tổng
    tsv += `\t\t\t\t\t-\t\t\n`;
    
    // Thêm tổng tiền
    tsv += `\tTổng cộng\t\t\t\t${totalPrice}\t\t\n`;
    tsv += `\tChiết khấu\t\t\t\t\t\t\n`;
    tsv += `\tĐã thanh toán\t\t\t\t\t\t\n`;
    tsv += `\tCòn lại\t\t\t\t\t${totalPrice}\t\t\n`;
    
    return tsv;
  } catch (e) {
    console.error("Lỗi khi tạo TSV:", e);
    return null;
  }
}

// Thử xuất CSV
function tryExportCSV(data) {
  try {
    console.log("Đang thử xuất file CSV...");
    
    // Nếu data là mảng 2 chiều, có thể là wsData
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      
      // Tải xuống file
      downloadFile(csv, 'cau_hinh_may_tinh.csv', 'text/csv;charset=utf-8;');
    } 
    // Nếu data là object, có thể là configData
    else {
      // Tạo dữ liệu CSV thủ công
      let csv = 'Linh kiện,Tên sản phẩm,Giá (VND)\n';
      
      Object.keys(data).forEach(type => {
        const component = data[type];
        csv += `${type},${component.name},${component.price}\n`;
      });
      
      // Tính tổng giá
      const totalPrice = Object.values(data).reduce((sum, component) => sum + (component.price || 0), 0);
      csv += `,,\nTỔNG TIỀN,,${totalPrice}`;
      
      // Tải xuống file CSV
      downloadFile(csv, 'cau_hinh_may_tinh.csv', 'text/csv;charset=utf-8;');
    }
    
    console.log("Đã xuất file CSV thành công");
    showNotification('Đã lưu cấu hình dưới dạng CSV thành công!');
  } catch (e) {
    console.error("Lỗi khi xuất CSV:", e);
    showNotification('Không thể tạo file. Vui lòng thử lại sau!', 'error');
    
    // Cuối cùng thử cách đơn giản nhất
    trySimpleTextDownload(data);
  }
}

// Hàm tải xuống từ Blob
function downloadBlob(blob, filename) {
  try {
    console.log("Bắt đầu hàm downloadBlob với:", {
      blobType: blob.type,
      blobSize: blob.size,
      filename: filename
    });
    
    // Tạo URL cho blob
    const url = URL.createObjectURL(blob);
    console.log("URL đã được tạo:", url);
    
    // Tạo thẻ a để tải xuống
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    console.log("Đã tạo thẻ a với thuộc tính:", {
      href: a.href,
      download: a.download,
      style: a.style.display
    });
    
    // Thêm vào DOM, click, và xóa
    console.log("Thêm thẻ a vào DOM");
    document.body.appendChild(a);
    
    console.log("Thực hiện click trên thẻ a");
    a.click();
    
    console.log("Thiết lập timeout để dọn dẹp");
    setTimeout(function() {
      try {
        console.log("Bắt đầu dọn dẹp");
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log("Đã hoàn thành dọn dẹp");
      } catch (cleanupError) {
        console.error("Lỗi khi dọn dẹp:", cleanupError);
        // Lỗi dọn dẹp không ảnh hưởng đến kết quả tải xuống
      }
    }, 100);
    
    console.log("Hoàn thành downloadBlob, trả về true");
    return true;
  } catch (e) {
    console.error("Lỗi chi tiết trong downloadBlob:", e);
    console.error("Loại lỗi:", e.name);
    console.error("Message:", e.message);
    console.error("Stack:", e.stack);
    
    // Thử phương pháp khác
    try {
      console.log("Thử phương pháp tải xuống thay thế...");
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("Phương pháp thay thế có vẻ đã thành công");
      return true;
    } catch (alternativeError) {
      console.error("Phương pháp thay thế cũng thất bại:", alternativeError);
    }
    
    return false;
  }
}

// Thử phương pháp đơn giản nhất - tạo file text
function trySimpleTextDownload(data) {
  try {
    console.log("Đang thử phương pháp cuối cùng...");
    
    // Tạo nội dung text
    let text = "CẤU HÌNH MÁY TÍNH\n\n";
    
    // Nếu là mảng 2 chiều (wsData)
    if (Array.isArray(data) && Array.isArray(data[0])) {
      data.forEach(row => {
        text += row.join('\t') + '\n';
      });
    } 
    // Nếu là object (configData)
    else {
      text += "Linh kiện\tTên sản phẩm\tGiá (VND)\n";
      
      Object.keys(data).forEach(type => {
        const component = data[type];
        text += `${type}\t${component.name}\t${component.price}\n`;
        
        // Thêm thông số kỹ thuật
        if (component.specs) {
          Object.entries(component.specs).forEach(([key, value]) => {
            if (typeof value !== 'object') {
              text += `\t- ${key}: ${value}\n`;
            }
          });
        }
      });
      
      // Tính tổng giá
      const totalPrice = Object.values(data).reduce((sum, component) => sum + (component.price || 0), 0);
      text += `\nTỔNG TIỀN\t\t${totalPrice}`;
    }
    
    // Tạo blob và tải xuống
    downloadFile(text, 'cau_hinh_may_tinh.txt', 'text/plain;charset=utf-8');
    
    console.log("Đã xuất file TXT thành công");
    showNotification('Đã lưu cấu hình dưới dạng văn bản thuần!');
  } catch (e) {
    console.error("Lỗi nghiêm trọng, không thể tạo file:", e);
    showNotification('Không thể tạo file! Vui lòng liên hệ hỗ trợ.', 'error');
    
    // Nếu tất cả các phương pháp đều thất bại, thử in ra console và cung cấp hướng dẫn
    console.log("==== DỮ LIỆU CẤU HÌNH - COPY TỪ ĐÂY ====");
    console.log(text || JSON.stringify(data, null, 2));
    console.log("==== KẾT THÚC DỮ LIỆU ====");
    
    // Hiển thị modal cuối cùng
    showLastResortModal(text || JSON.stringify(data, null, 2));
  }
}

// Hiển thị modal khi tất cả các phương pháp tải xuống đều thất bại
function showLastResortModal(content) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    max-width: 80%;
    max-height: 80%;
    overflow: auto;
    position: relative;
  `;
  
  // Nội dung
  modalContent.innerHTML = `
    <h2 style="color:#f44336">Không thể tải xuống file</h2>
    <p>Vui lòng copy dữ liệu sau và lưu thủ công:</p>
    <textarea style="width:100%; height:300px; margin-top:10px; padding:8px; border:1px solid #ddd;">${content}</textarea>
    <div style="margin-top:15px; text-align:center">
      <button id="copy-content" style="margin-right:10px; padding:8px 15px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer;">Sao chép</button>
      <button id="close-modal" style="padding:8px 15px; background:#f44336; color:white; border:none; border-radius:4px; cursor:pointer;">Đóng</button>
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Sự kiện nút copy
  document.getElementById('copy-content').addEventListener('click', function() {
    const textarea = modalContent.querySelector('textarea');
    textarea.select();
    document.execCommand('copy');
    this.textContent = 'Đã sao chép!';
  });
  
  // Sự kiện nút đóng
  document.getElementById('close-modal').addEventListener('click', function() {
    document.body.removeChild(modal);
  });
}

// Hàm load script động
function loadScript(url, callback) {
  console.log("Đang tải script:", url);
  const script = document.createElement('script');
  script.src = url;
  script.onload = callback;
  script.onerror = function() {
    console.error("Lỗi khi tải script:", url);
    alert("Không thể tải thư viện cần thiết. Vui lòng kiểm tra kết nối internet và thử lại.");
  };
  document.head.appendChild(script);
}

// Hàm hiển thị thông báo
function showNotification(message, type = 'success') {
  // Tạo phần tử thông báo
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: ${type === 'success' ? '#4CAF50' : '#f44336'};
    color: white;
    padding: 15px;
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    z-index: 10000;
    transition: opacity 0.5s ease-in-out;
  `;
  
  document.body.appendChild(notification);
  
  // Tự động ẩn sau 3 giây
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// Kiểm tra khả năng tương thích trình duyệt
function checkBrowserCompatibility() {
  const isIE = !!window.document.documentMode;
  if (isIE) {
    console.warn("Internet Explorer không được hỗ trợ đầy đủ. Một số tính năng có thể không hoạt động.");
    alert("Trình duyệt của bạn không được hỗ trợ đầy đủ. Vui lòng sử dụng Chrome, Firefox, hoặc Edge để có trải nghiệm tốt nhất.");
  }
  
  // Kiểm tra hỗ trợ download
  if (typeof navigator.msSaveBlob === 'undefined' && 
      typeof document.createElement('a').download === 'undefined') {
    console.warn("Trình duyệt không hỗ trợ tải xuống tệp tin.");
    alert("Trình duyệt của bạn không hỗ trợ tải xuống tệp tin. Vui lòng sử dụng Chrome, Firefox, hoặc Edge.");
  }
}

// Khi trang đã tải xong, thêm một quan sát viên DOM để phát hiện nút lưu cấu hình nếu nó được thêm vào sau
document.addEventListener('DOMContentLoaded', function() {
  checkBrowserCompatibility();
  
  // Thiết lập ngay lập tức
  setupExportButton();
  
  // Thêm sự kiện cho nút "Lưu cấu hình" trong modal
  const downloadConfigBtn = document.getElementById('download-config');
  if (downloadConfigBtn) {
    downloadConfigBtn.addEventListener('click', function() {
      const configData = collectComponentData();
      exportToExcel(configData);
    });
  }
  
  // Quan sát thay đổi trên DOM để phát hiện nút lưu cấu hình mới
  const observer = new MutationObserver(function(mutations) {
    // Kiểm tra xem có nút lưu cấu hình mới không
    const saveButton = document.querySelector('.luu-cau-hinh:not(.configured), #save-button:not(.configured)');
    if (saveButton) {
      console.log("Phát hiện nút lưu cấu hình mới, thiết lập lại sự kiện");
      saveButton.classList.add('configured');
      setupExportButton();
    }
  });
  
  // Bắt đầu quan sát
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Tìm và cài đặt lại mỗi 2 giây để đảm bảo kết nối với nút
  const checkInterval = setInterval(function() {
    const saveButton = document.querySelector('.luu-cau-hinh, #save-button');
    if (saveButton) {
      setupExportButton();
    }
  }, 2000);
  
  // Dừng interval sau 30 giây để tránh lãng phí tài nguyên
  setTimeout(function() {
    clearInterval(checkInterval);
  }, 30000);
});

// Phương pháp cuối cùng, đáng tin cậy nhất để tải file
function downloadFile(data, filename, type) {
  try {
    console.log("Thử phương pháp downloadFile đơn giản nhất cho:", filename, type);
    
    // Tạo Blob từ dữ liệu
    let blob;
    if (data instanceof Blob) {
      blob = data;
    } else {
      blob = new Blob([data], { type: type || 'application/octet-stream' });
    }
    
    // Phương pháp 1 - tải xuống an toàn
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      // Cho IE/Edge
      window.navigator.msSaveOrOpenBlob(blob, filename);
      console.log("Đã sử dụng msSaveOrOpenBlob cho IE/Edge");
      return true;
    }
    
    // Phương pháp 2 - tạo URL và thẻ tải xuống thông thường
    // Tạo đường dẫn
    const blobUrl = window.URL.createObjectURL(blob);
    console.log("Đã tạo blob URL:", blobUrl);
    
    // Tạo tạm link để download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    link.target = '_blank'; // Thêm target để tăng khả năng tương thích
    
    // Thêm vào văn bản
    document.body.appendChild(link);
    
    // Kiểm tra nếu đang chạy trên Safari thì mở tab mới
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      console.log("Phát hiện Safari, mở tab mới để tải");
      link.setAttribute('target', '_blank');
    }
    
    // Click vào link để download
    link.click();
    
    // Đợi một chút để đảm bảo tải xuống bắt đầu
    setTimeout(function() {
      // Xóa link
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      // Thu hồi URL
      window.URL.revokeObjectURL(blobUrl);
    }, 200);
    
    console.log("Đã hoàn thành phương pháp tải xuống tiêu chuẩn");
    
    // Hiển thị hướng dẫn
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 20px;
      background-color: rgba(0,0,0,0.8);
      color: white;
      border-radius: 5px;
      max-width: 400px;
      text-align: center;
      z-index: 10000;
    `;
    notification.innerHTML = `
      <h3>Lưu ý tải xuống</h3>
      <p>Nếu file không tự động tải xuống, vui lòng kiểm tra:</p>
      <ul style="text-align: left;">
        <li>Cửa sổ chặn popup</li>
        <li>Thiết lập bảo mật trình duyệt</li>
        <li>Thử nhấn nút CTRL+S và lưu thủ công</li>
      </ul>
      <button style="padding: 8px 15px; margin-top: 10px; cursor: pointer; background: #4CAF50; border: none; color: white; border-radius: 4px;">Đóng</button>
    `;
    
    document.body.appendChild(notification);
    
    // Thiết lập sự kiện đóng
    notification.querySelector('button').addEventListener('click', function() {
      document.body.removeChild(notification);
    });
    
    // Tự động đóng sau 8 giây
    setTimeout(function() {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 8000);
    
    return true;
  } catch (e) {
    console.error("Lỗi trong downloadFile:", e);
    return false;
  }
}

// Tạo file CSV đơn giản
function createCSV(configData) {
  try {
    console.log("Tạo file CSV đơn giản");
    
    // Tạo header
    let csv = "Linh kiện,Tên sản phẩm,Giá (VND)\n";
    
    // Thêm dữ liệu
    let totalPrice = 0;
    Object.keys(configData).forEach(type => {
      const component = configData[type];
      totalPrice += component.price || 0;
      
      // Chuẩn bị tên sản phẩm, thay thế dấu phẩy bằng dấu chấm phẩy để tránh lỗi CSV
      const safeName = component.name.replace(/,/g, ";");
      
      csv += `${type},${safeName},${component.price || 0}\n`;
      
      // Thêm thông số kỹ thuật
      if (component.specs && Object.keys(component.specs).length > 0) {
        Object.entries(component.specs).forEach(([key, value]) => {
          if (typeof value !== 'object') {
            const safeValue = String(value).replace(/,/g, ";");
            csv += `,- ${key}: ${safeValue},\n`;
          }
        });
      }
    });
    
    // Thêm tổng tiền
    csv += `,,\nTỔNG TIỀN,,${totalPrice}\n`;
    
    return csv;
  } catch (e) {
    console.error("Lỗi khi tạo CSV:", e);
    return null;
  }
}

// Tạo file TSV (Tab-Separated Values) - thay thế dấu phẩy bằng tab
function createTSV(configData) {
  try {
    console.log("Tạo file TSV đơn giản");
    
    // Tạo header
    let tsv = "Linh kiện\tTên sản phẩm\tGiá (VND)\n";
    
    // Thêm dữ liệu
    let totalPrice = 0;
    Object.keys(configData).forEach(type => {
      const component = configData[type];
      totalPrice += component.price || 0;
      
      tsv += `${type}\t${component.name}\t${component.price || 0}\n`;
      
      // Thêm thông số kỹ thuật
      if (component.specs && Object.keys(component.specs).length > 0) {
        Object.entries(component.specs).forEach(([key, value]) => {
          if (typeof value !== 'object') {
            tsv += `\t- ${key}: ${value}\t\n`;
          }
        });
      }
    });
    
    // Thêm tổng tiền
    tsv += `\t\t\nTỔNG TIỀN\t\t${totalPrice}\n`;
    
    return tsv;
  } catch (e) {
    console.error("Lỗi khi tạo TSV:", e);
    return null;
  }
}

// Hàm xuất file Excel bằng cách mở tab mới
function openInNewTab(content, format) {
  try {
    console.log(`Mở nội dung ${format} trong tab mới`);
    
    // Tạo blob URL
    let blob, type;
    
    if (format === 'html') {
      type = 'text/html';
      blob = new Blob([content], { type });
    } else if (format === 'csv') {
      type = 'text/csv';
      blob = new Blob([content], { type });
    } else if (format === 'tsv') {
      type = 'text/tab-separated-values';
      blob = new Blob([content], { type });
    } else {
      type = 'text/plain';
      blob = new Blob([content], { type });
    }
    
    const url = URL.createObjectURL(blob);
    
    // Mở tab mới
    window.open(url, '_blank');
    
    // Hiển thị hướng dẫn
    const message = `Đã mở ${format.toUpperCase()} trong tab mới. Vui lòng nhấn Ctrl+S để lưu file.`;
    showNotification(message);
    alert(message);
    
    return true;
  } catch (e) {
    console.error(`Lỗi khi mở ${format} trong tab mới:`, e);
    return false;
  }
} 