const videoFiles = [
  "videos/video1.mp4", "videos/video2.mp4", "videos/video3.mp4", "videos/video4.mp4", "videos/video5.mp4",
  "videos/video6.mp4", "videos/video7.mp4", "videos/video8.mp4", "videos/video9.mp4", "videos/video10.mp4",
  "videos/video11.mp4", "videos/video12.mp4", "videos/video13.mp4", "videos/video14.mp4", "videos/video15.mp4"
];

const GOOGLE_FORM_ACTION_URL = "https://docs.google.com/forms/d/1vrJ5VDEE1nc0xw5dRTfmJVLuGRUQf_TFN7MABCu9gbY/viewform";
const GOOGLE_FORM_ENTRY_IDS = [
  "entry.444096672",
  "entry.1425345148",
  "entry.2063717954",
  "entry.638386337",
  "entry.1457582556",
  "entry.1167391515",
  "entry.670434132",
  "entry.1133393609",
  "entry.266892035",
  "entry.984943444",
  "entry.856834092",
  "entry.2116329894",
  "entry.989951110",
  "entry.125407554",
  "entry.1260790740"
];

let current = 0;
let times = Array(videoFiles.length).fill(0); // milliseconds!
let timer = null;
let lastStart = null;
let started = false;

const videoPlayer = document.getElementById("videoPlayer");
const videoLabel = document.getElementById("videoLabel");
const videoCounter = document.getElementById("videoCounter");
const submitBtn = document.getElementById("submitBtn");
const swipeHint = document.getElementById("swipeHint");
const welcomeOverlay = document.getElementById("welcomeOverlay");

// Hide main UI until started
document.querySelector("main").style.display = "none";

// Welcome overlay: swipe up to start (touch and mouse)
let welcomeTouchStartY = null, welcomeTouchEndY = null;
const welcomeSwipeThreshold = 48;

welcomeOverlay.addEventListener('touchstart', e => {
  if(e.touches.length === 1) welcomeTouchStartY = e.touches[0].clientY;
});
welcomeOverlay.addEventListener('touchmove', e => {
  if(e.touches.length === 1) welcomeTouchEndY = e.touches[0].clientY;
});
welcomeOverlay.addEventListener('touchend', e => {
  if(welcomeTouchStartY !== null && welcomeTouchEndY !== null) {
    let deltaY = welcomeTouchEndY - welcomeTouchStartY;
    if (deltaY < -welcomeSwipeThreshold) {
      started = true;
      welcomeOverlay.setAttribute("hidden", "true");
      document.querySelector("main").style.display = "";
      showVideo(0);
      setTimeout(() => {
         videoPlayer.muted = false; 
        videoPlayer.play().catch(()=>{});
      }, 110);
    }
  }
  welcomeTouchStartY = null;
  welcomeTouchEndY = null;
});

// Mouse drag up for desktop
let welcomeMouseStartY = null, welcomeMouseEndY = null;
welcomeOverlay.addEventListener('mousedown', e => {
  welcomeMouseStartY = e.clientY;
});
welcomeOverlay.addEventListener('mouseup', e => {
  welcomeMouseEndY = e.clientY;
  if (welcomeMouseStartY !== null && welcomeMouseEndY !== null) {
    let deltaY = welcomeMouseEndY - welcomeMouseStartY;
    if (deltaY < -welcomeSwipeThreshold) {
      started = true;
      welcomeOverlay.setAttribute("hidden", "true");
      document.querySelector("main").style.display = "";
      showVideo(0);
      setTimeout(() => {
         videoPlayer.muted = false; 
        videoPlayer.play().catch(()=>{});
      }, 110);
    }
  }
  welcomeMouseStartY = null;
  welcomeMouseEndY = null;
});

function showVideo(idx) {
  stopTimer();
  current = idx;
  videoPlayer.src = videoFiles[current];
  videoLabel.textContent = "Video " + (current + 1);
  videoCounter.textContent = `${current + 1} / ${videoFiles.length}`;
  submitBtn.style.display = (current === videoFiles.length - 1) ? "block" : "none";
  setTimeout(() => {
    videoPlayer.currentTime = 0;
     videoPlayer.muted = false; 
    videoPlayer.play().catch(()=>{});
  }, 120);
  // Show swipe hint only on first video for 2 seconds
  if (current === 0) {
    swipeHint.style.opacity = "0.93";
    setTimeout(() => { swipeHint.style.opacity = "0"; }, 2000);
  }
}

function startTimer() {
  lastStart = Date.now();
  timer = setInterval(() => {}, 1000);
}

function stopTimer() {
  if (lastStart !== null) {
    times[current] += Date.now() - lastStart; // milliseconds
    lastStart = null;
  }
  if (timer) clearInterval(timer);
}

videoPlayer.onplay = () => { if (!lastStart) startTimer(); };
videoPlayer.onpause = () => stopTimer();
window.onbeforeunload = () => stopTimer();

submitBtn.onclick = () => {
  stopTimer();
  // Convert ms to seconds string with 2 decimals for Google Form
  let params = GOOGLE_FORM_ENTRY_IDS.map((entry, i) => {
    let sec = (times[i] || 0) / 1000;
    return entry + "=" + encodeURIComponent(sec.toFixed(2));
  }).join("&");
  let url = GOOGLE_FORM_ACTION_URL + "?" + params;
  window.open(url, "_blank");
};

// Keyboard navigation for desktop (optional)
document.addEventListener('keydown', e => {
  if (!started) return;
  if (e.key === "ArrowUp" && current > 0) showVideo(current - 1);
  if (e.key === "ArrowDown" && current < videoFiles.length - 1) showVideo(current + 1);
});

// Touch swipe navigation for mobile
let touchStartY = null;
let touchEndY = null;
const swipeThreshold = 48; // minimum px for swipe

videoPlayer.addEventListener('touchstart', e => {
  if (!started) return;
  if(e.touches.length === 1) touchStartY = e.touches[0].clientY;
});
videoPlayer.addEventListener('touchmove', e => {
  if (!started) return;
  if(e.touches.length === 1) touchEndY = e.touches[0].clientY;
});
videoPlayer.addEventListener('touchend', e => {
  if (!started) return;
  if (touchStartY !== null && touchEndY !== null) {
    let deltaY = touchEndY - touchStartY;
    if (deltaY < -swipeThreshold && current < videoFiles.length - 1) {
      showVideo(current + 1); // Swipe up: next video
    }
    if (deltaY > swipeThreshold && current > 0) {
      showVideo(current - 1); // Swipe down: previous video
    }
  }
  touchStartY = null;
  touchEndY = null;
});