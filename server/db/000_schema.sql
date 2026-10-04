--
-- PostgreSQL database dump
--

\restrict 1dd0vOrV72ftzBwNSLKLpi872E6nIK0bXOGTSYGrPfbJkgjHCkrfbebmYWYVEc5

-- Dumped from database version 16.15 (Homebrew)
-- Dumped by pg_dump version 16.15 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: drivers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.drivers (
    employee_number integer NOT NULL,
    batch_number integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    status text NOT NULL,
    rota text NOT NULL,
    rota_week integer NOT NULL,
    route text NOT NULL
);


--
-- Name: duties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.duties (
    duty_number integer NOT NULL,
    route text NOT NULL,
    rota text NOT NULL,
    sign_on text NOT NULL,
    sign_off text NOT NULL,
    CONSTRAINT duties_rota_check CHECK ((rota = ANY (ARRAY['early'::text, 'middle'::text, 'late'::text])))
);


--
-- Name: incidents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incidents (
    id integer NOT NULL,
    incident_type character varying(50) NOT NULL,
    description text NOT NULL,
    status character varying(20) DEFAULT 'open'::character varying NOT NULL,
    route character varying(20),
    driver_number integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    resolved_at timestamp without time zone,
    CONSTRAINT valid_incident_status CHECK (((status)::text = ANY ((ARRAY['open'::character varying, 'resolved'::character varying])::text[])))
);


--
-- Name: incidents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.incidents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: incidents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.incidents_id_seq OWNED BY public.incidents.id;


--
-- Name: planned_absences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.planned_absences (
    id integer NOT NULL,
    driver_number integer NOT NULL,
    absence_type text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT planned_absences_absence_type_check CHECK ((absence_type = ANY (ARRAY['HOLIDAY'::text, 'TRAINING'::text]))),
    CONSTRAINT planned_absences_check CHECK ((end_date >= start_date))
);


--
-- Name: planned_absences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.planned_absences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: planned_absences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.planned_absences_id_seq OWNED BY public.planned_absences.id;


--
-- Name: replacement_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.replacement_assignments (
    id integer NOT NULL,
    absent_driver_number integer NOT NULL,
    replacement_driver_number integer NOT NULL,
    duty_number integer NOT NULL,
    assignment_date date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: replacement_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.replacement_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: replacement_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.replacement_assignments_id_seq OWNED BY public.replacement_assignments.id;


--
-- Name: rest_day_patterns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rest_day_patterns (
    week_number integer NOT NULL,
    saturday character(1) NOT NULL,
    sunday character(1) NOT NULL,
    monday character(1) NOT NULL,
    tuesday character(1) NOT NULL,
    wednesday character(1) NOT NULL,
    thursday character(1) NOT NULL,
    friday character(1) NOT NULL,
    CONSTRAINT rest_day_patterns_friday_check CHECK ((friday = ANY (ARRAY['W'::bpchar, 'R'::bpchar]))),
    CONSTRAINT rest_day_patterns_monday_check CHECK ((monday = ANY (ARRAY['W'::bpchar, 'R'::bpchar]))),
    CONSTRAINT rest_day_patterns_saturday_check CHECK ((saturday = ANY (ARRAY['W'::bpchar, 'R'::bpchar]))),
    CONSTRAINT rest_day_patterns_sunday_check CHECK ((sunday = ANY (ARRAY['W'::bpchar, 'R'::bpchar]))),
    CONSTRAINT rest_day_patterns_thursday_check CHECK ((thursday = ANY (ARRAY['W'::bpchar, 'R'::bpchar]))),
    CONSTRAINT rest_day_patterns_tuesday_check CHECK ((tuesday = ANY (ARRAY['W'::bpchar, 'R'::bpchar]))),
    CONSTRAINT rest_day_patterns_wednesday_check CHECK ((wednesday = ANY (ARRAY['W'::bpchar, 'R'::bpchar]))),
    CONSTRAINT rest_day_patterns_week_number_check CHECK (((week_number >= 1) AND (week_number <= 4)))
);


--
-- Name: routes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.routes (
    route_number text NOT NULL
);


--
-- Name: sign_on_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sign_on_entries (
    id integer NOT NULL,
    operational_date date NOT NULL,
    driver_number integer NOT NULL,
    duty_number integer NOT NULL,
    signed_on_at timestamp without time zone,
    status character varying(20) DEFAULT 'EXPECTED'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT valid_sign_on_status CHECK (((status)::text = ANY ((ARRAY['EXPECTED'::character varying, 'DUE'::character varying, 'SIGNED_ON'::character varying, 'LATE'::character varying, 'ABSENT'::character varying])::text[])))
);


--
-- Name: sign_on_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sign_on_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sign_on_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sign_on_entries_id_seq OWNED BY public.sign_on_entries.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    role text NOT NULL,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['manager'::text, 'garage_supervisor'::text])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: incidents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidents ALTER COLUMN id SET DEFAULT nextval('public.incidents_id_seq'::regclass);


