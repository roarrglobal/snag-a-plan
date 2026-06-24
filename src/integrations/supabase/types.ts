export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analyses: {
        Row: {
          bottom_line: Json | null
          category: string | null
          created_at: string
          gate_status: string
          id: string
          original_input: string
          owner_name: string | null
          result: Json
          signal_due_date: string | null
          source_file_url: string | null
          source_module: string | null
          source_session_id: string | null
          source_type: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bottom_line?: Json | null
          category?: string | null
          created_at?: string
          gate_status?: string
          id?: string
          original_input: string
          owner_name?: string | null
          result: Json
          signal_due_date?: string | null
          source_file_url?: string | null
          source_module?: string | null
          source_session_id?: string | null
          source_type?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bottom_line?: Json | null
          category?: string | null
          created_at?: string
          gate_status?: string
          id?: string
          original_input?: string
          owner_name?: string | null
          result?: Json
          signal_due_date?: string | null
          source_file_url?: string | null
          source_module?: string | null
          source_session_id?: string | null
          source_type?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: Database["public"]["Enums"]["audit_entity_type"]
          event_data: Json
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id: string
          ip_address: string | null
          team_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type: Database["public"]["Enums"]["audit_entity_type"]
          event_data?: Json
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          ip_address?: string | null
          team_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: Database["public"]["Enums"]["audit_entity_type"]
          event_data?: Json
          event_type?: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          ip_address?: string | null
          team_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_leads: {
        Row: {
          asked_about_enterprise: boolean | null
          asked_about_pricing: boolean | null
          asked_for_demo: boolean | null
          converted_to_signup: boolean | null
          created_at: string | null
          email: string
          first_message: string | null
          first_name: string
          id: string
          interested_in_team: boolean | null
          last_interaction_at: string | null
          messages_count: number | null
          referrer: string | null
          source_page: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          asked_about_enterprise?: boolean | null
          asked_about_pricing?: boolean | null
          asked_for_demo?: boolean | null
          converted_to_signup?: boolean | null
          created_at?: string | null
          email: string
          first_message?: string | null
          first_name: string
          id?: string
          interested_in_team?: boolean | null
          last_interaction_at?: string | null
          messages_count?: number | null
          referrer?: string | null
          source_page?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          asked_about_enterprise?: boolean | null
          asked_about_pricing?: boolean | null
          asked_for_demo?: boolean | null
          converted_to_signup?: boolean | null
          created_at?: string | null
          email?: string
          first_message?: string | null
          first_name?: string
          id?: string
          interested_in_team?: boolean | null
          last_interaction_at?: string | null
          messages_count?: number | null
          referrer?: string | null
          source_page?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      decision_templates: {
        Row: {
          blind_spot_library: Json
          created_at: string
          created_by: string | null
          department: Database["public"]["Enums"]["department_type"]
          description: string | null
          failure_mode_library: Json
          id: string
          input_fields: Json
          is_system: boolean
          name: string
          prompt_additions: string | null
          team_id: string | null
          updated_at: string
          usage_count: number
        }
        Insert: {
          blind_spot_library?: Json
          created_at?: string
          created_by?: string | null
          department: Database["public"]["Enums"]["department_type"]
          description?: string | null
          failure_mode_library?: Json
          id?: string
          input_fields?: Json
          is_system?: boolean
          name: string
          prompt_additions?: string | null
          team_id?: string | null
          updated_at?: string
          usage_count?: number
        }
        Update: {
          blind_spot_library?: Json
          created_at?: string
          created_by?: string | null
          department?: Database["public"]["Enums"]["department_type"]
          description?: string | null
          failure_mode_library?: Json
          id?: string
          input_fields?: Json
          is_system?: boolean
          name?: string
          prompt_additions?: string | null
          team_id?: string | null
          updated_at?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "decision_templates_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          ai_nudge: string | null
          category: string | null
          chosen_option: string | null
          confidence: number | null
          created_at: string
          deadline: string | null
          decision_text: string
          deep_snag_id: string | null
          followup_enabled: boolean | null
          id: string
          options: Json | null
          outcome_check_date: string | null
          outcome_lesson: string | null
          outcome_logged_at: string | null
          outcome_notes: string | null
          outcome_proceeded: string | null
          outcome_result: string | null
          outcome_status: string | null
          risks_materialized: string[] | null
          stakes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_nudge?: string | null
          category?: string | null
          chosen_option?: string | null
          confidence?: number | null
          created_at?: string
          deadline?: string | null
          decision_text: string
          deep_snag_id?: string | null
          followup_enabled?: boolean | null
          id?: string
          options?: Json | null
          outcome_check_date?: string | null
          outcome_lesson?: string | null
          outcome_logged_at?: string | null
          outcome_notes?: string | null
          outcome_proceeded?: string | null
          outcome_result?: string | null
          outcome_status?: string | null
          risks_materialized?: string[] | null
          stakes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_nudge?: string | null
          category?: string | null
          chosen_option?: string | null
          confidence?: number | null
          created_at?: string
          deadline?: string | null
          decision_text?: string
          deep_snag_id?: string | null
          followup_enabled?: boolean | null
          id?: string
          options?: Json | null
          outcome_check_date?: string | null
          outcome_lesson?: string | null
          outcome_logged_at?: string | null
          outcome_notes?: string | null
          outcome_proceeded?: string | null
          outcome_result?: string | null
          outcome_status?: string | null
          risks_materialized?: string[] | null
          stakes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "decisions_deep_snag_id_fkey"
            columns: ["deep_snag_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      department_insights: {
        Row: {
          created_at: string
          decision_count: number
          department: Database["public"]["Enums"]["department_type"]
          id: string
          insight_data: Json
          insight_type: Database["public"]["Enums"]["insight_type"]
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          decision_count?: number
          department: Database["public"]["Enums"]["department_type"]
          id?: string
          insight_data?: Json
          insight_type: Database["public"]["Enums"]["insight_type"]
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          decision_count?: number
          department?: Database["public"]["Enums"]["department_type"]
          id?: string
          insight_data?: Json
          insight_type?: Database["public"]["Enums"]["insight_type"]
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_insights_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      email_preferences: {
        Row: {
          id: string
          outcome_reminders: boolean
          product_updates: boolean
          team_activity: boolean
          unsubscribed_all: boolean
          updated_at: string
          user_id: string
          weekly_digest: boolean
        }
        Insert: {
          id?: string
          outcome_reminders?: boolean
          product_updates?: boolean
          team_activity?: boolean
          unsubscribed_all?: boolean
          updated_at?: string
          user_id: string
          weekly_digest?: boolean
        }
        Update: {
          id?: string
          outcome_reminders?: boolean
          product_updates?: boolean
          team_activity?: boolean
          unsubscribed_all?: boolean
          updated_at?: string
          user_id?: string
          weekly_digest?: boolean
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          created_at: string
          email_type: Database["public"]["Enums"]["email_type"]
          error_message: string | null
          id: string
          retry_count: number
          scheduled_for: string
          sent_at: string | null
          status: Database["public"]["Enums"]["email_status"]
          subject: string
          team_id: string | null
          template_data: Json
          to_email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_type: Database["public"]["Enums"]["email_type"]
          error_message?: string | null
          id?: string
          retry_count?: number
          scheduled_for?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_status"]
          subject: string
          team_id?: string | null
          template_data?: Json
          to_email: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_type?: Database["public"]["Enums"]["email_type"]
          error_message?: string | null
          id?: string
          retry_count?: number
          scheduled_for?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_status"]
          subject?: string
          team_id?: string | null
          template_data?: Json
          to_email?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      framework_analyses: {
        Row: {
          ai_enhancement: Json | null
          created_at: string
          framework_type: string
          id: string
          inputs: Json
          title: string | null
          updated_at: string
          user_id: string
          visual_data: Json | null
        }
        Insert: {
          ai_enhancement?: Json | null
          created_at?: string
          framework_type: string
          id?: string
          inputs?: Json
          title?: string | null
          updated_at?: string
          user_id: string
          visual_data?: Json | null
        }
        Update: {
          ai_enhancement?: Json | null
          created_at?: string
          framework_type?: string
          id?: string
          inputs?: Json
          title?: string | null
          updated_at?: string
          user_id?: string
          visual_data?: Json | null
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          completed_at: string
          created_at: string
          habit_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          completed_at: string
          created_at?: string
          habit_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          habit_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          best_streak: number | null
          category: string | null
          created_at: string
          current_streak: number | null
          frequency: string
          frequency_days: number[] | null
          id: string
          is_active: boolean | null
          name: string
          reminder_time: string | null
          user_id: string
          why_it_matters: string | null
        }
        Insert: {
          best_streak?: number | null
          category?: string | null
          created_at?: string
          current_streak?: number | null
          frequency?: string
          frequency_days?: number[] | null
          id?: string
          is_active?: boolean | null
          name: string
          reminder_time?: string | null
          user_id: string
          why_it_matters?: string | null
        }
        Update: {
          best_streak?: number | null
          category?: string | null
          created_at?: string
          current_streak?: number | null
          frequency?: string
          frequency_days?: number[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          reminder_time?: string | null
          user_id?: string
          why_it_matters?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: Json
          created_at: string
          entry_type: string
          id: string
          linked_analysis_id: string | null
          linked_post_mortem_id: string | null
          mood: string | null
          updated_at: string
          user_id: string
          word_count: number | null
        }
        Insert: {
          content?: Json
          created_at?: string
          entry_type: string
          id?: string
          linked_analysis_id?: string | null
          linked_post_mortem_id?: string | null
          mood?: string | null
          updated_at?: string
          user_id: string
          word_count?: number | null
        }
        Update: {
          content?: Json
          created_at?: string
          entry_type?: string
          id?: string
          linked_analysis_id?: string | null
          linked_post_mortem_id?: string | null
          mood?: string | null
          updated_at?: string
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_linked_analysis_id_fkey"
            columns: ["linked_analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_linked_post_mortem_id_fkey"
            columns: ["linked_post_mortem_id"]
            isOneToOne: false
            referencedRelation: "post_mortems"
            referencedColumns: ["id"]
          },
        ]
      }
      kill_criteria_reminders: {
        Row: {
          analysis_id: string | null
          created_at: string
          criterion_text: string
          decision_id: string | null
          id: string
          reminder_date: string
          reminder_enabled: boolean | null
          responded_at: string | null
          response: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string
          criterion_text: string
          decision_id?: string | null
          id?: string
          reminder_date: string
          reminder_enabled?: boolean | null
          responded_at?: string | null
          response?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          created_at?: string
          criterion_text?: string
          decision_id?: string | null
          id?: string
          reminder_date?: string
          reminder_enabled?: boolean | null
          responded_at?: string | null
          response?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kill_criteria_reminders_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kill_criteria_reminders_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      mystical_purchases: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          product_type: string
          status: string
          stripe_payment_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          product_type: string
          status?: string
          stripe_payment_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          product_type?: string
          status?: string
          stripe_payment_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mystical_readings: {
        Row: {
          created_at: string
          decision_id: string | null
          id: string
          reading_data: Json
          reading_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          decision_id?: string | null
          id?: string
          reading_data?: Json
          reading_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          decision_id?: string | null
          id?: string
          reading_data?: Json
          reading_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mystical_readings_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      nerve_intake_forms: {
        Row: {
          admin_notes: string | null
          company_arr: string | null
          created_at: string
          current_situation: string
          how_found: string | null
          id: string
          modules_requested: string[]
          reviewed_at: string | null
          reviewed_by: string | null
          submitted_at: string
          team_context: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          company_arr?: string | null
          created_at?: string
          current_situation: string
          how_found?: string | null
          id?: string
          modules_requested?: string[]
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string
          team_context?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          company_arr?: string | null
          created_at?: string
          current_situation?: string
          how_found?: string | null
          id?: string
          modules_requested?: string[]
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string
          team_context?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nerve_module_access: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          created_at: string
          id: string
          module: string
          notes: string | null
          requested_at: string
          status: string
          trial_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          id?: string
          module: string
          notes?: string | null
          requested_at?: string
          status?: string
          trial_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          id?: string
          module?: string
          notes?: string | null
          requested_at?: string
          status?: string
          trial_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nerve_user_profiles: {
        Row: {
          company_name: string
          created_at: string
          full_name: string
          id: string
          is_admin: boolean
          job_title: string | null
          notes: string | null
          onboarding_status: string
          primary_module: string | null
          team_size: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string
          created_at?: string
          full_name?: string
          id: string
          is_admin?: boolean
          job_title?: string | null
          notes?: string | null
          onboarding_status?: string
          primary_module?: string | null
          team_size?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          full_name?: string
          id?: string
          is_admin?: boolean
          job_title?: string | null
          notes?: string | null
          onboarding_status?: string
          primary_module?: string | null
          team_size?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          body: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          read: boolean
          team_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          read?: boolean
          team_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          read?: boolean
          team_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      post_mortems: {
        Row: {
          ai_analysis: Json | null
          created_at: string
          description: string
          id: string
          linked_decision_id: string | null
          outcome_rating: number | null
          outcome_status: string | null
          post_mortem_type: string
          source_journal_id: string | null
          timeframe_end: string | null
          timeframe_start: string | null
          title: string | null
          updated_at: string
          user_id: string
          user_inputs: Json
        }
        Insert: {
          ai_analysis?: Json | null
          created_at?: string
          description: string
          id?: string
          linked_decision_id?: string | null
          outcome_rating?: number | null
          outcome_status?: string | null
          post_mortem_type: string
          source_journal_id?: string | null
          timeframe_end?: string | null
          timeframe_start?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          user_inputs?: Json
        }
        Update: {
          ai_analysis?: Json | null
          created_at?: string
          description?: string
          id?: string
          linked_decision_id?: string | null
          outcome_rating?: number | null
          outcome_status?: string | null
          post_mortem_type?: string
          source_journal_id?: string | null
          timeframe_end?: string | null
          timeframe_start?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          user_inputs?: Json
        }
        Relationships: [
          {
            foreignKeyName: "post_mortems_linked_decision_id_fkey"
            columns: ["linked_decision_id"]
            isOneToOne: false
            referencedRelation: "decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_mortems_source_journal_id_fkey"
            columns: ["source_journal_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          allow_connections: boolean | null
          avatar_url: string | null
          bio: string | null
          birth_place: string | null
          birth_time: string | null
          created_at: string
          date_of_birth: string | null
          deep_snags_used: number | null
          discount_code: string | null
          discoverable: boolean | null
          display_name: string | null
          focus_areas: string[] | null
          hobbies: string[] | null
          id: string
          interests: string[] | null
          life_goals: string[] | null
          life_path_number: number | null
          lifetime_deep_snags_used: number | null
          lifetime_frameworks_used: number | null
          lifetime_post_mortems_used: number | null
          linkedin_url: string | null
          location: string | null
          preferences: Json | null
          profile_completed: boolean | null
          retros_used: number | null
          role: string | null
          show_snags: boolean | null
          subscription_ends_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          trial_ends_at: string | null
          trial_expired: boolean | null
          trial_start_date: string | null
          updated_at: string
          user_id: string
          user_type: string | null
          visibility: string | null
          waitlist_joined: boolean | null
          waitlist_joined_at: string | null
          zodiac_chinese: string | null
          zodiac_vedic: string | null
          zodiac_western: string | null
        }
        Insert: {
          allow_connections?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          birth_place?: string | null
          birth_time?: string | null
          created_at?: string
          date_of_birth?: string | null
          deep_snags_used?: number | null
          discount_code?: string | null
          discoverable?: boolean | null
          display_name?: string | null
          focus_areas?: string[] | null
          hobbies?: string[] | null
          id?: string
          interests?: string[] | null
          life_goals?: string[] | null
          life_path_number?: number | null
          lifetime_deep_snags_used?: number | null
          lifetime_frameworks_used?: number | null
          lifetime_post_mortems_used?: number | null
          linkedin_url?: string | null
          location?: string | null
          preferences?: Json | null
          profile_completed?: boolean | null
          retros_used?: number | null
          role?: string | null
          show_snags?: boolean | null
          subscription_ends_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          trial_expired?: boolean | null
          trial_start_date?: string | null
          updated_at?: string
          user_id: string
          user_type?: string | null
          visibility?: string | null
          waitlist_joined?: boolean | null
          waitlist_joined_at?: string | null
          zodiac_chinese?: string | null
          zodiac_vedic?: string | null
          zodiac_western?: string | null
        }
        Update: {
          allow_connections?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          birth_place?: string | null
          birth_time?: string | null
          created_at?: string
          date_of_birth?: string | null
          deep_snags_used?: number | null
          discount_code?: string | null
          discoverable?: boolean | null
          display_name?: string | null
          focus_areas?: string[] | null
          hobbies?: string[] | null
          id?: string
          interests?: string[] | null
          life_goals?: string[] | null
          life_path_number?: number | null
          lifetime_deep_snags_used?: number | null
          lifetime_frameworks_used?: number | null
          lifetime_post_mortems_used?: number | null
          linkedin_url?: string | null
          location?: string | null
          preferences?: Json | null
          profile_completed?: boolean | null
          retros_used?: number | null
          role?: string | null
          show_snags?: boolean | null
          subscription_ends_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          trial_expired?: boolean | null
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
          visibility?: string | null
          waitlist_joined?: boolean | null
          waitlist_joined_at?: string | null
          zodiac_chinese?: string | null
          zodiac_vedic?: string | null
          zodiac_western?: string | null
        }
        Relationships: []
      }
      quick_retros: {
        Row: {
          ai_nudge: string | null
          category: string
          created_at: string
          description: string
          full_post_mortem_id: string | null
          id: string
          lesson: string
          outcome_rating: string
          source_journal_id: string | null
          updated_at: string
          user_id: string
          what_didnt: string | null
          what_worked: string | null
        }
        Insert: {
          ai_nudge?: string | null
          category: string
          created_at?: string
          description: string
          full_post_mortem_id?: string | null
          id?: string
          lesson: string
          outcome_rating: string
          source_journal_id?: string | null
          updated_at?: string
          user_id: string
          what_didnt?: string | null
          what_worked?: string | null
        }
        Update: {
          ai_nudge?: string | null
          category?: string
          created_at?: string
          description?: string
          full_post_mortem_id?: string | null
          id?: string
          lesson?: string
          outcome_rating?: string
          source_journal_id?: string | null
          updated_at?: string
          user_id?: string
          what_didnt?: string | null
          what_worked?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quick_retros_full_post_mortem_id_fkey"
            columns: ["full_post_mortem_id"]
            isOneToOne: false
            referencedRelation: "post_mortems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quick_retros_source_journal_id_fkey"
            columns: ["source_journal_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_sessions: {
        Row: {
          binding_constraint: Json
          company_inputs: Json
          completed: boolean
          created_at: string
          financial_impact: Json
          guest_email: string | null
          id: string
          pillar_scores: Json
          snag_session_id: string | null
          status: string
          updated_at: string
          user_id: string | null
          zero_session_id: string | null
        }
        Insert: {
          binding_constraint: Json
          company_inputs: Json
          completed?: boolean
          created_at?: string
          financial_impact: Json
          guest_email?: string | null
          id?: string
          pillar_scores: Json
          snag_session_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          zero_session_id?: string | null
        }
        Update: {
          binding_constraint?: Json
          company_inputs?: Json
          completed?: boolean
          created_at?: string
          financial_impact?: Json
          guest_email?: string | null
          id?: string
          pillar_scores?: Json
          snag_session_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          zero_session_id?: string | null
        }
        Relationships: []
      }
      shared_snags: {
        Row: {
          analysis_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          share_config: Json | null
          short_code: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          share_config?: Json | null
          short_code?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          analysis_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          share_config?: Json | null
          short_code?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_snags_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      shares: {
        Row: {
          analysis_id: string | null
          created_at: string | null
          id: string
          platform: string
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string | null
          id?: string
          platform: string
        }
        Update: {
          analysis_id?: string | null
          created_at?: string | null
          id?: string
          platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "shares_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      team_activity: {
        Row: {
          action_type: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          team_id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          team_id: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_activity_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_analyses: {
        Row: {
          analysis_type: string
          created_at: string
          decision_id: string
          id: string
          input_text: string
          output_json: Json | null
          processing_time_ms: number | null
          team_id: string
          token_count: number | null
          user_id: string
        }
        Insert: {
          analysis_type?: string
          created_at?: string
          decision_id: string
          id?: string
          input_text: string
          output_json?: Json | null
          processing_time_ms?: number | null
          team_id: string
          token_count?: number | null
          user_id: string
        }
        Update: {
          analysis_type?: string
          created_at?: string
          decision_id?: string
          id?: string
          input_text?: string
          output_json?: Json | null
          processing_time_ms?: number | null
          team_id?: string
          token_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_analyses_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "team_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_analyses_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_decision_comments: {
        Row: {
          content: string
          created_at: string
          decision_id: string
          id: string
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          decision_id: string
          id?: string
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          decision_id?: string
          id?: string
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_decision_comments_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "team_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_decision_comments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_decisions: {
        Row: {
          category: string | null
          chosen_option: string | null
          created_at: string
          created_by: string
          deadline: string | null
          decided_at: string | null
          decision_text: string
          description: string | null
          id: string
          input_context: string | null
          options: Json | null
          outcome_check_date: string | null
          outcome_notes: string | null
          resolved_at: string | null
          reversibility: string | null
          search_vector: unknown
          stakes: string | null
          status: string
          team_id: string
          template_id: string | null
          timeline: string | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          category?: string | null
          chosen_option?: string | null
          created_at?: string
          created_by: string
          deadline?: string | null
          decided_at?: string | null
          decision_text: string
          description?: string | null
          id?: string
          input_context?: string | null
          options?: Json | null
          outcome_check_date?: string | null
          outcome_notes?: string | null
          resolved_at?: string | null
          reversibility?: string | null
          search_vector?: unknown
          stakes?: string | null
          status?: string
          team_id: string
          template_id?: string | null
          timeline?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          category?: string | null
          chosen_option?: string | null
          created_at?: string
          created_by?: string
          deadline?: string | null
          decided_at?: string | null
          decision_text?: string
          description?: string | null
          id?: string
          input_context?: string | null
          options?: Json | null
          outcome_check_date?: string | null
          outcome_notes?: string | null
          resolved_at?: string | null
          reversibility?: string | null
          search_vector?: unknown
          stakes?: string | null
          status?: string
          team_id?: string
          template_id?: string | null
          timeline?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_decisions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_decisions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "decision_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string | null
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["team_invite_role"]
          team_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["team_invite_role"]
          team_id: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["team_invite_role"]
          team_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          last_active_at: string | null
          role: Database["public"]["Enums"]["team_member_role"]
          status: Database["public"]["Enums"]["team_member_status"]
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          last_active_at?: string | null
          role?: Database["public"]["Enums"]["team_member_role"]
          status?: Database["public"]["Enums"]["team_member_status"]
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          last_active_at?: string | null
          role?: Database["public"]["Enums"]["team_member_role"]
          status?: Database["public"]["Enums"]["team_member_status"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_outcomes: {
        Row: {
          analysis_id: string | null
          created_at: string
          decision_id: string
          id: string
          lesson: string | null
          predictions_hit: Json | null
          predictions_missed: Json | null
          result: string
          satisfaction: number | null
          team_id: string
          user_id: string
          what_happened: string | null
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string
          decision_id: string
          id?: string
          lesson?: string | null
          predictions_hit?: Json | null
          predictions_missed?: Json | null
          result: string
          satisfaction?: number | null
          team_id: string
          user_id: string
          what_happened?: string | null
        }
        Update: {
          analysis_id?: string | null
          created_at?: string
          decision_id?: string
          id?: string
          lesson?: string | null
          predictions_hit?: Json | null
          predictions_missed?: Json | null
          result?: string
          satisfaction?: number | null
          team_id?: string
          user_id?: string
          what_happened?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_outcomes_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "team_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_outcomes_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "team_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_outcomes_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_usage: {
        Row: {
          deep_snags_used: number | null
          id: string
          month: string
          post_mortems_used: number | null
          quick_snags_used: number | null
          team_id: string
          updated_at: string | null
        }
        Insert: {
          deep_snags_used?: number | null
          id?: string
          month: string
          post_mortems_used?: number | null
          quick_snags_used?: number | null
          team_id: string
          updated_at?: string | null
        }
        Update: {
          deep_snags_used?: number | null
          id?: string
          month?: string
          post_mortems_used?: number | null
          quick_snags_used?: number | null
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_usage_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          settings: Json | null
          slug: string
          subscription_status: Database["public"]["Enums"]["team_subscription_status"]
          subscription_tier: Database["public"]["Enums"]["team_subscription_tier"]
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          settings?: Json | null
          slug: string
          subscription_status?: Database["public"]["Enums"]["team_subscription_status"]
          subscription_tier?: Database["public"]["Enums"]["team_subscription_tier"]
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          settings?: Json | null
          slug?: string
          subscription_status?: Database["public"]["Enums"]["team_subscription_status"]
          subscription_tier?: Database["public"]["Enums"]["team_subscription_tier"]
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tier_limits: {
        Row: {
          analyses_monthly: number
          decisions_daily: number | null
          documents_monthly: number
          frameworks_monthly: number | null
          habits_limit: number | null
          journal_daily: number | null
          max_file_bytes: number
          max_words: number
          post_mortems_monthly: number | null
          storage_bytes: number
          tier: string
        }
        Insert: {
          analyses_monthly: number
          decisions_daily?: number | null
          documents_monthly: number
          frameworks_monthly?: number | null
          habits_limit?: number | null
          journal_daily?: number | null
          max_file_bytes: number
          max_words: number
          post_mortems_monthly?: number | null
          storage_bytes: number
          tier: string
        }
        Update: {
          analyses_monthly?: number
          decisions_daily?: number | null
          documents_monthly?: number
          frameworks_monthly?: number | null
          habits_limit?: number | null
          journal_daily?: number | null
          max_file_bytes?: number
          max_words?: number
          post_mortems_monthly?: number | null
          storage_bytes?: number
          tier?: string
        }
        Relationships: []
      }
      usage: {
        Row: {
          analyses_limit: number
          analyses_used: number | null
          created_at: string | null
          decisions_today: number | null
          documents_limit: number
          documents_used: number | null
          frameworks_limit: number | null
          frameworks_used: number | null
          habits_limit: number | null
          habits_used: number | null
          id: string
          journal_entries_today: number | null
          period_end: string
          period_start: string
          post_mortems_limit: number | null
          post_mortems_used: number | null
          storage_limit_bytes: number
          storage_used_bytes: number | null
          updated_at: string | null
          user_id: string
          visual_exports_used: number | null
        }
        Insert: {
          analyses_limit: number
          analyses_used?: number | null
          created_at?: string | null
          decisions_today?: number | null
          documents_limit: number
          documents_used?: number | null
          frameworks_limit?: number | null
          frameworks_used?: number | null
          habits_limit?: number | null
          habits_used?: number | null
          id?: string
          journal_entries_today?: number | null
          period_end: string
          period_start: string
          post_mortems_limit?: number | null
          post_mortems_used?: number | null
          storage_limit_bytes: number
          storage_used_bytes?: number | null
          updated_at?: string | null
          user_id: string
          visual_exports_used?: number | null
        }
        Update: {
          analyses_limit?: number
          analyses_used?: number | null
          created_at?: string | null
          decisions_today?: number | null
          documents_limit?: number
          documents_used?: number | null
          frameworks_limit?: number | null
          frameworks_used?: number | null
          habits_limit?: number | null
          habits_used?: number | null
          id?: string
          journal_entries_today?: number | null
          period_end?: string
          period_start?: string
          post_mortems_limit?: number | null
          post_mortems_used?: number | null
          storage_limit_bytes?: number
          storage_used_bytes?: number | null
          updated_at?: string | null
          user_id?: string
          visual_exports_used?: number | null
        }
        Relationships: []
      }
      visual_exports: {
        Row: {
          created_at: string
          framework_type: string
          id: string
          image_url: string | null
          source_id: string
          source_type: string
          user_id: string
          visual_data: Json
        }
        Insert: {
          created_at?: string
          framework_type: string
          id?: string
          image_url?: string | null
          source_id: string
          source_type: string
          user_id: string
          visual_data?: Json
        }
        Update: {
          created_at?: string
          framework_type?: string
          id?: string
          image_url?: string | null
          source_id?: string
          source_type?: string
          user_id?: string
          visual_data?: Json
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          discount_code: string | null
          email: string
          id: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          discount_code?: string | null
          email: string
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          discount_code?: string | null
          email?: string
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      zero_sessions: {
        Row: {
          belief_statement: string | null
          classification: string | null
          context_text: string | null
          counter_position_response: string | null
          created_at: string
          decision_text: string | null
          guest_email: string | null
          id: string
          modification_note: string | null
          origin_selection: string | null
          overall_verdict: string | null
          pillar_name: string | null
          pillar_number: number | null
          scan_session_id: string | null
          stage1_register: Json | null
          stage2_inference: Json | null
          stage3_inversion: Json | null
          stage4_matrix: Json | null
          stage5_protocol: Json | null
          status: string
          updated_at: string
          user_id: string | null
          verdict: string | null
        }
        Insert: {
          belief_statement?: string | null
          classification?: string | null
          context_text?: string | null
          counter_position_response?: string | null
          created_at?: string
          decision_text?: string | null
          guest_email?: string | null
          id?: string
          modification_note?: string | null
          origin_selection?: string | null
          overall_verdict?: string | null
          pillar_name?: string | null
          pillar_number?: number | null
          scan_session_id?: string | null
          stage1_register?: Json | null
          stage2_inference?: Json | null
          stage3_inversion?: Json | null
          stage4_matrix?: Json | null
          stage5_protocol?: Json | null
          status?: string
          updated_at?: string
          user_id?: string | null
          verdict?: string | null
        }
        Update: {
          belief_statement?: string | null
          classification?: string | null
          context_text?: string | null
          counter_position_response?: string | null
          created_at?: string
          decision_text?: string | null
          guest_email?: string | null
          id?: string
          modification_note?: string | null
          origin_selection?: string | null
          overall_verdict?: string | null
          pillar_name?: string | null
          pillar_number?: number | null
          scan_session_id?: string | null
          stage1_register?: Json | null
          stage2_inference?: Json | null
          stage3_inversion?: Json | null
          stage4_matrix?: Json | null
          stage5_protocol?: Json | null
          status?: string
          updated_at?: string
          user_id?: string | null
          verdict?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zero_sessions_scan_session_id_fkey"
            columns: ["scan_session_id"]
            isOneToOne: false
            referencedRelation: "scan_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          allow_connections: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          discoverable: boolean | null
          display_name: string | null
          focus_areas: string[] | null
          id: string | null
          linkedin_url: string | null
          location: string | null
          role: string | null
          show_snags: boolean | null
          updated_at: string | null
          user_id: string | null
          visibility: string | null
        }
        Insert: {
          allow_connections?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          discoverable?: boolean | null
          display_name?: string | null
          focus_areas?: string[] | null
          id?: string | null
          linkedin_url?: string | null
          location?: string | null
          role?: string | null
          show_snags?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Update: {
          allow_connections?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          discoverable?: boolean | null
          display_name?: string | null
          focus_areas?: string[] | null
          id?: string | null
          linkedin_url?: string | null
          location?: string | null
          role?: string | null
          show_snags?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      scorecard_stats: {
        Row: {
          business_count: number | null
          career_count: number | null
          last_hour: number | null
          other_count: number | null
          personal_count: number | null
          total_analyses: number | null
          travel_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_invitation: {
        Args: { p_token: string; p_user_id: string }
        Returns: Json
      }
      auth_user_email: { Args: never; Returns: string }
      can_use_feature: {
        Args: { p_feature: string; p_user_id: string }
        Returns: boolean
      }
      check_feature_access: {
        Args: { p_feature: string; p_user_id: string }
        Returns: Json
      }
      custom_auth_email_hook: { Args: { event: Json }; Returns: Json }
      get_invite_details: { Args: { p_token: string }; Returns: Json }
      get_or_create_email_preferences: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          outcome_reminders: boolean
          product_updates: boolean
          team_activity: boolean
          unsubscribed_all: boolean
          updated_at: string
          user_id: string
          weekly_digest: boolean
        }
        SetofOptions: {
          from: "*"
          to: "email_preferences"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_or_create_team_usage: {
        Args: { p_team_id: string }
        Returns: {
          deep_snags_used: number | null
          id: string
          month: string
          post_mortems_used: number | null
          quick_snags_used: number | null
          team_id: string
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "team_usage"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_or_create_usage: {
        Args: { p_user_id: string }
        Returns: {
          analyses_limit: number
          analyses_used: number | null
          created_at: string | null
          decisions_today: number | null
          documents_limit: number
          documents_used: number | null
          frameworks_limit: number | null
          frameworks_used: number | null
          habits_limit: number | null
          habits_used: number | null
          id: string
          journal_entries_today: number | null
          period_end: string
          period_start: string
          post_mortems_limit: number | null
          post_mortems_used: number | null
          storage_limit_bytes: number
          storage_used_bytes: number | null
          updated_at: string | null
          user_id: string
          visual_exports_used: number | null
        }
        SetofOptions: {
          from: "*"
          to: "usage"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_team_analytics: {
        Args: { p_days?: number; p_team_id: string }
        Returns: Json
      }
      get_user_teams: { Args: { p_user_id: string }; Returns: Json }
      increment_deep_snags_used: {
        Args: { p_user_id: string }
        Returns: number
      }
      increment_document_usage: {
        Args: { p_file_size: number; p_user_id: string }
        Returns: boolean
      }
      increment_framework_usage: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      increment_lifetime_usage:
        | { Args: { p_feature: string; p_user_id: string }; Returns: undefined }
        | { Args: { p_feature: string; p_user_id: string }; Returns: undefined }
      increment_post_mortem_usage: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      increment_retros_used: { Args: { p_user_id: string }; Returns: number }
      increment_share_view: {
        Args: { p_short_code: string }
        Returns: undefined
      }
      increment_team_snag_usage: {
        Args: { p_team_id: string; p_type: string }
        Returns: undefined
      }
      increment_template_usage: {
        Args: { p_template_id: string }
        Returns: undefined
      }
      is_nerve_admin: { Args: never; Returns: boolean }
      is_team_admin: {
        Args: { p_team_id: string; p_user_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { p_team_id: string; p_user_id: string }
        Returns: boolean
      }
      is_trial_expired: { Args: { p_user_id: string }; Returns: boolean }
      search_team_decisions: {
        Args: {
          p_categories?: string[]
          p_creator_id?: string
          p_date_from?: string
          p_date_to?: string
          p_has_outcome?: boolean
          p_page?: number
          p_page_size?: number
          p_query?: string
          p_sort_by?: string
          p_stakes?: string[]
          p_statuses?: string[]
          p_team_id: string
          p_visibilities?: string[]
        }
        Returns: Json
      }
      update_member_activity: {
        Args: { p_team_id: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      audit_entity_type:
        | "decision"
        | "analysis"
        | "outcome"
        | "team"
        | "member"
        | "template"
        | "settings"
        | "export"
      audit_event_type:
        | "decision.created"
        | "decision.updated"
        | "decision.deleted"
        | "decision.status_changed"
        | "decision.visibility_changed"
        | "analysis.started"
        | "analysis.completed"
        | "analysis.failed"
        | "outcome.logged"
        | "outcome.updated"
        | "team.created"
        | "team.updated"
        | "team.settings_changed"
        | "member.invited"
        | "member.joined"
        | "member.role_changed"
        | "member.removed"
        | "member.left"
        | "template.created"
        | "template.updated"
        | "template.deleted"
        | "auth.login"
        | "auth.logout"
        | "auth.password_changed"
        | "export.pdf_generated"
        | "export.csv_downloaded"
      department_type:
        | "sales"
        | "finance"
        | "product"
        | "hr"
        | "marketing"
        | "operations"
        | "strategy"
      email_status: "pending" | "sent" | "failed" | "bounced"
      email_type:
        | "outcome_reminder"
        | "outcome_overdue"
        | "weekly_digest"
        | "analysis_complete"
        | "team_invite"
        | "welcome"
        | "trial_ending"
        | "trial_ended"
      insight_type: "blind_spot_pattern" | "failure_pattern" | "success_pattern"
      team_invite_role: "admin" | "member" | "viewer"
      team_member_role: "owner" | "admin" | "member" | "viewer"
      team_member_status: "pending" | "active" | "removed"
      team_subscription_status: "trialing" | "active" | "past_due" | "canceled"
      team_subscription_tier: "team" | "business" | "enterprise"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      audit_entity_type: [
        "decision",
        "analysis",
        "outcome",
        "team",
        "member",
        "template",
        "settings",
        "export",
      ],
      audit_event_type: [
        "decision.created",
        "decision.updated",
        "decision.deleted",
        "decision.status_changed",
        "decision.visibility_changed",
        "analysis.started",
        "analysis.completed",
        "analysis.failed",
        "outcome.logged",
        "outcome.updated",
        "team.created",
        "team.updated",
        "team.settings_changed",
        "member.invited",
        "member.joined",
        "member.role_changed",
        "member.removed",
        "member.left",
        "template.created",
        "template.updated",
        "template.deleted",
        "auth.login",
        "auth.logout",
        "auth.password_changed",
        "export.pdf_generated",
        "export.csv_downloaded",
      ],
      department_type: [
        "sales",
        "finance",
        "product",
        "hr",
        "marketing",
        "operations",
        "strategy",
      ],
      email_status: ["pending", "sent", "failed", "bounced"],
      email_type: [
        "outcome_reminder",
        "outcome_overdue",
        "weekly_digest",
        "analysis_complete",
        "team_invite",
        "welcome",
        "trial_ending",
        "trial_ended",
      ],
      insight_type: [
        "blind_spot_pattern",
        "failure_pattern",
        "success_pattern",
      ],
      team_invite_role: ["admin", "member", "viewer"],
      team_member_role: ["owner", "admin", "member", "viewer"],
      team_member_status: ["pending", "active", "removed"],
      team_subscription_status: ["trialing", "active", "past_due", "canceled"],
      team_subscription_tier: ["team", "business", "enterprise"],
    },
  },
} as const
