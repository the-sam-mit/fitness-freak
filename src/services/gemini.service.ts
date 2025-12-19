
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { WorkoutLog } from '../models/workout.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  
  constructor() {
    // Note: process.env.API_KEY is handled by the Applet environment.
    const apiKey = process.env.API_KEY;
    if(apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      console.error('API_KEY environment variable not found.');
    }
  }

  async getWorkoutSuggestion(history: WorkoutLog[]): Promise<string> {
    if (!this.ai) {
      return 'Gemini AI is not configured. Please ensure your API key is set.';
    }

    const formattedHistory = history.length > 0
      ? history.map(log => `On ${log.date}, I did: ${log.exercises.map(ex => `${ex.name} (${ex.sets.length} sets)`).join(', ')}`).join('.\n')
      : 'I have no recent workout history.';

    const prompt = `
      You are an elite, motivating personal trainer. I need a suggestion for my next workout.
      Keep your response concise, actionable, and encouraging, formatted as simple text.
      Start with a motivational sentence. Then, suggest one or two exercises I could add or a technique to try.
      Do not use markdown formatting.

      My recent workout history:
      ${formattedHistory}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return 'Sorry, I couldn\'t get a suggestion right now. Please try again later.';
    }
  }
}
