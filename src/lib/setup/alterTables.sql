ALTER TABLE public.users ADD COLUMN u_sortquestions boolean DEFAULT true;
ALTER TABLE public.users ADD COLUMN u_skipcorrect  boolean DEFAULT true;
ALTER TABLE public.users ADD COLUMN u_maxquestions integer DEFAULT 5;

ALTER TABLE public.sessions DROP COLUMN s_sortquestions;
ALTER TABLE public.sessions DROP COLUMN s_skipcorrect;
ALTER TABLE public.sessions DROP COLUMN s_dftmaxquestions;