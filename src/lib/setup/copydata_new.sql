insert into  trf_reference
(
    rf_rfid ,
    rf_owner ,
    rf_subject ,
    rf_ref ,
    rf_sbid ,
    rf_desc  ,
    rf_link  ,
    rf_who  ,
    rf_type
)
select * from r1_trf_reference;


insert into  tsb_subject
(
    sb_sbid,
    sb_owner,
    sb_subject,
    sb_title,
    sb_cntquestions,
    sb_cntreference
)
select * from r1_tsb_subject;


insert into  tqq_questions
(
    qq_qqid ,
    qq_owner ,
    qq_subject ,
    qq_sbid ,
    qq_seq ,
    qq_detail,
    qq_points ,
    qq_ans ,
    qq_rounds ,
    qq_north ,
    qq_east ,
    qq_south,
    qq_west ,
    qq_rfid
)
select * from r1_tqq_questions;

insert into  tdb_database
(
    db_dbid ,
    db_name
)
select * from r1_tdb_database;

insert into  tus_users
(
    us_usid ,
    us_name ,
    us_email ,
    us_joined ,
    us_fedid ,
    us_admin ,
    us_fedcountry ,
    us_provider  ,
    us_sortquestions ,
    us_skipcorrect ,
    us_maxquestions
)
select * from r1_tus_users;


insert into  tup_userspwd
(
    up_usid,
    up_hash  ,
    up_email
)
select * from r1_tup_userspwd;


insert into  ths_history
(
    hs_hsid ,
    hs_datetime ,
    hs_sbid ,
    hs_owner ,
    hs_subject  ,
    hs_qqid ,
    hs_questions ,
    hs_ans ,
    hs_points ,
    hs_maxpoints ,
    hs_totalpoints ,
    hs_correctpercent ,
    hs_usid ,
    hs_rfid
)
select * from r1_ths_history;


insert into  tlg_logging
(
    lg_lgid ,
    lg_functionname ,
    lg_session ,
    lg_severity  ,
    lg_msg ,
    lg_datetime
)
select * from r1_tlg_logging;


insert into  tow_owner
(
    ow_owid ,
    ow_owner
)
select * from r1_tow_owner;


insert into  trt_reftype
(
    rt_rtid ,
    rt_type ,
    rt_title
)
select * from r1_trt_reftype;


insert into  tss_sessions
(
    ss_ssid ,
    ss_datetime ,
    ss_usid
)
select * from r1_tss_sessions;


insert into  tuo_usersowner
(
    uo_usid ,
    uo_owner
)
select * from r1_tuo_usersowner;


insert into  twh_who
(
    wh_whid ,
    wh_who ,
    wh_title
)
select * from r1_twh_who;