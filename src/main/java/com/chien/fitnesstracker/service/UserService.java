package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.model.User;
import java.util.List;

public interface UserService {
    List<User> getUsers();
    User getUserById(Long id);
    void deleteUserById(Long id);
    User saveUser(User user);
    User updateUser(Long id, User user);
    User findByUsername(String username);
}
