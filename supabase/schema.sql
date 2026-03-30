-- ============================================================
-- 파크골프 앱 Supabase 스키마
-- Supabase > SQL Editor 에서 순서대로 실행하세요.
-- ============================================================

-- 1. 테이블 생성 -----------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  nickname   TEXT NOT NULL,
  birth_year SMALLINT,                              -- 출생년도
  gender     TEXT CHECK (gender IN ('male','female')),  -- 성별
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.golf_courses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  address        TEXT,
  city_province  TEXT,           -- 시/도 (예: 경기, 서울)
  hole_count     SMALLINT NOT NULL DEFAULT 18 CHECK (hole_count IN (9, 18, 27, 36)),
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.score_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES public.golf_courses(id) ON DELETE CASCADE,
  played_at   DATE NOT NULL,
  total_score SMALLINT NOT NULL,
  hole_scores JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. 인덱스 ---------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_score_records_course_score
  ON public.score_records (course_id, total_score ASC);

CREATE INDEX IF NOT EXISTS idx_score_records_user
  ON public.score_records (user_id);

-- 3. 랭킹 뷰 -------------------------------------------------

CREATE OR REPLACE VIEW public.ranking_by_course AS
SELECT
  sr.course_id,
  u.id                                        AS user_id,
  u.nickname,
  MIN(sr.total_score)                         AS best_score,
  ROUND(AVG(sr.total_score)::numeric, 1)      AS avg_score,
  COUNT(*)                                    AS play_count,
  MAX(sr.played_at)::TEXT                     AS last_played
FROM public.score_records sr
JOIN public.users u ON u.id = sr.user_id
GROUP BY sr.course_id, u.id, u.nickname;

-- anon / authenticated 역할에 뷰 읽기 권한 부여
GRANT SELECT ON public.ranking_by_course TO anon, authenticated;

-- 4. 신규 회원가입 시 users 테이블 자동 생성 트리거 -----------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname, birth_year, gender)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data->>'birth_year', '')::SMALLINT,
    NULLIF(NEW.raw_user_meta_data->>'gender', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. RLS 활성화 -----------------------------------------------

ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.golf_courses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_records ENABLE ROW LEVEL SECURITY;

-- 6. RLS 정책 ------------------------------------------------

-- golf_courses: 누구나 읽기 가능
CREATE POLICY "golf_courses_public_read"
  ON public.golf_courses FOR SELECT USING (true);

-- users: 누구나 닉네임 조회 가능 (랭킹 표시), 본인만 수정
CREATE POLICY "users_public_read"
  ON public.users FOR SELECT USING (true);
CREATE POLICY "users_own_insert"
  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_own_update"
  ON public.users FOR UPDATE USING (auth.uid() = id);

-- score_records: 누구나 읽기 (랭킹 집계), 인증 사용자만 본인 기록 쓰기/삭제
CREATE POLICY "score_records_public_read"
  ON public.score_records FOR SELECT USING (true);
CREATE POLICY "score_records_own_insert"
  ON public.score_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "score_records_own_delete"
  ON public.score_records FOR DELETE USING (auth.uid() = user_id);
