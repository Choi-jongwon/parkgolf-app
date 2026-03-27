export const MOCK_COURSES = [
  { id: '1', name: '한강 파크골프장',   address: '서울 영등포구', hole_count: 18 },
  { id: '2', name: '올림픽 파크골프장', address: '서울 송파구',   hole_count: 9  },
  { id: '3', name: '양재천 파크골프장', address: '서울 강남구',   hole_count: 18 },
]

export const MOCK_RANKINGS = {
  '1': [
    { rank:1, user_id:'u1', nickname:'버디킹👑',   best_score:52, avg_score:55.2, play_count:12, last_played:'2026-03-25' },
    { rank:2, user_id:'u2', nickname:'초록바람',   best_score:54, avg_score:57.8, play_count:8,  last_played:'2026-03-24' },
    { rank:3, user_id:'u3', nickname:'파골퍼',     best_score:55, avg_score:58.1, play_count:20, last_played:'2026-03-26' },
    { rank:4, user_id:'u4', nickname:'홀인원',     best_score:57, avg_score:60.3, play_count:5,  last_played:'2026-03-20' },
    { rank:5, user_id:'u5', nickname:'새벽라운더', best_score:59, avg_score:62.0, play_count:15, last_played:'2026-03-22' },
  ],
  '2': [
    { rank:1, user_id:'u3', nickname:'파골퍼',   best_score:27, avg_score:28.5, play_count:10, last_played:'2026-03-26' },
    { rank:2, user_id:'u1', nickname:'버디킹👑', best_score:28, avg_score:29.1, play_count:7,  last_played:'2026-03-25' },
    { rank:3, user_id:'u2', nickname:'초록바람', best_score:29, avg_score:30.0, play_count:4,  last_played:'2026-03-18' },
  ],
  '3': [
    { rank:1, user_id:'u5', nickname:'새벽라운더', best_score:50, avg_score:53.4, play_count:18, last_played:'2026-03-26' },
    { rank:2, user_id:'u4', nickname:'홀인원',     best_score:53, avg_score:55.9, play_count:9,  last_played:'2026-03-23' },
  ],
}

export const MOCK_MY_SCORES = [
  { id:'s1', played_at:'2026-03-26', total_score:58, golf_courses:{ name:'한강 파크골프장',   hole_count:18 } },
  { id:'s2', played_at:'2026-03-22', total_score:54, golf_courses:{ name:'양재천 파크골프장', hole_count:18 } },
  { id:'s3', played_at:'2026-03-18', total_score:30, golf_courses:{ name:'올림픽 파크골프장', hole_count:9  } },
  { id:'s4', played_at:'2026-03-10', total_score:61, golf_courses:{ name:'한강 파크골프장',   hole_count:18 } },
]
