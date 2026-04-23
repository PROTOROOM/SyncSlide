# SyncSlide MVP

워크숍/데모용 실시간 슬라이드 동기화 웹 앱입니다.

- 여러 Host와 여러 Guest가 같은 슬라이드 인덱스를 공유합니다.
- 서버는 슬라이드 콘텐츠가 아니라 현재 인덱스 상태만 동기화합니다.
- 슬라이드 타입: `text`, `image`, `interactiveColor`, `bytebeat`, `bytebeatSlider`, `p5`.

## 실행

```bash
npm install
npm start
```

- Guest: `http://localhost:3000/`
- Host: `http://localhost:3000/host`

## 기술 스택

- Frontend: Vanilla JavaScript (ES Modules), HTML/CSS, p5.js, Web Audio API
- Backend: Node.js, Express, Socket.IO

## 프로젝트 구조

```text
client/
  index.html
  host.html
  main.js
  slideRenderer.js
  slides.js
  styles.css
server/
  server.js
package.json
```

## 동작 개요

1. 클라이언트가 `join` 이벤트로 role(`host`/`guest`)을 요청합니다.
2. 서버가 `roleAssigned`, `sync(currentSlide)`를 전달합니다.
3. Host가 `slideChange`를 보내면 서버가 전체에 `sync`와 `playSound(ding)`를 브로드캐스트합니다.
