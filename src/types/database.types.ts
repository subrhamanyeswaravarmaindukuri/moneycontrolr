export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MoneySource =
  | "parental_allowance"
  | "salary"
  | "scholarship"
  | "part_time"
  | "freelance"
  | "other";

export type PaymentSource =
  | "upi"
  | "cash"
  | "card"
  | "bank_transfer"
  | "other";

export type TransactionType = "expense" | "income";

export interface Profile {
  id: string;
  display_name: string | null;
  currency: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  monthly_allowance: number;
  budget_start_date: string; // YYYY-MM-DD
  budget_end_date: string; // YYYY-MM-DD
  needs_percentage: number;
  wants_percentage: number;
  savings_percentage: number;
  money_source: MoneySource;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string | null; // null if default system category
  name: string;
  type: TransactionType;
  icon?: string | null;
  color?: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  type: TransactionType;
  payment_source: PaymentSource;
  transaction_date: string; // YYYY-MM-DD
  note: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export type GenericRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          display_name?: string | null;
          currency?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          currency?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      budgets: {
        Row: Budget;
        Insert: {
          id?: string;
          user_id: string;
          monthly_allowance: number;
          budget_start_date?: string;
          budget_end_date?: string;
          needs_percentage?: number;
          wants_percentage?: number;
          savings_percentage?: number;
          money_source?: MoneySource;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          monthly_allowance?: number;
          budget_start_date?: string;
          budget_end_date?: string;
          needs_percentage?: number;
          wants_percentage?: number;
          savings_percentage?: number;
          money_source?: MoneySource;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      categories: {
        Row: Category;
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          type: TransactionType;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          type?: TransactionType;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      transactions: {
        Row: Transaction;
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          amount: number;
          type: TransactionType;
          payment_source?: PaymentSource;
          transaction_date?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          amount?: number;
          type?: TransactionType;
          payment_source?: PaymentSource;
          transaction_date?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
