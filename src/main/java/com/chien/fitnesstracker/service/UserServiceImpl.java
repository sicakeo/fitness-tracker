package com.chien.fitnesstracker.service;
import com.chien.fitnesstracker.model.User;
import com.chien.fitnesstracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        Optional<User> optional = userRepository.findById(id);
        User user;
        if (optional.isPresent()) user = optional.get();
        else throw new RuntimeException("User not found for id: " + id);
        return user;
    }
    @Override
    public User findByUsername(String username) {
        return this.userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public void deleteUserById(Long id) {
        this.userRepository.deleteById(id);
    }

    @Override
    public User saveUser(User user) {
        return this.userRepository.save(user);
    }

    @Override
    public User updateUser(Long id, User userDetails) {
        User userToUpdate = this.getUserById(id);
        userToUpdate.setUsername(userDetails.getUsername());
        userToUpdate.setPassword(userDetails.getPassword());
        userToUpdate.setHeight(userDetails.getHeight());
        userToUpdate.setWeight(userDetails.getWeight());
        return this.userRepository.save(userToUpdate);
    }
}

