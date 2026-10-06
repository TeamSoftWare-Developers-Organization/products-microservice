package com.skystore.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // إتاحة واجهات GraphQL العامة والـ WebSockets واستكشاف GraphiQL والمراقبة
                .requestMatchers("/graphiql", "/graphiql/**", "/graphql", "/graphql/**", "/ws", "/ws/**", "/actuator", "/actuator/**").permitAll()
                // تأمين طلبات المعالجة وتعديل البيانات برمز Keycloak JWT
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.decoder(jwtDecoder())));

        return http.build();
    }

    @Bean
    public org.springframework.security.oauth2.jwt.JwtDecoder jwtDecoder() {
        org.springframework.security.oauth2.jwt.NimbusJwtDecoder decoder =
            org.springframework.security.oauth2.jwt.NimbusJwtDecoder
                .withJwkSetUri("http://172.17.158.236:8080/realms/skystore/protocol/openid-connect/certs")
                .build();
        decoder.setJwtValidator(new org.springframework.security.oauth2.jwt.JwtTimestampValidator());
        return decoder;
    }
}
