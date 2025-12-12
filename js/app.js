/**
 * 나만의 도서관 - 메인 앱 로직
 */

// ===================================
// 초기화
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkSharedLibrary();
    initPage();
});

// 공유된 도서관 확인
function checkSharedLibrary() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedLibraryId = urlParams.get('library');
    
    if (sharedLibraryId) {
        // 공유된 도서관 모드
        loadSharedLibrary(sharedLibraryId);
    }
}

// 공유된 도서관 로드
function loadSharedLibrary(libraryId) {
    // 도서관 등록부에서 정보 가져오기
    const libraryInfo = getLibraryById(libraryId);
    
    if (!libraryInfo) {
        showToast('도서관을 찾을 수 없습니다', 'error');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    
    // 공유된 도서관 데이터 찾기
    const sharedData = localStorage.getItem(`shared_library_${libraryId}`);
    
    if (sharedData) {
        const data = JSON.parse(sharedData);
        // 공유 모드 표시
        showSharedLibraryMode(data, libraryInfo);
    } else {
        // 공유 데이터가 없으면 현재 도서관 표시
        showToast('공유된 도서관 데이터를 찾을 수 없습니다', 'error');
        setTimeout(() => window.location.href = 'index.html', 2000);
    }
}

// 공유 모드 UI 표시
function showSharedLibraryMode(data, libraryInfo) {
    // 헤더에 공유 모드 표시
    const header = document.querySelector('.main-header');
    if (header) {
        const sharedBadge = document.createElement('div');
        sharedBadge.style.cssText = 'background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;padding:0.8rem 1rem;text-align:center;font-size:0.95rem;box-shadow:0 2px 10px rgba(0,0,0,0.1);';
        sharedBadge.innerHTML = `
            <span style="font-weight:600;">👁️ ${escapeHtml(libraryInfo.name)}의 도서관</span> | 
            <a href="index.html" style="color:white;text-decoration:underline;margin-left:0.5rem;">내 도서관으로 돌아가기</a>
        `;
        header.insertAdjacentElement('afterend', sharedBadge);
    }
    
    // 공유된 도서관의 책 데이터로 교체
    if (data.books && Array.isArray(data.books)) {
        // 임시로 공유된 도서관의 책들을 표시하기 위해
        // 로컬 스토리지에 임시 저장 (뒤로가기 시 복원)
        const originalBooks = getAllBooks();
        localStorage.setItem('_original_books_backup', JSON.stringify(originalBooks));
        localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(data.books));
        
        // 페이지 새로고침하여 공유된 도서관의 책 표시
        if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
            renderRecentBooks();
            renderRankingList();
            updateCategoryCounts();
        }
    }
}

/**
 * 페이지별 초기화
 */
function initPage() {
    const path = window.location.pathname;
    
    // 공통 초기화
    updateStats();
    
    // 메인 페이지
    if (path.endsWith('index.html') || path.endsWith('/') || path === '') {
        renderRecentBooks();
        renderRankingList();
        updateCategoryCounts();
    }
    
    // 책 추가 페이지
    if (path.includes('add-book')) {
        initAddBookPage();
    }
    
    // 책 상세 페이지
    if (path.includes('book-detail')) {
        initBookDetailPage();
    }
    
    // 내 도서관 페이지
    if (path.includes('my-library')) {
        initMyLibraryPage();
    }
    
    // 둘러보기 페이지
    if (path.includes('explore')) {
        initExplorePage();
    }
}

// ===================================
// 테마 관리
// ===================================

function initTheme() {
    const settings = getSettings();
    document.documentElement.setAttribute('data-theme', settings.theme || 'light');
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    saveSettings({ theme: newTheme });
    
    // 버튼 아이콘 변경
    const btn = document.querySelector('.theme-toggle');
    if (btn) {
        btn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
}

// ===================================
// 검색 기능
// ===================================

function toggleSearch() {
    const searchBar = document.getElementById('searchBar');
    searchBar.classList.toggle('active');
    if (searchBar.classList.contains('active')) {
        document.getElementById('searchInput').focus();
    }
}

function handleSearch(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}

function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        window.location.href = `explore.html?search=${encodeURIComponent(query)}`;
    }
}

// ===================================
// 통계 업데이트
// ===================================

function updateStats() {
    const stats = getStats();
    
    const totalBooksEl = document.getElementById('totalBooks');
    const totalLikesEl = document.getElementById('totalLikes');
    
    if (totalBooksEl) {
        animateNumber(totalBooksEl, stats.totalBooks);
    }
    if (totalLikesEl) {
        animateNumber(totalLikesEl, stats.totalLikes);
    }
}

function updateCategoryCounts() {
    const stats = getStats();
    
    for (let i = 0; i <= 8; i++) {
        const el = document.getElementById(`cat-${i}-count`);
        if (el) {
            el.textContent = `${stats.categoryCounts[i] || 0}권`;
        }
    }
}

