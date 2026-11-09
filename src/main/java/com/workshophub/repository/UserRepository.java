package com.workshophub.repository;

import com.workshophub.model.User;
import com.workshophub.model.enums.UserRole;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<UserRole> countByRole(UserRole role);

    List<User> findByRole(UserRole role);
}
