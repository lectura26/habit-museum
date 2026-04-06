export type MetricType = 'yes_no' | 'score_10' | 'score_100' | 'number' | 'emotions' | 'freetext'

export const DEFAULT_EMOTIONS: string[] = [
  'Calm', 'Focused', 'Grateful', 'Restless', 'Tired',
  'Strong', 'Distracted', 'Content', 'Anxious', 'Present',
]
export type Language = 'en' | 'da'
export type TaskStatus = 'done' | 'partial' | 'not_done' | null

export interface Profile {
  id: string
  full_name: string | null
  language: Language
  default_todo_count: number
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  is_active: boolean
  display_order: number
  created_at: string
}

export interface HabitCompletion {
  id: string
  habit_id: string
  user_id: string
  date: string
  completed: boolean
}

export interface UserMetric {
  id: string
  user_id: string
  metric_name: string
  metric_type: MetricType
  unit: string | null
  is_active: boolean
  display_order: number
  emotion_options: string[] | null
  created_at: string
}

export interface CheckinEntry {
  id: string
  user_id: string
  metric_id: string
  date: string
  value_number: number | null
  value_text: string | null
  value_boolean: boolean | null
  value_emotions: string[] | null
}

export interface DailyIntention {
  id: string
  user_id: string
  date: string
  task_text: string
  display_order: number
  status: TaskStatus
  created_at: string
}

export interface WeeklyReview {
  id: string
  user_id: string
  week_start: string
  went_well: string | null
  focus_next: string | null
  goals: string[]
  created_at: string
}
