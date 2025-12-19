
import { Component, ChangeDetectionStrategy, inject, signal, AfterViewInit, ViewChild, ElementRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogService } from '../../services/log.service';
import { GeminiService } from '../../services/gemini.service';
import { WorkoutLog } from '../../models/workout.model';

declare const d3: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements AfterViewInit {
  private logService = inject(LogService);
  private geminiService = inject(GeminiService);

  @ViewChild('chart') private chartContainer!: ElementRef;
  
  logs = this.logService.logs;
  
  aiSuggestion = signal<string>('');
  isLoadingSuggestion = signal<boolean>(false);
  
  weeklyStats = computed(() => {
    const logs = this.logs();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentLogs = logs.filter(log => new Date(log.date) >= oneWeekAgo);
    
    const totalWorkouts = recentLogs.length;
    const totalSets = recentLogs.reduce((sum, log) => sum + log.exercises.reduce((s, ex) => s + ex.sets.length, 0), 0);
    const totalReps = recentLogs.reduce((sum, log) => sum + log.exercises.reduce((s, ex) => s + ex.sets.reduce((r, set) => r + (set.reps || 0), 0), 0), 0);

    return { totalWorkouts, totalSets, totalReps };
  });

  ngAfterViewInit(): void {
    this.createChart();
  }
  
  getAIsuggestion() {
    this.isLoadingSuggestion.set(true);
    this.aiSuggestion.set('');
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    const recentHistory = this.logs().filter(log => new Date(log.date) >= oneMonthAgo);

    this.geminiService.getWorkoutSuggestion(recentHistory)
      .then(suggestion => {
        this.aiSuggestion.set(suggestion);
      })
      .catch(error => {
        console.error(error);
        this.aiSuggestion.set('An error occurred while getting a suggestion.');
      })
      .finally(() => {
        this.isLoadingSuggestion.set(false);
      });
  }

  private createChart() {
    if (!this.chartContainer) return;
    
    const logs = this.logs();
    const data = this.getWorkoutsPerDay(logs);
    
    const element = this.chartContainer.nativeElement;
    d3.select(element).select('svg').remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    const svg = d3.select(element).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
      
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map((d: any) => d.day))
      .padding(0.4);
      
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("fill", "#9ca3af");

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: any) => d.count) || 10])
      .range([height, 0]);
      
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('d')))
      .selectAll("text")
      .style("fill", "#9ca3af");

    svg.selectAll('mybar')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d: any) => x(d.day))
      .attr('y', (d: any) => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', (d: any) => height - y(d.count))
      .attr('fill', '#22d3ee')
      .attr('rx', 4);
  }

  private getWorkoutsPerDay(logs: WorkoutLog[]) {
      const counts = {'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0};
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      logs.forEach(log => {
          const logDate = new Date(log.date + 'T00:00:00'); // Ensure local timezone
          if (logDate >= oneWeekAgo) {
              const dayOfWeek = days[logDate.getDay()];
              counts[dayOfWeek]++;
          }
      });
      
      return days.map(day => ({ day, count: counts[day] }));
  }
}
