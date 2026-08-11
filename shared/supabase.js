/**
 * supabase.js — Cliente Supabase unificado (Danmo Hub)
 * Todas as 7 aplicações usam ESTE ficheiro.
 * Última atualização: 2026-08-11
 *
 * Tabelas principais (38 total, 3 partilhadas):
 *   Partilhadas: users, collaborators, materials
 *   Oficina:    equipment, maintenance_requests, maintenance_parts
 *   RH:         departamentos, funcionarios, ferias, solicitacoes
 *   HST:        inspections, hazards, incidents, trainings
 *   Billing:    invoices, invoice_items, clients, payments
 *   Stock:      stock_entries, stock_movements, suppliers
 *   Fundo Local: fund_requests, fund_approvals, fund_disbursements
 *   Escalas:    schedules, shift_types, schedule_assignments
 */

const SUPABASE_URL  = 'https://czgnbzxoeylicrqjvncd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6Z25iemhvZXlsaWNycWp2bmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NDE2NjEsImV4cCI6MjA2NTAxNzY2MX0.TnZvd7wNJGYdFkwqvG5BfFyPKJZZpjfS2EVRc0jOq1c';

/* Wrapper mínimo — uso: db.from('tabela').select('*') */
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
