
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogWorkoutComponent } from './components/log-workout/log-workout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, LogWorkoutComponent, DashboardComponent],
})
export class AppComponent {
  activeView = signal<'log' | 'dashboard'>('log');

  setView(view: 'log' | 'dashboard') {
    this.activeView.set(view);
  }
}
