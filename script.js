/**
 * TXO 儀表板核心邏輯 - 混合模式 (JSON + 資料夾分類)
 */
const GITHUB_REPO = "zzac9ej/OI-Images"; 

async function loadHistoryFromGit() {
    const grid = document.getElementById('historyGrid');
    if (!grid) return;
    grid.innerHTML = "<p>正在載入籌碼資料庫...</p>";

    try {
        // 1. 讀取由 YAML 生成的靜態 list.json
        const response = await fetch('list.json?t=' + new Date().getTime());
        const data = await response.json(); 

        grid.innerHTML = ""; 
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - 15);

        // 2. 遍歷合約資料夾
        for (const [folderName, files] of Object.entries(data)) {
            // 過濾過舊合約 (15天)
            const folderYear = parseInt(folderName.substring(0, 4));
            const folderMonth = parseInt(folderName.substring(4, 6)) - 1;
            const folderDate = new Date(folderYear, folderMonth + 1, 0);
            if (folderDate < threshold) continue;

            createFolderUI(folderName, files);
        }
        
        // 3. 自動點開第一個資料夾並顯示最新圖
        setTimeout(() => {
            const firstFolder = document.querySelector('.folder-item');
            if (firstFolder) {
                firstFolder.click();
                setTimeout(() => document.querySelector('.history-item')?.click(), 100);
            }
        }, 300);

    } catch (e) {
        grid.innerHTML = "<p>暫時無法獲取數據，請檢查 list.json 是否存在。</p>";
    }
}

function createFolderUI(name, folderData) {
    const grid = document.getElementById('historyGrid');
    const folderWrap = document.createElement('div');
    folderWrap.style.width = "100%";
    
    // 從 folderData 提取檔案清單和更新時間
    const files = folderData.files;
    const updateTime = folderData.last_update;
    
    folderWrap.innerHTML = `
        <div class="folder-item" onclick="toggleFolder(this)">
            <div class="folder-header">
                <span class="folder-name">📂 ${name}</span>
                <span style="font-size:0.8rem;">${files.length} 張圖表</span>
            </div>
            <div class="update-time" style="font-size:0.75rem; color:#8b949e; margin-top:5px; border-top:1px solid #30363d; padding-top:5px;">
                🕒 最後同步：${updateTime}
            </div>
        </div>
        <div class="images-subgrid"></div>
    `;

    const subGrid = folderWrap.querySelector('.images-subgrid');
    
    files.forEach(fileName => {
        const isNight = fileName.includes('Night_Volume');
        const dateMatch = fileName.match(/\d{8}/);
        const dateStr = dateMatch ? dateMatch[0] : "";
        const formattedDate = `${dateStr.substring(4,6)}/${dateStr.substring(6,8)}`;
        
        const imgPath = `contracts/${name}/${fileName}`;

        const imgBtn = document.createElement('div');
        imgBtn.className = `history-item ${isNight ? 'type-night' : 'type-oi'}`;
        imgBtn.onclick = (e) => {
            e.stopPropagation();
            changeView(imgPath, formattedDate, imgBtn);
            updateInfoPanel(isNight); // 更新面板文字
        };
        imgBtn.innerHTML = `
            <img src="${imgPath}" loading="lazy">
            <span>${formattedDate} ${isNight ? '☀️當沖' : '📊盤後'}</span>
        `;
        subGrid.appendChild(imgBtn);
    });

    grid.appendChild(folderWrap);
}

// 展開/收合控制
function toggleFolder(element) {
    const subGrid = element.nextElementSibling;
    const isOpen = subGrid.style.display === 'grid';
    // 關閉其他所有展開的資料夾
    document.querySelectorAll('.images-subgrid').forEach(el => el.style.display = 'none');
    // 切換目前的
    subGrid.style.display = isOpen ? 'none' : 'grid';
}

function updateInfoPanel(isNight) {
    const pcVal = document.getElementById('pcVal');
    if (pcVal) {
        pcVal.innerText = isNight ? "夜盤成交監控中" : "載入中...";
        pcVal.style.color = isNight ? "#ffcc00" : "#3fb950";
    }
}

function changeView(src, date, element) {
    const mainImg = document.getElementById('mainChart');
    const displayDate = document.getElementById('currentDate');
    if (!mainImg || !displayDate) return;

    document.querySelectorAll('.history-item').forEach(item => item.classList.remove('selected'));
    if (element) element.classList.add('selected');

    mainImg.style.opacity = '0.3';
    const cacheBuster = src + '?t=' + new Date().getTime();

    const tempImg = new Image();
    tempImg.src = cacheBuster; 
    tempImg.onload = function() {
        mainImg.src = this.src;
        displayDate.innerText = date;
        mainImg.style.opacity = '1';
    };
    tempImg.onerror = () => {
        mainImg.alt = "⚠️ 圖片尚未同步...";
        mainImg.style.opacity = '1';
    };
}

document.addEventListener('DOMContentLoaded', loadHistoryFromGit);
// 初始化燈箱功能
let currentScale = 1;
let isDragging = false;
let startX = 0, startY = 0;
let translateX = 0, translateY = 0;

// 綁定主圖點擊
document.getElementById('mainChart').onclick = function() {
    openModal(this.src);
};

function openModal(src) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    modal.style.display = "flex";
    modalImg.src = src;
    
    // 重置狀態
    currentScale = 1;
    translateX = 0;
    translateY = 0;
    updateTransform();
}

function updateTransform() {
    const modalImg = document.getElementById('modalImg');
    // 🚀 關鍵：必須同時包含 translate 和 scale，順序不能錯
    modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
}

function closeModal() {
    document.getElementById('imageModal').style.display = "none";
}

// 滾動縮放邏輯
document.getElementById('imageModal').onwheel = function(e) {
    e.preventDefault();
    const zoomSpeed = 0.2;
    const oldScale = currentScale;
    
    if (e.deltaY < 0) {
        currentScale = Math.min(currentScale + zoomSpeed, 5);
    } else {
        currentScale = Math.max(currentScale - zoomSpeed, 1);
        if (currentScale === 1) { translateX = 0; translateY = 0; } // 縮回原樣時重置位置
    }
    updateTransform();
};
const modalImg = document.getElementById('modalImg');

modalImg.onmousedown = function(e) {
    if (currentScale <= 1) return; // 沒放大就不給拖
    isDragging = true;
    modalImg.style.cursor = "grabbing";
    modalImg.style.transition = "none"; // 拖動時關閉動畫，避免延遲感
    
    // 紀錄點擊時的初始位置
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
};

// 監聽全域滑鼠移動，避免滑鼠移出圖片後失效
window.onmousemove = function(e) {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform();
};

window.onmouseup = function() {
    isDragging = false;
    if (modalImg) {
        modalImg.style.cursor = "grab";
        modalImg.style.transition = "transform 0.1s ease-out";
    }
};
// 簡單的點擊 ESC 關閉功能
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") closeModal();
});

