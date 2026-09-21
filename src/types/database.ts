import type { Task, TaskPriority, TaskStatus } from '@/types/task';

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: Task;
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category?: string | null;
          priority?: TaskPriority;
          due_date?: string | null;
          status?: TaskStatus;
          created_at?: string;
        };
        Update: Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
