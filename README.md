# 📚 나만의 도서관

나만의 디지털 서재를 만들고 공유하는 웹 애플리케이션입니다.

## ✨ 주요 기능

1. **책 정보 추가** - 제목, 저자, 출판사, 이미지, 분류 등
2. **순위 매김** - 좋아요 기반 인기 순위
3. **키워드 분류** - 한국십진분류법(KDC) 9개 카테고리
4. **핵심 목차 표시** - 책의 주요 목차 정리
5. **비슷한 책 연결** - 같은 카테고리/작가 기반 추천
6. **책 내용 정리** - 요약 및 독서 기록
7. **24시간 작동** - GitHub Pages 무료 호스팅
8. **구글 검색 가능** - SEO 최적화
9. **도서관 공유** - QR 코드 및 URL 공유
10. **알라딘 크롤링** - 책 정보 자동 가져오기
11. **좋아요 및 구독** - 책 추천 기능

## 🚀 GitHub Pages 배포 방법

### 1. 저장소 설정

1. GitHub 저장소로 이동: https://github.com/jonyeo/all-por
2. **Settings** → **Pages** 메뉴로 이동
3. **Source**에서 **Deploy from a branch** 선택
4. **Branch**를 `main` (또는 `master`) 선택
5. **Folder**를 `/ (root)` 선택
6. **Save** 클릭

### 2. 배포 확인

배포 완료 후 (보통 1-2분 소요):
- 사이트 URL: `https://jonyeo.github.io/all-por/`
- 또는: `https://jonyeo.github.io/all-por/index.html`

### 3. Google Search Console 등록

1. [Google Search Console](https://search.google.com/search-console) 접속
2. 속성 추가 → URL 접두어 입력
3. 사이트맵 제출: `https://jonyeo.github.io/all-por/sitemap.xml`

## 📁 프로젝트 구조

```
도서관/
├── index.html          # 메인 페이지
├── explore.html        # 둘러보기
├── add-book.html       # 책 추가
├── book-detail.html    # 책 상세
├── my-library.html     # 내 도서관
├── css/
│   └── style.css       # 스타일시트
├── js/
│   ├── storage.js      # 데이터 관리 (로컬 스토리지)
│   └── app.js          # 앱 로직
├── sitemap.xml         # SEO 사이트맵
└── robots.txt          # 검색엔진 크롤링 설정
```

## 🛠️ 기술 스택

- **프론트엔드**: HTML, CSS, JavaScript (바닐라)
- **데이터 저장**: LocalStorage (로컬 테스트)
- **배포**: GitHub Pages
- **SEO**: sitemap.xml, robots.txt, 메타 태그

## 📝 사용 방법

### 책 추가하기

1. **자동 방법 (추천)**:
   - 알라딘에서 책 검색
   - 책 상세 페이지 URL 복사
   - "책 추가" 페이지에서 URL 붙여넣기
   - "정보 가져오기" 클릭

2. **수동 방법**:
   - 제목, 저자, 출판사 직접 입력
   - 이미지 URL 또는 파일 업로드
   - 분류 선택, 평점, 요약 작성

### 도서관 공유

1. "내 도서관" 페이지로 이동
2. QR 코드 스캔 또는 URL 복사
3. 친구에게 공유

## 🔄 Firebase 연동 (향후 계획)

현재는 로컬 스토리지로 작동하며, 나중에 Firebase로 교체 가능합니다:
- Firebase Firestore (데이터베이스)
- Firebase Storage (이미지 저장)
- Firebase Auth (사용자 인증)

## 📄 라이선스

MIT License

## 👤 제작자

나만의 도서관 프로젝트

