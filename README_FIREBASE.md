# Firebase 설정 완료 가이드

## ✅ 완료된 작업

1. Firebase SDK 통합
2. Firestore 데이터베이스 구조 설계
3. localStorage와 호환되는 하이브리드 시스템 구현
4. 공유 기능 Firebase 기반으로 업데이트

## 📋 다음 단계

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: "my-library")
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### 2. 웹 앱 등록

1. Firebase Console에서 "웹" 아이콘 클릭 (</>)
2. 앱 닉네임 입력 (예: "도서관 앱")
3. "Firebase Hosting도 설정" 체크 해제 (GitHub Pages 사용)
4. "앱 등록" 클릭
5. Firebase 설정 코드 복사

### 3. Firestore 데이터베이스 설정

1. Firebase Console에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. "프로덕션 모드에서 시작" 선택
4. 위치 선택 (asia-northeast3 - 서울 권장)
5. "사용 설정" 클릭

### 4. 보안 규칙 설정

Firestore Console > 규칙 탭에서 다음 규칙 추가:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 도서관 정보 - 읽기 공개, 쓰기는 소유자만
    match /libraries/{libraryId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == libraryId;
    }
    
    // 책 정보 - 읽기 공개, 쓰기는 소유자만
    match /libraries/{libraryId}/books/{bookId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == libraryId;
    }
    
    // 사용자 정보 (도서관 검색용)
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. 인증 설정 (익명 인증)

1. Firebase Console에서 "Authentication" 클릭
2. "시작하기" 클릭
3. "익명" 인증 방법 활성화
4. "저장" 클릭

### 6. 설정 파일 생성

`firebase-config.js` 파일을 열고 Firebase Console에서 복사한 설정 값으로 교체:

```javascript
const firebaseConfig = {
  apiKey: "실제_API_KEY",
  authDomain: "실제_PROJECT_ID.firebaseapp.com",
  projectId: "실제_PROJECT_ID",
  storageBucket: "실제_PROJECT_ID.appspot.com",
  messagingSenderId: "실제_MESSAGING_SENDER_ID",
  appId: "실제_APP_ID"
};

// Firebase 초기화
(async function() {
    try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        
        window.firebaseApp = initializeApp(firebaseConfig);
        window.firestore = getFirestore(window.firebaseApp);
        window.firebaseAuth = getAuth(window.firebaseApp);
        window.firebaseEnabled = true;
        
        console.log('Firebase 초기화 완료');
    } catch (error) {
        console.warn('Firebase 초기화 실패:', error);
        window.firebaseEnabled = false;
    }
})();
```

## 🎯 작동 방식

### Firebase 모드 (firebase-config.js가 설정된 경우)
- 모든 데이터가 Firestore에 저장
- 실시간 동기화
- 다른 사용자와 즉시 공유 가능
- URL로 바로 접근 가능

### localStorage 모드 (firebase-config.js가 없는 경우)
- 기존처럼 localStorage 사용
- JSON 파일 다운로드/업로드로 공유
- Firebase 설정 없이도 작동

## 📊 데이터 구조

### Firestore 구조
```
libraries/
  {userId}/
    - name: "도서관 이름"
    - description: "설명"
    - avatar: "📚"
    - visibility: "public"
    books/
      {bookId}/
        - title: "책 제목"
        - author: "저자"
        - category: "알라딘 카테고리"
        - visibility: "public"
        ...

users/
  {userId}/
    - name: "도서관 이름"
    - bookCount: 10
    - totalLikes: 5
    ...
```

## 🔒 보안

- 읽기: 모든 사용자 가능 (공개 도서관)
- 쓰기: 소유자만 가능 (인증 필요)
- 익명 인증으로 자동 로그인

## 🚀 배포

1. `firebase-config.js` 파일을 GitHub에 커밋 (공개되어도 안전)
2. GitHub Pages에 배포
3. 다른 사용자가 URL로 접근하면 자동으로 공유된 도서관 표시

## ⚠️ 주의사항

- Firebase 무료 티어 제한:
  - 일일 읽기: 50,000회
  - 일일 쓰기: 20,000회
  - 일일 삭제: 20,000회
- 초과 시 유료 플랜 필요

## 🆘 문제 해결

### Firebase가 작동하지 않는 경우
1. 브라우저 콘솔에서 오류 확인
2. `firebase-config.js` 파일이 올바른지 확인
3. Firestore 보안 규칙 확인
4. 익명 인증이 활성화되어 있는지 확인

### localStorage 모드로 전환
- `firebase-config.js` 파일을 삭제하거나 이름 변경
- 자동으로 localStorage 모드로 전환

