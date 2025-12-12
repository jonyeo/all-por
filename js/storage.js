/**
 * 나만의 도서관 - 로컬 스토리지 관리
 * (나중에 Firebase로 쉽게 교체 가능하도록 설계)
 */

// 한국십진분류법 카테고리
const KDC_CATEGORIES = {
    0: { name: '총류', icon: '📚', description: '총류, 문헌정보학, 백과사전' },
    1: { name: '철학', icon: '🤔', description: '철학, 심리학, 윤리학' },
    2: { name: '종교', icon: '🙏', description: '종교, 신화, 신학' },
    3: { name: '자연과학', icon: '🔬', description: '수학, 물리학, 화학, 생물학' },
    4: { name: '기술과학', icon: '⚙️', description: '의학, 공학, 농학, 가정학' },
    5: { name: '예술', icon: '🎨', description: '예술, 음악, 미술, 체육' },
    6: { name: '언어', icon: '💬', description: '언어학, 한국어, 영어' },
    7: { name: '문학', icon: '✍️', description: '한국문학, 세계문학' },
    8: { name: '역사', icon: '🏛️', description: '역사, 지리, 전기' }
};

// 스토리지 키
const STORAGE_KEYS = {
    BOOKS: 'library_books',
    LIBRARY_INFO: 'library_info',
    LIKES: 'library_likes',
    SETTINGS: 'library_settings',
    LIBRARY_ID: 'library_id' // 고유 도서관 ID
};

// 도서관 ID 생성/가져오기
function getLibraryId() {
    let libraryId = localStorage.getItem(STORAGE_KEYS.LIBRARY_ID);
    if (!libraryId) {
        libraryId = 'lib_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(STORAGE_KEYS.LIBRARY_ID, libraryId);
    }
    return libraryId;
}

// 공유 가능한 도서관 URL 생성
function getShareableLibraryUrl() {
    const libraryId = getLibraryId();
    const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
    return `${baseUrl}index.html?library=${libraryId}`;
}

/**
 * 책 데이터 구조
 * {
 *   id: string,
 *   title: string,
 *   author: string,
 *   publisher: string,
 *   image: string (URL or base64),
 *   category: number (0-8, KDC),
 *   rating: number (1-5),
 *   summary: string,
 *   tableOfContents: string[],
 *   relatedBooks: string[] (book IDs),
 *   likes: number,
 *   readingStatus: string ('not_started' | 'reading' | 'completed'),
 *   readingStartDate: timestamp,
 *   readingEndDate: timestamp,
 *   pages: number,
 *   createdAt: timestamp,
 *   updatedAt: timestamp
 * }
 */

// ===================================
// 책 관련 함수
// ===================================

/**
 * 모든 책 가져오기
 */
function getAllBooks() {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKS);
    return data ? JSON.parse(data) : [];
}

/**
 * 책 ID로 가져오기
 */
function getBookById(id) {
    const books = getAllBooks();
    return books.find(book => book.id === id);
}

/**
 * 책 추가하기
 */
function addBook(bookData) {
    const books = getAllBooks();
    const newBook = {
        id: generateId(),
        ...bookData,
        likes: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    books.push(newBook);
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    return newBook;
}

/**
 * 책 수정하기
 */
function updateBook(id, updates) {
    const books = getAllBooks();
    const index = books.findIndex(book => book.id === id);
    if (index !== -1) {
        books[index] = {
            ...books[index],
            ...updates,
            updatedAt: Date.now()
        };
        localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
        return books[index];
    }
    return null;
}

/**
 * 책 삭제하기
 */
function deleteBook(id) {
    const books = getAllBooks();
    const filtered = books.filter(book => book.id !== id);
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(filtered));
    return true;
}

/**
 * 카테고리별 책 가져오기
 */
function getBooksByCategory(categoryId) {
    const books = getAllBooks();
    return books.filter(book => book.category === categoryId);
}

/**
 * 최근 추가된 책 가져오기
 */
function getRecentBooks(limit = 8) {
    const books = getAllBooks();
    return books
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
}

/**
 * 인기 책 가져오기 (좋아요 순)
 */
function getPopularBooks(limit = 10) {
    const books = getAllBooks();
    return books
        .sort((a, b) => b.likes - a.likes)
        .slice(0, limit);
}

/**
 * 책 검색하기
 */
function searchBooks(query) {
    const books = getAllBooks();
    const lowerQuery = query.toLowerCase();
    return books.filter(book => 
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.publisher?.toLowerCase().includes(lowerQuery) ||
        KDC_CATEGORIES[book.category]?.name.includes(query)
    );
}

/**
 * 비슷한 책 찾기 (같은 카테고리 또는 같은 작가)
 */
function getSimilarBooks(bookId, limit = 4) {
    const book = getBookById(bookId);
    if (!book) return [];
    
    const books = getAllBooks();
    return books
        .filter(b => b.id !== bookId && (b.category === book.category || b.author === book.author))
        .slice(0, limit);
}