function animateNumber(element, target) {
    const duration = 1000;
    const start = parseInt(element.textContent) || 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.round(start + (target - start) * eased);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// ===================================
// 최근 책 렌더링
// ===================================

function renderRecentBooks() {
    const container = document.getElementById('recentBooks');
    if (!container) return;
    
    const books = getRecentBooks(8);
    const emptyState = document.getElementById('emptyState');
    
    if (books.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    container.innerHTML = books.map(book => createBookCard(book)).join('');
}

function createBookCard(book) {
    const category = KDC_CATEGORIES[book.category];
    const isLiked = isBookLiked(book.id);
    
    return `
        <div class="book-card" onclick="goToBookDetail('${book.id}')">
            <div class="book-cover">
                ${book.image 
                    ? `<img src="${book.image}" alt="${book.title}">`
                    : `<span>${category?.icon || '📖'}</span>`
                }
            </div>
            <div class="book-info">
                <h3 class="book-title">${escapeHtml(book.title)}</h3>
                <p class="book-author">${escapeHtml(book.author)}</p>
                <div class="book-meta">
                    <span class="book-category">${category?.name || '기타'}</span>
                    <span class="book-likes">
                        ${isLiked ? '❤️' : '🤍'} ${book.likes || 0}
                    </span>
                </div>
            </div>
        </div>
    `;
}

// ===================================
// 랭킹 리스트 렌더링
// ===================================

function renderRankingList() {
    const container = document.getElementById('rankingList');
    if (!container) return;
    
    const books = getPopularBooks(5);
    
    if (books.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>아직 등록된 책이 없습니다</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = books.map((book, index) => createRankingItem(book, index + 1)).join('');
}

function createRankingItem(book, rank) {
    const category = KDC_CATEGORIES[book.category];
    let rankClass = '';
    if (rank === 1) rankClass = 'gold';
    else if (rank === 2) rankClass = 'silver';
    else if (rank === 3) rankClass = 'bronze';
    
    return `
        <div class="ranking-item" onclick="goToBookDetail('${book.id}')">
            <span class="ranking-number ${rankClass}">${rank}</span>
            <div class="ranking-cover">
                ${book.image 
                    ? `<img src="${book.image}" alt="${book.title}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`
                    : `<span style="display:flex;align-items:center;justify-content:center;height:100%;font-size:2rem;">${category?.icon || '📖'}</span>`
                }
            </div>
            <div class="ranking-info">
                <div class="ranking-title">${escapeHtml(book.title)}</div>
                <div class="ranking-author">${escapeHtml(book.author)}</div>
            </div>
            <div class="ranking-stats">
                <span>❤️ ${book.likes || 0}</span>
                <span>⭐ ${book.rating || '-'}</span>
            </div>
        </div>
    `;
}

// ===================================
// 네비게이션
// ===================================

function goToBookDetail(bookId) {
    window.location.href = `book-detail.html?id=${bookId}`;
}

// ===================================
// 도서관 검색
// ===================================

function searchLibrary() {
    const query = document.getElementById('librarySearchInput').value.trim();
    const resultsContainer = document.getElementById('librarySearchResults');
    
    if (!query) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    // 도서관 이름으로 검색
    const results = searchLibrariesByName(query);
    const currentLibraryId = getLibraryId();
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div style="text-align:center;padding:2rem;color:var(--text-secondary);">
                <span style="font-size:3rem;display:block;margin-bottom:1rem;">🔍</span>
                <p>'${escapeHtml(query)}'에 해당하는 도서관을 찾을 수 없습니다.</p>
                <p style="font-size:0.9rem;margin-top:0.5rem;">도서관 이름을 정확히 입력해주세요.</p>
            </div>
        `;
        return;
    }
    
    // 검색 결과 표시
    let resultsHtml = '<div style="display:flex;flex-direction:column;gap:1rem;margin-top:1.5rem;">';
    
    results.forEach(lib => {
        const isMyLibrary = lib.id === currentLibraryId;
        resultsHtml += `
            <div class="ranking-item" style="cursor:pointer;transition:all 0.3s;" 
                 onclick="visitLibrary('${lib.id}')"
                 onmouseover="this.style.transform='translateX(5px)'"
                 onmouseout="this.style.transform='translateX(0)'">
                <span style="font-size:2rem;">${lib.avatar || '📚'}</span>
                <div class="ranking-info" style="flex:1;">
                    <div class="ranking-title">${escapeHtml(lib.name)} ${isMyLibrary ? '<span style="color:var(--accent-primary);font-size:0.8rem;">(내 도서관)</span>' : ''}</div>
                    <div class="ranking-author">
                        ${lib.description || '설명 없음'}
                    </div>
                    <div class="ranking-stats" style="margin-top:0.5rem;">
                        <span>📚 ${lib.bookCount || 0}권</span>
                        <span>❤️ ${lib.totalLikes || 0}</span>
                    </div>
                </div>
                <button class="btn btn-primary btn-small" onclick="event.stopPropagation();visitLibrary('${lib.id}')">
                    방문하기 →
                </button>
            </div>
        `;
    });
    
    resultsHtml += '</div>';
    resultsContainer.innerHTML = resultsHtml;
}

// 도서관 방문
function visitLibrary(libraryId) {
    window.location.href = `index.html?library=${libraryId}`;
}

// ===================================
// 토스트 알림
// ===================================

function showToast(message, type = 'success') {
    // 기존 토스트 제거
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 표시
    setTimeout(() => toast.classList.add('show'), 10);
    
    // 3초 후 제거
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===================================
// 유틸리티
// ===================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===================================
// 책 추가 페이지
// ===================================

function initAddBookPage() {
    // 크롤링 옵션 선택 (더 이상 필요 없지만 호환성을 위해 유지)
    const crawlOptions = document.querySelectorAll('.crawl-option');
    crawlOptions.forEach(option => {
        option.addEventListener('click', () => {
            crawlOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    // 튜토리얼 모달 표시 (localStorage 확인은 HTML에서 처리)
}

// 목차 항목 추가
function addTocItem() {
    const container = document.getElementById('tocContainer');
    const items = container.querySelectorAll('.toc-item');
    const newIndex = items.length + 1;
    
    const newItem = document.createElement('div');
    newItem.className = 'toc-item';
    newItem.innerHTML = `
        <input type="text" name="toc[]" placeholder="${newIndex}장. 목차 제목">
        <button type="button" onclick="removeTocItem(this)">✕</button>
    `;
    
    container.insertBefore(newItem, container.querySelector('.add-toc-btn'));
}

function removeTocItem(btn) {
    btn.parentElement.remove();
}

// 이미지 업로드 처리
function handleImageUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    const preview = document.getElementById('imagePreview');
    
    imageToBase64(file).then(base64 => {
        preview.innerHTML = `<img src="${base64}" alt="책 표지">`;
        preview.classList.add('has-image');
        document.getElementById('imageData').value = base64;
        showToast('이미지가 업로드되었습니다!');
    });
}

// 이미지 URL 직접 입력
function loadImageFromUrl() {
    const urlInput = document.getElementById('imageUrlInput');
    const imageUrl = urlInput.value.trim();
    
    if (!imageUrl) {
        showToast('이미지 URL을 입력해주세요', 'error');
        return;
    }
    
    if (!imageUrl.startsWith('http')) {
        showToast('올바른 URL 형식이 아닙니다 (https://로 시작)', 'error');
        return;
    }
    
    const preview = document.getElementById('imagePreview');
    
    // 이미지 로드 테스트
    const testImg = new Image();
    testImg.onload = function() {
        preview.innerHTML = `<img src="${imageUrl}" alt="책 표지" style="max-width:200px;max-height:300px;">`;
        preview.classList.add('has-image');
        document.getElementById('imageData').value = imageUrl;
        showToast('이미지를 적용했습니다!');
    };
    testImg.onerror = function() {
        // CORS 문제로 로드 실패해도 URL은 저장
        preview.innerHTML = `<img src="${imageUrl}" alt="책 표지" style="max-width:200px;max-height:300px;" onerror="this.parentElement.innerHTML='<div class=\\'upload-icon\\'>📷</div><p style=\\'color:var(--text-muted)\\'>이미지 미리보기 불가<br>(저장은 됩니다)</p>'">`;
        preview.classList.add('has-image');
        document.getElementById('imageData').value = imageUrl;
        showToast('이미지 URL을 저장했습니다 (미리보기 불가)');
    };
    testImg.src = imageUrl;
}

// 알라딘 카테고리 → KDC 분류 매핑
function mapAladinCategoryToKDC(categoryText) {
    if (!categoryText) return -1;
    
    const text = categoryText.toLowerCase();
    
    // KDC 분류 매핑
    // 0: 총류 (컴퓨터, 정보, 백과사전)
    // 1: 철학 (철학, 심리학, 자기계발)
    // 2: 종교 (종교, 신화)
    // 3: 자연과학 (수학, 물리, 화학, 생물, 과학)
    // 4: 기술과학 (의학, 공학, 농업, 가정, 요리)
    // 5: 예술 (음악, 미술, 사진, 체육, 스포츠)
    // 6: 언어 (언어학, 외국어, 영어, 일본어)
    // 7: 문학 (소설, 시, 희곡, 에세이, 만화)
    // 8: 역사 (역사, 지리, 전기, 여행)
    
    // 문학 (7)
    if (text.includes('소설') || text.includes('시') || text.includes('희곡') ||
        text.includes('에세이') || text.includes('문학') || text.includes('만화') ||
        text.includes('라이트노벨') || text.includes('로맨스') || text.includes('판타지') ||
        text.includes('무협') || text.includes('bl')) {
        return 7;
    }
    
    // 역사 (8)
    if (text.includes('역사') || text.includes('지리') || text.includes('여행') ||
        text.includes('전기') || text.includes('인물')) {
        return 8;
    }
    
    // 철학/자기계발 (1)
    if (text.includes('철학') || text.includes('심리') || text.includes('자기계발') ||
        text.includes('인문') || text.includes('윤리')) {
        return 1;
    }
    
    // 종교 (2)
    if (text.includes('종교') || text.includes('신화') || text.includes('역학') ||
        text.includes('불교') || text.includes('기독교') || text.includes('명상')) {
        return 2;
    }
    
    // 자연과학 (3)
    if (text.includes('과학') || text.includes('수학') || text.includes('물리') ||
        text.includes('화학') || text.includes('생물') || text.includes('천문') ||
        text.includes('지구')) {
        return 3;
    }
    
    // 기술과학 (4)
    if (text.includes('의학') || text.includes('건강') || text.includes('공학') ||
        text.includes('요리') || text.includes('살림') || text.includes('가정') ||
        text.includes('농업') || text.includes('원예') || text.includes('기술')) {
        return 4;
    }
    
    // 예술 (5)
    if (text.includes('예술') || text.includes('음악') || text.includes('미술') ||
        text.includes('사진') || text.includes('영화') || text.includes('연극') ||
        text.includes('체육') || text.includes('스포츠') || text.includes('취미') ||
        text.includes('대중문화')) {
        return 5;
    }
    
    // 언어 (6)
    if (text.includes('언어') || text.includes('외국어') || text.includes('영어') ||
        text.includes('일본어') || text.includes('중국어') || text.includes('한국어') ||
        text.includes('어학') || text.includes('사전')) {
        return 6;
    }
    
    // 총류 (0) - 컴퓨터, 경영, 경제 등
    if (text.includes('컴퓨터') || text.includes('프로그래밍') || text.includes('it') ||
        text.includes('경제') || text.includes('경영') || text.includes('사회') ||
        text.includes('정치') || text.includes('법률') || text.includes('교육') ||
        text.includes('수험서') || text.includes('자격증') || text.includes('참고서')) {
        return 0;
    }
    
    // 어린이/청소년 - 문학으로 분류
    if (text.includes('어린이') || text.includes('유아') || text.includes('청소년') ||
        text.includes('동화')) {
        return 7;
    }
    
    return -1; // 매칭 안됨
}

// 크롤링 실행
async function crawlBookInfo() {
    const url = document.getElementById('crawlUrl').value.trim();
    if (!url) {
        showToast('URL을 입력해주세요', 'error');
        return;
    }
    
    // URL 유효성 검사 - 알라딘만 지원
    if (!url.includes('aladin.co.kr')) {
        showToast('알라딘 URL만 지원합니다', 'error');
        return;
    }
    
    // 로딩 표시
    const crawlBtn = document.querySelector('.crawl-input-group button');
    const crawlStatus = document.getElementById('crawlStatus');
    const originalText = crawlBtn.innerHTML;
    crawlBtn.innerHTML = '⏳ 가져오는 중...';
    crawlBtn.disabled = true;
    if (crawlStatus) crawlStatus.style.display = 'block';
    
    try {
        let title = '';
        let author = '';
        let publisher = '';
        let imageUrl = '';
        let category = -1; // KDC 분류 (0-8), -1은 미분류
        
        // 여러 CORS 프록시 시도
        const proxyUrls = [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
            `https://corsproxy.io/?${encodeURIComponent(url)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
        ];
        
        let html = null;
        
        for (const proxyUrl of proxyUrls) {
            try {
                const response = await fetch(proxyUrl, { 
                    timeout: 10000,
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml'
                    }
                });
                if (response.ok) {
                    html = await response.text();
                    if (html && html.length > 1000) {
                        console.log('프록시 성공:', proxyUrl.split('?')[0]);
                        break;
                    }
                }
            } catch (e) {
                console.log('프록시 실패:', proxyUrl.split('?')[0]);
                continue;
            }
        }
        
        if (!html) {
            throw new Error('페이지를 가져올 수 없습니다');
        }
        
        // HTML 파싱
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // 알라딘 크롤링
        if (url.includes('aladin.co.kr')) {
            // 메타 태그에서 제목 (가장 신뢰성 높음)
            const metaTitle = doc.querySelector('meta[property="og:title"]');
            if (metaTitle) {
                title = metaTitle.getAttribute('content') || '';
                // " - 알라딘" 부분 제거
                title = title.replace(/\s*-\s*알라딘.*$/, '').trim();
            }
            
            // HTML에서 제목 (백업)
            if (!title) {
                const titleEl = doc.querySelector('#Ere_prod_title') ||
                               doc.querySelector('.Ere_bo_title') ||
                               doc.querySelector('h1.bo_title');
                if (titleEl) {
                    title = titleEl.textContent.trim();
                }
            }
            
            // 메타 태그에서 이미지
            const metaImage = doc.querySelector('meta[property="og:image"]');
            if (metaImage) {
                imageUrl = metaImage.getAttribute('content') || '';
            }
            
            // HTML에서 이미지 (백업)
            if (!imageUrl) {
                const imageEl = doc.querySelector('#CoverMainImage') ||
                               doc.querySelector('#cover img') ||
                               doc.querySelector('.cover_box img') ||
                               doc.querySelector('img[src*="cover"]');
                if (imageEl) {
                    imageUrl = imageEl.getAttribute('src') || '';
                }
            }
            
            // 저자 - 개선된 선택자
            const authorEl = doc.querySelector('.Ere_sub2_title a[href*="author"]') ||
                            doc.querySelector('.Ere_sub2_title a:first-child') ||
                            doc.querySelector('a.np_af[href*="author"]') ||
                            doc.querySelector('.bo_author a');
            if (authorEl) {
                author = authorEl.textContent.trim();
                author = author.replace(/\(저\)|\(글\)|\(지은이\)/g, '').trim();
            }
            
            // 출판사 - 사용자 제공 선택자
            const publisherEl = doc.querySelector('a.Ere_sub2_title[href*="PublisherSearch"]') ||
                               doc.querySelector('a[href*="PublisherSearch"]') ||
                               doc.querySelector('.Ere_sub2_title a[href*="publisher"]');
            if (publisherEl) {
                publisher = publisherEl.textContent.trim();
            }
            
            // 카테고리 추출 - 브레드크럼 또는 카테고리 링크에서
            const categoryEl = doc.querySelector('.Ere_prod_side_list li a') ||
                              doc.querySelector('a[href*="CID="]') ||
                              doc.querySelector('.path a:nth-child(2)') ||
                              doc.querySelector('meta[property="og:description"]');
            
            let categoryText = '';
            if (categoryEl) {
                categoryText = categoryEl.textContent?.trim() || categoryEl.getAttribute('content') || '';
            }
            
            // 알라딘 카테고리 → KDC 분류 매핑
            category = mapAladinCategoryToKDC(categoryText);
        }
        
        // 디버그 로그
        console.log('크롤링 결과:', { title, author, publisher, imageUrl, category });
        
        // 폼에 값 채우기
        if (title) {
            document.getElementById('bookTitle').value = title;
        }
        if (author) {
            document.getElementById('bookAuthor').value = author;
        }
        if (publisher) {
            document.getElementById('bookPublisher').value = publisher;
        }
        if (imageUrl) {
            document.getElementById('imagePreview').innerHTML = `<img src="${imageUrl}" alt="책 표지" onerror="this.parentElement.innerHTML='<div class=\\'upload-icon\\'>📷</div><p>이미지 로드 실패</p>'">`;
            document.getElementById('imagePreview').classList.add('has-image');
            document.getElementById('imageData').value = imageUrl;
        }
        
        // 카테고리 자동 선택
        if (category >= 0 && category <= 8) {
            const categorySelect = document.querySelector('select[name="category"]');
            if (categorySelect) {
                categorySelect.value = category.toString();
                // 선택 표시 효과
                categorySelect.style.borderColor = 'var(--accent-primary)';
                setTimeout(() => categorySelect.style.borderColor = '', 2000);
            }
        }
        
        // 결과 메시지
        const fetchedItems = [];
        if (title) fetchedItems.push('제목');
        if (author) fetchedItems.push('저자');
        if (publisher) fetchedItems.push('출판사');
        if (imageUrl) fetchedItems.push('이미지');
        if (category >= 0) fetchedItems.push('분류');
        
        if (fetchedItems.length > 0) {
            showToast(`${fetchedItems.join(', ')}를 가져왔습니다! 🎉`);
        } else {
            showCrawlFailureHelp();
        }
        
    } catch (error) {
        console.error('크롤링 오류:', error);
        showCrawlFailureHelp();
    } finally {
        crawlBtn.innerHTML = originalText;
        crawlBtn.disabled = false;
        if (crawlStatus) crawlStatus.style.display = 'none';
    }
}

// 크롤링 실패 시 도움말 표시
function showCrawlFailureHelp() {
    const crawlUrl = document.getElementById('crawlUrl')?.value || '';
    
    const helpHtml = `
        <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--bg-card);padding:2rem;border-radius:16px;box-shadow:var(--shadow-medium);z-index:3000;max-width:500px;width:90%;max-height:80vh;overflow-y:auto;">
            <h3 style="margin-bottom:1rem;">😅 크롤링에 실패했습니다</h3>
            <p style="color:var(--text-secondary);margin-bottom:1rem;">
                알라딘이 크롤링을 차단했거나 네트워크 오류가 발생했을 수 있습니다.
            </p>
            
            <div style="background:var(--accent-light);padding:1rem;border-radius:8px;margin-bottom:1rem;">
                <p style="font-weight:600;margin-bottom:0.5rem;">📋 빠른 입력 방법:</p>
                <ol style="padding-left:1.2rem;color:var(--text-secondary);font-size:0.9rem;line-height:1.8;margin:0;">
                    <li>책 페이지에서 <strong>제목, 저자, 출판사</strong> 복사 → 붙여넣기</li>
                    <li>책 표지 <strong>우클릭</strong> → "이미지 주소 복사" → URL 입력란에 붙여넣기</li>
                </ol>
            </div>
            
            <div style="background:var(--bg-primary);padding:1rem;border-radius:8px;margin-bottom:1.5rem;">
                <p style="font-weight:600;margin-bottom:0.5rem;">🔗 책 페이지 바로가기:</p>
                <a href="${crawlUrl}" target="_blank" style="color:var(--accent-primary);word-break:break-all;font-size:0.85rem;">
                    ${crawlUrl || '입력된 URL 없음'}
                </a>
            </div>
            
            <div style="display:flex;gap:0.5rem;">
                <button onclick="this.closest('div[style*=fixed]').parentElement.remove()" class="btn btn-primary" style="flex:1;">확인</button>
                <button onclick="window.open('${crawlUrl}', '_blank');this.closest('div[style*=fixed]').parentElement.remove()" class="btn btn-secondary" style="flex:1;">페이지 열기</button>
            </div>
        </div>
        <div onclick="this.parentElement.remove()" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:2999;"></div>
    `;
    
    const helpDiv = document.createElement('div');
    helpDiv.innerHTML = helpHtml;
    document.body.appendChild(helpDiv);
}

// 책 저장
function saveBook(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // 목차 수집
    const tocInputs = form.querySelectorAll('input[name="toc[]"]');
    const tableOfContents = Array.from(tocInputs)
        .map(input => input.value.trim())
        .filter(value => value !== '');
    
    const readingStatus = formData.get('readingStatus') || 'not_started';
    const readingStartDate = formData.get('readingStartDate') ? new Date(formData.get('readingStartDate')).getTime() : null;
    const readingEndDate = formData.get('readingEndDate') ? new Date(formData.get('readingEndDate')).getTime() : null;
    const pages = parseInt(formData.get('pages')) || 0;
    
    const bookData = {
        title: formData.get('title'),
        author: formData.get('author'),
        publisher: formData.get('publisher') || '',
        image: document.getElementById('imageData')?.value || '',
        category: parseInt(formData.get('category')),
        rating: parseInt(formData.get('rating')) || 0,
        summary: formData.get('summary') || '',
        tableOfContents,
        relatedBooks: [],
        readingStatus,
        readingStartDate,
        readingEndDate,
        pages
    };
    
    // 유효성 검사
    if (!bookData.title || !bookData.author) {
        showToast('제목과 저자는 필수입니다', 'error');
        return;
    }
    
    // 저장
    const newBook = addBook(bookData);
    showToast('책이 추가되었습니다!');
    
    // 상세 페이지로 이동
    setTimeout(() => {
        window.location.href = `book-detail.html?id=${newBook.id}`;
    }, 1000);
}

// ===================================
// 책 상세 페이지
// ===================================

function initBookDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    if (!bookId) {
        window.location.href = 'index.html';
        return;
    }
    
    const book = getBookById(bookId);
    if (!book) {
        showToast('책을 찾을 수 없습니다', 'error');
        setTimeout(() => window.location.href = 'index.html', 1000);
        return;
    }
    
    renderBookDetail(book);
    renderSimilarBooks(bookId);
}

function renderBookDetail(book) {
    const category = KDC_CATEGORIES[book.category];
    const isLiked = isBookLiked(book.id);
    
    // 제목
    document.getElementById('bookTitle').textContent = book.title;
    document.title = `${book.title} - 나만의 도서관`;
    
    // 표지
    const coverEl = document.getElementById('bookCover');
    if (book.image) {
        coverEl.innerHTML = `<img src="${book.image}" alt="${book.title}" class="book-detail-cover">`;
    } else {
        coverEl.innerHTML = `<div class="book-cover" style="width:100%;height:400px;border-radius:16px;">${category?.icon || '📖'}</div>`;
    }
    
    // 메타 정보
    document.getElementById('bookAuthor').textContent = book.author;
    document.getElementById('bookPublisher').textContent = book.publisher || '-';
    document.getElementById('bookCategory').textContent = category?.name || '기타';
    document.getElementById('bookRating').textContent = '⭐'.repeat(book.rating || 0);
    document.getElementById('bookDate').textContent = formatDate(book.createdAt);
    
    // 좋아요 버튼
    const likeBtn = document.getElementById('likeBtn');
    likeBtn.innerHTML = `${isLiked ? '❤️' : '🤍'} 좋아요 <span id="likeCount">${book.likes || 0}</span>`;
    if (isLiked) likeBtn.classList.add('liked');
    
    // 요약 (마크다운 렌더링)
    const summaryEl = document.getElementById('bookSummary');
    if (book.summary) {
        summaryEl.innerHTML = `<div style="line-height:1.8;">${renderMarkdown(book.summary)}</div>`;
    } else {
        summaryEl.innerHTML = `<p style="color:var(--text-muted);">요약이 없습니다.</p>`;
    }
    
    // 독서 기록 표시
    if (book.readingStatus || book.readingStartDate || book.readingEndDate || book.pages) {
        const readingInfo = document.createElement('div');
        readingInfo.className = 'book-summary';
        readingInfo.style.marginTop = '1rem';
        readingInfo.innerHTML = `
            <h2>📖 독서 기록</h2>
            <div style="display:flex;gap:2rem;flex-wrap:wrap;margin-top:1rem;">
                ${book.readingStatus ? `<div><strong>상태:</strong> ${
                    book.readingStatus === 'completed' ? '✅ 읽음 완료' : 
                    book.readingStatus === 'reading' ? '📖 읽는 중' : '📚 아직 안 읽음'
                }</div>` : ''}
                ${book.readingStartDate ? `<div><strong>시작일:</strong> ${formatDate(book.readingStartDate)}</div>` : ''}
                ${book.readingEndDate ? `<div><strong>완독일:</strong> ${formatDate(book.readingEndDate)}</div>` : ''}
                ${book.pages ? `<div><strong>페이지:</strong> ${book.pages}페이지</div>` : ''}
            </div>
        `;
        document.querySelector('.book-detail-info').appendChild(readingInfo);
    }
    
    // 목차
    const tocEl = document.getElementById('bookToc');
    if (book.tableOfContents && book.tableOfContents.length > 0) {
        tocEl.innerHTML = `
            <ul class="toc-list">
                ${book.tableOfContents.map((item, i) => `
                    <li>
                        <span class="toc-number">${i + 1}</span>
                        ${escapeHtml(item)}
                    </li>
                `).join('')}
            </ul>
        `;
    } else {
        tocEl.innerHTML = `<p style="color:var(--text-muted);">목차가 없습니다.</p>`;
    }
}

function handleLike(bookId) {
    const added = toggleLike(bookId);
    const likeBtn = document.getElementById('likeBtn');
    const likeCount = document.getElementById('likeCount');
    const book = getBookById(bookId);
    
    if (added) {
        likeBtn.classList.add('liked');
        likeBtn.innerHTML = `❤️ 좋아요 <span id="likeCount">${book.likes}</span>`;
        showToast('좋아요를 눌렀습니다!');
    } else {
        likeBtn.classList.remove('liked');
        likeBtn.innerHTML = `🤍 좋아요 <span id="likeCount">${book.likes}</span>`;
        showToast('좋아요를 취소했습니다');
    }
}

function renderSimilarBooks(bookId) {
    const container = document.getElementById('similarBooks');
    if (!container) return;
    
    const books = getSimilarBooks(bookId, 4);
    
    if (books.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted);">비슷한 책이 없습니다.</p>`;
        return;
    }
    
    container.innerHTML = `
        <div class="books-grid">
            ${books.map(book => createBookCard(book)).join('')}
        </div>
    `;
}

function editBook(bookId) {
    window.location.href = `add-book.html?edit=${bookId}`;
}

function deleteBookConfirm(bookId) {
    if (confirm('정말 이 책을 삭제하시겠습니까?')) {
        deleteBook(bookId);
        showToast('책이 삭제되었습니다');
        setTimeout(() => window.location.href = 'index.html', 1000);
    }
}

// ===================================
// 내 도서관 페이지
// ===================================

function initMyLibraryPage() {
    const libraryInfo = getLibraryInfo();
    
    // 도서관 이름
    const nameInput = document.getElementById('libraryName');
    if (nameInput) {
        nameInput.value = libraryInfo.name;
    }
    
    // 통계
    const stats = getStats();
    const statElements = document.querySelectorAll('.library-stats .stat-number');
    if (statElements.length >= 2) {
        statElements[0].textContent = stats.totalBooks;
        statElements[1].textContent = stats.totalLikes;
    }
    
    // 내 책 목록 렌더링
    renderMyBooks();
    
    // QR 코드 생성
    generateQRCode();
    
    // 공유 URL 설정
    const shareUrlInput = document.getElementById('shareUrl');
    if (shareUrlInput) {
        shareUrlInput.value = window.location.href;
    }
}

function updateLibraryName(input) {
    saveLibraryInfo({ name: input.value });
}

function renderMyBooks() {
    const container = document.getElementById('myBooksGrid');
    if (!container) return;
    
    const books = getAllBooks();
    
    if (books.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📭</span>
                <p>아직 등록된 책이 없습니다</p>
                <a href="add-book.html" class="btn btn-primary">첫 책 추가하기</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = books.map(book => createBookCard(book)).join('');
}

function generateQRCode() {
    const qrContainer = document.getElementById('qrCode');
    if (!qrContainer) return;
    
    // QRCode 라이브러리가 로드되어 있으면 생성
    if (typeof QRCode !== 'undefined') {
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: window.location.href,
            width: 200,
            height: 200,
            colorDark: '#2c2c2c',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    } else {
        qrContainer.innerHTML = `
            <div style="width:200px;height:200px;background:var(--border-color);display:flex;align-items:center;justify-content:center;border-radius:12px;">
                <span>QR 코드</span>
            </div>
        `;
    }
}

function copyShareUrl() {
    const input = document.getElementById('shareUrl');
    input.select();
    document.execCommand('copy');
    showToast('URL이 복사되었습니다!');
}

// ===================================
// 둘러보기 페이지
// ===================================

function initExplorePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    const sort = urlParams.get('sort');
    
    let books = getAllBooks();
    let title = '모든 책';
    
    // 카테고리 필터
    if (category !== null) {
        const catId = parseInt(category);
        books = books.filter(book => book.category === catId);
        title = KDC_CATEGORIES[catId]?.name || '전체';
    }
    
    // 검색 필터
    if (search) {
        books = searchBooks(search);
        title = `'${search}' 검색 결과`;
    }
    
    // 정렬
    if (sort === 'popular') {
        books.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        title = '인기순';
    } else if (sort === 'rating') {
        books.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
        // 기본: 최신순
        books.sort((a, b) => b.createdAt - a.createdAt);
    }
    
    // 페이지 제목 업데이트
    const titleEl = document.getElementById('exploreTitle');
    if (titleEl) titleEl.textContent = title;
    
    // 책 그리드 렌더링
    const container = document.getElementById('exploreGrid');
    if (container) {
        if (books.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p>해당하는 책이 없습니다</p>
                    <a href="add-book.html" class="btn btn-primary">책 추가하기</a>
                </div>
            `;
        } else {
            container.innerHTML = books.map(book => createBookCard(book)).join('');
        }
    }
    
    // 카테고리 필터 활성화
    if (category !== null) {
        const catBtn = document.querySelector(`[data-category="${category}"]`);
        if (catBtn) catBtn.classList.add('active');
    }
}

function filterByCategory(categoryId) {
    window.location.href = `explore.html?category=${categoryId}`;
}

function sortBooks(sortType) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('sort', sortType);
    window.location.href = `explore.html?${urlParams.toString()}`;
}

// 고급 검색 모달
function showAdvancedSearch() {
    document.getElementById('advancedSearchModal').classList.add('show');
}

function closeAdvancedSearch() {
    document.getElementById('advancedSearchModal').classList.remove('show');
}

function applyAdvancedSearch() {
    const status = document.getElementById('filterStatus').value;
    const ratingMin = parseInt(document.getElementById('filterRatingMin').value) || 0;
    const ratingMax = parseInt(document.getElementById('filterRatingMax').value) || 5;
    const pagesMin = parseInt(document.getElementById('filterPagesMin').value) || 0;
    const pagesMax = parseInt(document.getElementById('filterPagesMax').value) || 999999;
    
    let books = getAllBooks();
    
    // 필터 적용
    books = books.filter(book => {
        if (status && book.readingStatus !== status) return false;
        if (book.rating < ratingMin || book.rating > ratingMax) return false;
        if (book.pages && (book.pages < pagesMin || book.pages > pagesMax)) return false;
        return true;
    });
    
    // 결과 표시
    const container = document.getElementById('exploreGrid');
    if (books.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📭</span>
                <p>검색 조건에 맞는 책이 없습니다</p>
            </div>
        `;
    } else {
        container.innerHTML = books.map(book => createBookCard(book)).join('');
    }
    
    closeAdvancedSearch();
    showToast(`${books.length}권의 책을 찾았습니다!`);
}

// 마크다운 렌더링 (간단한 버전)
function renderMarkdown(text) {
    if (!text) return '';
    
    let html = escapeHtml(text);
    
    // 굵게
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // 기울임
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // 취소선
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
    // 이미지
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:1rem 0;">');
    // 링크
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:var(--accent-primary);">$1</a>');
    // 줄바꿈
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

