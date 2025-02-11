UPDATE tsb_subject
SET sb_cntquestions = subquery.count
FROM (
    SELECT sb_sbid, COALESCE(COUNT(qq_sbid), 0) AS count
    FROM tsb_subject
    LEFT JOIN tqq_questions ON sb_sbid = qq_sbid
    GROUP BY sb_sbid
) subquery
WHERE tsb_subject.sb_sbid = subquery.sb_sbid;
