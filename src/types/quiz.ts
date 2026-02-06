// Quiz Types

export interface QuizCategory {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
    total_resources?: number;
}

export interface QuizOption {
    id: number;
    option_text: string;
    order: number;
    image?: string | null;
}

export interface QuizQuestion {
    id: number;
    question_text: string;
    image: string | null;
    question_type: 'single' | 'multiple' | 'true_false';
    points: number;
    options: QuizOption[];
    time_limit?: number;
}

export interface Quiz {
    id: number;
    title: string;
    slug: string;
    description: string;
    quiz_type: 'standard' | 'kahoot';
    category: QuizCategory;
    difficulty: 'easy' | 'medium' | 'hard';
    timing_mode: 'per_question' | 'total_time';
    time_per_question?: number;
    total_time?: number;
    total_questions: number;
    total_points: number;
    passing_score: number;
    total_attempts: number;
    average_score: number;
    created_by: {
        id: number;
        username: string;
        full_name?: string;
    };
    questions?: QuizQuestion[];
    created_at: string;
    updated_at?: string;
}

export interface QuizAttempt {
    attempt_id: string;
    quiz_id: number;
    started_at: string;
    status: 'in_progress' | 'completed' | 'abandoned';
    score?: number;
    max_score?: number;
    score_percentage?: number;
    passed?: boolean;
    time_taken?: number;
    completed_at?: string;
}

export interface AnswerSubmitResponse {
    is_correct: boolean;
    points_earned: number;
    correct_options: number[];
    explanation?: string;
}

// Kahoot Types
export interface KahootRoom {
    id: number;
    room_code: string;
    quiz: {
        id: number;
        title: string;
    };
    host: {
        id: number;
        username: string;
        full_name?: string;
    };
    status: 'waiting' | 'in_progress' | 'completed';
    max_players: number;
    total_participants: number;
    allow_late_join: boolean;
    created_at: string;
}

export interface KahootPlayer {
    id: number;
    username: string;
    score: number;
    rank: number;
}

export interface KahootLeaderboard {
    rankings: KahootPlayer[];
}
