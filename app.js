/**
 * CẨM NANG NEWBIE - NHÀ GA VÀNG
 * Main Application Logic & Interactive Engines
 */

// Global State
let currentStation = 1;
let currentMobileMode = 'read';
let completedSteps = JSON.parse(localStorage.getItem('nhagavang_newbie_steps') || '[]');
let activeVideoTimers = {};

// On DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initProgress();
  calculateLotSize();
  setMobileMode('read');
  checkGraduation();
  explainScenario('scenario1');

  // Check URL hash if any (e.g. #station-2)
  const hash = window.location.hash;
  if (hash && hash.startsWith('#station-')) {
    const stId = parseInt(hash.replace('#station-', ''));
    if (stId >= 1 && stId <= 4) {
      switchStation(stId);
    }
  }
});

/**
 * 1. Station Navigation
 */
function switchStation(stationId) {
  currentStation = stationId;

  // Auto-record visited station into progress
  if (!completedSteps.includes(stationId)) {
    completedSteps.push(stationId);
    localStorage.setItem('nhagavang_newbie_steps', JSON.stringify(completedSteps));
    updateProgressUI();
  }

  // Update tabs
  for (let i = 1; i <= 4; i++) {
    const tabBtn = document.getElementById(`tab-btn-${i}`);
    const pane = document.getElementById(`station-${i}`);
    
    if (tabBtn) {
      if (i === stationId) {
        tabBtn.classList.add('active');
        tabBtn.classList.remove('text-slate-400');
      } else {
        tabBtn.classList.remove('active');
        tabBtn.classList.add('text-slate-400');
      }
    }

    if (pane) {
      if (i === stationId) {
        pane.classList.remove('hidden');
        pane.classList.add('active');
      } else {
        pane.classList.add('hidden');
        pane.classList.remove('active');
      }
    }
  }

  // Scroll to station top on mobile
  if (window.innerWidth < 1024) {
    const pane = document.getElementById(`station-${stationId}`);
    if (pane) {
      pane.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

/**
 * 2. Mobile Mode Toggler (Read vs Video)
 */
function setMobileMode(mode) {
  currentMobileMode = mode;
  const readBtn = document.getElementById('mobile-mode-read');
  const videoBtn = document.getElementById('mobile-mode-video');

  if (mode === 'read') {
    document.body.classList.remove('mobile-show-video');
    document.body.classList.add('mobile-show-read');
    
    if (readBtn && videoBtn) {
      readBtn.className = 'py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow';
      videoBtn.className = 'py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-slate-400 hover:text-slate-200';
    }
  } else {
    document.body.classList.remove('mobile-show-read');
    document.body.classList.add('mobile-show-video');
    
    if (readBtn && videoBtn) {
      videoBtn.className = 'py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow';
      readBtn.className = 'py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-slate-400 hover:text-slate-200';
    }
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

/**
 * 3. Progress Tracking & LocalStorage
 */
function initProgress() {
  if (!completedSteps.includes(1)) {
    completedSteps.push(1);
    localStorage.setItem('nhagavang_newbie_steps', JSON.stringify(completedSteps));
  }
  updateProgressUI();
}

function toggleStepCompleted(stationId) {
  const idx = completedSteps.indexOf(stationId);
  if (idx > -1) {
    completedSteps.splice(idx, 1);
  } else {
    completedSteps.push(stationId);
    showToast(`Tuyệt vời! Đã hoàn thành Trạm ${stationId} 🎉`);
  }

  localStorage.setItem('nhagavang_newbie_steps', JSON.stringify(completedSteps));
  updateProgressUI();
}

function updateProgressUI() {
  const totalStations = 4;
  const count = completedSteps.length;
  const percent = Math.round((count / totalStations) * 100);

  // Update text & percent
  const progressText = document.getElementById('progressText');
  const progressPercent = document.getElementById('progressPercent');
  const progressCircle = document.getElementById('progressCircle');

  if (progressText) progressText.innerText = `${count} / ${totalStations} Trạm`;
  if (progressPercent) progressPercent.innerText = `${percent}%`;

  if (progressCircle) {
    // Circle circumference = 2 * PI * 13 ≈ 81.68
    const circumference = 81.68;
    const offset = circumference - (percent / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
  }

  // Update button badges
  for (let i = 1; i <= 4; i++) {
    const isDone = completedSteps.includes(i);
    const tabBtn = document.getElementById(`tab-btn-${i}`);
    const toggleBtn = document.getElementById(`btn-complete-${i}`);

    if (tabBtn) {
      if (isDone) {
        tabBtn.classList.add('completed');
      } else {
        tabBtn.classList.remove('completed');
      }
    }

    if (toggleBtn) {
      if (isDone) {
        toggleBtn.classList.add('completed');
        toggleBtn.innerHTML = `<i data-lucide="check-check" class="w-3.5 h-3.5 text-emerald-400"></i><span class="text-emerald-300 font-bold">Đã hoàn thành</span>`;
      } else {
        toggleBtn.classList.remove('completed');
        toggleBtn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i><span>Đánh dấu xong</span>`;
      }
    }
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

/**
 * 4. Interactive Video Player Engine (Real Videos & Simulated)
 */
let currentStation1SubVideo = 1;

function switchStation1Video(subIndex) {
  currentStation1SubVideo = subIndex;
  const btn1 = document.getElementById('st1-pill-1');
  const btn2 = document.getElementById('st1-pill-2');
  const badge = document.getElementById('st1-video-badge');
  const title = document.getElementById('st1-video-title');
  const duration = document.getElementById('st1-video-duration');
  const vid1 = document.getElementById('real-video-1');
  const vid2 = document.getElementById('real-video-2-st1');
  const chaptersContent = document.getElementById('st1-chapters-content');

  if (subIndex === 1) {
    if (btn1) btn1.className = 'py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow';
    if (btn2) btn2.className = 'py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 text-slate-400 hover:text-slate-200 border border-transparent';
    if (badge) badge.innerHTML = '<i data-lucide="play" class="w-2.5 h-2.5 fill-rose-400"></i> Video 1/2';
    if (title) title.innerText = 'Hướng Dẫn Đăng Ký Tài Khoản';
    if (duration) duration.innerText = '03:54';
    if (vid2) {
      vid2.pause();
      vid2.classList.add('hidden');
      vid2.style.display = 'none';
    }
    if (vid1) {
      vid1.classList.remove('hidden');
      vid1.style.display = 'block';
    }
    if (chaptersContent) {
      chaptersContent.innerHTML = `
        <button onclick="seekStation1Video(1, 0)" class="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-center truncate">00:00 Bắt đầu</button>
        <button onclick="seekStation1Video(1, 75)" class="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-center truncate">01:15 Nhập thông tin</button>
        <button onclick="seekStation1Video(1, 150)" class="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-center truncate">02:30 Xác minh KYC</button>
      `;
    }
  } else {
    if (btn2) btn2.className = 'py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow';
    if (btn1) btn1.className = 'py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 text-slate-400 hover:text-slate-200 border border-transparent';
    if (badge) badge.innerHTML = '<i data-lucide="play" class="w-2.5 h-2.5 fill-rose-400"></i> Video 2/2';
    if (title) title.innerText = 'Hướng Dẫn Mở Tài Khoản Demo (MT5)';
    if (duration) duration.innerText = '02:13';
    if (vid1) {
      vid1.pause();
      vid1.classList.add('hidden');
      vid1.style.display = 'none';
    }
    if (vid2) {
      vid2.classList.remove('hidden');
      vid2.style.display = 'block';
    }
    if (chaptersContent) {
      chaptersContent.innerHTML = `
        <button onclick="seekStation1Video(2, 0)" class="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-center truncate">00:00 Vào Cài đặt</button>
        <button onclick="seekStation1Video(2, 35)" class="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-center truncate">00:35 Chọn Demo</button>
        <button onclick="seekStation1Video(2, 70)" class="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-center truncate">01:10 Điền vốn $500</button>
      `;
    }
  }
  if (window.lucide) {
    lucide.createIcons();
  }
}

function seekStation1Video(subIndex, seconds) {
  const vid = subIndex === 1
    ? document.getElementById('real-video-1')
    : document.getElementById('real-video-2-st1');
  if (vid) {
    vid.currentTime = seconds;
    vid.play().catch(() => {});
    const curMin = Math.floor(seconds / 60).toString().padStart(2, '0');
    const curRemSec = Math.floor(seconds % 60).toString().padStart(2, '0');
    showToast(`Đã tua đến ${curMin}:${curRemSec}`);
  }
}

function triggerWatchStation1Video(subIndex) {
  if (window.innerWidth < 1024) {
    setMobileMode('video');
  }
  switchStation1Video(subIndex);
  const vid = subIndex === 1 
    ? document.getElementById('real-video-1') 
    : document.getElementById('real-video-2-st1');
  if (vid) {
    vid.play().catch(() => {});
  }
  setTimeout(() => {
    const screenEl = document.getElementById('video-screen-1-wrapper');
    if (screenEl) {
      screenEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
}

function triggerWatchVideo(videoId) {
  if (videoId === 1) {
    triggerWatchStation1Video(1);
    return;
  }
  if (window.innerWidth < 1024) {
    setMobileMode('video');
  }
  playInteractiveVideo(videoId);
  
  setTimeout(() => {
    const screenEl = document.getElementById(`video-screen-${videoId}`);
    if (screenEl) {
      screenEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
}

function playInteractiveVideo(videoId) {
  const realVid = document.getElementById(`real-video-${videoId}`);
  if (realVid) {
    realVid.play().catch(() => {});
    return;
  }

  const player = document.getElementById(`sim-player-${videoId}`);
  if (!player) return;

  player.classList.remove('hidden');
  player.classList.add('flex');

  // Start timer simulation
  let currentSec = 0;
  const totalSecs = { 1: 65, 2: 90, 3: 130, 4: 75 }[videoId] || 60;
  let speed = 1;

  if (activeVideoTimers[videoId]) {
    clearInterval(activeVideoTimers[videoId]);
  }

  const progressBar = document.getElementById(`sim-bar-${videoId}`);
  const timerLabel = document.getElementById(`sim-timer-${videoId}`);

  activeVideoTimers[videoId] = setInterval(() => {
    currentSec += speed;
    if (currentSec >= totalSecs) {
      currentSec = totalSecs;
      clearInterval(activeVideoTimers[videoId]);
      showToast(`Đã xem xong Video ${videoId}! Bạn có thể đánh dấu hoàn thành.`);
    }

    const curMin = Math.floor(currentSec / 60).toString().padStart(2, '0');
    const curRemSec = Math.floor(currentSec % 60).toString().padStart(2, '0');
    const totMin = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const totRemSec = Math.floor(totalSecs % 60).toString().padStart(2, '0');

    if (timerLabel) {
      timerLabel.innerText = `${curMin}:${curRemSec} / ${totMin}:${totRemSec}`;
    }
    if (progressBar) {
      progressBar.style.width = `${(currentSec / totalSecs) * 100}%`;
    }
  }, 1000);
}

function stopInteractiveVideo(videoId) {
  const realVid = document.getElementById(`real-video-${videoId}`);
  if (realVid) {
    realVid.pause();
    return;
  }

  if (activeVideoTimers[videoId]) {
    clearInterval(activeVideoTimers[videoId]);
  }
  const player = document.getElementById(`sim-player-${videoId}`);
  if (player) {
    player.classList.add('hidden');
    player.classList.remove('flex');
  }
}

function seekVideo(videoId, seconds) {
  if (videoId === 1) {
    seekStation1Video(currentStation1SubVideo, seconds);
    return;
  }

  const realVid = document.getElementById(`real-video-${videoId}`);
  if (realVid) {
    realVid.currentTime = seconds;
    realVid.play().catch(() => {});
    const curMin = Math.floor(seconds / 60).toString().padStart(2, '0');
    const curRemSec = Math.floor(seconds % 60).toString().padStart(2, '0');
    showToast(`Đã tua đến ${curMin}:${curRemSec}`);
    return;
  }

  playInteractiveVideo(videoId);
  const progressBar = document.getElementById(`sim-bar-${videoId}`);
  const timerLabel = document.getElementById(`sim-timer-${videoId}`);
  const totalSecs = { 1: 65, 2: 90, 3: 130, 4: 75 }[videoId] || 60;

  const curMin = Math.floor(seconds / 60).toString().padStart(2, '0');
  const curRemSec = Math.floor(seconds % 60).toString().padStart(2, '0');
  const totMin = Math.floor(totalSecs / 60).toString().padStart(2, '0');
  const totRemSec = Math.floor(totalSecs % 60).toString().padStart(2, '0');

  if (timerLabel) {
    timerLabel.innerText = `${curMin}:${curRemSec} / ${totMin}:${totRemSec}`;
  }
  if (progressBar) {
    progressBar.style.width = `${(seconds / totalSecs) * 100}%`;
  }
  showToast(`Đã tua đến ${curMin}:${curRemSec}`);
}

function setSpeed(videoId, speed) {
  const realVid = videoId === 1
    ? (currentStation1SubVideo === 1 ? document.getElementById('real-video-1') : document.getElementById('real-video-2-st1'))
    : document.getElementById(`real-video-${videoId}`);
  if (realVid) {
    realVid.playbackRate = speed;
  }
  showToast(`Tốc độ phát: ${speed}x`);
}

/**
 * 5. Interactive Signal Explainer
 */
const signalDetails = {
  entry: {
    title: 'Giải mã "Sell Limit: 4373 - 4376" (Vùng Đón Tàu)',
    body: 'Đây là lệnh chờ Bán ở vùng giá cao hơn giá thị trường hiện tại. Chuyên gia phân tích thấy vùng 4373 - 4376 là kháng cự mạnh của vàng. Mẹo của Pro: Chia làm 2 lệnh nhỏ (Ví dụ bạn định đánh 0.02 lot -> Đặt 1 lệnh 0.01 tại 4373 và 1 lệnh 0.01 tại 4376). Khi giá chạm vùng này, hệ thống sẽ tự động khớp mà không cần bạn canh màn hình!'
  },
  sl: {
    title: 'Giải mã "❌ SL: 4383" (Stop Loss: 7 - 10 Giá - Khiên Chống Cháy Bắt Buộc)',
    body: 'Stop Loss của Nhà Ga Vàng luôn cố định từ 7 đến 10 giá (ở đây là 4383, cách vùng đón 7 - 9 giá), KHÔNG BAO GIỜ vượt quá con số này. Khi giá chạm 4383, hệ thống tự động cắt lỗ ngay lập tức để bảo vệ 96-97% số vốn an toàn. NGUYÊN TẮC BẤT DI BẤT DỊCH: Tuyệt đối không bao giờ được gỡ hay nới rộng Stop Loss!'
  },
  tp1: {
    title: 'Giải mã "🎯 TP1: 4364" (Take Profit 1: Ăn 10+ Giá - Chốt 50% & Kéo SL Hòa)',
    body: 'Khi giá vàng rớt từ vùng đón về 4364 -> Bạn đã ăn hơn 10 giá (+105 pips). HÀNH ĐỘNG CỦA BẠN: Vào MT5 bấm đóng 50% số lot đang chạy (hoặc đóng 1 trong 2 lệnh 0.01) để cất tiền lãi vào túi, sau đó sửa Stop Loss của phần lot còn lại về đúng giá vào ban đầu (4375). Lúc này lệnh của bạn hoàn toàn BẤT TỬ RỦI RO!'
  },
  tp2: {
    title: 'Giải mã "🎯 TP2: 4354" (Take Profit 2: Ăn 20+ Giá - Trọn Xu Hướng Dài)',
    body: 'Sau khi đã cất lãi TP1 và kéo SL về hòa vốn, phần khối lượng còn lại được thả trôi theo trend về đích dài 4354 (+20 giá = +200 pips). Nếu thị trường quay đầu, bạn hòa vốn phần này; nếu thị trường đạt TP2, bạn nhân đôi lợi nhuận!'
  }
};

function explainSignal(type) {
  const data = signalDetails[type];
  if (!data) return;

  const titleEl = document.getElementById('explainerTitle');
  const bodyEl = document.getElementById('explainerBody');

  if (titleEl) titleEl.innerText = data.title;
  if (bodyEl) bodyEl.innerHTML = data.body;

}

/**
 * 5b. Interactive Signal Scenarios (2 Dạng Báo Lệnh Thực Tế)
 */
const scenarioDetails = {
  scenario1: {
    title: 'DẠNG 1: KHỚP CẢ 2 VÙNG - GIÁ GIẰNG CO CHƯA HÒA VỐN',
    badge: 'Ưu Tiên Vùng Gần SL',
    badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-sans',
    body: `
      <div class="p-3 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1.5">
        <div class="text-[11px] text-slate-400 uppercase font-semibold">Tín hiệu thực tế đã bắn trong nhóm VIP Zalo:</div>
        <div class="font-mono text-amber-300 font-bold text-xs sm:text-sm">
          🚂 Sell Limit: 4373 (Vùng 1) - 4376 (Vùng 2) | SL: 4383
        </div>
      </div>

      <div class="space-y-1.5">
        <div class="text-amber-300 font-bold flex items-center gap-1.5">
          <i data-lucide="message-square" class="w-4 h-4 text-amber-400"></i>
          <span>📱 Thông báo Chuyên gia gửi trên Zalo:</span>
        </div>
        <div class="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40 text-amber-200 font-mono text-xs">
          "Cả 2 vùng (4373 & 4376) đã khớp, nến giằng co chưa bứt phá -> Anh em CẮT VÙNG 1 (4373), GIỮ VÙNG 2 (4376)!"
        </div>
      </div>

      <div class="space-y-1.5">
        <div class="text-white font-bold flex items-center gap-1.5">
          <i data-lucide="check-square" class="w-4 h-4 text-amber-400"></i>
          <span>🛠️ Hướng dẫn Newbie làm đúng 2 bước trên MT5 (30 Giây):</span>
        </div>
        <div class="pl-3 border-l-2 border-amber-500/60 space-y-1 text-slate-200">
          <p>• <strong>Bước 1:</strong> Mở mục "Lệnh đang chạy" trên MT5 -> Bấm chốt đóng lệnh Vùng 1 (4373) ở mức cắt hòa hoặc âm nhẹ vài Pips.</p>
          <p>• <strong>Bước 2:</strong> Giữ nguyên lệnh Vùng 2 (4376) và giữ nguyên điểm Stoploss SL (4383).</p>
        </div>
      </div>

      <div class="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs space-y-1">
        <div class="font-bold text-amber-300 flex items-center gap-1">
          <i data-lucide="help-circle" class="w-4 h-4 text-amber-400"></i>
          <span>Giải mã đơn giản: Tại sao lại cắt Vùng 1, giữ Vùng 2?</span>
        </div>
        <p class="leading-relaxed">
          Vùng 2 (4376) nằm sát điểm Cắt Lỗ SL (4383) hơn, nên khoảng lỗ tối đa rất ngắn (chỉ 7 giá thay vì 10 giá) và vị thế đẹp hơn nhiều. Việc cắt Vùng 1 giúp bạn cắt giảm ngay 50% rủi ro tài khoản mà vẫn giữ trọn vẹn cơ hội ăn lãi lớn ở Vùng 2!
        </p>
      </div>
    `
  },
  scenario2: {
    title: 'DẠNG 2: KHỚP 1 VÙNG - GIÁ PHÁT TRUYỂN ĐÚNG SÓNG LỜI MẠNH',
    badge: 'Ăn Lớn Hoặc Hòa Vốn',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-sans',
    body: `
      <div class="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-1.5">
        <div class="text-[11px] text-slate-400 uppercase font-semibold">Tín hiệu thực tế đã bắn trong nhóm VIP Zalo:</div>
        <div class="font-mono text-emerald-300 font-bold text-xs sm:text-sm">
          🚂 Sell Limit: 4373 (Vùng 1) - 4376 (Vùng 2) | SL: 4383
        </div>
      </div>

      <div class="space-y-1.5">
        <div class="text-emerald-300 font-bold flex items-center gap-1.5">
          <i data-lucide="message-square" class="w-4 h-4 text-emerald-400"></i>
          <span>📱 Thông báo Chuyên gia gửi trên Zalo:</span>
        </div>
        <div class="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-emerald-200 font-mono text-xs">
          "Đã khớp Vùng 1 (4373) và giá rớt mạnh +80 Pips (+8 giá) -> HỦY LỆNH VÙNG 2 (4376) & DỜI SL VỀ ENTRY (4373)!"
        </div>
      </div>

      <div class="space-y-1.5">
        <div class="text-white font-bold flex items-center gap-1.5">
          <i data-lucide="check-square" class="w-4 h-4 text-emerald-400"></i>
          <span>🛠️ Hướng dẫn Newbie làm đúng 2 bước trên MT5 (30 Giây):</span>
        </div>
        <div class="pl-3 border-l-2 border-emerald-500/60 space-y-1 text-slate-200">
          <p>• <strong>Bước 1:</strong> Mở mục "Lệnh chờ" trên MT5 -> Bấm XÓA/HỦY ngay lệnh Sell Limit Vùng 2 (4376) chưa khớp.</p>
          <p>• <strong>Bước 2:</strong> Mở lệnh Vùng 1 (4373) đang chạy -> Sửa điểm Stoploss (SL) từ 4383 về đúng giá vào 4373 (Entry).</p>
        </div>
      </div>

      <div class="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs space-y-1">
        <div class="font-bold text-emerald-300 flex items-center gap-1">
          <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i>
          <span>Giải mã đơn giản: Trạng thái BẤT TỬ RỦI RO là gì?</span>
        </div>
        <p class="leading-relaxed">
          Hủy Vùng 2 giúp giá không quay lại dính 2 đầu. Khi kéo SL về Entry (4373), tài khoản của bạn ở thế <strong>"Thắng thì ĂN LỚN (đạt TP1, TP2), thua thì HÒA VỐN"</strong>. Ngay cả khi thị trường giật ngược lại, bạn chỉ hòa tiền chứ không mất đồng nào!
        </p>
      </div>
    `
  }
};

function explainScenario(type) {
  const data = scenarioDetails[type];
  if (!data) return;

  const titleEl = document.getElementById('scenarioTitle');
  const badgeEl = document.getElementById('scenarioBadge');
  const bodyEl = document.getElementById('scenarioBody');

  if (titleEl) titleEl.innerText = data.title;
  if (badgeEl) {
    badgeEl.innerText = data.badge;
    badgeEl.className = `text-[10px] px-2 py-0.5 rounded ${data.badgeClass}`;
  }
  if (bodyEl) bodyEl.innerHTML = data.body;

  const box = document.getElementById('scenarioExplainer');
  if (box) {
    box.classList.add('ring-2', 'ring-amber-400');
    setTimeout(() => {
      box.classList.remove('ring-2', 'ring-amber-400');
    }, 600);
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

/**
 * 6. Interactive Lot & Risk Calculator
 */
function setCapital(amount) {
  const input = document.getElementById('capitalInput');
  if (input) {
    input.value = amount;
    calculateLotSize();
  }
}

function calculateLotSize() {
  const input = document.getElementById('capitalInput');
  if (!input) return;

  let capital = parseFloat(input.value) || 500;
  if (capital < 50) capital = 50;

  // Stoploss distance in gold signal is strictly 7 - 10 prices (average 8.5 prices)
  // Target max risk = 2% - 4% of capital
  let lot = 0.01;

  // Rounding rules matching Nhà Ga Vàng pocket table
  if (capital < 350) {
    lot = 0.01;
  } else if (capital < 700) {
    lot = 0.02;
  } else if (capital < 1500) {
    lot = 0.04;
  } else if (capital < 2500) {
    lot = 0.07;
  } else {
    lot = Math.round((capital * 0.03 / 850) * 100) / 100;
  }

  // Min risk (7 prices) and Max risk (10 prices)
  const minRisk = Math.round(lot * 700);
  const maxRisk = Math.round(lot * 1000);
  const avgRisk = lot * 850;
  const riskPercent = ((avgRisk / capital) * 100).toFixed(1);

  // TP1: Ăn từ 10 giá trở lên (closed 50% lot)
  const tp1Profit = Math.round((lot * 0.5) * 1000);
  
  // TP2: Ăn 20 giá trọn trend (remaining 50% lot)
  const tp2Profit = Math.round((lot * 0.5) * 2000);
  const totalProfit = tp1Profit + tp2Profit;

  // Update UI elements
  const resLot = document.getElementById('resLot');
  const resLotDetail = document.getElementById('resLotDetail');
  const resRisk = document.getElementById('resRisk');
  const resRiskPercent = document.getElementById('resRiskPercent');
  const resTP1 = document.getElementById('resTP1');
  const resTP2 = document.getElementById('resTP2');

  if (resLot) resLot.innerText = `${lot.toFixed(2)} Lot`;
  if (resLotDetail) {
    if (lot <= 0.01) {
      resLotDetail.innerText = 'Đi 1 lệnh 0.01 duy nhất';
    } else {
      const half = (lot / 2).toFixed(2);
      resLotDetail.innerText = `Chia 2 lệnh ${half} Lot`;
    }
  }

  if (resRisk) resRisk.innerText = `-$${minRisk} ~ -$${maxRisk}`;
  if (resRiskPercent) resRiskPercent.innerText = `~${riskPercent}% Vốn (SL 7-10 giá)`;
  if (resTP1) resTP1.innerText = `+$${tp1Profit}`;
  if (resTP2) resTP2.innerText = `+$${totalProfit}+`;
}

/**
 * 7. Graduation & VIP Pass Submission
 */
function checkGraduation() {
  const t1 = document.getElementById('task1')?.checked || false;
  const t2 = document.getElementById('task2')?.checked || false;
  const t3 = document.getElementById('task3')?.checked || false;

  const btn = document.getElementById('btn-submit-graduation');
  if (btn) {
    if (t1 && t2 && t3) {
      btn.classList.add('ring-4', 'ring-amber-400', 'animate-bounce');
    } else {
      btn.classList.remove('ring-4', 'ring-amber-400', 'animate-bounce');
    }
  }
}

function submitGraduationToZalo() {
  const name = document.getElementById('userNameInput')?.value.trim() || 'Thành viên mới';
  const contact = document.getElementById('userContactInput')?.value.trim() || 'Chưa cung cấp';
  const capital = document.getElementById('userCapitalSelect')?.value || '$500';

  const message = `Chào Admin Nhà Ga Vàng! 🚂\nTôi đã hoàn thành xong 4 Trạm Cẩm Nang Newbie & hoàn tất bài tập Demo.\n\n👤 Họ tên: ${name}\n📱 SĐT Zalo: ${contact}\n💵 Vốn dự kiến: ${capital}\n\nNhờ Admin kiểm tra kết quả Demo và cấp vé vào Nhóm VIP cho tôi nhé!`;

  // Copy to clipboard
  copyToClipboard(message, 'Đã sao chép tin nhắn tốt nghiệp! Đang chuyển sang Zalo...');

  setTimeout(() => {
    window.open('https://zalo.me', '_blank');
    closeModal('vipModal');
  }, 1000);
}

/**
 * 8. Modal Management
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

/**
 * 9. Toast Helper
 */
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;

  toastMsg.innerText = msg;
  toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 3000);
}

function copyToClipboard(text, successMsg) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg || 'Đã sao chép vào bộ nhớ tạm!');
    });
  } else {
    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(successMsg || 'Đã sao chép vào bộ nhớ tạm!');
    } catch (err) {
      showToast('Sao chép thất bại');
    }
    document.body.removeChild(textArea);
  }
}
