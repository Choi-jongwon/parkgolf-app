-- ============================================================
-- 테스트 스코어 데이터 삽입
-- 전제: create_test_users.mjs 로 test01~test30@naepas.com 생성 완료
-- Supabase SQL Editor 에서 실행하세요.
-- ============================================================

-- 1. 기존 테스트 스코어 삭제
DELETE FROM public.score_records
WHERE user_id IN (
  SELECT id FROM public.users WHERE email LIKE '%@naepas.com'
);

-- 2. 스코어 삽입
-- 골프장 상위 20개 × 5명 = 100개 레코드
-- 유저 순번 = ((course_seq-1)*5 + slot) % 30 + 1  (순환)
-- total_score: 70~90 랜덤
-- played_at:   2026-01-01 ~ 2026-04-16

WITH
user_seq AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY email) AS seq   -- test01→1, test02→2 ...
  FROM public.users
  WHERE email LIKE '%@naepas.com'
),
top_courses AS (
  SELECT
    id   AS course_id,
    ROW_NUMBER() OVER (ORDER BY created_at, id) AS course_seq
  FROM public.golf_courses
  LIMIT 20
),
slot_series AS (
  SELECT generate_series(0, 4) AS slot
),
score_combos AS (
  SELECT
    tc.course_id,
    tc.course_seq,
    ss.slot,
    ((tc.course_seq - 1) * 5 + ss.slot) % 30 + 1 AS user_seq_num
  FROM top_courses tc
  CROSS JOIN slot_series ss
),
score_data AS (
  SELECT
    sc.course_id,
    us.id                                                         AS user_id,
    DATE '2026-01-01' + (floor(random() * 106))::int             AS played_at,
    (floor(random() * 21) + 70)::smallint                        AS total_score
  FROM score_combos sc
  JOIN user_seq us ON us.seq = sc.user_seq_num
)

INSERT INTO public.score_records (user_id, course_id, played_at, total_score, hole_scores)
SELECT user_id, course_id, played_at, total_score, NULL
FROM score_data;

-- 확인
SELECT COUNT(*) AS inserted_scores
FROM public.score_records
WHERE user_id IN (
  SELECT id FROM public.users WHERE email LIKE '%@naepas.com'
);
