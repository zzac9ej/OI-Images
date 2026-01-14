/**
 * TXO 儀表板核心邏輯 - GitHub API 全自動掃描版
 */
const GITHUB_REPO = "zzac9ej/OI-Images"; 

async function loadHistoryFromGit() {
    const grid = document.getElementById('historyGrid');
    if (!grid) return;
    grid.innerHTML = "<p>正在整理近期合約...</p>";

    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/contracts`);
        const folders = await response.json();

        grid.innerHTML = ""; 

        // 取得「15 天前」的時間點
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        for (const folder of folders) {
            if (folder.type === 'dir') {
                /** * 效能優化：過濾邏輯 
                 * 假設資料夾名為 202601 或 202601W2
                 * 我們提取前 6 位數 YYYYMM
                 */
                const folderDateStr = folder.name.substring(0, 6);
                const folderYear = parseInt(folderDateStr.substring(0, 4));
                const folderMonth = parseInt(folderDateStr.substring(4, 6)) - 1; // JS 月份從 0 開始
                
                // 建立一個該月份最後一天的代表日期（粗略判斷）
                const folderDate = new Date(folderYear, folderMonth + 1, 0);

                // 如果該合約月份已經結束超過 15 天，就不再深入 call API 抓取裡面的圖片
                if (folderDate < fifteenDaysAgo) {
                    console.log(`跳過過期合約: ${folder.name}`);
                    continue; 
                }

                // --- 以下是原本抓取圖片的邏輯 ---
                const imgRes = await fetch(folder.url);
                const files = await imgRes.json();
                
                const commitRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/commits?path=contracts/${folder.name}&per_page=1`);
                const commitData = await commitRes.json();
                const lastUpdate = commitData.length > 0 ? new Date(commitData[0].commit.committer.date).toLocaleString('zh-TW') : "---";

                createFolderUI(folder.name, files, lastUpdate);
            }
        }
        
        setTimeout(() => {
            const firstFolder = document.querySelector('.folder-item');
            if (firstFolder) firstFolder.click();
        }, 500);

    } catch (e) {
        console.error("載入失敗:", e);
    }
}

function createFolderUI(name, files, updateTime) {
    const grid = document.getElementById('historyGrid');
    
    // 資料夾外殼
    const folderWrap = document.createElement('div');
    folderWrap.style.width = "100%";
    
    const folderItem = document.createElement('div');
    folderItem.className = 'folder-item';
    folderItem.innerHTML = `
        <div class="folder-header">
            <span class="folder-name"><span class="folder-icon">📂</span> ${name}</span>
            <span style="color:var(--text); font-size:0.8rem;">${files.length} 張圖表</span>
        </div>
        <div class="update-time">🕒 最後同步：${updateTime}</div>
    `;

    // 子網格 (存放圖片)
    const subGrid = document.createElement('div');
    subGrid.className = 'images-subgrid';
    
    // 點擊資料夾展開/收合
    folderItem.onclick = () => {
        const isOpen = subGrid.style.display === 'grid';
        document.querySelectorAll('.images-subgrid').forEach(el => el.style.display = 'none'); // 先關閉其他
        subGrid.style.display = isOpen ? 'none' : 'grid';
    };

    // 填入圖片按鈕 (按日期降序)
    files.filter(f => f.name.endsWith('.png')).reverse().forEach(file => {
        const isNight = file.name.includes('Night_Volume');
        const dateStr = file.name.match(/\d{8}/)?.[0] || "";
        const formattedDate = `${dateStr.substring(4,6)}/${dateStr.substring(6,8)}`;
        
        const imgBtn = document.createElement('div');
        imgBtn.className = `history-item ${isNight ? 'type-night' : 'type-oi'}`;
        imgBtn.style.minWidth = "140px";
        imgBtn.onclick = (e) => {
            e.stopPropagation(); // 防止觸發資料夾收合
            changeView(file.download_url, formattedDate, imgBtn);
        };
        imgBtn.innerHTML = `
            <img src="${file.download_url}" loading="lazy">
            <span style="font-size:0.75rem;">${formattedDate} ${isNight ? '☀️當沖' : '📊盤後'}</span>
        `;
        subGrid.appendChild(imgBtn);
    });

    folderWrap.appendChild(folderItem);
    folderWrap.appendChild(subGrid);
    grid.appendChild(folderWrap);
}

function createHistoryItem(file, contractName) {
    const grid = document.getElementById('historyGrid');
    const isNight = file.name.includes('Night_Volume');
    const typeClass = isNight ? 'type-night' : 'type-oi';
    const label = isNight ? '☀️ 當沖' : '📊 盤後';
    
    const dateMatch = file.name.match(/\d{8}/);
    const dateStr = dateMatch ? dateMatch[0] : "Unknown";
    const formattedDate = `${dateStr.substring(0,4)}/${dateStr.substring(4,6)}/${dateStr.substring(6,8)}`;

    const item = document.createElement('div');
    item.className = `history-item ${typeClass}`;
    
    // 點擊事件
    item.onclick = () => {
        changeView(file.download_url, formattedDate, item);
        // 如果是盤後圖，可以嘗試更新 P/C Ratio 顯示（假設你未來想做的話）
        updateInfoPanel(isNight);
    };

    item.innerHTML = `
        <img src="${file.download_url}" loading="lazy">
        <span>${formattedDate} ${label}<br><small>(${contractName})</small></span>
    `;
    grid.appendChild(item);
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
        mainImg.alt = "⚠️ 圖片同步中...";
        mainImg.style.opacity = '1';
    };
}

document.addEventListener('DOMContentLoaded', loadHistoryFromGit);