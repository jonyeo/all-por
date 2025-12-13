/**
 * Firebase 기반 스토리지 관리
 * localStorage와 호환되도록 설계
 */

// Firebase가 활성화되어 있는지 확인
const isFirebaseEnabled = () => {
    return window.firebaseEnabled === true && window.firestore && window.firebaseAuth;
};

// 익명 인증
async function authenticateAnonymously() {
    if (!isFirebaseEnabled()) return null;
    
    try {
        const { signInAnonymously } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        const user = await signInAnonymously(window.firebaseAuth);
        return user;
    } catch (error) {
        console.error('익명 인증 오류:', error);
        return null;
    }
}

// Google 로그인
async function signInWithGoogle() {
    if (!isFirebaseEnabled()) {
        alert('Firebase가 초기화되지 않았습니다.');
        return null;
    }
    
    try {
        const { GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        const provider = new GoogleAuthProvider();
        
        // 추가 스코프 요청 (선택사항)
        provider.addScope('profile');
        provider.addScope('email');
        
        const result = await signInWithPopup(window.firebaseAuth, provider);
        const user = result.user;
        
        console.log('Google 로그인 성공:', user.email);
        return user;
    } catch (error) {
        console.error('Google 로그인 오류:', error);
        
        // 사용자가 팝업을 닫은 경우
        if (error.code === 'auth/popup-closed-by-user') {
            console.log('사용자가 로그인 팝업을 닫았습니다.');
        } else {
            alert('Google 로그인에 실패했습니다: ' + error.message);
        }
        return null;
    }
}

// 로그아웃
async function signOut() {
    if (!isFirebaseEnabled()) return;
    
    try {
        const { signOut: firebaseSignOut } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        await firebaseSignOut(window.firebaseAuth);
        console.log('로그아웃 완료');
    } catch (error) {
        console.error('로그아웃 오류:', error);
    }
}

// 현재 사용자 가져오기
function getCurrentAuthUser() {
    if (!isFirebaseEnabled()) return null;
    return window.firebaseAuth.currentUser;
}

// 로그인 상태 확인
function isAuthenticated() {
    if (!isFirebaseEnabled()) return false;
    return window.firebaseAuth.currentUser !== null;
}

// 현재 사용자 ID 가져오기 (Firebase 또는 localStorage)
async function getCurrentUserId() {
    if (isFirebaseEnabled()) {
        await authenticateAnonymously();
        const user = window.firebaseAuth.currentUser;
        if (user) {
            return user.uid;
        }
    }
    // Firebase가 없으면 localStorage 사용
    return getLibraryId();
}

// ===================================
// 도서관 정보 관련 함수
// ===================================

/**
 * 도서관 정보 가져오기
 */
async function getLibraryInfo() {
    if (isFirebaseEnabled()) {
        try {
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const userId = await getCurrentUserId();
            const libraryDoc = await getDoc(doc(window.firestore, 'libraries', userId));
            
            if (libraryDoc.exists()) {
                return libraryDoc.data();
            }
        } catch (error) {
            console.error('Firebase 읽기 오류:', error);
        }
    }
    
    // Firebase 실패 시 localStorage 사용
    const data = localStorage.getItem(STORAGE_KEYS.LIBRARY_INFO);
    return data ? JSON.parse(data) : {
        name: '나만의 도서관',
        description: '',
        avatar: '📚',
        visibility: 'public',
        createdAt: Date.now()
    };
}

/**
 * 도서관 정보 저장하기
 */
async function saveLibraryInfo(info) {
    const updatedInfo = {
        ...info,
        updatedAt: Date.now()
    };
    
    if (isFirebaseEnabled()) {
        try {
            const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const userId = await getCurrentUserId();
            await setDoc(doc(window.firestore, 'libraries', userId), {
                ...updatedInfo,
                id: userId,
                createdAt: updatedInfo.createdAt || Date.now()
            }, { merge: true });
            
            // 등록부에도 업데이트
            await registerLibraryInRegistry(updatedInfo.name || '나만의 도서관');
            return;
        } catch (error) {
            console.error('Firebase 저장 오류:', error);
        }
    }
    
    // Firebase 실패 시 localStorage 사용
    const currentInfo = await getLibraryInfo();
    localStorage.setItem(STORAGE_KEYS.LIBRARY_INFO, JSON.stringify({
        ...currentInfo,
        ...updatedInfo
    }));
}

// ===================================
// 책 관련 함수
// ===================================

/**
 * 모든 책 가져오기
 */
async function getAllBooks() {
    if (isFirebaseEnabled()) {
        try {
            const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const userId = await getCurrentUserId();
            const booksSnapshot = await getDocs(
                query(collection(window.firestore, 'libraries', userId, 'books'), orderBy('createdAt', 'desc'))
            );
            
            return booksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Firebase 책 읽기 오류:', error);
        }
    }
    
    // Firebase 실패 시 localStorage 사용
    const data = localStorage.getItem(STORAGE_KEYS.BOOKS);
    return data ? JSON.parse(data) : [];
}

/**
 * 책 추가하기
 */
async function addBook(bookData) {
    const newBook = {
        ...bookData,
        likes: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    if (isFirebaseEnabled()) {
        try {
            const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const userId = await getCurrentUserId();
            const docRef = await addDoc(collection(window.firestore, 'libraries', userId, 'books'), newBook);
            return { id: docRef.id, ...newBook };
        } catch (error) {
            console.error('Firebase 책 추가 오류:', error);
        }
    }
    
    // Firebase 실패 시 localStorage 사용
    const books = await getAllBooks();
    newBook.id = generateId();
    books.push(newBook);
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    return newBook;
}

/**
 * 책 업데이트하기
 */
async function updateBook(bookId, updates) {
    if (isFirebaseEnabled()) {
        try {
            const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const userId = await getCurrentUserId();
            await updateDoc(doc(window.firestore, 'libraries', userId, 'books', bookId), {
                ...updates,
                updatedAt: Date.now()
            });
            return;
        } catch (error) {
            console.error('Firebase 책 업데이트 오류:', error);
        }
    }
    
    // Firebase 실패 시 localStorage 사용
    const books = await getAllBooks();
    const index = books.findIndex(b => b.id === bookId);
    if (index !== -1) {
        books[index] = { ...books[index], ...updates, updatedAt: Date.now() };
        localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    }
}

/**
 * 책 삭제하기
 */
async function deleteBook(bookId) {
    if (isFirebaseEnabled()) {
        try {
            const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const userId = await getCurrentUserId();
            await deleteDoc(doc(window.firestore, 'libraries', userId, 'books', bookId));
            return;
        } catch (error) {
            console.error('Firebase 책 삭제 오류:', error);
        }
    }
    
    // Firebase 실패 시 localStorage 사용
    const books = await getAllBooks();
    const filtered = books.filter(b => b.id !== bookId);
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(filtered));
}

/**
 * ID로 책 가져오기
 */
async function getBookById(bookId) {
    const books = await getAllBooks();
    return books.find(b => b.id === bookId) || null;
}

// ===================================
// 도서관 등록부 관련 함수
// ===================================

/**
 * 도서관 등록부에 등록
 */
async function registerLibraryInRegistry(libraryName) {
    if (isFirebaseEnabled()) {
        try {
            const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const userId = await getCurrentUserId();
            const libraryInfo = await getLibraryInfo();
            const books = await getAllBooks();
            const stats = await getStats();
            
            await setDoc(doc(window.firestore, 'users', userId), {
                id: userId,
                name: libraryName || libraryInfo.name || '나만의 도서관',
                description: libraryInfo.description || '',
                avatar: libraryInfo.avatar || '📚',
                bookCount: stats.totalBooks,
                totalLikes: stats.totalLikes,
                updatedAt: Date.now()
            }, { merge: true });
            return;
        } catch (error) {
            console.error('Firebase 등록부 업데이트 오류:', error);
        }
    }
    
    // Firebase 실패 시 localStorage 사용
    const libraryId = getLibraryId();
    const registry = getAllLibrariesRegistry();
    const libraryInfo = await getLibraryInfo();
    const books = await getAllBooks();
    const stats = await getStats();
    
    registry[libraryId] = {
        id: libraryId,
        name: libraryName || libraryInfo.name || '나만의 도서관',
        description: libraryInfo.description || '',
        avatar: libraryInfo.avatar || '📚',
        bookCount: stats.totalBooks,
        totalLikes: stats.totalLikes
    };
    
    localStorage.setItem(STORAGE_KEYS.ALL_LIBRARIES, JSON.stringify(registry));
}

/**
 * 도서관 이름으로 검색
 */
async function searchLibrariesByName(query) {
    if (isFirebaseEnabled()) {
        try {
            const { collection, getDocs, query as firestoreQuery, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const lowerQuery = query.toLowerCase();
            
            // Firestore는 대소문자 구분 검색이 제한적이므로 모든 문서를 가져와서 필터링
            const usersSnapshot = await getDocs(collection(window.firestore, 'users'));
            const libraries = usersSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(lib => 
                    lib.name.toLowerCase().includes(lowerQuery) ||
                    (lib.description && lib.description.toLowerCase().includes(lowerQuery))
                );
            
            return libraries;
        } catch (error) {
            console.error('Firebase 검색 오류:', error);
        }
    }
    
    // Firebase 실패 시 localStorage 사용
    const registry = getAllLibrariesRegistry();
    const lowerQuery = query.toLowerCase();
    
    return Object.values(registry).filter(lib => 
        lib.name.toLowerCase().includes(lowerQuery) ||
        (lib.description && lib.description.toLowerCase().includes(lowerQuery))
    );
}

/**
 * 도서관 ID로 도서관 정보 가져오기
 */
async function getLibraryById(libraryId) {
    if (isFirebaseEnabled()) {
        try {
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const libraryDoc = await getDoc(doc(window.firestore, 'users', libraryId));
            
            if (libraryDoc.exists()) {
                return { id: libraryDoc.id, ...libraryDoc.data() };
            }
        } catch (error) {
            console.error('Firebase 도서관 정보 읽기 오류:', error);
        }
    }
    
    // Firebase 실패 시 localStorage 사용
    const registry = getAllLibrariesRegistry();
    return registry[libraryId] || null;
}

/**
 * 공유된 도서관 데이터 가져오기
 */
async function getSharedLibraryData(libraryId) {
    if (isFirebaseEnabled()) {
        try {
            const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            // 도서관 정보 가져오기
            const libraryDoc = await getDoc(doc(window.firestore, 'libraries', libraryId));
            const libraryInfo = libraryDoc.exists() ? libraryDoc.data() : null;
            
            if (!libraryInfo) {
                // users 컬렉션에서도 시도
                const userDoc = await getDoc(doc(window.firestore, 'users', libraryId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    libraryInfo = {
                        name: userData.name,
                        description: userData.description,
                        avatar: userData.avatar,
                        visibility: 'public'
                    };
                }
            }
            
            // 책 목록 가져오기
            const booksSnapshot = await getDocs(
                query(collection(window.firestore, 'libraries', libraryId, 'books'), orderBy('createdAt', 'desc'))
            );
            const books = booksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            return {
                libraryInfo: libraryInfo || {
                    name: '알 수 없는 도서관',
                    visibility: 'public'
                },
                books: books,
                createdAt: Date.now()
            };
        } catch (error) {
            console.error('Firebase 공유 도서관 읽기 오류:', error);
        }
    }
    
    // Firebase 실패 시 localStorage 사용
    const sharedData = localStorage.getItem(`shared_library_${libraryId}`);
    return sharedData ? JSON.parse(sharedData) : null;
}

// ===================================
// 통계 관련 함수
// ===================================

/**
 * 통계 가져오기
 */
async function getStats() {
    const books = await getAllBooks();
    const likedBooks = getLikedBooks();
    
    const totalBooks = books.length;
    const readBooks = books.filter(b => b.readingStatus === 'completed').length;
    const totalPages = books.reduce((sum, b) => sum + (b.pages || 0), 0);
    const avgRating = totalBooks > 0 
        ? (books.reduce((sum, b) => sum + (b.rating || 0), 0) / totalBooks).toFixed(1)
        : 0;
    
    const categoryCounts = {};
    books.forEach(book => {
        const catId = book.categoryId || 0;
        categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
    });
    
    const totalLikes = books.reduce((sum, b) => sum + (b.likes || 0), 0);
    
    const readingStatusCounts = {
        not_started: books.filter(b => b.readingStatus === 'not_started' || !b.readingStatus).length,
        reading: books.filter(b => b.readingStatus === 'reading').length,
        completed: books.filter(b => b.readingStatus === 'completed').length
    };
    
    return {
        totalBooks,
        readBooks,
        totalPages,
        avgRating: parseFloat(avgRating),
        categoryCounts,
        totalLikes,
        readingStatusCounts
    };
}

// localStorage에서 가져오는 함수들 (호환성 유지)
function getLikedBooks() {
    const data = localStorage.getItem(STORAGE_KEYS.LIKES);
    return data ? JSON.parse(data) : [];
}

function toggleLike(bookId) {
    const likes = getLikedBooks();
    const index = likes.indexOf(bookId);
    
    if (index === -1) {
        likes.push(bookId);
        const book = getBookById(bookId);
        if (book) {
            updateBook(bookId, { likes: (book.likes || 0) + 1 });
        }
    } else {
        likes.splice(index, 1);
        const book = getBookById(bookId);
        if (book) {
            updateBook(bookId, { likes: Math.max(0, (book.likes || 0) - 1) });
        }
    }
    
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likes));
    return index === -1;
}

function isBookLiked(bookId) {
    const likes = getLikedBooks();
    return likes.includes(bookId);
}

// 기타 유틸리티 함수들 (storage.js에서 가져옴)
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getLibraryId() {
    let libraryId = localStorage.getItem(STORAGE_KEYS.LIBRARY_ID);
    if (!libraryId) {
        libraryId = generateId();
        localStorage.setItem(STORAGE_KEYS.LIBRARY_ID, libraryId);
    }
    return libraryId;
}

function getAllLibrariesRegistry() {
    const data = localStorage.getItem(STORAGE_KEYS.ALL_LIBRARIES);
    return data ? JSON.parse(data) : {};
}

// storage.js의 다른 함수들도 필요하면 추가
function getRecentBooks(limit = 8) {
    return getAllBooks().then(books => 
        books.slice(0, limit)
    );
}

function getSimilarBooks(bookId, limit = 4) {
    return getBookById(bookId).then(currentBook => {
        if (!currentBook) return [];
        
        return getAllBooks().then(books => 
            books
                .filter(b => 
                    b.id !== bookId && 
                    (b.categoryId === currentBook.categoryId || 
                     b.relatedBooks?.includes(bookId))
                )
                .slice(0, limit)
        );
    });
}

function searchBooks(query) {
    return getAllBooks().then(books => {
        const lowerQuery = query.toLowerCase();
        return books.filter(book =>
            book.title.toLowerCase().includes(lowerQuery) ||
            book.author.toLowerCase().includes(lowerQuery) ||
            book.publisher?.toLowerCase().includes(lowerQuery) ||
            book.category?.toLowerCase().includes(lowerQuery) ||
            book.summary?.toLowerCase().includes(lowerQuery)
        );
    });
}

