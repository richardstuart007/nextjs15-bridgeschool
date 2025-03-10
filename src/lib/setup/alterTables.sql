ALTER TABLE tss_sessions
ALTER COLUMN ss_datetime
SET DATA TYPE TIMESTAMP WITH TIME ZONE
USING ss_datetime AT TIME ZONE 'UTC';

ALTER TABLE ths_history
ALTER COLUMN hs_datetime
SET DATA TYPE TIMESTAMP WITH TIME ZONE
USING hs_datetime AT TIME ZONE 'UTC';

ALTER TABLE tlg_logging
ALTER COLUMN lg_datetime
SET DATA TYPE TIMESTAMP WITH TIME ZONE
USING lg_datetime AT TIME ZONE 'UTC';

ALTER TABLE tus_users
ALTER COLUMN us_joined
SET DATA TYPE TIMESTAMP WITH TIME ZONE
USING us_joined AT TIME ZONE 'UTC';

ALTER DATABASE verceldb SET TIMEZONE = 'UTC';


ALTER ROLE postgres SET TIMEZONE = 'UTC';
ALTER ROLE "default" SET timezone = 'UTC';

ALTER TABLE tlg_logging RENAME COLUMN lg_session TO lg_ssid;


