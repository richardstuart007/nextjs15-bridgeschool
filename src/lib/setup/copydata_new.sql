insert into  trf_reference
(
    rf_rid ,
    rf_owner ,
    rf_subject ,
    rf_ref ,
    rf_gid ,
    rf_desc  ,
    rf_link  ,
    rf_who  ,
    rf_type
)
select * from rnm_tlr_library;

insert into  tsb_subject
(
    sb_sid,
    sb_owner,
    sb_subject,
    sb_title,
    sb_cntquestions,
    sb_cntreference
)
select * from z_1tog_ownergroup;

insert into  trf_reference
(
    rf_rid,
    rf_owner ,
    rf_subject ,
    rf_ref,
    rf_gid,
    rf_desc ,
    rf_link  ,
    rf_who ,
    rf_type
)

select *
from rnm_trf_reference;

insert into  tqq_questions
(
    qq_qid ,
    qq_owner ,
    qq_subject ,
    qq_gid ,
    qq_seq ,
    qq_detail,
    qq_points ,
    qq_ans ,
    qq_rounds ,
    qq_north ,
    qq_east ,
    qq_south,
    qq_west ,
    qq_lid
)
select * from rnm_tqq_questions;

insert into  tdb_database
(
    db_did ,
    db_name
)

select *
from rnm_tdb_database;

insert into  tus_users
(
    us_uid ,
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

select *
from rnm_tus_users;

insert into  tup_userspwd
(
    up_uid,
    up_hash  ,
    up_email
)

select *
from rnm_tup_userspwd;


insert into  ths_history
(
    hs_hid ,
    hs_datetime ,
    hs_gid ,
    hs_owner ,
    hs_subject  ,
    hs_qid ,
    hs_questions ,
    hs_ans ,
    hs_points ,
    hs_maxpoints ,
    hs_totalpoints ,
    hs_correctpercent ,
    hs_uid ,
    hs_sid
)

select *
from rnm_ths_usershistory;


insert into  tlg_logging
(
    lg_id ,
    lg_functionname ,
    lg_session ,
    lg_severity  ,
    lg_msg ,
    lg_datetime
)

select *
from rnm_tlg_logging;


insert into  tow_owner
(
    ow_oid ,
    ow_owner
)

select *
from rnm_tow_owner;


insert into  trt_reftype
(
    rt_rid ,
    rt_type ,
    rt_title
)

select *
from rnm_trt_reftype;


insert into  tss_sessions
(
    ss_id ,
    ss_datetime ,
    ss_uid
)

select *
from rnm_tss_sessions;


insert into  tuo_usersowner
(
    uo_uid ,
    uo_owner
)

select *
from rnm_tuo_usersowner;


insert into  twh_who
(
    wh_wid ,
    wh_who ,
    wh_title
)
select * from rnm_twh_who;