--
-- Name: planned_absences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planned_absences ALTER COLUMN id SET DEFAULT nextval('public.planned_absences_id_seq'::regclass);


--
-- Name: replacement_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.replacement_assignments ALTER COLUMN id SET DEFAULT nextval('public.replacement_assignments_id_seq'::regclass);


--
-- Name: sign_on_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sign_on_entries ALTER COLUMN id SET DEFAULT nextval('public.sign_on_entries_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (employee_number);


--
-- Name: duties duties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.duties
    ADD CONSTRAINT duties_pkey PRIMARY KEY (duty_number);


--
-- Name: incidents incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_pkey PRIMARY KEY (id);


--
-- Name: planned_absences planned_absences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planned_absences
    ADD CONSTRAINT planned_absences_pkey PRIMARY KEY (id);


--
-- Name: replacement_assignments replacement_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.replacement_assignments
    ADD CONSTRAINT replacement_assignments_pkey PRIMARY KEY (id);


--
-- Name: rest_day_patterns rest_day_patterns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rest_day_patterns
    ADD CONSTRAINT rest_day_patterns_pkey PRIMARY KEY (week_number);


--
-- Name: routes routes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (route_number);


--
-- Name: sign_on_entries sign_on_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sign_on_entries
    ADD CONSTRAINT sign_on_entries_pkey PRIMARY KEY (id);


--
-- Name: replacement_assignments unique_absent_driver_per_day; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.replacement_assignments
    ADD CONSTRAINT unique_absent_driver_per_day UNIQUE (absent_driver_number, assignment_date);


--
-- Name: sign_on_entries unique_driver_sign_on_per_day; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sign_on_entries
    ADD CONSTRAINT unique_driver_sign_on_per_day UNIQUE (operational_date, driver_number);


--
-- Name: replacement_assignments unique_duty_per_day; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.replacement_assignments
    ADD CONSTRAINT unique_duty_per_day UNIQUE (duty_number, assignment_date);


--
-- Name: sign_on_entries unique_duty_sign_on_per_day; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sign_on_entries
    ADD CONSTRAINT unique_duty_sign_on_per_day UNIQUE (operational_date, duty_number);


--
-- Name: replacement_assignments unique_replacement_driver_per_day; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.replacement_assignments
    ADD CONSTRAINT unique_replacement_driver_per_day UNIQUE (replacement_driver_number, assignment_date);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: incidents incidents_driver_number_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_driver_number_fkey FOREIGN KEY (driver_number) REFERENCES public.drivers(employee_number);


--
-- Name: planned_absences planned_absences_driver_number_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planned_absences
    ADD CONSTRAINT planned_absences_driver_number_fkey FOREIGN KEY (driver_number) REFERENCES public.drivers(employee_number);


--
-- Name: replacement_assignments replacement_assignments_absent_driver_number_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.replacement_assignments
    ADD CONSTRAINT replacement_assignments_absent_driver_number_fkey FOREIGN KEY (absent_driver_number) REFERENCES public.drivers(employee_number);


--
-- Name: replacement_assignments replacement_assignments_duty_number_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.replacement_assignments
    ADD CONSTRAINT replacement_assignments_duty_number_fkey FOREIGN KEY (duty_number) REFERENCES public.duties(duty_number);


--
-- Name: replacement_assignments replacement_assignments_replacement_driver_number_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.replacement_assignments
    ADD CONSTRAINT replacement_assignments_replacement_driver_number_fkey FOREIGN KEY (replacement_driver_number) REFERENCES public.drivers(employee_number);


--
-- Name: sign_on_entries sign_on_entries_driver_number_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sign_on_entries
    ADD CONSTRAINT sign_on_entries_driver_number_fkey FOREIGN KEY (driver_number) REFERENCES public.drivers(employee_number);


--
-- Name: sign_on_entries sign_on_entries_duty_number_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sign_on_entries
    ADD CONSTRAINT sign_on_entries_duty_number_fkey FOREIGN KEY (duty_number) REFERENCES public.duties(duty_number);


--
-- PostgreSQL database dump complete
--

\unrestrict 1dd0vOrV72ftzBwNSLKLpi872E6nIK0bXOGTSYGrPfbJkgjHCkrfbebmYWYVEc5

