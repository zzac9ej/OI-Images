const GITHUB_REPO = "zzac9ej/OI-Images"; 

async function loadHistoryFromGit() {
    const grid = document.getElementById('historyGrid');
    if (!grid) return;
    grid.innerHTML = "<p>正在載入籌碼資料庫...</p>";

    try {
        const response = await fetch('list.json?t=' + new Date().getTime());
        const data = await response.json(); 

        grid.innerHTML = ""; 
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - 15);

        for (const [folderName, folderData] of Object.entries(data)) {
            const folderYear = parseInt(folderName.substring(0, 4));
            const folderMonth = parseInt(folderName.substring(4, 6)) - 1;
            const folderDate = new Date(folderYear, folderMonth + 1, 0);
            if (folderDate < threshold) continue;

            createFolderUI(folderName, folderData);
        }
        
        setTimeout(() => {
            const firstFolder = document.querySelector('.folder-item');
            if (firstFolder) {
                firstFolder.click();
                setTimeout(() => document.querySelector('.history-item')?.click(), 100);
            }
        }, 300);

    } catch (e) {
        grid.innerHTML = "<p>暫時無法獲獲數據。</p>";
    }
}

function createFolderUI(name, folderData) {
    const grid = document.getElementById('historyGrid');
    const folderWrap = document.createElement('div');
    folderWrap.style.width = "100%";
    
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
            updateInfoPanel(isNight);
        };
        imgBtn.innerHTML = `<img src="${imgPath}" loading="lazy"><span>${formattedDate} ${isNight ? '☀️當沖' : '📊盤後'}</span>`;
        subGrid.appendChild(imgBtn);
    });
    grid.appendChild(folderWrap);
}

function toggleFolder(element) {
    const subGrid = element.nextElementSibling;
    const isOpen = subGrid.style.display === 'grid';
    document.querySelectorAll('.images-subgrid').forEach(el => el.style.display = 'none');
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
}

// --- 燈箱核心變數 ---
let currentScale = 1;
let isDragging = false;
let startX = 0, startY = 0;
let translateX = 0, translateY = 0;

function openModal(src) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    modal.style.display = "flex";
    modalImg.src = src;
    currentScale = 1; translateX = 0; translateY = 0;
    updateTransform();
}

function closeModal() {
    document.getElementById('imageModal').style.display = "none";
    isDragging = false;
}

function updateTransform() {
    const modalImg = document.getElementById('modalImg');
    if (modalImg) {
        modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadHistoryFromGit();
    document.getElementById('mainChart').onclick = function() { openModal(this.src); };
});

document.getElementById('imageModal').onwheel = function(e) {
    e.preventDefault();
    const zoomSpeed = 0.25;
    if (e.deltaY < 0) {
        currentScale = Math.min(currentScale + zoomSpeed, 5);
    } else {
        currentScale = Math.max(currentScale - zoomSpeed, 1);
        if (currentScale === 1) { translateX = 0; translateY = 0; }
    }
    updateTransform();
};

document.addEventListener('mousedown', function(e) {
    if (e.target.id === 'modalImg' && currentScale > 1) {
        e.preventDefault();
        isDragging = true;
        e.target.style.transition = "none";
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
    }
});

window.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform();
});

window.addEventListener('mouseup', function() {
    isDragging = false;
    const modalImg = document.getElementById('modalImg');
    if (modalImg) modalImg.style.transition = "transform 0.1s ease-out";
});

document.addEventListener('keydown', (e) => { if (e.key === "Escape") closeModal(); });