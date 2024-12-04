--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

-- Started on 2024-12-05 10:44:43

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- TOC entry 223 (class 1259 OID 16538)
-- Name: admin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin (
    username character varying,
    id integer NOT NULL,
    role character varying,
    enterprise_name character varying,
    email character varying,
    password character varying,
    max_managers integer,
    max_employes integer,
    is_active boolean,
    start_date date,
    end_date date,
    enterprise_id integer
);


--
-- TOC entry 224 (class 1259 OID 16543)
-- Name: admin_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4830 (class 0 OID 0)
-- Dependencies: 224
-- Name: admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_id_seq OWNED BY public.admin.id;


--
-- TOC entry 222 (class 1259 OID 16462)
-- Name: certifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certifications (
    id integer NOT NULL,
    title character varying(255),
    employee_id integer,
    file_data bytea,
    issued_date date,
    expire boolean
);


--
-- TOC entry 221 (class 1259 OID 16461)
-- Name: certifications_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.certifications_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4831 (class 0 OID 0)
-- Dependencies: 221
-- Name: certifications_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.certifications_id_seq1 OWNED BY public.certifications.id;


--
-- TOC entry 219 (class 1259 OID 16420)
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    "position" character varying(100) NOT NULL,
    enterprise_id integer,
    password character varying(255),
    email character varying,
    manager_id integer,
    is_active boolean DEFAULT true
);


--
-- TOC entry 218 (class 1259 OID 16419)
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4832 (class 0 OID 0)
-- Dependencies: 218
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- TOC entry 217 (class 1259 OID 16414)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    username character varying(100) NOT NULL,
    password character varying(100) NOT NULL,
    role character varying(50) NOT NULL,
    enterprise_id integer,
    id integer NOT NULL,
    email character varying,
    manager_id integer,
    max_employes integer,
    is_active boolean DEFAULT true
);


--
-- TOC entry 220 (class 1259 OID 16451)
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
-- TOC entry 4833 (class 0 OID 0)
-- Dependencies: 220
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4661 (class 2604 OID 16544)
-- Name: admin id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin ALTER COLUMN id SET DEFAULT nextval('public.admin_id_seq'::regclass);


--
-- TOC entry 4660 (class 2604 OID 16465)
-- Name: certifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certifications ALTER COLUMN id SET DEFAULT nextval('public.certifications_id_seq1'::regclass);


--
-- TOC entry 4658 (class 2604 OID 16423)
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- TOC entry 4656 (class 2604 OID 16452)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4823 (class 0 OID 16538)
-- Dependencies: 223
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin (username, id, role, enterprise_name, email, password, max_managers, max_employes, is_active, start_date, end_date, enterprise_id) FROM stdin;
SuperAdmin	1	superadmin	ilearn	ilearn.nc@gmail.com	$2b$10$M1zz/EIJsrEY1cbRJiO8wOa.AT2C3hsFxYNtI8WPVO2JWfCUuA6.q	\N	\N	t	\N	\N	\N
\.


--
-- TOC entry 4822 (class 0 OID 16462)
-- Dependencies: 222
-- Data for Name: certifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.certifications (id, title, employee_id, file_data, issued_date, expire) FROM stdin;
\.


--
-- TOC entry 4819 (class 0 OID 16420)
-- Dependencies: 219
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employees (id, name, "position", enterprise_id, password, email, manager_id, is_active) FROM stdin;
\.


--
-- TOC entry 4817 (class 0 OID 16414)
-- Dependencies: 217
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (username, password, role, enterprise_id, id, email, manager_id, max_employes, is_active) FROM stdin;
\.


--
-- TOC entry 4834 (class 0 OID 0)
-- Dependencies: 224
-- Name: admin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_id_seq', 9, true);


--
-- TOC entry 4835 (class 0 OID 0)
-- Dependencies: 221
-- Name: certifications_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.certifications_id_seq1', 64, true);


--
-- TOC entry 4836 (class 0 OID 0)
-- Dependencies: 218
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employees_id_seq', 116, true);


--
-- TOC entry 4837 (class 0 OID 0)
-- Dependencies: 220
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 86, true);


--
-- TOC entry 4671 (class 2606 OID 16551)
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (id);


--
-- TOC entry 4669 (class 2606 OID 16469)
-- Name: certifications certifications_pkey1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_pkey1 PRIMARY KEY (id);


--
-- TOC entry 4667 (class 2606 OID 16425)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- TOC entry 4663 (class 2606 OID 16454)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4665 (class 2606 OID 16418)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


-- Completed on 2024-12-05 10:44:43

--
-- PostgreSQL database dump complete
--

