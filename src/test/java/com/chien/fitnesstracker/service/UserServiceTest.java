package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.model.User;
import com.chien.fitnesstracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository; // Simulated DB dependency

    @InjectMocks
    private UserServiceImpl userService; // Injects the mock repo into your real service

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
    }

    @Test
    @DisplayName("Should give a list of users when getUsers is called")
    void shouldGiveAListOfUsersWhenGetUsersIsCalled() {
        // Implementation for this test case

        // GIVEN: The repository returns a list of users
        List<User> mockUsers = List.of(testUser);
        when(userRepository.findAll()).thenReturn(mockUsers);

        // WHEN: Calling getUsers
        List<User> result = userService.getUsers();

        // THEN: The returned list should contain the expected users
        assertEquals(mockUsers, result);
    }

    @Test
    @DisplayName("Should throw RuntimeException when getUserById is called with non-existing id")
    void shouldThrowRuntimeExceptionWhenGetUserByIdIsCalledWithNonExistingId() {
        // GIVEN: The repository returns an empty Optional for the given id
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.empty());

        // WHEN & THEN: Calling getUserById should throw a RuntimeException         
        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> userService.getUserById(1L)
        );

        //THEN: The exception message should indicate that the user was not found
        assertEquals("User not found for id: 1", exception.getMessage());
    }

    @Test
    @DisplayName("Should delete user when deleteUserById is called with existing id")
    void shouldDeleteUserWhenDeleteUserByIdIsCalledWithExistingId() {
        // GIVEN: The repository does not throw an exception when deleting by id
        doNothing().when(userRepository).deleteById(1L);


        // WHEN: Calling deleteUserById
        userService.deleteUserById(1L); 

        // THEN: Verify that the repository's deleteById method was called with the correct id
        verify(userRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should save user when saveUser is called")
    void shouldSaveUserWhenSaveUserIsCalled() {
        //GIVEN: The repository returns the user when saving
        when(userRepository.save(testUser)).thenReturn(testUser);
        //WHEN: Calling saveUser
        User result = userService.saveUser(testUser);
        //THEN: The returned user should be the same as the testUser
        assertEquals(testUser, result);
        //VERIFY: Ensure userRepository.save() was called with the correct user
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should update user when updateUser is called with existing id")
    void shouldUpdateUserWhenUpdateUserIsCalledWithExistingId() {
        // GIVEN: The repository returns a user for the given id
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(testUser));

         // Tell Mockito to return whatever object is passed into save(...)
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN: Calling updateUser
        User updatedDetails = new User();
        updatedDetails.setUsername("updatedUser");
        updatedDetails.setEmail("updatedUser@mail.com");
        User result = userService.updateUser(1L, updatedDetails);
        assertEquals(updatedDetails.getUsername(), result.getUsername());
        assertEquals(updatedDetails.getEmail(), result.getEmail());

        // THEN: Verify that the repository's save method was called with the updated user
        verify(userRepository, times(1)).save(any(User.class));
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when registering duplicate username")
    void shouldThrowExceptionWhenUsernameExists() {
        // GIVEN: The repository reports that the username already exists
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        // WHEN & THEN: Registering the user should throw an exception
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> userService.registerNewUser(testUser)
        );

        assertEquals("Username is already taken.", exception.getMessage());
        
        // VERIFY: Ensure userRepository.save() was NEVER called because validation failed
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when registering duplicate email")
    void shouldThrowExceptionWhenEmailExists() {
        // GIVEN: The repository reports that the email already exists
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // WHEN & THEN: Registering the user should throw an exception
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> userService.registerNewUser(testUser)
        );

        assertEquals("Email is already registered.", exception.getMessage());

        // VERIFY: Ensure userRepository.save() was NEVER called because validation failed
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should save user when username is unique")
    void shouldSaveUserWhenUsernameIsUnique() {
        // GIVEN: The repository reports that the username does not exist
        when(userRepository.existsByUsername("testuser")).thenReturn(false);

        // WHEN: Registering the user
        userService.registerNewUser(testUser);

        // THEN: The user should be saved
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should return user when findByUsername is called with existing username")
    void shouldReturnUserWhenFindByUsernameIsCalledWithExistingUsername() {
        // GIVEN: The repository returns a user for the given username
        when(userRepository.findByUsername("testuser")).thenReturn(java.util.Optional.of(testUser));    

        //WHEN: Calling findByUsername
        User result = userService.findByUsername("testuser");

        // THEN: The returned user should be the expected user
        assertEquals(testUser, result);
    }
}
