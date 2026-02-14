package com.example.mymusicopinion.services;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;

@Service
public class YoutubeService {

    private final RestClient restClient;

    @Value("${youtube.api.key:}")
    private String apiKey;

    public YoutubeService(RestClient.Builder builder) {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setSupportedMediaTypes(Collections.singletonList(MediaType.APPLICATION_JSON));

        this.restClient = builder
                .baseUrl("https://www.googleapis.com/youtube/v3")
                .messageConverters(converters -> converters.add(converter))
                .build();
    }

    public String searchVideoId(String query) {
        if (apiKey == null || apiKey.isEmpty()) {
            return null;
        }

        try {
            YoutubeSearchResponseDto response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("part", "snippet")
                            .queryParam("q", query)
                            .queryParam("type", "video")
                            .queryParam("maxResults", 1)
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .body(YoutubeSearchResponseDto.class);

            if (response != null && response.getItems() != null && !response.getItems().isEmpty()) {
                return response.getItems().get(0).getId().getVideoId();
            }
        } catch (Exception e) {
            // ignore
        }

        return null;
    }

    // 간단한 파싱을 위한 내부 DTO 클래스들
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class YoutubeSearchResponseDto {
        private List<Item> items;

        public List<Item> getItems() {
            return items;
        }

        public void setItems(List<Item> items) {
            this.items = items;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Item {
            private Id id;

            public Id getId() {
                return id;
            }

            public void setId(Id id) {
                this.id = id;
            }
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Id {
            private String videoId;

            public String getVideoId() {
                return videoId;
            }

            public void setVideoId(String videoId) {
                this.videoId = videoId;
            }
        }
    }
}
