// 관리자 계정 생성 – Supabase Admin REST API
// 실행: node scripts/create_admin.mjs

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ybzdsxvgocfgxcvzqrwq.supabase.co'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY || '<YOUR_SERVICE_ROLE_KEY>'

const headers = {
  'Content-Type':  'application/json',
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'apikey':        SERVICE_KEY,
}

async function main() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email:         'admin@naepas.com',
      password:      'Test1234!',
      email_confirm: true,
      user_metadata: {
        nickname:   'admin',
        birth_year: 1980,
        gender:     'male',
      },
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    console.error('❌ 실패:', json.msg ?? json.message ?? JSON.stringify(json))
  } else {
    console.log('✅ 관리자 계정 생성 완료')
    console.log('   이메일  :', json.email)
    console.log('   닉네임  : admin')
    console.log('   비밀번호: Test1234!')
  }
}

main().catch(console.error)
