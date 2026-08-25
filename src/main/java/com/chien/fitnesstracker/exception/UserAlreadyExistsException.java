package com.chien.fitnesstracker.exception;

/**
 * UserAlreadyExistsException
 */
public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
