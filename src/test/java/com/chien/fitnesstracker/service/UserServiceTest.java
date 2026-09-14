package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.model.User;
import com.chien.fitnesstracker.model.enums.FitnessGoal;
import com.chien.fitnesstracker.repository.UserRepository;
import com.chien.fitnesstracker.dto.User.UserRegisterRequestDto;
import com.chien.fitnesstracker.dto.User.UserResponseDto;
import com.chien.fitnesstracker.exception.*;


import com.chien.fitnesstracker.service.impl.UserServiceImpl;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    @Mock
    private PasswordEncoder passwordEncoder; // Simulated password encoder

    @InjectMocks
    private UserServiceImpl userService; // Injects the mock repo into your real service

    private User testUser;
    
    private User createSampleUser(Long id) {
        User user = new User();
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setWeight(70.0);
        user.setHeight(175.0);
        user.setAge(25);
        user.setGender("MALE");
        user.setActivityLevel(1.55);
        user.setFitnessGoal(FitnessGoal.MAINTAIN);
        user.setTdee(2300.0);
        return user;
    }

    private UserRegisterRequestDto createSampleRegisterRequest() {
        return new UserRegisterRequestDto(
            "testuser", "test@example.com", "password123", "Test User",
            70.0, 175.0, 25, "MALE", 1.55, FitnessGoal.MAINTAIN, 2300.0
        );
    }

    private UserResponseDto createSampleResponseDto(User user) {
        return new UserResponseDto(
            user.getId(), user.getUsername(), user.getName(),
            user.getWeight(), user.getHeight(), user.getAge(),
            user.getGender(), user.getActivityLevel(),
            user.getFitnessGoal(), user.getTdee()
        );
    }


    @Test
    @DisplayName("Should give a list of users when getUsers is called")
    void shouldGiveAListOfUsersWhenGetUsersIsCalled() {

        testUser = createSampleUser(1L);

        // GIVEN: The repository returns a list of users
        when(userRepository.findAll()).thenReturn(List.of(testUser));

        // WHEN: Calling getUsers
        List<UserResponseDto> result = userService.getUsers();

        // THEN: The returned list should contain the expected users
        assertEquals(List.of(createSampleResponseDto(testUser)), result);
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

        testUser = createSampleUser(1L);

        // GIVEN: The repository does not throw an exception when deleting by id
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(testUser));
        doNothing().when(userRepository).delete(testUser);

        // WHEN: Calling deleteUserById
        userService.deleteUserById(1L); 

        // THEN: Verify that the repository's delete method was called with the correct id
        verify(userRepository).delete(testUser);
    }

    @Test
    @DisplayName("Should save user when saveUser is called")
    void shouldSaveUserWhenSaveUserIsCalled() {

        testUser = createSampleUser(1L);
        UserRegisterRequestDto testUserRequest = createSampleRegisterRequest();

        //GIVEN: The repository returns the user when saving
        when(userRepository.save(testUser)).thenReturn(testUser);
        //WHEN: Calling saveUser
        UserResponseDto result = userService.saveUser(testUserRequest);
        //THEN: The returned user should be the same as the testUser
        assertEquals(testUser.getUsername(), result.username());
        //VERIFY: Ensure userRepository.save() was called with the correct user
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should update user when updateUser is called with existing id")
    void shouldUpdateUserWhenUpdateUserIsCalledWithExistingId() {

        testUser = createSampleUser(1L);
        // GIVEN: The repository returns a user for the given id
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(testUser));

         // Tell Mockito to return whatever object is passed into save(...)
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN: Calling updateUser
        UserRegisterRequestDto updatedDetails = createSampleRegisterRequest();
 
        UserResponseDto result = userService.updateUserProfile(1L, updatedDetails);
        assertEquals(updatedDetails.username(), result.username());
        assertEquals(updatedDetails.name(), result.name());
        // THEN: Verify that the repository's save method was called with the updated user
        verify(userRepository, times(1)).save(any(User.class));
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should throw UserAlreadyExistsException when registering duplicate username")
    void shouldThrowExceptionWhenUsernameExists() {
        // GIVEN: The repository reports that the username already exists
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        // WHEN & THEN: Registering the user should throw an exception
        UserAlreadyExistsException exception = assertThrows(
            UserAlreadyExistsException.class,
            () -> userService.registerNewUser(createSampleRegisterRequest())
        );

        assertEquals("Username is already taken.", exception.getMessage());
        
        // VERIFY: Ensure userRepository.save() was NEVER called because validation failed
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw EmailAlreadyExistsException when registering duplicate email")
    void shouldThrowExceptionWhenEmailExists() {
        // GIVEN: The repository reports that the email already exists
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // WHEN & THEN: Registering the user should throw an exception
        EmailAlreadyExistsException exception = assertThrows(
            EmailAlreadyExistsException.class,
            () -> userService.registerNewUser(createSampleRegisterRequest())
        );

        assertEquals("Email is already registered.", exception.getMessage());

        // VERIFY: Ensure userRepository.save() was NEVER called because validation failed
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should save user when username is unique")
    void shouldSaveUserWhenUsernameIsUnique() {
        testUser = createSampleUser(1L);
        testUser.setPassword("encodedPassword"); // Set a password for encoding
        UserResponseDto expectedResponse = createSampleResponseDto(testUser);
         // GIVEN: Mock the password encoding behavior
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");

        // GIVEN: The repository reports that the username and email do not exist
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);

        // GIVEN: The repository returns the user when saving
        when(userRepository.save(testUser)).thenReturn(testUser);

        // WHEN: Registering the user
        UserResponseDto result = userService.registerNewUser(createSampleRegisterRequest());

        // THEN: The returned user should be the same as the testUser
        assertEquals(expectedResponse, result);
        // VERIFY: Ensure userRepository.save() was called with the correct user
        verify(userRepository).save(testUser);
        // VERIFY: Ensure the password was encoded
        verify(passwordEncoder).encode("password123");
    }

    @Test
    @DisplayName("Should return user when findByUsername is called with existing username")
    void shouldReturnUserWhenFindByUsernameIsCalledWithExistingUsername() {

        // GIVEN: A sample user
        testUser = createSampleUser(1L);
        // GIVEN: The repository returns a user for the given username
        when(userRepository.findByUsername("testuser")).thenReturn(java.util.Optional.of(testUser));    
        UserResponseDto expectedResponse = createSampleResponseDto(testUser);

        //WHEN: Calling findByUsername
        UserResponseDto result = userService.findByUsername("testuser");

        // THEN: The returned user should be the expected user
        assertEquals(expectedResponse, result);
    }
}
