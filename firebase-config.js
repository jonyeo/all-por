// Firebase 설정 파일
// Firebase Console에서 가져온 설정 값

// ============================================
// Firebase 설정
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyCaXQAf5SjXQUvayR7Oc6-qp5t5eWdINqY",
    authDomain: "asdf-ecfe3.firebaseapp.com",
    projectId: "asdf-ecfe3",
    storageBucket: "asdf-ecfe3.firebasestorage.app",
    messagingSenderId: "954072167417",
    appId: "1:954072167417:web:29790fe7e30be3e9db8328",
    measurementId: "G-XV5Q0XKG7K"
};

// Firebase 초기화 (CDN 모듈 방식)
(async function() {
    try {
        // Firebase App 초기화
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        const { getAnalytics } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js');
        
        // Firebase 앱 초기화
        window.firebaseApp = initializeApp(firebaseConfig);
        window.firestore = getFirestore(window.firebaseApp);
        window.firebaseAuth = getAuth(window.firebaseApp);
        
        // 인증 상태 변경 감지
        window.firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                console.log('✅ 사용자 로그인:', user.email || '익명 사용자');
                window.currentUser = user;
                // 로그인 상태 변경 이벤트 발생
                window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
            } else {
                console.log('👤 사용자 로그아웃');
                window.currentUser = null;
                window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: null } }));
            }
        });
        
        // Analytics 초기화 (브라우저 환경에서만, 로컬 환경 제외)
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            try {
                window.analytics = getAnalytics(window.firebaseApp);
                console.log('✅ Firebase Analytics 초기화 완료');
            } catch (analyticsError) {
                console.warn('Analytics 초기화 실패 (로컬 환경일 수 있음):', analyticsError);
            }
        }
        
        window.firebaseEnabled = true;
        console.log('✅ Firebase 초기화 완료');
        console.log('📊 프로젝트:', firebaseConfig.projectId);
    } catch (error) {
        console.error('⚠️ Firebase 초기화 실패:', error);
        console.log('localStorage 모드로 전환합니다.');
        window.firebaseEnabled = false;
    }
})();

