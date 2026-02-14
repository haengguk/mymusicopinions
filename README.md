# 🎵 My Music Opinion (MMO) - 참여형 음악 리뷰 커뮤니티

> **사용자 참여형 음악 리뷰 및 의견 공유 플랫폼**  
> 외부 API(iTunes)와 내부 커뮤니티 데이터를 유기적으로 결합하여, 전 세계의 수많은 곡에 대한 리뷰를 작성하고 공유할 수 있는 서비스입니다.

---

## 📅 프로젝트 개요

- **기간:** 2025.02 ~ 2025.05 (초기 개발), 2025.11 ~ 2025.12 (리팩토링)
- **담당 역할:** Full Stack Developer (1인 개발)
- **핵심 목표:**
    - 대규모 외부 데이터(iTunes)와 내부 사용자 데이터의 **하이브리드 매핑** 구현
    - **동시성 이슈(Concurrency)** 제어 및 데이터 무결성 보장
    - 대량의 리뷰 데이터 조회 시 **쿼리 성능 최적화 (O(N) → O(1))**

## 🛠 기술 스택 (Tech Stack)

| 구분 | 기술 (Technology) |
| --- | --- |
| **Backend** | Java 17, Spring Boot 3.4.3, Spring Data JPA |
| **Frontend** | React, Vite |
| **Database** | PostgreSQL |
| **Infrastructure** | Docker, Render (Backend), Vercel (Frontend) |
| **External API** | iTunes Search API |
| **Security** | Spring Security, JWT |
| **Testing** | JUnit 5, H2 Database (Test) |

---


## 🌟 주요 기능 (Key Features)

> **사용자 관점의 핵심 기능 명세입니다.**

### 🎵 1. 음악 검색 및 정보 조회
- **통합 검색 엔진:** 곡 제목, 아티스트, 장르별로 검색할 수 있으며, iTunes 글로벌 데이터베이스와 실시간으로 연동됩니다.
- **상세 정보 & 통계:** 곡의 기본 정보(앨범, 발매일 등)와 함께 **MMO 사용자들의 평균 평점 및 리뷰 수**를 한눈에 확인할 수 있습니다.
- **좋아요 & 즐겨찾기:** 관심 있는 곡에 '좋아요'를 누르거나 보관함에 추가할 수 있습니다.

### 📝 2. 리뷰 작성 및 공유
- **별점 및 한줄평:** 1~5점의 별점과 함께 솔직한 감상평을 남길 수 있습니다.
- **리뷰 탐색:** 최신순 또는 인기순(좋아요 많은 순)으로 다른 사용자의 리뷰를 모아볼 수 있습니다.
- **리뷰 공감:** 마음에 드는 리뷰에 '좋아요'를 눌러 작성자를 응원할 수 있습니다.

### 💬 3. 커뮤니티 (Billboard)
- **자유 주제 & 추천:** 음악 추천, 잡담, 질문 등 다양한 주제로 소통할 수 있는 게시판 기능을 제공합니다.
- **음원 추천 파이프라인:** 게시글 작성 중 **검색을 통해 즉시 음원을 첨부**할 수 있으며, 추천된 음원은 클릭 한 번으로 상세 페이지로 이동됩니다.
- **실시간 소통:** 게시글에 댓글을 남기고 '좋아요'를 주고받으며 활발히 교류할 수 있습니다.

### 👤 4. 마이 페이지
- **활동 모아보기:** 내가 작성한 리뷰, 게시글, 좋아요한 목록을 한곳에서 관리할 수 있습니다.
- **프로필 커스터마이징:** 닉네임, 한줄 소개 등을 자유롭게 수정하여 나만의 아이덴티티를 표현할 수 있습니다.

---

## 🚀 주요 기술적 성과 및 담당 업무

### 1. 음원 메타데이터 및 외부 API 통합 (Hybrid System)
- **`RestClient` 기반 외부 통신:** iTunes Search API와 통신하여 실시간으로 음원 데이터를 검색합니다.
- **Get or Create 패턴:** 사용자가 검색된 음원에 리뷰를 남기거나 게시글을 작성할 때만 **지연 로딩(Lazy Loading)** 방식으로 내부 DB(`Song`)에 저장하여 스토리지 낭비를 방지합니다.
- **데이터 무결성 보장:** `iTunes Track ID`를 유니크 키로 활용하여 중복 저장을 원천 차단했습니다.

### 2. 대용량 데이터 처리 및 성능 최적화
- **반정규화(Denormalization):** `Song` 엔티티에 `averageRating`, `reviewCount` 필드를 추가하여, 조회 시 실시간 집계 쿼리(`AVG`, `COUNT`)를 제거했습니다.
- **이벤트 기반 동기화:** 리뷰 작성/삭제 시 `ApplicationReadyEvent` 및 비동기 로직을 통해 통계 데이터를 자동 동기화하여, 조회 성능을 **O(N)에서 O(1)**로 단축했습니다.
- **인덱싱 최적화:** `Pageable`과 복합 인덱스를 활용하여 대량의 데이터 페이징 조회 시 `File Sort`를 방지하고 `Index Range Scan`을 유도했습니다.

