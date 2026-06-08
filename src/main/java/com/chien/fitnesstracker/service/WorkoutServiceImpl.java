package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.model.Workout;
import com.chien.fitnesstracker.repository.WorkoutRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class WorkoutServiceImpl implements WorkoutService {
    private final WorkoutRepository workoutRepository;
    public WorkoutServiceImpl(WorkoutRepository workoutRepository) {
        this.workoutRepository = workoutRepository;
    }

    @Override
    public List<Workout> getAllWorkouts() {
        return workoutRepository.findAll();
    }

    @Override
    public Workout getWorkoutById(Long id) {
        Optional<Workout> optional = workoutRepository.findById(id);
        Workout workout;
        if (optional.isPresent()) workout = optional.get();
        else throw new RuntimeException("Workout with id " + id + " not found");
        return workout;
    }

    @Override
    public Workout saveWorkout(Workout workout) {
        if(workout.getDate()!=null){
            workout.setDate(LocalDate.now());
        }
        return workoutRepository.save(workout);
    }

    @Override
    public void deleteWorkoutById(Long id) {
        workoutRepository.deleteById(id);
    }

    @Override
    public Workout updateWorkout(Long id, Workout workoutDetails) {
        Workout workout = getWorkoutById(workoutDetails.getId());
        workout.setExercise(workoutDetails.getExercise());
        workout.setDuration(workoutDetails.getDuration());
        workout.setDistance(workoutDetails.getDistance());
        workout.setCalories(workoutDetails.getCalories());
        workout.setReps(workoutDetails.getReps());
        workout.setSets(workoutDetails.getSets());
        workout.setWeight(workoutDetails.getWeight());
        workout.setDate(workoutDetails.getDate());
        workout.setUser(workoutDetails.getUser());
        return workoutRepository.save(workout);
    }
}
