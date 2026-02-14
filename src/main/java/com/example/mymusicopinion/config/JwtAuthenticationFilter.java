package com.example.mymusicopinion.config;

import com.example.mymusicopinion.models.User;
import com.example.mymusicopinion.repositories.UserRepository;
import com.example.mymusicopinion.security.UserDetailsImpl;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j(topic = "JWT 검증 및 인가")
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = request.getHeader("Authorization");

        if (token != null) {
            try {
                Claims userInfo = jwtUtil.getUserInfoFromToken(token);
                String username = userInfo.getSubject();

                User user = userRepository.findByUsername(username).orElseThrow(
                        () -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

                UserDetails userDetails = new UserDetailsImpl(user);
                Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, null);

                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);

            } catch (Exception e) {
                log.error("Token Error: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}