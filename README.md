# 🀄 Tap Tap Pairs (사천성)

이모지 카드를 매칭하여 모든 카드를 제거하는 퍼즐 게임입니다.  
사천성(Shisen-Sho) 규칙 기반으로, 0~2번 꺾이는 경로로 같은 카드를 연결합니다.

## ✨ 주요 기능

- **스테이지 시스템** — JSON 파일 기반 무한 스테이지 확장
- **경로 시각화** — SVG로 연결 경로를 실시간 표시
- **힌트 & 셔플** — 막힐 때 힌트 또는 셔플 사용
- **매치 불가 감지** — 가능한 매치가 없으면 자동 알림
- **다크/라이트 모드** — 시스템 설정 자동 인식 + 수동 전환
- **스테이지 에디터** — 커스텀 스테이지 레이아웃 제작 (개발 모드)

## 🛠 기술 스택

- Vue 3 + TypeScript
- Vite
- Lucide Icons

## 🚀 실행

```bash
npm install
npm run dev
```

## 📦 빌드

```bash
npm run build
npm run preview
```

## 📁 스테이지 추가

`public/stages/` 폴더에 JSON 파일을 추가하면 자동 인식됩니다.

```
public/stages/
├── stage1.json
├── stage2.json
├── stage3.json
└── ...
```

각 파일 형식:

```json
{
  "id": 1,
  "cols": 6,
  "rows": 4,
  "timeLimit": 120,
  "layout": [[true, true, ...], ...]
}
```

> 스테이지 에디터(`npm run dev` → ⚙ 버튼)에서 레이아웃을 디자인하고 JSON으로 다운로드할 수 있습니다.
