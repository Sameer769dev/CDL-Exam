import * as Speech from 'expo-speech';
import { Question } from '../types/quiz';

export interface AudioStudyOptions {
    rate?: number; // 0.8 - 1.25
    voicePitch?: number;
    pauseBeforeAnswerMs?: number; // default 2500ms
    onStateChange?: (state: 'idle' | 'speaking_question' | 'waiting_answer' | 'speaking_answer') => void;
    onCompleted?: () => void;
}

class AudioStudyService {
    private isPlaying: boolean = false;
    private timer: any = null;
    private currentRate: number = 0.95;

    public setRate(rate: number) {
        this.currentRate = Math.max(0.75, Math.min(1.5, rate));
    }

    public getRate(): number {
        return this.currentRate;
    }

    public stop() {
        this.isPlaying = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        Speech.stop().catch(() => {});
    }

    /**
     * Reads the question aloud, pauses to give the driver time to think,
     * then reads the correct answer and a concise explanation.
     */
    public async playQuestionFlow(question: Question, options: AudioStudyOptions = {}) {
        this.stop();
        this.isPlaying = true;

        const rate = options.rate ?? this.currentRate;
        const pauseMs = options.pauseBeforeAnswerMs ?? 2200;

        options.onStateChange?.('speaking_question');

        // 1. Speak question text
        Speech.speak(question.question, {
            rate,
            pitch: 1.0,
            onDone: () => {
                if (!this.isPlaying) return;

                options.onStateChange?.('waiting_answer');

                // 2. Pause interval for the user to formulate the answer
                this.timer = setTimeout(() => {
                    if (!this.isPlaying) return;

                    options.onStateChange?.('speaking_answer');

                    // Clean explanation: avoid overly verbose preamble
                    const answerText = `The correct answer is: ${question.correct_answer}. ${question.explanation}`;

                    Speech.speak(answerText, {
                        rate,
                        pitch: 1.0,
                        onDone: () => {
                            if (!this.isPlaying) return;
                            options.onStateChange?.('idle');
                            options.onCompleted?.();
                        },
                        onError: () => {
                            options.onStateChange?.('idle');
                        }
                    });
                }, pauseMs);
            },
            onError: () => {
                options.onStateChange?.('idle');
            }
        });
    }
}

export const audioStudy = new AudioStudyService();
