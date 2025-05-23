DROP TABLE IF EXISTS public.tlg_logging;
CREATE TABLE IF NOT EXISTS public.tlg_logging
(
    lg_lgid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    lg_severity character(1) ,
    lg_caller character varying  DEFAULT '',
    lg_functionname character varying  NOT NULL,
    lg_msg character varying  NOT NULL,
    lg_ssid integer NOT NULL,
    lg_datetime timestamp without time zone NOT NULL,
    CONSTRAINT tlg_logging_lg_lgid_key UNIQUE (lg_lgid)
);