# Firebase 설정 가이드

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: "my-library")
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

## 2. 웹 앱 등록

1. Firebase Console에서 "웹" 아이콘 클릭 (</>)
2. 앱 닉네임 입력 (예: "도서관 앱")
3. "Firebase Hosting도 설정" 체크 해제 (GitHub Pages 사용)
4. "앱 등록" 클릭
5. Firebase 설정 코드 복사 (아래와 유사한 형태)

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 3. Firestore 데이터베이스 설정

1. Firebase Console에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. "프로덕션 모드에서 시작" 선택 (나중에 보안 규칙 설정)
4. 위치 선택 (asia-northeast3 - 서울 권장)
5. "사용 설정" 클릭

## 4. 보안 규칙 설정

Firestore Console > 규칙 탭에서 다음 규칙 추가:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 도서관 정보 - 읽기 공개, 쓰기는 소유자만
    match /libraries/{libraryId} {
      allow read: if true; // 모든 사용자가 읽기 가능
      allow write: if request.auth != null && request.auth.uid == libraryId;
    }
    
    // 책 정보 - 읽기 공개, 쓰기는 소유자만
    match /libraries/{libraryId}/books/{bookId} {
      allow read: if true; // 모든 사용자가 읽기 가능
      allow write: if request.auth != null && request.auth.uid == libraryId;
    }
    
    // 사용자 정보
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 5. 인증 설정 (익명 인증)

1. Firebase Console에서 "Authentication" 클릭
2. "시작하기" 클릭
3. "익명" 인증 방법 활성화
4. "저장" 클릭

## 6. 설정 파일 생성

`firebase-config.js` 파일을 생성하고 Firebase 설정 코드를 입력하세요.

## 7. GitHub Pages 배포 시 환경 변수

Firebase 설정은 클라이언트에 노출되어도 안전합니다. (보안 규칙으로 보호)

