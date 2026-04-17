-- ============================================================
-- 트리거 재생성 + auth.users → public.users 누락 데이터 동기화
-- Supabase SQL Editor에서 실행하세요.
-- ============================================================

-- 1. 트리거 함수 재생성
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

-- 2. 트리거 재연결
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. auth.users에 있지만 public.users에 없는 계정 동기화
INSERT INTO public.users (id, email, nickname, birth_year, gender)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'nickname', split_part(au.email, '@', 1)),
  NULLIF(au.raw_user_meta_data->>'birth_year', '')::SMALLINT,
  NULLIF(au.raw_user_meta_data->>'gender', '')
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 4. 확인 쿼리
SELECT
  (SELECT COUNT(*) FROM auth.users)   AS auth_users,
  (SELECT COUNT(*) FROM public.users) AS public_users;
