/**
 * TXO 儀表板核心邏輯
 */

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

    // 高亮選中項目
    document.querySelectorAll('.history-item').forEach(item => item.classList.remove('selected'));
    if (element) element.classList.add('selected');

    // 淡出效果
    mainImg.style.opacity = '0';

    // 預載圖片以確保切換流暢
    const tempImg = new Image();
    tempImg.src = src + '?t=' + new Date().getTime(); // 防止瀏覽器快取舊圖
    
    tempImg.onload = function() {
        mainImg.src = this.src;
        displayDate.innerText = date;
        mainImg.style.opacity = '1';
    };

    // 容錯處理
    tempImg.onerror = function() {
        mainImg.alt = "⚠️ 圖片尚未同步或路徑錯誤: " + src;
        mainImg.style.opacity = '1';
    };
}