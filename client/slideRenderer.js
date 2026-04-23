let activeP5Instance = null;
let activeBytebeatStop = null;

function toFontSizeValue(value) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return `${value}px`;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return null;
}

function clearActiveMedia() {
  if (activeP5Instance) {
    activeP5Instance.remove();
    activeP5Instance = null;
  }

  if (activeBytebeatStop) {
    activeBytebeatStop();
    activeBytebeatStop = null;
  }
}

export function renderSlide(container, slide) {
  clearActiveMedia();
  container.innerHTML = "";

  if (!slide) {
    container.textContent = "슬라이드를 찾을 수 없습니다.";
    return;
  }

  if (slide.type === "text") {
    const wrapper = document.createElement("article");
    wrapper.className = "slide-text";

    const title = document.createElement("h1");
    title.textContent = slide.title || "";
    const titleFontSize = toFontSizeValue(slide.titleFontSize);
    if (titleFontSize) {
      title.style.fontSize = titleFontSize;
    }

    const body = document.createElement("p");
    body.textContent = slide.body || "";
    const bodyFontSize = toFontSizeValue(slide.bodyFontSize);
    if (bodyFontSize) {
      body.style.fontSize = bodyFontSize;
    }

    wrapper.append(title, body);
    container.appendChild(wrapper);
    return;
  }

  if (slide.type === "image") {
    const wrapper = document.createElement("article");
    wrapper.className = "slide-image";

    const img = document.createElement("img");
    img.src = slide.src;
    img.alt = slide.alt || "slide image";
    wrapper.appendChild(img);
    container.appendChild(wrapper);
    return;
  }

  if (slide.type === "p5") {
    const wrap = document.createElement("div");
    wrap.className = "p5-wrap";
    container.appendChild(wrap);

    if (slide.sketch === "sketch1" && typeof window.runSketch1 === "function") {
      activeP5Instance = window.runSketch1(wrap);
      return;
    }

    wrap.textContent = "p5 스케치를 로드할 수 없습니다.";
    return;
  }

  if (slide.type === "interactiveColor") {
    const wrapper = document.createElement("article");
    wrapper.className = "slide-interactive";

    const title = document.createElement("h2");
    title.textContent = slide.title || "Interactive";

    const body = document.createElement("p");
    body.textContent = slide.body || "화면을 움직여보세요";

    const value = document.createElement("div");
    value.className = "interactive-value";
    value.textContent = "hsl(200, 85%, 45%)";

    wrapper.append(title, body, value);
    container.appendChild(wrapper);

    const updateColorFromPoint = (clientX, clientY) => {
      const rect = wrapper.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

      const hue = Math.round(x * 360);
      const lightness = Math.round(30 + (1 - y) * 35);
      const color = `hsl(${hue}, 85%, ${lightness}%)`;
      wrapper.style.background = color;
      value.textContent = color;
    };

    wrapper.addEventListener("pointerdown", (event) => {
      updateColorFromPoint(event.clientX, event.clientY);
    });

    wrapper.addEventListener("pointermove", (event) => {
      if (event.buttons === 0 && event.pointerType !== "touch") {
        return;
      }
      updateColorFromPoint(event.clientX, event.clientY);
    });

    return;
  }

  if (slide.type === "bytebeat") {
    const wrapper = document.createElement("article");
    wrapper.className = "slide-bytebeat";

    const title = document.createElement("h2");
    title.textContent = slide.title || "Bytebeat";

    const body = document.createElement("p");
    body.textContent = slide.body || "t 기반 수식을 입력하고 재생하세요";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "bytebeat-input";
    input.value = slide.expression || "t*(t>>5|t>>8)>>3";

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Play";

    const status = document.createElement("div");
    status.className = "bytebeat-status";
    status.textContent = "8kHz bytebeat 준비";

    wrapper.append(title, body, input, button, status);
    container.appendChild(wrapper);

    let isPlaying = false;

    const stopPlayback = () => {
      if (activeBytebeatStop) {
        activeBytebeatStop();
        activeBytebeatStop = null;
      }
      isPlaying = false;
      button.textContent = "Play";
    };

    button.addEventListener("click", async () => {
      if (isPlaying) {
        stopPlayback();
        status.textContent = "정지됨";
        return;
      }

      let fn;
      try {
        fn = new Function("t", `return (${input.value});`);
      } catch (_error) {
        status.textContent = "수식 오류: 문법을 확인하세요";
        return;
      }

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        status.textContent = "오디오를 지원하지 않는 브라우저입니다";
        return;
      }

      const audioCtx = new AudioCtx();
      try {
        await audioCtx.resume();
      } catch (_error) {
        status.textContent = "오디오 시작에 실패했습니다";
        audioCtx.close();
        return;
      }

      const node = audioCtx.createScriptProcessor(1024, 0, 1);
      let t = 0;
      const ratio = 8000 / audioCtx.sampleRate;

      node.onaudioprocess = (event) => {
        const out = event.outputBuffer.getChannelData(0);
        for (let i = 0; i < out.length; i += 1) {
          let sampleValue = 0;
          try {
            sampleValue = fn(Math.floor(t)) | 0;
          } catch (_error) {
            sampleValue = 0;
          }
          out[i] = ((sampleValue & 255) - 128) / 128;
          t += ratio;
        }
      };

      node.connect(audioCtx.destination);

      activeBytebeatStop = () => {
        node.disconnect();
        audioCtx.close();
      };

      isPlaying = true;
      button.textContent = "Stop";
      status.textContent = "재생 중 (8kHz source)";
    });

    return;
  }

  if (slide.type === "bytebeatSlider") {
    const wrapper = document.createElement("article");
    wrapper.className = "slide-bytebeat";

    const title = document.createElement("h2");
    title.textContent = slide.title || "Bytebeat t*n";

    const body = document.createElement("p");
    body.textContent = slide.body || "n 값을 조절하고 재생하세요";

    const fixedFormula = document.createElement("div");
    fixedFormula.className = "bytebeat-status";
    fixedFormula.textContent = "formula: t * n";

    const row = document.createElement("div");
    row.className = "bytebeat-row";

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.step = "1";
    slider.value = String(typeof slide.n === "number" ? slide.n : 24);
    slider.className = "bytebeat-slider";

    const nValue = document.createElement("strong");
    nValue.className = "bytebeat-n";
    nValue.textContent = `n=${slider.value}`;

    row.append(slider, nValue);

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Play";

    const status = document.createElement("div");
    status.className = "bytebeat-status";
    status.textContent = "8kHz bytebeat 준비";

    wrapper.append(title, body, fixedFormula, row, button, status);
    container.appendChild(wrapper);

    let isPlaying = false;
    let n = Number(slider.value);

    slider.addEventListener("input", () => {
      n = Number(slider.value);
      nValue.textContent = `n=${slider.value}`;
    });

    const stopPlayback = () => {
      if (activeBytebeatStop) {
        activeBytebeatStop();
        activeBytebeatStop = null;
      }
      isPlaying = false;
      button.textContent = "Play";
    };

    button.addEventListener("click", async () => {
      if (isPlaying) {
        stopPlayback();
        status.textContent = "정지됨";
        return;
      }

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        status.textContent = "오디오를 지원하지 않는 브라우저입니다";
        return;
      }

      const audioCtx = new AudioCtx();
      try {
        await audioCtx.resume();
      } catch (_error) {
        status.textContent = "오디오 시작에 실패했습니다";
        audioCtx.close();
        return;
      }

      const node = audioCtx.createScriptProcessor(1024, 0, 1);
      let t = 0;
      const ratio = 8000 / audioCtx.sampleRate;

      node.onaudioprocess = (event) => {
        const out = event.outputBuffer.getChannelData(0);
        for (let i = 0; i < out.length; i += 1) {
          const sampleValue = (Math.floor(t) * n) | 0;
          out[i] = ((sampleValue & 255) - 128) / 128;
          t += ratio;
        }
      };

      node.connect(audioCtx.destination);

      activeBytebeatStop = () => {
        node.disconnect();
        audioCtx.close();
      };

      isPlaying = true;
      button.textContent = "Stop";
      status.textContent = `재생 중 (8kHz source, n=${n})`;
    });

    return;
  }

  container.textContent = "지원하지 않는 슬라이드 타입입니다.";
}
