// 테스트 유저 30명 생성 – Supabase Admin REST API
// 실행: node scripts/create_test_users.mjs

// 환경변수로 설정하거나 아래 값을 직접 입력하세요 (커밋하지 마세요!)
// SUPABASE_SERVICE_KEY: Supabase 대시보드 → Project Settings → API → service_role key
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://<YOUR_PROJECT_ID>.supabase.co'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY || '<YOUR_SERVICE_ROLE_KEY>'
const PASSWORD     = 'Test1234!'

const headers = {
  'Content-Type':  'application/json',
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'apikey':        SERVICE_KEY,
}

const TEST_USERS = [
  { email: 'test01@naepas.com', nickname: '파3킹',     birth_year: 1958, gender: 'male'   },
  { email: 'test02@naepas.com', nickname: '버디맨',    birth_year: 1963, gender: 'female' },
  { email: 'test03@naepas.com', nickname: '홀인원',    birth_year: 1955, gender: 'male'   },
  { email: 'test04@naepas.com', nickname: '이글샷',    birth_year: 1970, gender: 'female' },
  { email: 'test05@naepas.com', nickname: '그린파',    birth_year: 1961, gender: 'male'   },
  { email: 'test06@naepas.com', nickname: '페어웨이',  birth_year: 1952, gender: 'female' },
  { email: 'test07@naepas.com', nickname: '롱드라이브', birth_year: 1967, gender: 'male'  },
  { email: 'test08@naepas.com', nickname: '숏게임',    birth_year: 1950, gender: 'female' },
  { email: 'test09@naepas.com', nickname: '파크에이스', birth_year: 1964, gender: 'male'  },
  { email: 'test10@naepas.com', nickname: '골프왕',    birth_year: 1957, gender: 'female' },
  { email: 'test11@naepas.com', nickname: '새벽라운더', birth_year: 1969, gender: 'male'  },
  { email: 'test12@naepas.com', nickname: '황혼골퍼',  birth_year: 1953, gender: 'female' },
  { email: 'test13@naepas.com', nickname: '실버에이스', birth_year: 1960, gender: 'male'  },
  { email: 'test14@naepas.com', nickname: '그린마스터', birth_year: 1966, gender: 'female' },
  { email: 'test15@naepas.com', nickname: '파크챔프',  birth_year: 1951, gender: 'male'   },
  { email: 'test16@naepas.com', nickname: '버디퀸',    birth_year: 1965, gender: 'female' },
  { email: 'test17@naepas.com', nickname: '홀마스터',  birth_year: 1956, gender: 'male'   },
  { email: 'test18@naepas.com', nickname: '이글킹',    birth_year: 1968, gender: 'female' },
  { email: 'test19@naepas.com', nickname: '파크스타',  birth_year: 1954, gender: 'male'   },
  { email: 'test20@naepas.com', nickname: '골든샷',    birth_year: 1962, gender: 'female' },
  { email: 'test21@naepas.com', nickname: '클럽마스터', birth_year: 1959, gender: 'male'  },
  { email: 'test22@naepas.com', nickname: '핀포인트',  birth_year: 1970, gender: 'female' },
  { email: 'test23@naepas.com', nickname: '스윙킹',    birth_year: 1950, gender: 'male'   },
  { email: 'test24@naepas.com', nickname: '퍼팅마스터', birth_year: 1963, gender: 'female' },
  { email: 'test25@naepas.com', nickname: '드라이버킹', birth_year: 1955, gender: 'male'  },
  { email: 'test26@naepas.com', nickname: '아이언맨',  birth_year: 1967, gender: 'female' },
  { email: 'test27@naepas.com', nickname: '웨지샷',    birth_year: 1961, gender: 'male'   },
  { email: 'test28@naepas.com', nickname: '칩샷왕',    birth_year: 1953, gender: 'female' },
  { email: 'test29@naepas.com', nickname: '피치샷',    birth_year: 1966, gender: 'male'   },
  { email: 'test30@naepas.com', nickname: '파크러버',  birth_year: 1958, gender: 'female' },
]

async function main() {
  console.log('🚀 테스트 유저 30명 생성 시작\n')
  let ok = 0, skip = 0, fail = 0

  for (const u of TEST_USERS) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method:  'POST',
      headers,
      body: JSON.stringify({
        email:          u.email,
        password:       PASSWORD,
        email_confirm:  true,
        user_metadata: {
          nickname:   u.nickname,
          birth_year: u.birth_year,
          gender:     u.gender,
        },
      }),
    })

    const json = await res.json()

    if (res.status === 422 && json.msg?.includes('already')) {
      console.log(`⏭  ${u.email} (이미 존재)`)
      skip++
    } else if (!res.ok) {
      console.error(`❌ ${u.email}: ${json.msg ?? json.message ?? JSON.stringify(json)}`)
      fail++
    } else {
      console.log(`✅ ${u.email}  →  ${u.nickname} (${u.birth_year}, ${u.gender})`)
      ok++
    }

    // rate-limit 방지용 딜레이 (200ms)
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\n완료: 생성 ${ok}명 / 스킵 ${skip}명 / 실패 ${fail}명`)
  console.log(`공통 비밀번호: ${PASSWORD}`)
}

main().catch(console.error)
