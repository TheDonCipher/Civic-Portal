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
      departments: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      issue_votes: {
        Row: {
          created_at: string | null
          id: string
          issue_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          issue_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
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
          id: string
          issue_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          issue_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
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
          author_name: string | null
          category: string
          constituency: string | null
          created_at: string | null
          description: string
          id: string
          location: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          thumbnail: string | null
          thumbnails: string[] | null
          title: string
          updated_at: string | null
          votes: number
          watchers_count: number | null
        }
        Insert: {
          author_avatar?: string | null
          author_id: string
          author_name?: string | null
          category: string
          constituency?: string | null
          created_at?: string | null
          description: string
          id?: string
          location?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          thumbnail?: string | null
          thumbnails?: string[] | null
          title: string
          updated_at?: string | null
          votes?: number
          watchers_count?: number | null
        }
        Update: {
          author_avatar?: string | null
          author_id?: string
          author_name?: string | null
          category?: string
          constituency?: string | null
          created_at?: string | null
          description?: string
          id?: string
          location?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          thumbnail?: string | null
          thumbnails?: string[] | null
          title?: string
          updated_at?: string | null
          votes?: number
          watchers_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_locked_until: string | null
          avatar_url: string | null
          banner_url: string | null
          constituency: string | null
          created_at: string | null
          department: string | null
          department_id: string | null
          email: string | null
          email_verified_at: string | null
          failed_login_attempts: number | null
          full_name: string | null
          government_id: string | null
          id: string
          last_login_at: string | null
          login_count: number | null
          marketing_opt_in: boolean | null
          password_changed_at: string | null
          privacy_accepted_at: string | null
          role: string | null
          terms_accepted_at: string | null
          updated_at: string | null
          username: string | null
          verification_documents: Json | null
          verification_status: string | null
        }
        Insert: {
          account_locked_until?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          constituency?: string | null
          created_at?: string | null
          department?: string | null
          department_id?: string | null
          email?: string | null
          email_verified_at?: string | null
          failed_login_attempts?: number | null
          full_name?: string | null
          government_id?: string | null
          id: string
          last_login_at?: string | null
          login_count?: number | null
          marketing_opt_in?: boolean | null
          password_changed_at?: string | null
          privacy_accepted_at?: string | null
          role?: string | null
          terms_accepted_at?: string | null
          updated_at?: string | null
          username?: string | null
          verification_documents?: Json | null
          verification_status?: string | null
        }
        Update: {
          account_locked_until?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          constituency?: string | null
          created_at?: string | null
          department?: string | null
          department_id?: string | null
          email?: string | null
          email_verified_at?: string | null
          failed_login_attempts?: number | null
          full_name?: string | null
          government_id?: string | null
          id?: string
          last_login_at?: string | null
          login_count?: number | null
          marketing_opt_in?: boolean | null
          password_changed_at?: string | null
          privacy_accepted_at?: string | null
          role?: string | null
          terms_accepted_at?: string | null
          updated_at?: string | null
          username?: string | null
          verification_documents?: Json | null
          verification_status?: string | null
        }
        Relationships: []
      }
      solution_votes: {
        Row: {
          created_at: string | null
          id: string
          solution_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          solution_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
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
          status: string | null
          title: string
          updated_at: string | null
          votes: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          estimated_cost: number
          id?: string
          issue_id: string
          proposed_by: string
          status?: string | null
          title: string
          updated_at?: string | null
          votes?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          estimated_cost?: number
          id?: string
          issue_id?: string
          proposed_by?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          votes?: number | null
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
          type: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          issue_id: string
          type?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          issue_id?: string
          type?: string | null
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
      create_missing_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          status: string
        }[]
      }
      create_profile_for_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      decrement_issue_votes: {
        Args: { issue_id: string }
        Returns: undefined
      }
      decrement_issue_watchers: {
        Args: { issue_id: string }
        Returns: undefined
      }
      decrement_solution_votes: {
        Args: { solution_id: string }
        Returns: undefined
      }
      get_user_issues: {
        Args: { user_id: string }
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
        Args: { issue_id: string }
        Returns: undefined
      }
      increment_issue_watchers: {
        Args: { issue_id: string }
        Returns: undefined
      }
      increment_solution_votes: {
        Args: { solution_id: string }
        Returns: undefined
      }
      sync_missing_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          action: string
        }[]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
