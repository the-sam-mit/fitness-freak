
export interface ExerciseSet {
  reps: number | null;
  weight: number | null;
}

export interface Exercise {
  id: string; 
  name: string;
  sets: ExerciseSet[];
}

export interface WorkoutLog {
  date: string; // YYYY-MM-DD
  exercises: Exercise[];
}
