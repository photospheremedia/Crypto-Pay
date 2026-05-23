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
      billing_payment_methods: {
        Row: {
          brand: string | null
          created_at: string
          customer_id: string
          exp_month: number | null
          exp_year: number | null
          id: string
          is_default: boolean
          last4: string | null
          provider: string
          provider_payment_method_id: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          customer_id: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean
          last4?: string | null
          provider?: string
          provider_payment_method_id: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          customer_id?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean
          last4?: string | null
          provider?: string
          provider_payment_method_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_payment_methods_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          customer_id: string
          id: string
          provider: string
          provider_payment_id: string | null
          status: string
          subscription_id: string | null
          type: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          customer_id: string
          id?: string
          provider?: string
          provider_payment_id?: string | null
          status: string
          subscription_id?: string | null
          type: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          customer_id?: string
          id?: string
          provider?: string
          provider_payment_id?: string | null
          status?: string
          subscription_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "billing_subscriptions"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      billing_plans: {
        Row: {
          created_at: string
          features_json: Json
          id: string
          interval: string
          is_active: boolean
          name: string
          price_cents: number
          slug: string
        }
        Insert: {
          created_at?: string
          features_json?: Json
          id?: string
          interval: string
          is_active?: boolean
          name: string
          price_cents: number
          slug: string
        }
        Update: {
          created_at?: string
          features_json?: Json
          id?: string
          interval?: string
          is_active?: boolean
          name?: string
          price_cents?: number
          slug?: string
        }
        Relationships: []
      }
      billing_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          customer_id: string
          plan_id: string | null
          provider: string
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          customer_id: string
          plan_id?: string | null
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          customer_id?: string
          plan_id?: string | null
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "billing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string | null
          id: string
          options: Json | null
          price_cents: number
          product_id: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string | null
          id?: string
          options?: Json | null
          price_cents: number
          product_id: string
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string | null
          id?: string
          options?: Json | null
          price_cents?: number
          product_id?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          item_count: number | null
          session_id: string | null
          status: string | null
          subtotal_cents: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          item_count?: number | null
          session_id?: string | null
          status?: string | null
          subtotal_cents?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          item_count?: number | null
          session_id?: string | null
          status?: string | null
          subtotal_cents?: number | null
          updated_at?: string | null
          user_id?: string | null
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
      comparison_lists: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          product_ids: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          product_ids?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          product_ids?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_category_discounts: {
        Row: {
          category_id: string
          created_at: string | null
          created_by: string | null
          customer_id: string
          discount_type: string
          discount_value: number
          end_date: string | null
          id: string
          is_active: boolean | null
          start_date: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          discount_type: string
          discount_value: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          start_date?: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          start_date?: string
        }
        Relationships: []
      }
      customer_payment_terms: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          credit_limit: number | null
          customer_id: string
          early_payment_days: number | null
          early_payment_discount: number | null
          id: string
          is_approved: boolean | null
          notes: string | null
          payment_terms_days: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          credit_limit?: number | null
          customer_id: string
          early_payment_days?: number | null
          early_payment_discount?: number | null
          id?: string
          is_approved?: boolean | null
          notes?: string | null
          payment_terms_days?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          credit_limit?: number | null
          customer_id?: string
          early_payment_days?: number | null
          early_payment_discount?: number | null
          id?: string
          is_approved?: boolean | null
          notes?: string | null
          payment_terms_days?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_price_tiers: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer_id: string
          end_date: string | null
          id: string
          notes: string | null
          start_date: string
          tier_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string
          tier_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string
          tier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_price_tiers_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "price_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_product_prices: {
        Row: {
          contract_reference: string | null
          created_at: string | null
          created_by: string | null
          custom_price: number
          customer_id: string
          end_date: string | null
          id: string
          is_active: boolean | null
          min_quantity: number | null
          notes: string | null
          product_id: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          contract_reference?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_price: number
          customer_id: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          min_quantity?: number | null
          notes?: string | null
          product_id: string
          start_date?: string
          updated_at?: string | null
        }
        Update: {
          contract_reference?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_price?: number
          customer_id?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          min_quantity?: number | null
          notes?: string | null
          product_id?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string
          customer_id: string
          legal_name: string | null
          org_type: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          trade_name: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          customer_id: string
          legal_name?: string | null
          org_type?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          trade_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          customer_id?: string
          legal_name?: string | null
          org_type?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          trade_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config_json: Json
          created_at: string
          customer_id: string
          external_id: string | null
          id: string
          provider: string
          status: string
          updated_at: string
        }
        Insert: {
          config_json?: Json
          created_at?: string
          customer_id: string
          external_id?: string | null
          id?: string
          provider: string
          status?: string
          updated_at?: string
        }
        Update: {
          config_json?: Json
          created_at?: string
          customer_id?: string
          external_id?: string | null
          id?: string
          provider?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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
      locations: {
        Row: {
          address: string | null
          created_at: string
          customer_id: string
          id: string
          name: string
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          customer_id: string
          id?: string
          name: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          name?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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
      order_items: {
        Row: {
          created_at: string
          id: string
          options: Json | null
          order_id: string
          product_id: string
          product_image: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          status: string | null
          total_cents: number
          unit_price_cents: number
        }
        Insert: {
          created_at?: string
          id?: string
          options?: Json | null
          order_id: string
          product_id: string
          product_image?: string | null
          product_name: string
          product_sku?: string | null
          quantity?: number
          status?: string | null
          total_cents: number
          unit_price_cents: number
        }
        Update: {
          created_at?: string
          id?: string
          options?: Json | null
          order_id?: string
          product_id?: string
          product_image?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          status?: string | null
          total_cents?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          notes: string | null
          order_id: string
          previous_status: string | null
          status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          previous_status?: string | null
          status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          previous_status?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          currency: string
          customer_id: string | null
          customer_notes: string | null
          delivered_at: string | null
          discount_cents: number
          estimated_delivery_date: string | null
          id: string
          internal_notes: string | null
          order_number: string
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string
          promotion_code: string | null
          promotion_id: string | null
          shipped_at: string | null
          shipping_address: Json
          shipping_carrier: string | null
          shipping_cents: number
          shipping_method: string | null
          status: string
          subtotal_cents: number
          tax_cents: number
          total_cents: number
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_notes?: string | null
          delivered_at?: string | null
          discount_cents?: number
          estimated_delivery_date?: string | null
          id?: string
          internal_notes?: string | null
          order_number: string
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          promotion_code?: string | null
          promotion_id?: string | null
          shipped_at?: string | null
          shipping_address?: Json
          shipping_carrier?: string | null
          shipping_cents?: number
          shipping_method?: string | null
          status?: string
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_notes?: string | null
          delivered_at?: string | null
          discount_cents?: number
          estimated_delivery_date?: string | null
          id?: string
          internal_notes?: string | null
          order_number?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          promotion_code?: string | null
          promotion_id?: string | null
          shipped_at?: string | null
          shipping_address?: Json
          shipping_carrier?: string | null
          shipping_cents?: number
          shipping_method?: string | null
          status?: string
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      price_tiers: {
        Row: {
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number | null
          id: string
          is_active: boolean | null
          name: string
          priority: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          priority?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          level: number | null
          name: string
          parent_id: string | null
          product_count: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          level?: number | null
          name: string
          parent_id?: string | null
          product_count?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          level?: number | null
          name?: string
          parent_id?: string | null
          product_count?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          admin_responded_at: string | null
          admin_response: string | null
          content: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          is_verified_purchase: boolean | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_responded_at?: string | null
          admin_response?: string | null
          content?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_verified_purchase?: boolean | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_responded_at?: string | null
          admin_response?: string | null
          content?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_verified_purchase?: boolean | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_backorder: boolean | null
          attributes: Json | null
          average_rating: number | null
          barcode: string | null
          brand: string | null
          category: string | null
          category_id: string | null
          compare_at_price_cents: number | null
          cost_estimate: number | null
          created_at: string
          currency: string | null
          description: string | null
          dimensions: Json | null
          id: string
          images: Json | null
          internal_sku: string
          is_active: boolean
          is_eco_friendly: boolean | null
          is_featured: boolean | null
          lead_time_days: number | null
          long_description: string | null
          low_stock_threshold: number | null
          meta_description: string | null
          meta_title: string | null
          min_order_quantity: number | null
          name: string
          notes: string | null
          price_cents: number | null
          resale_price: number
          review_count: number | null
          shipping_class: string | null
          ships_free: boolean | null
          short_description: string | null
          sku: string | null
          slug: string | null
          specifications: Json | null
          status: string | null
          stock_quantity: number | null
          subcategory: string | null
          supplier: string
          supplier_product_id: string | null
          supplier_url: string | null
          tags: Json | null
          thumbnail_url: string | null
          total_sales: number | null
          track_inventory: boolean | null
          unit_type: string | null
          units_per_case: number | null
          updated_at: string
          video_url: string | null
          weight_oz: number | null
          wholesale_price_cents: number | null
        }
        Insert: {
          allow_backorder?: boolean | null
          attributes?: Json | null
          average_rating?: number | null
          barcode?: string | null
          brand?: string | null
          category?: string | null
          category_id?: string | null
          compare_at_price_cents?: number | null
          cost_estimate?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          images?: Json | null
          internal_sku: string
          is_active?: boolean
          is_eco_friendly?: boolean | null
          is_featured?: boolean | null
          lead_time_days?: number | null
          long_description?: string | null
          low_stock_threshold?: number | null
          meta_description?: string | null
          meta_title?: string | null
          min_order_quantity?: number | null
          name: string
          notes?: string | null
          price_cents?: number | null
          resale_price: number
          review_count?: number | null
          shipping_class?: string | null
          ships_free?: boolean | null
          short_description?: string | null
          sku?: string | null
          slug?: string | null
          specifications?: Json | null
          status?: string | null
          stock_quantity?: number | null
          subcategory?: string | null
          supplier?: string
          supplier_product_id?: string | null
          supplier_url?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          total_sales?: number | null
          track_inventory?: boolean | null
          unit_type?: string | null
          units_per_case?: number | null
          updated_at?: string
          video_url?: string | null
          weight_oz?: number | null
          wholesale_price_cents?: number | null
        }
        Update: {
          allow_backorder?: boolean | null
          attributes?: Json | null
          average_rating?: number | null
          barcode?: string | null
          brand?: string | null
          category?: string | null
          category_id?: string | null
          compare_at_price_cents?: number | null
          cost_estimate?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          images?: Json | null
          internal_sku?: string
          is_active?: boolean
          is_eco_friendly?: boolean | null
          is_featured?: boolean | null
          lead_time_days?: number | null
          long_description?: string | null
          low_stock_threshold?: number | null
          meta_description?: string | null
          meta_title?: string | null
          min_order_quantity?: number | null
          name?: string
          notes?: string | null
          price_cents?: number | null
          resale_price?: number
          review_count?: number | null
          shipping_class?: string | null
          ships_free?: boolean | null
          short_description?: string | null
          sku?: string | null
          slug?: string | null
          specifications?: Json | null
          status?: string | null
          stock_quantity?: number | null
          subcategory?: string | null
          supplier?: string
          supplier_product_id?: string | null
          supplier_url?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          total_sales?: number | null
          track_inventory?: boolean | null
          unit_type?: string | null
          units_per_case?: number | null
          updated_at?: string
          video_url?: string | null
          weight_oz?: number | null
          wholesale_price_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_usage: {
        Row: {
          created_at: string | null
          discount_applied_cents: number
          id: string
          promotion_id: string
          quote_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          discount_applied_cents: number
          id?: string
          promotion_id: string
          quote_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          discount_applied_cents?: number
          id?: string
          promotion_id?: string
          quote_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotion_usage_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_usage_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          applies_to: string | null
          category_ids: string[] | null
          code: string
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          maximum_discount_cents: number | null
          minimum_order_cents: number | null
          name: string
          product_ids: string[] | null
          starts_at: string | null
          times_used: number | null
          updated_at: string | null
          usage_limit: number | null
          usage_limit_per_user: number | null
        }
        Insert: {
          applies_to?: string | null
          category_ids?: string[] | null
          code: string
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          maximum_discount_cents?: number | null
          minimum_order_cents?: number | null
          name: string
          product_ids?: string[] | null
          starts_at?: string | null
          times_used?: number | null
          updated_at?: string | null
          usage_limit?: number | null
          usage_limit_per_user?: number | null
        }
        Update: {
          applies_to?: string | null
          category_ids?: string[] | null
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          maximum_discount_cents?: number | null
          minimum_order_cents?: number | null
          name?: string
          product_ids?: string[] | null
          starts_at?: string | null
          times_used?: number | null
          updated_at?: string | null
          usage_limit?: number | null
          usage_limit_per_user?: number | null
        }
        Relationships: []
      }
      quote_lines: {
        Row: {
          created_at: string
          id: string
          line_total: number
          product_id: string
          quantity: number
          quote_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_total: number
          product_id: string
          quantity: number
          quote_id: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          product_id?: string
          quantity?: number
          quote_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_lines_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          attachments_json: Json
          created_at: string
          customer_id: string
          id: string
          location_id: string | null
          notes: string | null
          shipping_estimate: number | null
          status: string
          subtotal: number
          tax_estimate: number | null
          total: number
          updated_at: string
        }
        Insert: {
          attachments_json?: Json
          created_at?: string
          customer_id: string
          id?: string
          location_id?: string | null
          notes?: string | null
          shipping_estimate?: number | null
          status?: string
          subtotal?: number
          tax_estimate?: number | null
          total?: number
          updated_at?: string
        }
        Update: {
          attachments_json?: Json
          created_at?: string
          customer_id?: string
          id?: string
          location_id?: string | null
          notes?: string | null
          shipping_estimate?: number | null
          status?: string
          subtotal?: number
          tax_estimate?: number | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      recently_viewed: {
        Row: {
          created_at: string
          id: string
          last_viewed_at: string
          product_id: string
          user_id: string
          view_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_viewed_at?: string
          product_id: string
          user_id: string
          view_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_viewed_at?: string
          product_id?: string
          user_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      system_metrics: {
        Row: {
          created_at: string | null
          dimension_name: string | null
          dimension_value: string | null
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
          period_start: string
          period_type: string
        }
        Insert: {
          created_at?: string | null
          dimension_name?: string | null
          dimension_value?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value: number
          period_start: string
          period_type: string
        }
        Update: {
          created_at?: string | null
          dimension_name?: string | null
          dimension_value?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          period_start?: string
          period_type?: string
        }
        Relationships: []
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
      up_delivery_integrations: {
        Row: {
          connected_at: string | null
          created_at: string | null
          id: string
          last_synced_at: string | null
          menu_id: string | null
          menu_sync_enabled: boolean | null
          platform: string
          status: string | null
          store_id: string | null
          store_name: string | null
          subscription_id: string
          sync_error: string | null
          total_orders: number | null
          updated_at: string | null
        }
        Insert: {
          connected_at?: string | null
          created_at?: string | null
          id?: string
          last_synced_at?: string | null
          menu_id?: string | null
          menu_sync_enabled?: boolean | null
          platform: string
          status?: string | null
          store_id?: string | null
          store_name?: string | null
          subscription_id: string
          sync_error?: string | null
          total_orders?: number | null
          updated_at?: string | null
        }
        Update: {
          connected_at?: string | null
          created_at?: string | null
          id?: string
          last_synced_at?: string | null
          menu_id?: string | null
          menu_sync_enabled?: boolean | null
          platform?: string
          status?: string | null
          store_id?: string | null
          store_name?: string | null
          subscription_id?: string
          sync_error?: string | null
          total_orders?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "up_delivery_integrations_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "urban_piper_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      up_onboarding_tickets: {
        Row: {
          activated_at: string | null
          assigned_to: string | null
          contract_sent_at: string | null
          contract_signed_at: string | null
          created_at: string | null
          customer_id: string
          demo_completed_at: string | null
          demo_scheduled_at: string | null
          form_data: Json
          id: string
          internal_notes: Json | null
          status: string | null
          subscription_id: string | null
          up_status: string | null
          up_ticket_id: string | null
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          assigned_to?: string | null
          contract_sent_at?: string | null
          contract_signed_at?: string | null
          created_at?: string | null
          customer_id: string
          demo_completed_at?: string | null
          demo_scheduled_at?: string | null
          form_data: Json
          id?: string
          internal_notes?: Json | null
          status?: string | null
          subscription_id?: string | null
          up_status?: string | null
          up_ticket_id?: string | null
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          assigned_to?: string | null
          contract_sent_at?: string | null
          contract_signed_at?: string | null
          created_at?: string | null
          customer_id?: string
          demo_completed_at?: string | null
          demo_scheduled_at?: string | null
          form_data?: Json
          id?: string
          internal_notes?: Json | null
          status?: string | null
          subscription_id?: string | null
          up_status?: string | null
          up_ticket_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "up_onboarding_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "up_onboarding_tickets_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "urban_piper_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      urban_piper_subscriptions: {
        Row: {
          billing_start_date: string | null
          created_at: string | null
          customer_id: string
          hub_enabled: boolean | null
          hub_plan: string | null
          id: string
          internal_notes: string | null
          meraki_domain: string | null
          meraki_enabled: boolean | null
          monthly_fee_cents: number
          next_billing_date: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          setup_fee_cents: number | null
          setup_fee_paid: boolean | null
          status: string | null
          up_account_id: string | null
          up_api_key_encrypted: string | null
          updated_at: string | null
        }
        Insert: {
          billing_start_date?: string | null
          created_at?: string | null
          customer_id: string
          hub_enabled?: boolean | null
          hub_plan?: string | null
          id?: string
          internal_notes?: string | null
          meraki_domain?: string | null
          meraki_enabled?: boolean | null
          monthly_fee_cents?: number
          next_billing_date?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          setup_fee_cents?: number | null
          setup_fee_paid?: boolean | null
          status?: string | null
          up_account_id?: string | null
          up_api_key_encrypted?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_start_date?: string | null
          created_at?: string | null
          customer_id?: string
          hub_enabled?: boolean | null
          hub_plan?: string | null
          id?: string
          internal_notes?: string | null
          meraki_domain?: string | null
          meraki_enabled?: boolean | null
          monthly_fee_cents?: number
          next_billing_date?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          setup_fee_cents?: number | null
          setup_fee_paid?: boolean | null
          status?: string | null
          up_account_id?: string | null
          up_api_key_encrypted?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "urban_piper_subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          address_type: string
          city: string
          company: string | null
          country: string
          created_at: string
          first_name: string
          id: string
          is_default: boolean
          is_verified: boolean | null
          label: string
          last_name: string
          phone: string | null
          postal_code: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          address_type?: string
          city: string
          company?: string | null
          country?: string
          created_at?: string
          first_name: string
          id?: string
          is_default?: boolean
          is_verified?: boolean | null
          label?: string
          last_name: string
          phone?: string | null
          postal_code: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          address_type?: string
          city?: string
          company?: string | null
          country?: string
          created_at?: string
          first_name?: string
          id?: string
          is_default?: boolean
          is_verified?: boolean | null
          label?: string
          last_name?: string
          phone?: string | null
          postal_code?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          created_at: string
          email_account_activity: boolean
          email_back_in_stock: boolean
          email_newsletter: boolean
          email_order_updates: boolean
          email_price_drops: boolean
          email_promotions: boolean
          email_shipping_updates: boolean
          id: string
          push_order_updates: boolean
          push_promotions: boolean
          sms_order_updates: boolean
          sms_shipping_updates: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_account_activity?: boolean
          email_back_in_stock?: boolean
          email_newsletter?: boolean
          email_order_updates?: boolean
          email_price_drops?: boolean
          email_promotions?: boolean
          email_shipping_updates?: boolean
          id?: string
          push_order_updates?: boolean
          push_promotions?: boolean
          sms_order_updates?: boolean
          sms_shipping_updates?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_account_activity?: boolean
          email_back_in_stock?: boolean
          email_newsletter?: boolean
          email_order_updates?: boolean
          email_price_drops?: boolean
          email_promotions?: boolean
          email_shipping_updates?: boolean
          id?: string
          push_order_updates?: boolean
          push_promotions?: boolean
          sms_order_updates?: boolean
          sms_shipping_updates?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_payment_methods: {
        Row: {
          card_brand: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_last4: string | null
          created_at: string
          id: string
          is_active: boolean
          is_default: boolean
          provider: string
          provider_payment_method_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          provider?: string
          provider_payment_method_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          provider?: string
          provider_payment_method_id?: string
          updated_at?: string
          user_id?: string
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
          state?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          sms_notifications: boolean | null
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
          sms_notifications?: boolean | null
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
          sms_notifications?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      volume_pricing: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          max_quantity: number | null
          min_quantity: number
          product_id: string
          tier_id: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_quantity?: number | null
          min_quantity: number
          product_id: string
          tier_id?: string | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_quantity?: number | null
          min_quantity?: number
          product_id?: string
          tier_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "volume_pricing_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "price_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string | null
          id: string
          notify_on_sale: boolean | null
          notify_on_stock: boolean | null
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notify_on_sale?: boolean | null
          notify_on_stock?: boolean | null
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notify_on_sale?: boolean | null
          notify_on_stock?: boolean | null
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Functions: {
      current_user_id: { Args: never; Returns: string }
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
      get_customer_price: {
        Args: {
          p_base_price?: number
          p_customer_id: string
          p_product_id: string
          p_quantity?: number
        }
        Returns: number
      }
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
      get_user_order_stats: {
        Args: { p_user_id: string }
        Returns: {
          delivered_orders: number
          pending_orders: number
          total_orders: number
          total_spent_cents: number
        }[]
      }
      has_tenant_role: {
        Args: { allowed_roles: string[]; check_tenant_id: string }
        Returns: boolean
      }
      is_hanouta_admin: { Args: never; Returns: boolean }
      is_member_of_tenant: {
        Args: { check_tenant_id: string }
        Returns: boolean
      }
      is_rhs_admin: { Args: never; Returns: boolean }
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
      update_staff_activity: {
        Args: { p_action?: string; p_page?: string; p_resource?: string }
        Returns: undefined
      }
      upsert_recently_viewed: {
        Args: { p_product_id: string; p_user_id: string }
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
  public: {
    Enums: {},
  },
} as const
