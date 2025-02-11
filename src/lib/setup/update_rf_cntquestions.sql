UPDATE trf_reference
SET rf_cntquestions = subquery.count
FROM (
    SELECT rf_rfid, COALESCE(COUNT(qq_rfid), 0) AS count
    FROM trf_reference
    LEFT JOIN tqq_questions ON rf_rfid = qq_rfid
    GROUP BY rf_rfid
) subquery
WHERE trf_reference.rf_rfid = subquery.rf_rfid;
