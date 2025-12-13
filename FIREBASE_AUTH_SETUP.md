# Firebase 인증 설정 가이드

## 📋 익명 인증 활성화

### 1. Firebase Console 접속
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택: **asdf-ecfe3**

### 2. Authentication 메뉴로 이동
1. 왼쪽 사이드바에서 **"Authentication"** 클릭
2. 아직 시작하지 않았다면 **"시작하기"** 버튼 클릭

### 3. 익명 인증 활성화
1. Authentication 페이지 상단의 **"Sign-in method"** 탭 클릭
2. 제공업체 목록에서 **"익명"** 찾기
3. **"익명"** 클릭
4. **"사용 설정"** 토글을 **ON**으로 변경
5. **"저장"** 버튼 클릭

### 4. 확인
- "익명" 항목 옆에 **"사용 설정됨"** 표시가 나타나면 완료
- 이제 앱에서 익명 인증을 사용할 수 있습니다

---

## 🔐 Google 로그인 활성화

### 1. Authentication 메뉴로 이동
1. Firebase Console에서 **"Authentication"** 클릭
2. **"Sign-in method"** 탭 클릭

### 2. Google 로그인 활성화
1. 제공업체 목록에서 **"Google"** 찾기
2. **"Google"** 클릭
3. **"사용 설정"** 토글을 **ON**으로 변경
4. **프로젝트 지원 이메일** 선택 (기본값 사용 가능)
5. **"저장"** 버튼 클릭

### 3. OAuth 동의 화면 설정 (필수)
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 **"asdf-ecfe3"** 선택
3. 왼쪽 메뉴에서 **"API 및 서비스"** > **"OAuth 동의 화면"** 클릭
4. 사용자 유형 선택: **"외부"** 선택 후 **"만들기"**
5. 앱 정보 입력:
   - **앱 이름**: 나만의 도서관 (또는 원하는 이름)
   - **사용자 지원 이메일**: 본인 이메일
   - **앱 로고**: 선택사항
   - **앱 도메인**: `jonyeo.github.io` (GitHub Pages 도메인)
   - **개발자 연락처 정보**: 본인 이메일
6. **"저장 후 계속"** 클릭
7. **범위** 화면에서 **"저장 후 계속"** 클릭
8. **테스트 사용자** 화면에서 (선택사항) **"저장 후 계속"** 클릭
9. **요약** 화면에서 **"대시보드로 돌아가기"** 클릭

### 4. 승인된 리디렉션 URI 추가
1. Firebase Console > Authentication > Sign-in method > Google
2. **승인된 리디렉션 URI** 섹션 확인
3. 다음 URI가 자동으로 추가되어 있어야 함:
   - `https://asdf-ecfe3.firebaseapp.com/__/auth/handler`
   - `https://jonyeo.github.io/__/auth/handler` (GitHub Pages 배포 시)

### 5. 확인
- "Google" 항목 옆에 **"사용 설정됨"** 표시가 나타나면 완료
- 이제 앱에서 Google 로그인을 사용할 수 있습니다

## 🔍 스크린샷 가이드

```
Firebase Console
├── 프로젝트: asdf-ecfe3
├── Authentication
│   ├── Sign-in method 탭
│   │   ├── 익명 (Anonymous)
│   │   │   ├── 사용 설정: ON ✅
│   │   │   └── 저장 버튼
```

## ✅ 완료 확인

브라우저 콘솔에서 다음 메시지를 확인하세요:
- `✅ Firebase 초기화 완료`
- `📊 프로젝트: asdf-ecfe3`

익명 인증이 활성화되면 사용자가 자동으로 로그인되어 도서관을 공유할 수 있습니다.

## 🆘 문제 해결

### 익명 인증이 작동하지 않는 경우
1. Firebase Console에서 "익명" 인증이 활성화되어 있는지 확인
2. 브라우저 콘솔에서 오류 메시지 확인
3. Firestore 보안 규칙이 올바르게 설정되어 있는지 확인

### 보안 규칙 확인
Firestore 규칙에서 `request.auth != null`이 작동하려면 익명 인증이 활성화되어 있어야 합니다.

