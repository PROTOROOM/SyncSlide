window.runSketch1 = (container) => {
  if (typeof window.p5 === "undefined") {
    container.textContent = "p5 라이브러리를 불러오지 못했습니다.";
    return null;
  }

  return new window.p5((p) => {
    p.setup = () => {
      p.createCanvas(container.clientWidth, container.clientHeight);
      p.frameRate(60);
    };

    p.windowResized = () => {
      p.resizeCanvas(container.clientWidth, container.clientHeight);
    };

    p.draw = () => {
      p.background(12, 20, 38);
      p.noFill();

      for (let i = 0; i < 9; i += 1) {
        const radius = 40 + i * 45 + Math.sin(p.frameCount * 0.03 + i) * 18;
        p.stroke(56 + i * 16, 189, 248, 180);
        p.strokeWeight(2);
        p.circle(p.width / 2, p.height / 2, radius);
      }
    };
  }, container);
};
