---
name: supabase-architect
description: Expertise in designing and implementing Supabase schemas, Row Level Security (RLS) policies, and database functions for Prime Property.
---
# Skill: Supabase Architect
Expertise in designing and implementing Supabase schemas, Row Level Security (RLS) policies, and database functions for Prime Property.

## Guidelines
- **Schema:** Use `bigint` for currency (Rupiah). Ensure `soft_delete` column is present in all main tables.
- **RLS:** Admin can only READ properties. Superadmin has FULL CRUD.
- **Functions:** Implement audit log triggers for every insert/update on the `properties` table.
- **Conventions:** Use snake_case for database columns and singular table names.
