package com.core.config;

import com.core.entity.Role;
import com.core.entity.User;
import com.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Application configuration including data seeding on startup.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class AppConfig {

    @Bean
    public CommandLineRunner dataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed default admin user if no users exist
            if (userRepository.count() == 0) {
                User admin = User.builder()
                        .username("admin")
                        .email("admin@core.com")
                        .password(passwordEncoder.encode("Admin@123"))
                        .fullName("System Administrator")
                        .role(Role.ROLE_ADMIN)
                        .active(true)
                        .build();
                userRepository.save(admin);

                User manager = User.builder()
                        .username("manager")
                        .email("manager@core.com")
                        .password(passwordEncoder.encode("Manager@123"))
                        .fullName("Project Manager")
                        .role(Role.ROLE_MANAGER)
                        .active(true)
                        .build();
                userRepository.save(manager);

                User user = User.builder()
                        .username("user")
                        .email("user@core.com")
                        .password(passwordEncoder.encode("User@123"))
                        .fullName("Regular User")
                        .role(Role.ROLE_STUDENT)
                        .active(true)
                        .build();
                userRepository.save(user);

                log.info("Default users seeded: admin@core.com / Admin@123, manager@core.com / Manager@123, user@core.com / User@123");
            }
        };
    }
}
