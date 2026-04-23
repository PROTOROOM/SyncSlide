# PROJECT_PLAN.md

## 1. 프로젝트 개요

SyncSlide는 Host 1명과 다수 Guest가 같은 슬라이드 인덱스를 실시간으로 공유하는 웹 프레젠테이션 앱이다.

- Host만 슬라이드 인덱스를 제어한다.
- Guest는 인덱스를 따라가며 일부 슬라이드에서 로컬 인터랙션을 수행할 수 있다.
- 서버는 슬라이드 데이터 자체를 전달하지 않고, 인덱스 상태만 동기화한다.
- 모바일/데스크톱 모두 전체 화면형 레이아웃을 목표로 한다.

---

## 2. 핵심 설계 철학

슬라이드 "콘텐츠"는 클라이언트에 미리 존재하고, 서버는 "현재 위치"만 관리한다.

```js
sharedState = {
  currentSlide: number
};
```

동기화 원칙:

- `currentSlide`는 전원 공통(글로벌 동기화)
- 슬라이드 내부 인터랙션(예: 색상 드래그, bytebeat 수식/슬라이더)은 기본 로컬 상태

---

## 3. 현재 MVP 범위 (구현 반영)

### 3.1 세션/역할

- 단일 Room만 지원
- 역할:
  - Host: 다수 가능
  - Guest: 다수
- Host 요청자는 모두 Host 권한 부여

### 3.2 실시간 동기화 (Socket.IO)

이벤트:

- `join` `{ role: "host" | "guest" }`
- `roleAssigned` `{ role, reason? }`
- `sync` `{ currentSlide }`
- `slideChange` `number`
- `playSound` `{ type: "ding" }`

처리 규칙:

- `slideChange`는 Host만 반영
- 서버는 인덱스를 정수/0 이상으로 보정 후 브로드캐스트

### 3.3 슬라이드 타입

현재 구현된 타입:

- `text`
- `image`
- `interactiveColor` (Guest 직접 조작 가능, 로컬 상태)
- `bytebeat` (t 수식 입력 + Play/Stop)
- `bytebeatSlider` (`t*n` 고정식, n=0..100 슬라이더)
- `p5`

### 3.4 슬라이드 제어

- Host: `Prev` / `Next`
- Guest: 인덱스 제어 불가

### 3.5 오디오

- 슬라이드 변경 시 `ding` 재생 이벤트 수신
- 별도 버튼 없이 기본 활성화
- 모바일 제약 대응을 위해 첫 사용자 입력(터치/클릭) 시 오디오 컨텍스트 unlock
- bytebeat는 슬라이드 내 Play/Stop으로 개별 재생

### 3.6 모바일 동작

- `viewport-fit=cover`, web-app-capable 메타 태그 적용
- 화면 스크롤/바운스 억제
- 폼 컨트롤(input/range/button) 조작은 예외 허용
- 슬라이더는 모바일 터치 조작 가능하도록 `touch-action: pan-x` 적용

---

## 4. 기술 스택

Frontend:

- Vanilla JavaScript (ES Modules)
- HTML / CSS
- p5.js (CDN)
- Web Audio API

Backend:

- Node.js
- Express
- Socket.IO

---

## 5. 현재 디렉토리 구조

```text
/project
  /server
    server.js

  /client
    index.html
    host.html
    main.js
    socket.js
    slideRenderer.js
    slides.js
    styles.css

    /assets
      /images
        mobile-portrait.svg
        scene1.svg

    /p5
      sketch1.js

  package.json
```

---

## 6. 데이터 구조

서버 상태:

- `currentSlide: number`

슬라이드 데이터 예시:

```js
{
  type: "text",
  title: "제목",
  body: "본문",
  titleFontSize: "clamp(42px, 10vw, 120px)",
  bodyFontSize: 28
}
```

---

## 7. 시스템 흐름

초기 접속:

1. 클라이언트가 `join` 전송
2. 서버가 역할 확정(`roleAssigned`) + 현재 인덱스(`sync`) 전달
3. 클라이언트가 해당 인덱스 슬라이드 렌더링

슬라이드 변경:

1. Host가 `slideChange` 전송
2. 서버가 `currentSlide` 갱신 후 `sync` 브로드캐스트
3. 서버가 `playSound(ding)` 브로드캐스트
4. 모든 클라이언트가 슬라이드 갱신 + ding 재생 시도

인터랙티브 슬라이드:

- `interactiveColor`/`bytebeat*`의 내부 조작은 각 클라이언트 로컬에서 처리

---

## 8. UI 구조

- `host.html`: Host 상태 표시, Prev/Next, 인덱스 표시
- `index.html`: Guest 전용 전체 화면 뷰어
- 공통 렌더러: `renderSlide(container, slide)`

이미지 정책:

- `object-fit: contain`으로 기기 비율이 달라도 동일한 이미지 콘텐츠 표시

---

## 9. 실행 방법

```bash
npm install
npm start
```

- Guest: `http://localhost:3000/`
- Host: `http://localhost:3000/host`

---

## 10. 리스크 및 제한

- WebSocket 재연결 시 UX(자동 role 재협상 안내) 미흡
- 모바일 브라우저 오디오 정책으로 첫 사용자 입력 전 자동 재생 제한
- `ScriptProcessorNode` 기반 bytebeat는 향후 `AudioWorklet`로 교체 여지 있음
- multi-room 미지원

---

## 11. 다음 확장 계획

1. multi-room 및 룸 코드 입장
2. 인터랙티브 슬라이드 상태 동기화 옵션(로컬/글로벌 모드)
3. bytebeat 프리셋/저장 기능
4. 재연결 복구 UX 및 Host 이관 정책
5. 간단한 슬라이드 에디터

---

## 요약

현재 SyncSlide MVP는 "인덱스 동기화"를 중심으로 text/image/p5 + 인터랙티브/오디오 슬라이드까지 동작하며, 모바일 고정형 화면 사용성까지 반영된 상태다.
