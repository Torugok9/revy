-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.maintenances (
id uuid NOT NULL DEFAULT gen_random_uuid(),
vehicle_id uuid NOT NULL,
type USER-DEFINED NOT NULL DEFAULT 'other'::maintenance_type,
title text NOT NULL,
description text,
date date NOT NULL DEFAULT CURRENT_DATE,
km_at_maintenance integer,
cost numeric,
workshop_name text,
next_maintenance_km integer,
next_maintenance_date date,
receipt_url text,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT maintenances_pkey PRIMARY KEY (id),
CONSTRAINT maintenances_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id)
);
CREATE TABLE public.plans (
id text NOT NULL,
name text NOT NULL,
description text,
max_vehicles integer NOT NULL,
has_pdf_export boolean NOT NULL DEFAULT false,
has_push_reminders boolean NOT NULL DEFAULT false,
has_receipt_photo boolean NOT NULL DEFAULT false,
has_multi_user boolean NOT NULL DEFAULT false,
has_fleet_dashboard boolean NOT NULL DEFAULT false,
price_monthly_cents integer,
is_active boolean NOT NULL DEFAULT true,
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.subscriptions (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL,
plan_id text NOT NULL,
status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'canceled'::text, 'past_due'::text, 'trialing'::text])),
started_at timestamp with time zone NOT NULL DEFAULT now(),
expires_at timestamp with time zone,
canceled_at timestamp with time zone,
payment_provider text,
payment_provider_id text,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id)
);
CREATE TABLE public.vehicles (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL,
brand text NOT NULL,
model text NOT NULL,
year integer NOT NULL,
plate text,
color text,
chassis_number text,
current_km integer NOT NULL DEFAULT 0,
purchase_date date,
purchase_value numeric,
photo_url text,
notes text,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT vehicles_pkey PRIMARY KEY (id),
CONSTRAINT vehicles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
