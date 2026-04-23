package com.example.mymusicopinion;

import com.example.mymusicopinion.dto.ItunesResponseDto;
import com.example.mymusicopinion.models.*;
import com.example.mymusicopinion.repositories.*;
import com.example.mymusicopinion.services.MusicSearchService;
import com.example.mymusicopinion.services.SongService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.CompletableFuture;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SongRepository songRepository;
    private final ReviewRepository reviewRepository;
    private final PostRepository postRepository;
    private final PostCommentRepository postCommentRepository;
    private final PasswordEncoder passwordEncoder;
    private final MusicSearchService musicSearchService;
    private final SongService songService;

    public DataInitializer(UserRepository userRepository,
            SongRepository songRepository,
            ReviewRepository reviewRepository,
            PostRepository postRepository,
            PostCommentRepository postCommentRepository,
            PasswordEncoder passwordEncoder,
            MusicSearchService musicSearchService,
            SongService songService) {
        this.userRepository = userRepository;
        this.songRepository = songRepository;
        this.reviewRepository = reviewRepository;
        this.postRepository = postRepository;
        this.postCommentRepository = postCommentRepository;
        this.passwordEncoder = passwordEncoder;
        this.musicSearchService = musicSearchService;
        this.songService = songService;
    }

    @Override
    public void run(String... args) throws Exception {
        // 비동기로 실행하여 메인 스레드(서버 부팅)를 막지 않음
        CompletableFuture.runAsync(() -> {
            try {
                processInitialization();
            } catch (Exception e) {
                System.err.println("❌ [DataInitializer] 데이터 초기화 중 오류 발생: " + e.getMessage());
                e.printStackTrace();
            }
        });
    }

    // @Transactional // 제거: HTTP 요청이 포함된 긴 작업이므로 트랜잭션을 쪼갭니다.
    public void processInitialization() {
        if (userRepository.count() > 0) {
            return;
        }

        long startTime = System.currentTimeMillis();

        // iTunes에서 노래 가져오기
        List<Song> songPool = new ArrayList<>();
        String[] artists = {
                "Daniel Caesar", "Oasis", "John Mayer", "Red Hot Chili Peppers", "Justin Bieber",
                "Ed Sheeran", "Coldplay", "BTS", "Shawn Mendes", "Stevie Ray Vaughan",
                "Taylor Swift", "Bruno Mars", "The Weeknd", "Post Malone", "Ariana Grande",
                "Drake", "Maroon 5", "Adele", "Imagine Dragons", "Dua Lipa"
        };

            for (String artist : artists) {
                try {
                    List<ItunesResponseDto.ItunesResultDto> results = musicSearchService.searchMusic(artist, "artist");
                    int count = 0;
                    for (ItunesResponseDto.ItunesResultDto dto : results) {
                        if (count >= 5)
                            break;
                        if (dto.getTrackId() == null)
                            continue;

                        if (songPool.stream().anyMatch(s -> s.getItunesTrackId().equals(dto.getTrackId())))
                            continue;

                        Song song = new Song();
                        song.setItunesTrackId(dto.getTrackId());
                        song.setTitle(dto.getTrackName());
                        song.setArtist(dto.getArtistName());
                        song.setAlbum(dto.getCollectionName());
                        song.setImageUrl(dto.getArtworkUrl100());
                        song.setGenre(dto.getPrimaryGenreName() != null ? dto.getPrimaryGenreName() : "Pop");

                        if (dto.getReleaseDate() != null && dto.getReleaseDate().length() >= 4) {
                            try {
                                song.setReleaseYear(Integer.parseInt(dto.getReleaseDate().substring(0, 4)));
                            } catch (NumberFormatException e) {
                                song.setReleaseYear(2000);
                            }
                        } else {
                            song.setReleaseYear(2000);
                        }

                        songPool.add(song);
                        count++;
                    }
                } catch (Exception e) {
                    // ignore
                }
            }
            songPool = songRepository.saveAll(songPool);
            songPool = songRepository.saveAll(songPool);

            // 사용자 생성
            List<User> userPool = new ArrayList<>();
            String commonEncodedPassword = passwordEncoder.encode("1234");
            Random random = new Random();
            String[] adjectives = { "Happy", "Blue", "Red", "Fast", "Cool", "Smart", "Funny", "Brave", "Calm", "Wild" };
            String[] nouns = { "Tiger", "Lion", "Eagle", "Bear", "Wolf", "Shark", "Panda", "Fox", "Hawk", "Cat" };

            for (int i = 1; i <= 1000; i++) {
                User user = new User();
                user.setUsername("user" + i);
                user.setPassword(commonEncodedPassword);
                String nickname = adjectives[random.nextInt(adjectives.length)] + nouns[random.nextInt(nouns.length)]
                        + i;
                user.setBio("Hello, I am " + nickname);
                userPool.add(user);
            }
            userPool = userRepository.saveAll(userPool);
            userPool = userRepository.saveAll(userPool);

            // 리뷰 생성
            List<Review> reviews = new ArrayList<>();
            String[] comments = {
                    "정말 좋은 노래입니다!", "강추합니다.", "듣기 좋아요.", "별로예요.", "최고!",
                    "무한 반복 중...", "목소리가 너무 좋아요.", "가사가 예술입니다.", "비트가 찢었다.", "쏘쏘."
            };

            for (int i = 0; i < 3000; i++) {
                User reviewer = userPool.get(random.nextInt(userPool.size()));
                Song song = songPool.get(random.nextInt(songPool.size()));

                Review review = new Review();
                review.setUser(reviewer);
                review.setSong(song);
                review.setRating((byte) (random.nextInt(5) + 1)); // 1 ~ 5
                review.setComment(comments[random.nextInt(comments.length)]);
                review.setCreatedAt(
                        java.time.LocalDateTime.now().minusDays(random.nextInt(365)).plusHours(random.nextInt(24)));

                reviews.add(review);
            }
            reviewRepository.saveAll(reviews);
            reviewRepository.saveAll(reviews);

            // 게시글 생성
            List<Post> posts = new ArrayList<>();
            String[] titles = {
                    "노래 추천해요", "이 노래 아시는 분?", "요즘 듣는 플레이리스트", "가사가 너무 슬퍼요",
                    "콘서트 가고 싶다", "기타 코드 좀 알려주세요", "작곡 해보려고 합니다", "이어폰 추천 좀",
                    "LP 수집하시는 분 계신가요?", "드라이브 할 때 듣기 좋은 노래"
            };

            for (int i = 0; i < 200; i++) {
                User poster = userPool.get(random.nextInt(userPool.size()));

                Post post = new Post();
                post.setUser(poster);
                post.setTitle(titles[random.nextInt(titles.length)] + " " + i);
                post.setContent("내용입니다. " + UUID.randomUUID().toString().substring(0, 8));
                post.setCreatedAt(java.time.LocalDateTime.now()
                        .minusDays(random.nextInt(30))
                        .minusMinutes(random.nextInt(1440)));

                boolean isRecommend = random.nextBoolean();
                if (isRecommend) {
                    post.setCategory("RECOMMEND"); // 대문자 명시
                    post.setSong(songPool.get(random.nextInt(songPool.size())));
                } else {
                    post.setCategory("FREE"); // 대문자 명시
                }

                posts.add(post);
            }
            posts = postRepository.saveAll(posts);
            posts = postRepository.saveAll(posts);

            // 댓글 생성
            List<PostComment> postComments = new ArrayList<>();
            for (Post post : posts) {
                int commentCount = random.nextInt(6); // 0 to 5
                for (int j = 0; j < commentCount; j++) {
                    User commenter = userPool.get(random.nextInt(userPool.size()));
                    PostComment pc = new PostComment();
                    pc.setPost(post);
                    pc.setUser(commenter);
                    pc.setComment("댓글입니다. " + j);
                    pc.setCreatedAt(post.getCreatedAt().plusMinutes(random.nextInt(60) + 1));
                    postComments.add(pc);
                }
            }
            postCommentRepository.saveAll(postComments);
            postCommentRepository.saveAll(postComments);

            // 노래 통계 동기화
            for (Song song : songPool) {
                songService.updateSongStats(song.getId());
            }

    }
}
