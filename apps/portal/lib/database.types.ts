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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_invites: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          full_name: string
          id: string
          invited_by: string | null
          metadata: Json | null
          role: string
          status: string
          temporary_password_hash: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          full_name: string
          id?: string
          invited_by?: string | null
          metadata?: Json | null
          role?: string
          status?: string
          temporary_password_hash?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          full_name?: string
          id?: string
          invited_by?: string | null
          metadata?: Json | null
          role?: string
          status?: string
          temporary_password_hash?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          diff_json: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          tenant_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          diff_json?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          tenant_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          diff_json?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      backup_logs: {
        Row: {
          backup_type: string
          completed_at: string | null
          created_at: string | null
          duration_seconds: number | null
          error_message: string | null
          id: string
          metadata: Json | null
          row_count: number | null
          started_at: string | null
          status: string
          storage_path: string | null
          storage_size_bytes: number | null
          table_count: number | null
        }
        Insert: {
          backup_type: string
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          row_count?: number | null
          started_at?: string | null
          status?: string
          storage_path?: string | null
          storage_size_bytes?: number | null
          table_count?: number | null
        }
        Update: {
          backup_type?: string
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          row_count?: number | null
          started_at?: string | null
          status?: string
          storage_path?: string | null
          storage_size_bytes?: number | null
          table_count?: number | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          contact_captured: boolean | null
          contact_captured_at: string | null
          created_at: string | null
          ended_at: string | null
          follow_up_completed: boolean | null
          follow_up_date: string | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          interested_in: string[] | null
          internal_notes: string | null
          ip_address: string | null
          is_guest: boolean | null
          landing_page: string | null
          lead_score: number | null
          lead_status: string | null
          message_count: number | null
          referrer: string | null
          session_id: string
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          contact_captured?: boolean | null
          contact_captured_at?: string | null
          created_at?: string | null
          ended_at?: string | null
          follow_up_completed?: boolean | null
          follow_up_date?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          interested_in?: string[] | null
          internal_notes?: string | null
          ip_address?: string | null
          is_guest?: boolean | null
          landing_page?: string | null
          lead_score?: number | null
          lead_status?: string | null
          message_count?: number | null
          referrer?: string | null
          session_id: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          contact_captured?: boolean | null
          contact_captured_at?: string | null
          created_at?: string | null
          ended_at?: string | null
          follow_up_completed?: boolean | null
          follow_up_date?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          interested_in?: string[] | null
          internal_notes?: string | null
          ip_address?: string | null
          is_guest?: boolean | null
          landing_page?: string | null
          lead_score?: number | null
          lead_status?: string | null
          message_count?: number | null
          referrer?: string | null
          session_id?: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          contains_email: boolean | null
          contains_phone: boolean | null
          content: string
          conversation_id: string
          created_at: string | null
          extracted_email: string | null
          extracted_phone: string | null
          id: string
          role: string
        }
        Insert: {
          contains_email?: boolean | null
          contains_phone?: boolean | null
          content: string
          conversation_id: string
          created_at?: string | null
          extracted_email?: string | null
          extracted_phone?: string | null
          id?: string
          role: string
        }
        Update: {
          contains_email?: boolean | null
          contains_phone?: boolean | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          extracted_email?: string | null
          extracted_phone?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_leads_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      email_automations: {
        Row: {
          clicked_count: number | null
          content_html: string | null
          content_json: Json | null
          created_at: string | null
          created_by: string | null
          delay_minutes: number | null
          description: string | null
          from_email: string
          from_name: string
          id: string
          is_active: boolean | null
          name: string
          opened_count: number | null
          sent_count: number | null
          subject: string
          template_id: string | null
          trigger_config: Json
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          clicked_count?: number | null
          content_html?: string | null
          content_json?: Json | null
          created_at?: string | null
          created_by?: string | null
          delay_minutes?: number | null
          description?: string | null
          from_email: string
          from_name?: string
          id?: string
          is_active?: boolean | null
          name: string
          opened_count?: number | null
          sent_count?: number | null
          subject: string
          template_id?: string | null
          trigger_config?: Json
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          clicked_count?: number | null
          content_html?: string | null
          content_json?: Json | null
          created_at?: string | null
          created_by?: string | null
          delay_minutes?: number | null
          description?: string | null
          from_email?: string
          from_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          opened_count?: number | null
          sent_count?: number | null
          subject?: string
          template_id?: string | null
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          bounced_count: number | null
          clicked_count: number | null
          content_html: string | null
          content_json: Json | null
          created_at: string | null
          created_by: string | null
          from_email: string
          from_name: string
          id: string
          name: string
          opened_count: number | null
          preview_text: string | null
          recipient_count: number | null
          reply_to: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          subject: string
          tags: string[] | null
          template_id: string | null
          unsubscribed_count: number | null
          updated_at: string | null
        }
        Insert: {
          bounced_count?: number | null
          clicked_count?: number | null
          content_html?: string | null
          content_json?: Json | null
          created_at?: string | null
          created_by?: string | null
          from_email: string
          from_name?: string
          id?: string
          name: string
          opened_count?: number | null
          preview_text?: string | null
          recipient_count?: number | null
          reply_to?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          tags?: string[] | null
          template_id?: string | null
          unsubscribed_count?: number | null
          updated_at?: string | null
        }
        Update: {
          bounced_count?: number | null
          clicked_count?: number | null
          content_html?: string | null
          content_json?: Json | null
          created_at?: string | null
          created_by?: string | null
          from_email?: string
          from_name?: string
          id?: string
          name?: string
          opened_count?: number | null
          preview_text?: string | null
          recipient_count?: number | null
          reply_to?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          tags?: string[] | null
          template_id?: string | null
          unsubscribed_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          converted_at: string | null
          country: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          estimated_locations: number | null
          full_name: string | null
          how_heard_about_us: string | null
          id: string
          interests: string[] | null
          ip_address: string | null
          landing_page: string | null
          marketing_consent: boolean | null
          newsletter_consent: boolean | null
          notes: string | null
          org_name: string | null
          org_type: string | null
          phone: string | null
          postal_code: string | null
          referrer: string | null
          source: string | null
          state: string | null
          status: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          converted_at?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          estimated_locations?: number | null
          full_name?: string | null
          how_heard_about_us?: string | null
          id?: string
          interests?: string[] | null
          ip_address?: string | null
          landing_page?: string | null
          marketing_consent?: boolean | null
          newsletter_consent?: boolean | null
          notes?: string | null
          org_name?: string | null
          org_type?: string | null
          phone?: string | null
          postal_code?: string | null
          referrer?: string | null
          source?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          converted_at?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          estimated_locations?: number | null
          full_name?: string | null
          how_heard_about_us?: string | null
          id?: string
          interests?: string[] | null
          ip_address?: string | null
          landing_page?: string | null
          marketing_consent?: boolean | null
          newsletter_consent?: boolean | null
          notes?: string | null
          org_name?: string | null
          org_type?: string | null
          phone?: string | null
          postal_code?: string | null
          referrer?: string | null
          source?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          role: string
          status: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          status?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          status?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_wallets: {
        Row: {
          created_at: string
          external_id: string | null
          id: string
          is_primary: boolean
          label: string
          last_admin_reminder_at: string | null
          merchant_status_emailed_at: string | null
          merchant_status_emailed_for_request: string | null
          rejection_reason: string | null
          runner_client_id: string | null
          source: string
          status: string
          updated_at: string
          user_id: string
          verification_requested_at: string
          verified_at: string | null
          verified_by: string | null
          wallet_address: string
          wallet_network: string
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          id?: string
          is_primary?: boolean
          label: string
          last_admin_reminder_at?: string | null
          merchant_status_emailed_at?: string | null
          merchant_status_emailed_for_request?: string | null
          rejection_reason?: string | null
          runner_client_id?: string | null
          source?: string
          status?: string
          updated_at?: string
          user_id: string
          verification_requested_at?: string
          verified_at?: string | null
          verified_by?: string | null
          wallet_address: string
          wallet_network: string
        }
        Update: {
          created_at?: string
          external_id?: string | null
          id?: string
          is_primary?: boolean
          label?: string
          last_admin_reminder_at?: string | null
          merchant_status_emailed_at?: string | null
          merchant_status_emailed_for_request?: string | null
          rejection_reason?: string | null
          runner_client_id?: string | null
          source?: string
          status?: string
          updated_at?: string
          user_id?: string
          verification_requested_at?: string
          verified_at?: string | null
          verified_by?: string | null
          wallet_address?: string
          wallet_network?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_wallets_runner_client_id_fkey"
            columns: ["runner_client_id"]
            isOneToOne: false
            referencedRelation: "runner_api_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          company_name: string | null
          confirmed: boolean | null
          confirmed_at: string | null
          created_at: string | null
          email: string
          emails_clicked: number | null
          emails_opened: number | null
          emails_sent: number | null
          first_name: string | null
          id: string
          ip_address: string | null
          last_email_opened_at: string | null
          last_email_sent_at: string | null
          list_type: string | null
          resubscribed_at: string | null
          source: string | null
          status: string | null
          unsubscribe_reason: string | null
          unsubscribed_at: string | null
          updated_at: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          company_name?: string | null
          confirmed?: boolean | null
          confirmed_at?: string | null
          created_at?: string | null
          email: string
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          first_name?: string | null
          id?: string
          ip_address?: string | null
          last_email_opened_at?: string | null
          last_email_sent_at?: string | null
          list_type?: string | null
          resubscribed_at?: string | null
          source?: string | null
          status?: string | null
          unsubscribe_reason?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          company_name?: string | null
          confirmed?: boolean | null
          confirmed_at?: string | null
          created_at?: string | null
          email?: string
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          first_name?: string | null
          id?: string
          ip_address?: string | null
          last_email_opened_at?: string | null
          last_email_sent_at?: string | null
          list_type?: string | null
          resubscribed_at?: string | null
          source?: string | null
          status?: string | null
          unsubscribe_reason?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      runner_api_clients: {
        Row: {
          api_key: string
          api_secret: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key: string
          api_secret: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key?: string
          api_secret?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      runner_api_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          merchant_wallet_id: string | null
          payload: Json | null
          runner_client_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          merchant_wallet_id?: string | null
          payload?: Json | null
          runner_client_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          merchant_wallet_id?: string | null
          payload?: Json | null
          runner_client_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "runner_api_events_merchant_wallet_id_fkey"
            columns: ["merchant_wallet_id"]
            isOneToOne: false
            referencedRelation: "merchant_wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runner_api_events_runner_client_id_fkey"
            columns: ["runner_client_id"]
            isOneToOne: false
            referencedRelation: "runner_api_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_outbound_log: {
        Row: {
          body_preview: string
          created_at: string
          error: string | null
          event: string
          id: string
          idempotency_key: string | null
          provider: string | null
          provider_message_id: string | null
          status: string
          to_phone_e164: string
          user_id: string | null
        }
        Insert: {
          body_preview: string
          created_at?: string
          error?: string | null
          event: string
          id?: string
          idempotency_key?: string | null
          provider?: string | null
          provider_message_id?: string | null
          status?: string
          to_phone_e164: string
          user_id?: string | null
        }
        Update: {
          body_preview?: string
          created_at?: string
          error?: string | null
          event?: string
          id?: string
          idempotency_key?: string | null
          provider?: string | null
          provider_message_id?: string | null
          status?: string
          to_phone_e164?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sms_phone_verification_challenges: {
        Row: {
          attempts: number
          code_hash: string
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          phone_e164: string
          user_id: string
        }
        Insert: {
          attempts?: number
          code_hash: string
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          phone_e164: string
          user_id: string
        }
        Update: {
          attempts?: number
          code_hash?: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          phone_e164?: string
          user_id?: string
        }
        Relationships: []
      }
      staff_activity: {
        Row: {
          created_at: string | null
          current_page: string | null
          id: string
          is_online: boolean | null
          last_action: string | null
          last_resource: string | null
          last_seen_at: string | null
          leads_handled_today: number | null
          messages_sent_today: number | null
          orders_processed_today: number | null
          session_started_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_page?: string | null
          id?: string
          is_online?: boolean | null
          last_action?: string | null
          last_resource?: string | null
          last_seen_at?: string | null
          leads_handled_today?: number | null
          messages_sent_today?: number | null
          orders_processed_today?: number | null
          session_started_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_page?: string | null
          id?: string
          is_online?: boolean | null
          last_action?: string | null
          last_resource?: string | null
          last_seen_at?: string | null
          leads_handled_today?: number | null
          messages_sent_today?: number | null
          orders_processed_today?: number | null
          session_started_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tenant_settings: {
        Row: {
          accepts_card: boolean | null
          accepts_cash: boolean | null
          created_at: string | null
          currency: string | null
          custom_settings: Json | null
          delivery_fee_cents: number | null
          favicon_url: string | null
          free_delivery_threshold_cents: number | null
          id: string
          logo_url: string | null
          meta_description: string | null
          meta_title: string | null
          min_order_amount_cents: number | null
          notify_email: string | null
          notify_low_stock: boolean | null
          notify_new_customer: boolean | null
          notify_new_order: boolean | null
          notify_order_status: boolean | null
          notify_phone: string | null
          operating_hours: Json | null
          social_links: Json | null
          store_address: Json | null
          store_email: string | null
          store_name: string | null
          store_phone: string | null
          tax_rate: number | null
          tenant_id: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          accepts_card?: boolean | null
          accepts_cash?: boolean | null
          created_at?: string | null
          currency?: string | null
          custom_settings?: Json | null
          delivery_fee_cents?: number | null
          favicon_url?: string | null
          free_delivery_threshold_cents?: number | null
          id?: string
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          min_order_amount_cents?: number | null
          notify_email?: string | null
          notify_low_stock?: boolean | null
          notify_new_customer?: boolean | null
          notify_new_order?: boolean | null
          notify_order_status?: boolean | null
          notify_phone?: string | null
          operating_hours?: Json | null
          social_links?: Json | null
          store_address?: Json | null
          store_email?: string | null
          store_name?: string | null
          store_phone?: string | null
          tax_rate?: number | null
          tenant_id: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          accepts_card?: boolean | null
          accepts_cash?: boolean | null
          created_at?: string | null
          currency?: string | null
          custom_settings?: Json | null
          delivery_fee_cents?: number | null
          favicon_url?: string | null
          free_delivery_threshold_cents?: number | null
          id?: string
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          min_order_amount_cents?: number | null
          notify_email?: string | null
          notify_low_stock?: boolean | null
          notify_new_customer?: boolean | null
          notify_new_order?: boolean | null
          notify_order_status?: boolean | null
          notify_phone?: string | null
          operating_hours?: Json | null
          social_links?: Json | null
          store_address?: Json | null
          store_email?: string | null
          store_name?: string | null
          store_phone?: string | null
          tax_rate?: number | null
          tenant_id?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          status?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          avatar_url: string | null
          business_type: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          email: string
          estimated_locations: number | null
          full_name: string | null
          how_heard_about_us: string | null
          id: string
          last_sign_in_at: string | null
          last_sign_in_ip: unknown
          newsletter_subscribed: boolean | null
          notification_preferences: Json | null
          number_of_locations: number | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          org_name: string | null
          org_type: string | null
          phone: string | null
          postal_code: string | null
          role: string | null
          security_score: number | null
          state: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          business_type?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          estimated_locations?: number | null
          full_name?: string | null
          how_heard_about_us?: string | null
          id: string
          last_sign_in_at?: string | null
          last_sign_in_ip?: unknown
          newsletter_subscribed?: boolean | null
          notification_preferences?: Json | null
          number_of_locations?: number | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          org_name?: string | null
          org_type?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: string | null
          security_score?: number | null
          state?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          business_type?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          estimated_locations?: number | null
          full_name?: string | null
          how_heard_about_us?: string | null
          id?: string
          last_sign_in_at?: string | null
          last_sign_in_ip?: unknown
          newsletter_subscribed?: boolean | null
          notification_preferences?: Json | null
          number_of_locations?: number | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          org_name?: string | null
          org_type?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: string | null
          security_score?: number | null
          state?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_security_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "security_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_security_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown
          last_activity_at: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          last_activity_at?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          last_activity_at?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "security_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          auto_reorder_enabled: boolean | null
          created_at: string | null
          currency: string | null
          delivery_auto_accept: boolean | null
          delivery_sound_alerts: boolean | null
          email_notifications: boolean | null
          id: string
          language: string | null
          marketing_emails: boolean | null
          order_updates: boolean | null
          preferred_shipping_method: string | null
          quote_notifications: boolean | null
          sms_disabled_at: string | null
          sms_notifications: boolean | null
          sms_opt_in_at: string | null
          sms_phone_e164: string | null
          sms_verified_at: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_reorder_enabled?: boolean | null
          created_at?: string | null
          currency?: string | null
          delivery_auto_accept?: boolean | null
          delivery_sound_alerts?: boolean | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          marketing_emails?: boolean | null
          order_updates?: boolean | null
          preferred_shipping_method?: string | null
          quote_notifications?: boolean | null
          sms_disabled_at?: string | null
          sms_notifications?: boolean | null
          sms_opt_in_at?: string | null
          sms_phone_e164?: string | null
          sms_verified_at?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_reorder_enabled?: boolean | null
          created_at?: string | null
          currency?: string | null
          delivery_auto_accept?: boolean | null
          delivery_sound_alerts?: boolean | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          marketing_emails?: boolean | null
          order_updates?: boolean | null
          preferred_shipping_method?: string | null
          quote_notifications?: boolean | null
          sms_disabled_at?: string | null
          sms_notifications?: boolean | null
          sms_opt_in_at?: string | null
          sms_phone_e164?: string | null
          sms_verified_at?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "security_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wallet_profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          wallet_address: string
          wallet_network: string
          wallet_verified: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          wallet_address: string
          wallet_network: string
          wallet_verified?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string
          wallet_network?: string
          wallet_verified?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      chat_leads_summary: {
        Row: {
          assigned_to: string | null
          assigned_to_name: string | null
          contact_captured: boolean | null
          created_at: string | null
          email: string | null
          ended_at: string | null
          follow_up_completed: boolean | null
          follow_up_date: string | null
          id: string | null
          interested_in: string[] | null
          internal_notes: string | null
          is_guest: boolean | null
          lead_score: number | null
          lead_status: string | null
          message_count: number | null
          name: string | null
          phone: string | null
          session_id: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      lead_analytics: {
        Row: {
          converted_count: number | null
          lead_count: number | null
          org_type: string | null
          signup_date: string | null
          source: string | null
          status: string | null
        }
        Relationships: []
      }
      newsletter_analytics: {
        Row: {
          confirmed_count: number | null
          list_type: string | null
          source: string | null
          status: string | null
          subscribe_date: string | null
          subscriber_count: number | null
          total_emails_clicked: number | null
          total_emails_opened: number | null
          total_emails_sent: number | null
        }
        Relationships: []
      }
      security_dashboard: {
        Row: {
          active_sessions: number | null
          created_at: string | null
          email: string | null
          failed_logins_24h: number | null
          id: string | null
          last_failed_login: string | null
          last_successful_login: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_dashboard_stats: {
        Args: { p_include_super_admin?: boolean }
        Returns: Json
      }
      admin_search: {
        Args: { result_limit?: number; search_query: string }
        Returns: Json
      }
      cleanup_expired_sessions: { Args: never; Returns: number }
      current_user_id: { Args: never; Returns: string }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      get_chat_leads_stats: {
        Args: never
        Returns: {
          contacted: number
          converted: number
          lost: number
          new_leads: number
          pending_follow_up: number
          qualified: number
          this_week: number
          today: number
          total: number
          with_contact: number
        }[]
      }
      get_private_file_url: {
        Args: { bucket_name: string; file_path: string }
        Returns: string
      }
      get_product_image_url: { Args: { file_name: string }; Returns: string }
      get_super_admin_stats: {
        Args: never
        Returns: {
          active_staff: number
          chat_conversations_today: number
          new_leads_today: number
          orders_today: number
          revenue_today: number
          total_leads: number
          total_orders: number
          total_tenants: number
          total_users: number
        }[]
      }
      has_tenant_role: {
        Args: { allowed_roles: string[]; check_tenant_id: string }
        Returns: boolean
      }
      has_tenant_role_any: {
        Args: { p_roles: string[]; p_tenant_id: string }
        Returns: boolean
      }
      is_hanouta_admin: { Args: never; Returns: boolean }
      is_member_of_tenant: {
        Args: { check_tenant_id: string }
        Returns: boolean
      }
      is_platform_super_admin: { Args: never; Returns: boolean }
      is_session_valid: { Args: never; Returns: boolean }
      is_staff_jwt: { Args: never; Returns: boolean }
      is_tenant_member_cached: {
        Args: { p_tenant_id: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_description?: string
          p_metadata?: Json
          p_new_values?: Json
          p_old_values?: Json
          p_resource_id?: string
          p_resource_type: string
        }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_details?: Json
          p_event_type: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      revoke_user_sessions: { Args: { p_user_id: string }; Returns: number }
      update_staff_activity: {
        Args: { p_action?: string; p_page?: string; p_resource?: string }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
