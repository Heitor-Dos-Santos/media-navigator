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
      clients: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string
          company_name: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          id: string
          municipal_registration: string | null
          notes: string | null
          rebate_tiers: Json | null
          state: string | null
          state_registration: string | null
          trade_name: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj: string
          company_name: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          municipal_registration?: string | null
          notes?: string | null
          rebate_tiers?: Json | null
          state?: string | null
          state_registration?: string | null
          trade_name?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string
          company_name?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          municipal_registration?: string | null
          notes?: string | null
          rebate_tiers?: Json | null
          state?: string | null
          state_registration?: string | null
          trade_name?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      evolution_api_config: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean
          server_url: string
          updated_at: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean
          server_url: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          server_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          ad_account_id: string | null
          ad_id: string | null
          campaign_id: string | null
          campaign_name: string
          created_at: string
          email: string
          form_id: string | null
          id: string
          name: string
          page_id: string | null
          phone: string
          raw_payload: Json | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          ad_account_id?: string | null
          ad_id?: string | null
          campaign_id?: string | null
          campaign_name?: string
          created_at?: string
          email?: string
          form_id?: string | null
          id?: string
          name?: string
          page_id?: string | null
          phone?: string
          raw_payload?: Json | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          ad_account_id?: string | null
          ad_id?: string | null
          campaign_id?: string | null
          campaign_name?: string
          created_at?: string
          email?: string
          form_id?: string | null
          id?: string
          name?: string
          page_id?: string | null
          phone?: string
          raw_payload?: Json | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_plans: {
        Row: {
          active_scenario_id: string | null
          campaign: string | null
          client: string | null
          client_id: string | null
          created_at: string
          id: string
          lines: Json | null
          period_end: string | null
          period_start: string | null
          quarter: string | null
          scenarios: Json | null
          status: string | null
          taxonomy: string | null
          total_budget: number | null
          updated_at: string
          year: string | null
        }
        Insert: {
          active_scenario_id?: string | null
          campaign?: string | null
          client?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          lines?: Json | null
          period_end?: string | null
          period_start?: string | null
          quarter?: string | null
          scenarios?: Json | null
          status?: string | null
          taxonomy?: string | null
          total_budget?: number | null
          updated_at?: string
          year?: string | null
        }
        Update: {
          active_scenario_id?: string | null
          campaign?: string | null
          client?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          lines?: Json | null
          period_end?: string | null
          period_start?: string | null
          quarter?: string | null
          scenarios?: Json | null
          status?: string | null
          taxonomy?: string | null
          total_budget?: number | null
          updated_at?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_ads_config: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          page_id: string | null
          updated_at: string
          verify_token: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          page_id?: string | null
          updated_at?: string
          verify_token?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          page_id?: string | null
          updated_at?: string
          verify_token?: string
        }
        Relationships: []
      }
      platform_connections: {
        Row: {
          access_token: string
          account_id: string
          account_name: string | null
          connected_at: string
          id: string
          platform: string
          scopes: string | null
          status: string
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_id?: string
          account_name?: string | null
          connected_at?: string
          id?: string
          platform: string
          scopes?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_id?: string
          account_name?: string | null
          connected_at?: string
          id?: string
          platform?: string
          scopes?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_configs: {
        Row: {
          api_key: string
          created_at: string
          id: string
          instance_name: string
          is_active: boolean
          label: string
          message_template: string
          phone_to: string
          phones_to: string[]
          server_url: string
          trigger_type: string
          trigger_value: string
          updated_at: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          instance_name: string
          is_active?: boolean
          label: string
          message_template?: string
          phone_to: string
          phones_to?: string[]
          server_url: string
          trigger_type?: string
          trigger_value: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          instance_name?: string
          is_active?: boolean
          label?: string
          message_template?: string
          phone_to?: string
          phones_to?: string[]
          server_url?: string
          trigger_type?: string
          trigger_value?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
