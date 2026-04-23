export const slides = [
  {
    type: "text",
    title: "Matter Matters",
    body: "PROTOROOM",
    titleFontSize: 60
  },
  {
    type: "text",
    title: "타이틀만 크게",
    body: "",
    titleFontSize: "clamp(42px, 10vw, 120px)"
  },
  {
    type: "text",
    title: "본문 크게 보기",
    body: "슬라이드마다 title/body 폰트 크기를 개별 설정할 수 있습니다. 슬라이드마다 title/body 폰트 크기를 개별 설정할 수 있습니다. \
    슬라이드마다 title/body 폰트 크기를 개별 설정할 수 있습니다. 슬라이드마다 title/body 폰트 크기를 개별 설정할 수 있습니다.\
    슬라이드마다 title/body 폰트 크기를 개별 설정할 수 있습니다.슬라이드마다 title/body 폰트 크기를 개별 설정할 수 있습니다.",
    titleFontSize: 30,
    bodyFontSize: "clamp(32px, 4vw, 50px)"
  },
  {
    type: "image",
    src: "/assets/images/mobile-portrait.svg",
    alt: "모바일 세로형 이미지 슬라이드"
  },
  {
    type: "image",
    src: "/assets/images/mindstorms.png",
    alt: "마인드스톰"
  },
  {
    type: "interactiveColor",
    title: "Interactive Slide",
    body: "화면을 드래그하면 배경색이 바뀝니다"
  },
  {
    type: "bytebeatSlider",
    title: "t * n",
    body: "t는 시간의 변수입니다. 계속 증가합니다.",
    n: 0
  },
  {
    type: "bytebeat",
    title: "Bytebeat",
    body: "t 수식을 넣고 Play를 누르면 소리가 납니다",
    expression: "(t>>4|t|t>>5)*(t>>7)"
  },

  {
    type: "p5",
    sketch: "sketch1"
  }
];
