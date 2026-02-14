package com.example.mymusicopinion.services;

import com.example.mymusicopinion.dto.ItunesResponseDto;
import com.example.mymusicopinion.models.Song;
import com.example.mymusicopinion.repositories.SongRepository;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class MusicSearchService {

    private final RestClient restClient;
    private final SongRepository songRepository;

    public MusicSearchService(RestClient.Builder builder,
            SongRepository songRepository) {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setSupportedMediaTypes(
                Arrays.asList(MediaType.APPLICATION_JSON, MediaType.valueOf("text/javascript")));

        this.restClient = builder
                .baseUrl("https://itunes.apple.com")
                .messageConverters(converters -> converters.add(converter))
                .build();
        this.songRepository = songRepository;
    }

    public List<ItunesResponseDto.ItunesResultDto> searchMusic(String term, String type) {
        if (term == null || term.trim().isEmpty()) {
            return Collections.emptyList();
        }

        ItunesResponseDto response = restClient.get()
                .uri(uriBuilder -> {
                    uriBuilder
                            .path("/search")
                            .queryParam("term", term)
                            .queryParam("media", "music")
                            .queryParam("country", "KR")
                            .queryParam("limit", 200);

                    if ("song".equalsIgnoreCase(type)) {
                        uriBuilder.queryParam("attribute", "songTerm");
                    } else if ("artist".equalsIgnoreCase(type)) {
                        uriBuilder.queryParam("attribute", "artistTerm");
                    }

                    return uriBuilder.build();
                })
                .retrieve()
                .body(ItunesResponseDto.class);

        if (response == null || response.getResults() == null) {
            return Collections.emptyList();
        }

        List<ItunesResponseDto.ItunesResultDto> results = response.getResults();

        try {
            List<Long> trackIds = results.stream()
                    .map(ItunesResponseDto.ItunesResultDto::getTrackId)
                    .filter(java.util.Objects::nonNull)
                    .toList();

            if (!trackIds.isEmpty()) {
                List<Song> dbSongs = songRepository.findByItunesTrackIdIn(trackIds);
                java.util.Map<Long, Song> songMap = dbSongs.stream()
                        .collect(java.util.stream.Collectors
                                .toMap(Song::getItunesTrackId, song -> song));

                for (ItunesResponseDto.ItunesResultDto result : results) {
                    if (result.getTrackId() != null && songMap.containsKey(result.getTrackId())) {
                        Song dbSong = songMap.get(result.getTrackId());
                        result.setReviewCount(dbSong.getReviewCount());
                        result.setAverageRating(dbSong.getAverageRating());
                    }
                }
            }
        } catch (Exception e) {
            // ignore
        }

        return results;
    }

    public List<ItunesResponseDto.ItunesResultDto> getArtistAlbums(String artistName) {
        if (artistName == null || artistName.trim().isEmpty()) {
            return Collections.emptyList();
        }

        ItunesResponseDto response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("term", artistName)
                        .queryParam("entity", "album")
                        .queryParam("limit", 10)
                        .build())
                .retrieve()
                .body(ItunesResponseDto.class);

        if (response == null || response.getResults() == null) {
            return Collections.emptyList();
        }

        List<ItunesResponseDto.ItunesResultDto> albums = response.getResults();
        albums.sort((a, b) -> {
            String dateA = a.getReleaseDate() != null ? a.getReleaseDate() : "";
            String dateB = b.getReleaseDate() != null ? b.getReleaseDate() : "";
            return dateB.compareTo(dateA);
        });

        return albums;
    }
}
