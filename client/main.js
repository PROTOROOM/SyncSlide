import { connectSocket } from "./socket.js";
import { slides } from "./slides.js";
import { renderSlide } from "./slideRenderer.js";
import "./p5/sketch1.js";

const roleFromPage = document.body.dataset.role === "host" ? "host" : "guest";
const slideContainer = document.getElementById("slide");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const indexEl = document.getElementById("index");
const roleStatusEl = document.getElementById("role-status");

let currentSlideIndex = 0;
let assignedRole = roleFromPage;
let soundEnabled = true;
let audioCtx = null;

const socket = connectSocket();

function clampSlideIndex(index) {
  return Math.max(0, Math.min(index, slides.length - 1));
}

function updateSlide(index) {
  currentSlideIndex = clampSlideIndex(index);
  renderSlide(slideContainer, slides[currentSlideIndex]);

  if (indexEl) {
    indexEl.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
  }
}

function setRoleStatus() {
  if (!roleStatusEl) {
    return;
  }

  if (assignedRole === "host") {
    roleStatusEl.textContent = "Host 권한";
  } else {
    roleStatusEl.textContent = "Guest";
  }
}

function playDing() {
  if (!soundEnabled) {
    return;
  }

  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return;
    }
    audioCtx = new AudioCtx();
  }

  if (audioCtx.state !== "running") {
    return;
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = 880;
  gain.gain.value = 0.001;
  gain.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.21);
}

function unlockAudio() {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return;
    }
    audioCtx = new AudioCtx();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
}

window.addEventListener("pointerdown", unlockAudio, { passive: true });
window.addEventListener("touchstart", unlockAudio, { passive: true });
window.addEventListener("click", unlockAudio, { passive: true });

document.addEventListener(
  "touchmove",
  (event) => {
    if (event.target instanceof Element && event.target.closest("input, textarea, select, button, [contenteditable='true']")) {
      return;
    }
    event.preventDefault();
  },
  { passive: false }
);

document.addEventListener(
  "gesturestart",
  (event) => {
    if (event.target instanceof Element && event.target.closest("input, textarea, select, button, [contenteditable='true']")) {
      return;
    }
    event.preventDefault();
  },
  { passive: false }
);

if (prevButton) {
  prevButton.addEventListener("click", () => {
    if (assignedRole !== "host") {
      return;
    }
    socket.emit("slideChange", clampSlideIndex(currentSlideIndex - 1));
  });
}

if (nextButton) {
  nextButton.addEventListener("click", () => {
    if (assignedRole !== "host") {
      return;
    }
    socket.emit("slideChange", clampSlideIndex(currentSlideIndex + 1));
  });
}

socket.on("connect", () => {
  socket.emit("join", { role: roleFromPage });
});

socket.on("roleAssigned", ({ role }) => {
  assignedRole = role;
  setRoleStatus();
});

socket.on("sync", ({ currentSlide }) => {
  updateSlide(currentSlide);
});

socket.on("playSound", ({ type }) => {
  if (type === "ding") {
    playDing();
  }
});

updateSlide(0);
setRoleStatus();