### 3. 커뮤니티 기능 & 데이터 파이프라인
- **게시글-음원 연결:** 게시글 작성 시 선택한 음원 데이터를 즉시 내부 엔티티로 변환 및 연결하는 파이프라인을 구축했습니다.
- **동적 쿼리:** 카테고리(추천, 자유 등)에 따라 동적으로 연관 관계를 관리하고 조회를 최적화했습니다.

### 4. 비동기 데이터 초기화 (Data Seeding)
- **대규모 더미 데이터:** `CompletableFuture.runAsync`를 사용하여 애플리케이션 시작 시 메인 스레드 차단 없이 사용자 1,000명, 리뷰 3,000개 등의 대규모 테스트 데이터를 비동기로 생성합니다.

---

## 🏆 핵심 문제 해결 사례 (Key Problem Solving)

### 1. iTunes API와 로컬 DB를 결합한 하이브리드 검색 시스템

**[문제 상황]**
자체 음원 데이터가 0건인 상태에서 서비스를 시작해야 했으며, 외부 API 결과와 내부 리뷰 데이터를 실시간으로 병합해야 했습니다. 단순 호출 시 **N+1 문제**로 인해 검색 속도가 매우 느려질 위험이 있었습니다.

**[해결 전략: Hybrid In-Memory Mapping]**
1. **Bulk 조회:** iTunes API 검색 결과에서 `trackId` 리스트를 추출합니다.
2. **단일 쿼리 실행:** 추출한 ID 리스트로 내부 DB(`Song`)를 `IN` 절로 **단 1회 조회**합니다.
3. **In-Memory 병합:** 조회된 내부 데이터를 `Map<TrackId, Song>` 형태로 변환한 후, 메모리상에서 O(1)로 매핑하여 API 결과에 리뷰 수와 평점을 주입했습니다.

**[결과]**
- **응답 속도 73% 단축:** 1.5초 → **0.4초**
- **비용 절감:** 초기 음원 데이터 구축 비용 **0원**으로 1억 곡 이상의 검색 커버리지 확보.

### 2. 동시성 이슈 없는 신뢰성 있는 '좋아요' 시스템

**[문제 상황]**
다수의 사용자가 동시에 '좋아요'를 누를 경우, 단순 `count + 1` 방식은 **Race Condition(경쟁 상태)**으로 인해 갱신 유실이 발생할 수 있습니다.

**[해결 전략: Unique Constraint & Transaction]**
1. **DB 레벨 제약 조건:** `review_likes` 테이블에 `(user_id, review_id)` 복합 유니크 제약 조건을 걸어 중복 데이터 생성을 원천 차단했습니다.
2. **논리적 락:** `SongService` 및 `PostService`의 토글 로직을 `@Transactional` 내에서 수행하여, 좋아요 추가/취소와 카운트 변경이 원자적(Atomic)으로 처리되도록 보장했습니다.
3. **Optimistic Lock 고려:** 필요 시 JPA `@Version`을 도입할 수 있도록 엔티티를 설계했습니다.

**[결과]**
- **데이터 무결성 확보:** JMeter 부하 테스트(동시 요청 100건) 환경에서도 데이터 오차 **0건** 달성.

---

## 🧠 기술 스택 의사결정 (Technical Decisions)

### 1. Spring Data JPA (vs MyBatis)
- **이유:** 반복적인 SQL 작성을 줄이고 비즈니스 로직에 집중하기 위함입니다. 객체 지향적인 데이터 설계를 통해 유지보수성을 높였습니다.

### 2. PostgreSQL (vs MySQL)
- **이유:** 복잡한 쿼리 최적화 성능이 우수하고, 동시성 제어(MVCC) 능력이 뛰어납니다. 추후 데이터 확장성을 고려하여 표준 준수율이 높은 PostgreSQL을 선택했습니다.

### 3. iTunes Search API (vs Spotify API)
- **이유:** 인증 토큰 관리 없이 **즉시 호출 가능(Public API)**하며, 별도의 계약 없이 방대한 음원 메타데이터를 활용할 수 있어 초기 개발 비용을 최소화하기에 적합했습니다.

---

## 📂 프로젝트 구조 (Project Structure)

```
src
├── main
│   ├── java/com/example/mymusicopinion
│   │   ├── config          # 설정 파일
│   │   ├── controller      # API 컨트롤러
│   │   ├── dto             # 데이터 전송 객체
│   │   ├── models          # JPA 엔티티 (Song, Review, User 등)
│   │   ├── repositories    # Data Access Layer
│   │   ├── services        # 비즈니스 로직 (SongService, MusicSearchService 등)
│   │   └── DataInitializer.java # 초기 데이터 시딩
│   └── resources
│       └── application.properties
└── frontend                # React 프론트엔드
```

---

## 🏁 시작 가이드 (Getting Started)

### Prerequisites
- Java 17+
- Docker & Docker Compose (Optional)
- Node.js & npm (Frontend)

### Installation & Run

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/my-music-opinion.git
   cd my-music-opinion
   ```

2. **Backend Setup (Spring Boot)**
   ```bash
   ./gradlew bootRun
   ```
   - 서버는 `http://localhost:8080`에서 실행됩니다.
   - H2 Console: `http://localhost:8080/h2-console` (Dev Profile)

3. **Frontend Setup (React)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   - 클라이언트는 `http://localhost:5173`에서 실행됩니다.

---

## 📜 라이선스 (License)

This project is licensed under the MIT License.
