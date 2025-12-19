
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogService } from '../../services/log.service';
import { Exercise, WorkoutLog } from '../../models/workout.model';

@Component({
  selector: 'app-log-workout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './log-workout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogWorkoutComponent {
  private logService = inject(LogService);
  
  today = new Date();
  todayString = this.getFormattedDate(this.today);
  
  workoutLog = signal<WorkoutLog>({
    date: this.todayString,
    exercises: [],
  });
  
  newExerciseName = signal('');
  
  constructor() {
    const existingLog = this.logService.getLogForDate(this.todayString);
    if (existingLog) {
      this.workoutLog.set(existingLog);
    }
  }
  
  private getFormattedDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  addExercise() {
    const name = this.newExerciseName().trim();
    if (!name) return;

    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: name,
      sets: [{ reps: null, weight: null }],
    };

    this.workoutLog.update(log => ({
      ...log,
      exercises: [...log.exercises, newExercise],
    }));

    this.newExerciseName.set('');
  }

  addSet(exerciseId: string) {
    this.workoutLog.update(log => {
      const exercises = log.exercises.map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: [...ex.sets, { reps: null, weight: null }],
          };
        }
        return ex;
      });
      return { ...log, exercises };
    });
  }

  removeExercise(exerciseId: string) {
    this.workoutLog.update(log => ({
      ...log,
      exercises: log.exercises.filter(ex => ex.id !== exerciseId),
    }));
  }

  removeSet(exerciseId: string, setIndex: number) {
    this.workoutLog.update(log => {
      const exercises = log.exercises.map(ex => {
        if (ex.id === exerciseId && ex.sets.length > 1) {
          const newSets = ex.sets.filter((_, i) => i !== setIndex);
          return { ...ex, sets: newSets };
        }
        return ex;
      });
      return { ...log, exercises };
    });
  }

  saveWorkout() {
    // Filter out exercises with no sets or empty sets
    const cleanedLog = { ...this.workoutLog() };
    cleanedLog.exercises = cleanedLog.exercises.map(ex => ({
      ...ex,
      sets: ex.sets.filter(set => set.reps !== null && set.reps > 0)
    })).filter(ex => ex.sets.length > 0);

    this.logService.saveLog(cleanedLog);
    alert('Workout saved successfully!');
  }
  
  trackById(index: number, item: any): any {
    return item.id;
  }

  trackByIndex(index: number, item: any): any {
    return index;
  }
}