// ===================================
// 좋아요 관련 함수
// ===================================

/**
 * 좋아요한 책 목록 가져오기
 */
function getLikedBooks() {
    const data = localStorage.getItem(STORAGE_KEYS.LIKES);
    return data ? JSON.parse(data) : [];
}

/**
 * 책 좋아요 토글
 */
function toggleLike(bookId) {
    const likes = getLikedBooks();
    const index = likes.indexOf(bookId);
    
    if (index === -1) {
        // 좋아요 추가
        likes.push(bookId);
        const book = getBookById(bookId);
        if (book) {
            updateBook(bookId, { likes: (book.likes || 0) + 1 });
        }
    } else {
        // 좋아요 제거
        likes.splice(index, 1);
        const book = getBookById(bookId);
        if (book) {
            updateBook(bookId, { likes: Math.max(0, (book.likes || 0) - 1) });
        }
    }
    
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likes));
    return index === -1; // true면 좋아요 추가됨, false면 제거됨
}

/**
 * 책이 좋아요 됐는지 확인
 */
function isBookLiked(bookId) {
    const likes = getLikedBooks();
    return likes.includes(bookId);
}

// ===================================
// 도서관 정보 관련 함수
// ===================================

/**
 * 도서관 정보 가져오기
 */
function getLibraryInfo() {
    const data = localStorage.getItem(STORAGE_KEYS.LIBRARY_INFO);
    return data ? JSON.parse(data) : {
        name: '나만의 도서관',
        description: '',
        avatar: '📚',
        createdAt: Date.now()
    };
}

/**
 * 도서관 정보 저장하기
 */
function saveLibraryInfo(info) {
    localStorage.setItem(STORAGE_KEYS.LIBRARY_INFO, JSON.stringify({
        ...getLibraryInfo(),
        ...info,
        updatedAt: Date.now()
    }));
}

// ===================================
// 설정 관련 함수
// ===================================

/**
 * 설정 가져오기
 */
function getSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
        theme: 'light'
    };
}

/**
 * 설정 저장하기
 */
function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        ...getSettings(),
        ...settings
    }));
}

// ===================================
// 통계 함수
// ===================================

/**
 * 전체 통계 가져오기
 */
function getStats() {
    const books = getAllBooks();
    const categoryCounts = {};
    let totalLikes = 0;
    
    books.forEach(book => {
        // 카테고리별 카운트
        categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
        // 총 좋아요
        totalLikes += book.likes || 0;
    });
    
    return {
        totalBooks: books.length,
        totalLikes,
        categoryCounts
    };
}

// ===================================
// 유틸리티 함수
// ===================================

/**
 * 고유 ID 생성
 */
function generateId() {
    return 'book_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 날짜 포맷팅
 */
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * 이미지를 Base64로 변환
 */
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * 샘플 데이터 추가 (테스트용)
 */
function addSampleBooks() {
    const sampleBooks = [
        {
            title: '데미안',
            author: '헤르만 헤세',
            publisher: '민음사',
            image: '',
            category: 7,
            rating: 5,
            summary: '진정한 자아를 찾아가는 청년 싱클레어의 성장 이야기. 내면의 목소리에 귀 기울이고, 자신만의 길을 찾아가는 여정을 담은 헤세의 대표작.',
            tableOfContents: ['두 세계', '카인', '도둑', '베아트리체', '새는 알에서 나오려고 투쟁한다', '야콥의 싸움', '에바 부인', '종말의 시작'],
            relatedBooks: []
        },
        {
            title: '코스모스',
            author: '칼 세이건',
            publisher: '사이언스북스',
            image: '',
            category: 3,
            rating: 5,
            summary: '우주의 신비와 인류의 위치를 탐구하는 과학 교양서. 별의 탄생부터 생명의 기원까지, 우주와 과학에 대한 경이로운 여행.',
            tableOfContents: ['코스모스의 해변에서', '우주 생명의 푸가', '지상과 천상의 하모니', '천국과 지옥', '붉은 행성을 위한 블루스'],
            relatedBooks: []
        },
        {
            title: '사피엔스',
            author: '유발 하라리',
            publisher: '김영사',
            image: '',
            category: 8,
            rating: 5,
            summary: '인류의 역사를 새로운 시각으로 조명하는 역작. 인지혁명, 농업혁명, 과학혁명을 통해 호모 사피엔스가 어떻게 지구를 지배하게 되었는지 탐구.',
            tableOfContents: ['인지혁명', '농업혁명', '인류의 통합', '과학혁명'],
            relatedBooks: []
        }
    ];
    
    sampleBooks.forEach(book => addBook(book));
}

// 초기화: 책이 없으면 샘플 추가 (개발/테스트용, 나중에 제거)
// if (getAllBooks().length === 0) {
//     addSampleBooks();
// }

