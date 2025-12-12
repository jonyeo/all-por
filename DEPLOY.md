# 🚀 GitHub Pages 배포 가이드

## 1단계: GitHub 저장소에 코드 업로드

### 방법 1: GitHub Desktop 사용 (추천)

1. [GitHub Desktop](https://desktop.github.com/) 다운로드 및 설치
2. GitHub Desktop 실행
3. **File** → **Add Local Repository**
4. `C:\Users\jjh\Desktop\A2\도서관` 폴더 선택
5. **Publish repository** 클릭
6. Repository name: `all-por` (또는 원하는 이름)
7. **Publish** 클릭

### 방법 2: Git 명령어 사용

```bash
cd "C:\Users\jjh\Desktop\A2\도서관"
git init
git add .
git commit -m "Initial commit: 나만의 도서관 프로젝트"
git branch -M main
git remote add origin https://github.com/jonyeo/all-por.git
git push -u origin main
```

## 2단계: GitHub Pages 활성화

1. GitHub 저장소로 이동: https://github.com/jonyeo/all-por
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 클릭
4. **Source** 섹션에서:
   - **Deploy from a branch** 선택
   - **Branch**: `main` 선택
   - **Folder**: `/ (root)` 선택
5. **Save** 버튼 클릭

## 3단계: 배포 확인

- 배포 완료까지 **1-2분** 소요됩니다
- 배포 완료 후 사이트 URL 확인:
  - **https://jonyeo.github.io/all-por/**
  - 또는 **https://jonyeo.github.io/all-por/index.html**

## 4단계: Google Search Console 등록

### 4-1. Google Search Console 접속

1. [Google Search Console](https://search.google.com/search-console) 접속
2. Google 계정으로 로그인

### 4-2. 속성 추가

1. **속성 추가** 버튼 클릭
2. **URL 접두어** 선택
3. 사이트 URL 입력: `https://jonyeo.github.io/all-por`
4. **계속** 클릭

### 4-3. 소유권 확인

**방법 1: HTML 파일 업로드 (추천)**

1. Google에서 제공하는 HTML 파일 다운로드
2. GitHub 저장소의 `도서관` 폴더에 업로드
3. GitHub에 커밋 및 푸시
4. Google Search Console에서 **확인** 클릭

**방법 2: HTML 태그**

1. Google에서 제공하는 메타 태그 복사
2. `index.html`의 `<head>` 섹션에 추가
3. GitHub에 커밋 및 푸시
4. Google Search Console에서 **확인** 클릭

### 4-4. 사이트맵 제출

1. Google Search Console 왼쪽 메뉴에서 **Sitemaps** 클릭
2. **새 사이트맵 추가** 입력란에 입력:
   ```
   https://jonyeo.github.io/all-por/sitemap.xml
   ```
3. **제출** 클릭

## 5단계: SEO 최적화 확인

배포 후 다음을 확인하세요:

- ✅ 사이트가 정상적으로 로드되는지
- ✅ 모든 페이지가 작동하는지
- ✅ 모바일에서도 잘 보이는지
- ✅ sitemap.xml 접근 가능한지: https://jonyeo.github.io/all-por/sitemap.xml
- ✅ robots.txt 접근 가능한지: https://jonyeo.github.io/all-por/robots.txt

## 🔄 업데이트 방법

코드를 수정한 후:

```bash
git add .
git commit -m "업데이트 내용 설명"
git push
```

GitHub Pages는 자동으로 재배포됩니다 (1-2분 소요).

## 📝 참고사항

- GitHub Pages는 **무료**로 제공됩니다
- 저장소가 **Public**이면 무료, **Private**이면 유료 플랜 필요
- 사이트는 `https://[사용자명].github.io/[저장소명]/` 형식으로 접근 가능
- Google 검색에 노출되려면 **수일~수주**가 걸릴 수 있습니다

## 🆘 문제 해결

### 사이트가 404 에러가 나는 경우

1. GitHub Pages 설정 확인 (Settings → Pages)
2. Branch가 `main`으로 설정되어 있는지 확인
3. `index.html` 파일이 루트에 있는지 확인

### 사이트맵이 인식되지 않는 경우

1. sitemap.xml 파일이 루트에 있는지 확인
2. URL이 정확한지 확인: `https://jonyeo.github.io/all-por/sitemap.xml`
3. 사이트맵 형식이 올바른지 확인

### Google Search Console 소유권 확인 실패

1. HTML 파일/태그가 올바른 위치에 있는지 확인
2. GitHub에 푸시가 완료되었는지 확인
3. 몇 분 기다린 후 다시 시도

