DROP TABLE IF EXISTS public.trf_reference;
CREATE TABLE IF NOT EXISTS public.trf_reference
(
    rf_rfid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    rf_owner character varying(16)  NOT NULL,
    rf_subject character varying(32)  NOT NULL,
    rf_ref character varying(32)  NOT NULL,
    rf_sbid integer,
    rf_desc character varying ,
    rf_link character varying ,
    rf_who character varying ,
    rf_type character varying ,
    rf_cntquestions SMALLINT DEFAULT 0,
    CONSTRAINT trf_reference_pkey PRIMARY KEY (rf_owner, rf_subject, rf_ref),
    CONSTRAINT trf_reference_rf_rfid_key UNIQUE (rf_rfid)
);

DROP TABLE IF EXISTS public.tqq_questions;
CREATE TABLE IF NOT EXISTS public.tqq_questions
(
    qq_qqid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    qq_owner character varying(16)  NOT NULL,
    qq_subject character varying(32)  NOT NULL,
    qq_sbid integer NOT NULL,
    qq_seq smallint NOT NULL,
    qq_detail character varying(256),
    qq_points integer[],
    qq_ans text[] ,
    qq_rounds text[] ,
    qq_north text[] ,
    qq_east text[] ,
    qq_south text[] ,
    qq_west text[] ,
    qq_rfid integer DEFAULT 0,
    qq_help text ,
    CONSTRAINT tqq_questions_pkey PRIMARY KEY (qq_owner, qq_subject, qq_seq),
    CONSTRAINT tqq_questions_qq_qqid_key UNIQUE (qq_qqid)
);

DROP TABLE IF EXISTS public.tsb_subject;
CREATE TABLE IF NOT EXISTS public.tsb_subject
(
    sb_sbid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    sb_owner character varying(16)  NOT NULL,
    sb_subject character varying(32)  NOT NULL,
    sb_title character varying(50) ,
    sb_cntquestions smallint DEFAULT 0,
    sb_cntreference smallint DEFAULT 0,
    CONSTRAINT tsb_subject_pkey PRIMARY KEY (sb_owner, sb_subject),
    CONSTRAINT tsb_subject_sb_sbid_key UNIQUE (sb_sbid)
);

DROP TABLE IF EXISTS public.tdb_database;
CREATE TABLE IF NOT EXISTS public.tdb_database
(
    db_dbid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    db_name character varying(16)  NOT NULL,
    CONSTRAINT tdb_database_pkey PRIMARY KEY (db_name)
);

DROP TABLE IF EXISTS public.tus_users;
CREATE TABLE IF NOT EXISTS public.tus_users
(
    us_usid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    us_name character varying(100) ,
    us_email text  NOT NULL,
    us_joined timestamp without time zone NOT NULL,
    us_fedid character varying(30) ,
    us_admin boolean,
    us_fedcountry character varying(16) ,
    us_provider character varying(30) ,
    us_sortquestions boolean DEFAULT true,
    us_skipcorrect boolean DEFAULT true,
    us_maxquestions integer DEFAULT 5,
    CONSTRAINT tus_users_pkey PRIMARY KEY (us_usid),
    CONSTRAINT tus_users_us_email_key UNIQUE (us_email)
);

DROP TABLE IF EXISTS public.tup_userspwd;
CREATE TABLE IF NOT EXISTS public.tup_userspwd
(
    up_usid integer NOT NULL,
    up_hash character varying(100) ,
    up_email text ,
    CONSTRAINT tup_userspwd_pkey PRIMARY KEY (up_usid)
);

DROP TABLE IF EXISTS public.ths_history;
CREATE TABLE IF NOT EXISTS public.ths_history
(
    hs_hsid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    hs_datetime timestamp without time zone NOT NULL,
    hs_sbid integer,
    hs_owner character varying(16)  NOT NULL,
    hs_subject character varying(32) ,
    hs_qqid integer[],
    hs_questions integer,
    hs_ans integer[],
    hs_points integer[],
    hs_maxpoints integer,
    hs_totalpoints integer,
    hs_correctpercent integer,
    hs_usid integer,
    hs_rfid integer DEFAULT 0,
    CONSTRAINT ths_history_hs_hsid_key UNIQUE (hs_hsid)
);

DROP TABLE IF EXISTS public.tlg_logging;
CREATE TABLE IF NOT EXISTS public.tlg_logging
(
    lg_lgid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    lg_functionname character varying  NOT NULL,
    lg_ssid integer NOT NULL,
    lg_severity character(1) ,
    lg_msg character varying  NOT NULL,
    lg_datetime timestamp without time zone NOT NULL,
    CONSTRAINT tlg_logging_lg_lgid_key UNIQUE (lg_lgid)
);

DROP TABLE IF EXISTS public.tow_owner;
CREATE TABLE IF NOT EXISTS public.tow_owner
(
    ow_owid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    ow_owner character varying(16)  NOT NULL,
    CONSTRAINT tow_owner_pkey PRIMARY KEY (ow_owner)
);

DROP TABLE IF EXISTS public.trt_reftype;
CREATE TABLE IF NOT EXISTS public.trt_reftype
(
    rt_rtid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    rt_type character varying  NOT NULL,
    rt_title character varying(32) ,
    CONSTRAINT trt_reftype_pkey PRIMARY KEY (rt_type),
    CONSTRAINT trt_reftype_rt_rtid_key UNIQUE (rt_rtid)
);

DROP TABLE IF EXISTS public.tss_sessions;
CREATE TABLE IF NOT EXISTS public.tss_sessions
(
    ss_ssid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    ss_datetime timestamp without time zone NOT NULL,
    ss_usid integer NOT NULL,
    CONSTRAINT tss_sessions_ss_ssid_key UNIQUE (ss_ssid)
);

DROP TABLE IF EXISTS public.tuo_usersowner;
CREATE TABLE IF NOT EXISTS public.tuo_usersowner
(
    uo_usid integer NOT NULL,
    uo_owner character varying(32)  NOT NULL,
    CONSTRAINT tuo_usersowner_pkey PRIMARY KEY (uo_usid, uo_owner)
);

DROP TABLE IF EXISTS public.twh_who;
CREATE TABLE IF NOT EXISTS public.twh_who
(
    wh_whid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    wh_who character varying(16)  NOT NULL,
    wh_title character varying(32) ,
    CONSTRAINT twh_who_pkey PRIMARY KEY (wh_who),
    CONSTRAINT twh_who_wh_whid_key UNIQUE (wh_whid)
);

DROP INDEX IF EXISTS idx_tml_menulinks_ml_ssid_ml_mlid;
DROP TABLE IF EXISTS public.tml_menulinks;

CREATE TABLE IF NOT EXISTS public.tml_menulinks
(
    ml_mlid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    ml_ssid integer NOT NULL,
    ml_reference character varying(32),
    ml_url character varying(255),
    ml_path character varying(128),
    ml_segment character varying(16),
    ml_query character varying(255),
    ml_route character varying(32),
    CONSTRAINT tml_menulinks_ml_mlid_key UNIQUE (ml_mlid)
);

CREATE INDEX idx_tml_menulinks_ml_ssid_ml_mlid
ON public.tml_menulinks (ml_ssid, ml_mlid);