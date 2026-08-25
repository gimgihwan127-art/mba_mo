# 2026 하반기 라인업 — 캐스트 랜딩

이미지 두 장짜리 모바일 랜딩페이지. **빌드 도구 없음.**
저장소 루트를 그대로 GitHub Pages에 올리면 동작한다.

## 어떻게 움직이나

1. 극장 단체사진이 **좌측 끝에서 시작해 우측 끝까지 가로로 밀린다.**
   `.cast-carousel`(세로로 긴 트랙)이 스크롤 거리를 만들고,
   안쪽 `.cast-carousel__sticky`가 화면에 붙어 있다.
   다 밀기 전에는 다음 이미지로 내려가지 않는다.
2. 가로 이동이 끝나면 세로로 긴 랜딩 이미지가 이어서 올라온다.

## 파일

```
index.html    마크업 (섹션 두 개가 전부)
style.css     스타일 전부
main.js       가로 슬라이드 (sticky 트랙)
images/
  lineup-cast.png   극장 단체사진 (가로로 미는 쪽)
  lineup-full.png   세로로 긴 랜딩
.gitignore
.nojekyll     GitHub Pages가 Jekyll로 처리하지 않게
```

## 손대기 전에 알아둘 것

- **`style.css`의 `.cast-carousel__img { max-width: none }`을 지우지 말 것.**
  리셋의 `img{max-width:100%}`가 이미지를 화면 폭으로 눌러버리면
  넘치는 폭이 0이 되고 밀 거리도 0이 된다.
  증상은 "이미지가 가운데 정렬된 채 스크롤해도 꿈쩍하지 않음".
- **슬라이드 속도는 `main.js` 맨 위 `PACE` 하나만** 건드린다.
  1 = 손가락이 움직인 만큼 이미지가 움직인다. 키우면 느긋해지고 줄이면 빨라진다.
  트랙 높이(`--track-h`)는 JS의 `measure()`가 계산해서 덮어쓰므로 CSS에서 고쳐도 소용없다.
- 이미지를 교체하면 **같은 파일명으로 덮어쓰면** 코드 수정이 필요 없다.
  가로/세로 비율이 달라져도 JS가 다시 재서 트랙 높이를 맞춘다.
- `prefers-reduced-motion`이 켜져 있으면 가로 이동을 하지 않고
  가로 스크롤로 대체된다. 새 애니메이션을 넣으면 CSS 맨 아래 블록에도 같이 적는다.

## 로컬에서 보기

```bash
python -m http.server 5500
```

python이 PATH에 없으면 node로:

```bash
npx -y serve -l 5500 .
```

주소창에 `http://localhost:5500`.
`file://`로 열어도 대부분 동작하지만 이미지 경로가 브라우저마다 달라서 서버 쪽을 권한다.

**고쳤는데 안 바뀌면 브라우저 캐시다.** `Ctrl+Shift+R`.

## 배포 (GitHub Pages)

GitHub에서 빈 저장소를 만든 뒤, 이 폴더에서:

```bash
git init -b main
```

```bash
git add . ; git commit -m "캐스트 랜딩페이지"
```

```bash
git remote add origin https://github.com/<계정>/<저장소>.git
```

```bash
git push -u origin main
```

그다음 저장소 **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.
1~2분 뒤 `https://<계정>.github.io/<저장소>/` 에서 열린다.

### 올린 뒤 확인

- 브라우저 콘솔에 **404가 없는지** (`style.css`, `main.js`, 이미지 2장).
- 단체사진이 **좌측 끝부터** 시작하는지.
- 390 / 768 / 1440 세 폭에서 가로 스크롤이 생기지 않는지.

### 이미지 용량

`lineup-cast.png` 14MB, `lineup-full.png` 12MB — 합쳐서 26MB다.
저장소에 올라가는 건 문제없지만(파일당 100MB 제한) 모바일에서 그대로 받는다.
급해지면 WebP로 바꾸는 걸 먼저 검토할 것. 보통 1/5~1/10로 줄어든다.
