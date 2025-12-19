
import { Injectable, signal } from '@angular/core';
import { WorkoutLog } from '../models/workout.model';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  private readonly STORAGE_KEY = 'gymGeniusLogs';
  logs = signal<WorkoutLog[]>([]);

  constructor() {
    this.loadLogsFromStorage();
  }

  private loadLogsFromStorage() {
    try {
      const storedLogs = localStorage.getItem(this.STORAGE_KEY);
      if (storedLogs) {
        this.logs.set(JSON.parse(storedLogs));
      } else {
        this.logs.set([]);
      }
    } catch (e) {
      console.error('Error reading logs from localStorage', e);
      this.logs.set([]);
    }
  }

  private saveLogsToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs()));
    } catch (e) {
      console.error('Error saving logs to localStorage', e);
    }
  }

  getLogs(): WorkoutLog[] {
    return this.logs();
  }

  getLogForDate(date: string): WorkoutLog | undefined {
    return this.logs().find(log => log.date === date);
  }

  saveLog(log: WorkoutLog) {
    const index = this.logs().findIndex(l => l.date === log.date);
    if (index > -1) {
      this.logs.update(logs => {
        logs[index] = log;
        return [...logs];
      });
    } else {
      this.logs.update(logs => [...logs, log]);
    }
    this.saveLogsToStorage();
  }
}
