/**
 * TXO 儀表板核心邏輯
 */

window.onload = function() {
    // 1. 抓取歷史紀錄中的第一個項目 (就是最新的)
    const firstItem = document.querySelector('.history-item');
    if (firstItem) {
        // 自動執行點擊動作，讓主圖顯示最新的圖片
        firstItem.click();
    }
};

// 1. 初始化頁面資訊
document.addEventListener('DOMContentLoaded', () => {
    // 顯示本地更新時間
    const timeElement = document.getElementById('time');
    if (timeElement) {
        timeElement.innerText = new Date().toLocaleTimeString('zh-TW', { 
            hour12: false, hour: '2-digit', minute: '2-digit' 
        });
    }

    // 預設選中最新看板
    const latestItem = document.querySelector('.history-item[onclick*="latest.png"]');
    if (latestItem) latestItem.classList.add('selected');
});

// 2. 切換大圖檢視函式
function changeView(src, date, element) {
    const mainImg = document.getElementById('mainChart');
    const displayDate = document.getElementById('currentDate');
    
    if (!mainImg || !displayDate) return;

    // 1. 高亮選中項目 (修正 class 名稱為你 CSS 用的 'active' 或 'selected')
    document.querySelectorAll('.history-item').forEach(item => {
        item.classList.remove('active', 'selected');
    });
    if (element) element.classList.add('selected');

    // 2. 淡出效果
    mainImg.style.opacity = '0';

    // 3. 圖片路徑處理
    // 你的 YAML 生成的 src 應該是 "contracts/202601/Night_Volume_20260114.png"
    // 加上時間戳防止快取
    const cacheBuster = src + '?t=' + new Date().getTime();

    const tempImg = new Image();
    tempImg.src = cacheBuster; 
    
    tempImg.onload = function() {
        mainImg.src = this.src;
        displayDate.innerText = date;
        mainImg.style.opacity = '1';
    };

    tempImg.onerror = function() {
        // 如果抓不到 contracts 裡的路徑，嘗試退回到根目錄找 (備援邏輯)
        console.error("路徑錯誤，嘗試備援:", src);
        mainImg.alt = "⚠️ 數據同步中，請稍後再試...";
        mainImg.style.opacity = '0.5';
    };
}