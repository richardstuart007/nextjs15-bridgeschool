CREATE TABLE IF NOT EXISTS public.database
(
    d_name character varying(16) COLLATE pg_catalog."default" NOT NULL,
    d_did integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    CONSTRAINT database_pkey PRIMARY KEY (d_name)
);

CREATE TABLE IF NOT EXISTS public.library
(
    lrlid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 160 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    lrref character varying(32) COLLATE pg_catalog."default" NOT NULL,
    lrdesc character varying COLLATE pg_catalog."default",
    lrlink character varying COLLATE pg_catalog."default",
    lrwho character varying COLLATE pg_catalog."default",
    lrtype character varying COLLATE pg_catalog."default",
    lrowner character varying(16) COLLATE pg_catalog."default" NOT NULL,
    lrgroup character varying(32) COLLATE pg_catalog."default" NOT NULL,
    lrgid integer,
    CONSTRAINT library_pkey PRIMARY KEY (lrowner, lrgroup, lrref),
    CONSTRAINT unique_lrlid UNIQUE (lrlid)
);

CREATE TABLE IF NOT EXISTS public.logging
(
    lgid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    lgfunctionname character varying COLLATE pg_catalog."default" NOT NULL,
    lgsession integer NOT NULL,
    lgseverity character(1) COLLATE pg_catalog."default",
    lgmsg character varying COLLATE pg_catalog."default" NOT NULL,
    lgdatetime timestamp without time zone NOT NULL,
    CONSTRAINT unique_lgid UNIQUE (lgid)
);

CREATE TABLE IF NOT EXISTS public.owner
(
    oowner character varying(16) COLLATE pg_catalog."default" NOT NULL,
    ooid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 5 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    CONSTRAINT "Owner_pkey" PRIMARY KEY (oowner),
    CONSTRAINT unique_oowner UNIQUE (oowner)
);

CREATE TABLE IF NOT EXISTS public.ownergroup
(
    ogowner character varying(16) COLLATE pg_catalog."default" NOT NULL,
    oggroup character varying(32) COLLATE pg_catalog."default" NOT NULL,
    ogtitle character varying(50) COLLATE pg_catalog."default",
    ogcntquestions smallint DEFAULT 0,
    ogcntlibrary smallint DEFAULT 0,
    oggid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 88 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    CONSTRAINT ownergroup_pkey PRIMARY KEY (ogowner, oggroup),
    CONSTRAINT unique_oggid UNIQUE (oggid)
);

CREATE TABLE IF NOT EXISTS public.questions
(
    qqid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 900 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    qowner character varying(16) COLLATE pg_catalog."default" NOT NULL,
    qdetail character varying(256) COLLATE pg_catalog."default",
    qgroup character varying(32) COLLATE pg_catalog."default" NOT NULL,
    qpoints integer[],
    qans text[] COLLATE pg_catalog."default",
    qseq smallint NOT NULL,
    qrounds text[] COLLATE pg_catalog."default",
    qnorth text[] COLLATE pg_catalog."default",
    qeast text[] COLLATE pg_catalog."default",
    qsouth text[] COLLATE pg_catalog."default",
    qwest text[] COLLATE pg_catalog."default",
    qgid integer,
    CONSTRAINT questions_pkey PRIMARY KEY (qowner, qgroup, qseq),
    CONSTRAINT unique_qqid UNIQUE (qqid)
);

CREATE TABLE IF NOT EXISTS public.reftype
(
    rttype character varying COLLATE pg_catalog."default" NOT NULL,
    rttitle character varying(32) COLLATE pg_catalog."default",
    rtrid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 4 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    CONSTRAINT reftype_pkey PRIMARY KEY (rttype),
    CONSTRAINT unique_rtrid UNIQUE (rtrid)
);

CREATE TABLE IF NOT EXISTS public.sessions
(
    s_id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 700 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    s_datetime timestamp without time zone NOT NULL,
    s_uid integer NOT NULL,
    s_sortquestions boolean DEFAULT true,
    s_skipcorrect boolean DEFAULT true,
    s_dftmaxquestions integer DEFAULT 20,
    CONSTRAINT unique_s_id UNIQUE (s_id)
);

CREATE TABLE IF NOT EXISTS public.users
(
    u_uid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 500 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    u_name character varying(100) COLLATE pg_catalog."default",
    u_email text COLLATE pg_catalog."default" NOT NULL,
    u_joined timestamp without time zone NOT NULL,
    u_fedid character varying(30) COLLATE pg_catalog."default",
    u_admin boolean,
    u_fedcountry character varying(16) COLLATE pg_catalog."default",
    u_provider character varying(30) COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (u_uid),
    CONSTRAINT unique_u_uid UNIQUE (u_uid),
    CONSTRAINT users_email_key UNIQUE (u_email)
);

CREATE TABLE IF NOT EXISTS public.usershistory
(
    r_hid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 750 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    r_datetime timestamp without time zone NOT NULL,
    r_owner character varying(16) COLLATE pg_catalog."default" NOT NULL,
    r_group character varying(32) COLLATE pg_catalog."default",
    r_questions integer,
    r_qid integer[],
    r_ans integer[],
    r_uid integer,
    r_points integer[],
    r_maxpoints integer,
    r_totalpoints integer,
    r_correctpercent integer,
    r_gid integer,
    r_sid integer DEFAULT 0,
    CONSTRAINT unique_r_hid UNIQUE (r_hid)
);

CREATE TABLE IF NOT EXISTS public.usersowner
(
    uouid integer NOT NULL,
    uoowner character varying(32) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT usersowner_pkey PRIMARY KEY (uouid, uoowner),
    CONSTRAINT unique_uouid_uoowner UNIQUE (uouid, uoowner)
);

CREATE TABLE IF NOT EXISTS public.userspwd
(
    upuid integer NOT NULL,
    uphash character varying(100) COLLATE pg_catalog."default",
    upemail text COLLATE pg_catalog."default",
    CONSTRAINT userspwd_pkey PRIMARY KEY (upuid),
    CONSTRAINT unique_upuid UNIQUE (upuid)
);

CREATE TABLE IF NOT EXISTS public.who
(
    wwho character varying(16) COLLATE pg_catalog."default" NOT NULL,
    wtitle character varying(32) COLLATE pg_catalog."default",
    wwid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 12 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    CONSTRAINT "Who_pkey" PRIMARY KEY (wwho),
    CONSTRAINT unique_wwid UNIQUE (wwid)
);
