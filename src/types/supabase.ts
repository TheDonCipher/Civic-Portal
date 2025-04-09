export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          resource_id: string
          resource_type: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          resource_id: string
          resource_type: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          resource_id?: string
          resource_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          issue_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          issue_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          issue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_comments: {
        Row: {
          author_avatar: string | null
          author_id: string
          author_name: string | null
          content: string
          created_at: string | null
          id: string
          issue_id: string | null
        }
        Insert: {
          author_avatar?: string | null
          author_id: string
          author_name?: string | null
          content: string
          created_at?: string | null
          id?: string
          issue_id?: string | null
        }
        Update: {
          author_avatar?: string | null
          author_id?: string
          author_name?: string | null
          content?: string
          created_at?: string | null
          id?: string
          issue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issue_comments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_solutions: {
        Row: {
          created_at: string | null
          description: string
          estimated_cost: number
          id: string
          issue_id: string | null
          proposed_by_avatar: string | null
          proposed_by_id: string
          proposed_by_name: string | null
          status: string
          title: string
          updated_at: string | null
          votes: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          estimated_cost: number
          id?: string
          issue_id?: string | null
          proposed_by_avatar?: string | null
          proposed_by_id: string
          proposed_by_name?: string | null
          status?: string
          title: string
          updated_at?: string | null
          votes?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          estimated_cost?: number
          id?: string
          issue_id?: string | null
          proposed_by_avatar?: string | null
          proposed_by_id?: string
          proposed_by_name?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "issue_solutions_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_updates: {
        Row: {
          author_avatar: string | null
          author_id: string
          author_name: string | null
          content: string
          created_at: string | null
          id: string
          issue_id: string | null
          type: string
        }
        Insert: {
          author_avatar?: string | null
          author_id: string
          author_name?: string | null
          content: string
          created_at?: string | null
          id?: string
          issue_id?: string | null
          type?: string
        }
        Update: {
          author_avatar?: string | null
          author_id?: string
          author_name?: string | null
          content?: string
          created_at?: string | null
          id?: string
          issue_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_updates_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_votes: {
        Row: {
          created_at: string | null
          issue_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          issue_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          issue_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_votes_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_watchers: {
        Row: {
          created_at: string | null
          issue_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          issue_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          issue_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_watchers_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          author_avatar: string | null
          author_id: string
          author_name: string
          category: string
          constituency: string | null
          created_at: string | null
          description: string
          id: string
          location: string | null
          resolved_at: string | null
          resolved_by: string | null
          search_vector: unknown | null
          status: string
          thumbnail: string | null
          title: string
          updated_at: string | null
          votes: number
          watchers_count: number | null
        }
        Insert: {
          author_avatar?: string | null
          author_id: string
          author_name: string
          category: string
          constituency?: string | null
          created_at?: string | null
          description: string
          id?: string
          location?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          search_vector?: unknown | null
          status?: string
          thumbnail?: string | null
          title: string
          updated_at?: string | null
          votes?: number
          watchers_count?: number | null
        }
        Update: {
          author_avatar?: string | null
          author_id?: string
          author_name?: string
          category?: string
          constituency?: string | null
          created_at?: string | null
          description?: string
          id?: string
          location?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          search_vector?: unknown | null
          status?: string
          thumbnail?: string | null
          title?: string
          updated_at?: string | null
          votes?: number
          watchers_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          constituency: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          constituency?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          constituency?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      solution_votes: {
        Row: {
          created_at: string | null
          solution_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          solution_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          solution_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_votes_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      solutions: {
        Row: {
          created_at: string | null
          description: string
          estimated_cost: number
          id: string
          issue_id: string
          proposed_by: string
          status: string
          title: string
          updated_at: string | null
          votes: number
        }
        Insert: {
          created_at?: string | null
          description: string
          estimated_cost: number
          id?: string
          issue_id: string
          proposed_by: string
          status?: string
          title: string
          updated_at?: string | null
          votes?: number
        }
        Update: {
          created_at?: string | null
          description?: string
          estimated_cost?: number
          id?: string
          issue_id?: string
          proposed_by?: string
          status?: string
          title?: string
          updated_at?: string | null
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "solutions_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      updates: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          issue_id: string
          type: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          issue_id: string
          type?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          issue_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "updates_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_issue_votes: {
        Args: {
          issue_id: string
        }
        Returns: undefined
      }
      decrement_issue_watchers: {
        Args: {
          issue_id: string
        }
        Returns: undefined
      }
      decrement_solution_votes: {
        Args: {
          solution_id: string
        }
        Returns: undefined
      }
      get_user_issues: {
        Args: {
          user_id: string
        }
        Returns: {
          issue_id: string
          title: string
          description: string
          category: string
          status: string
          votes: number
          created_at: string
          location: string
          constituency: string
          thumbnail: string
          author_name: string
          author_avatar: string
          type: string
        }[]
      }
      increment_issue_votes: {
        Args: {
          issue_id: string
        }
        Returns: undefined
      }
      increment_issue_watchers: {
        Args: {
          issue_id: string
        }
        Returns: undefined
      }
      increment_solution_votes: {
        Args: {
          solution_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
