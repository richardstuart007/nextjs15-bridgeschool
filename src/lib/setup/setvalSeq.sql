SELECT setval('questions_qq_qid_seq', COALESCE((SELECT MAX(qq_qid) FROM tqq_questions), 1));
SELECT setval('library_lrlid_seq', COALESCE((SELECT MAX(lrlid) FROM library), 1));