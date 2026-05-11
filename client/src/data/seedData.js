export const ADMIN_PASSWORD = 'admin@2005'

export const colleges = [
  { id: 1, full_name: 'Government Medical College Alappuzha', short_name: 'GMC Alappuzha' },
  { id: 2, full_name: 'Amrita Institute of Medical Sciences', short_name: 'Amrita' },
  { id: 3, full_name: 'Government Medical College Kottayam', short_name: 'GMC Kottayam' },
  { id: 4, full_name: 'Government Medical College Thiruvananthapuram', short_name: 'GMC TVM' },
  { id: 5, full_name: 'Kerala Institute of Medical Sciences', short_name: 'KIMS' },
  { id: 6, full_name: 'Travancore Medical College', short_name: 'TMC' },
  { id: 7, full_name: 'Sree Gokulam Medical College', short_name: 'SGMC' },
  { id: 8, full_name: 'Jubilee Mission Medical College', short_name: 'Jubilee' },
]

export const sports = [
  { id: 'football', name: 'Football', icon: '⚽', description: 'Men: 11-a-side | Women: 5-a-side (Futsal)', sort_order: 1 },
  { id: 'cricket', name: 'Cricket', icon: '🏏', description: 'Standard cricket rules apply', sort_order: 2 },
  { id: 'basketball', name: 'Basketball', icon: '🏀', description: '5v5 standard rules', sort_order: 3 },
  { id: 'badminton', name: 'Badminton', icon: '🏸', description: 'Singles & Doubles', sort_order: 4 },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐', description: '6v6 indoor volleyball', sort_order: 5 },
  { id: 'kho-kho', name: 'Kho Kho', icon: '🏃', description: 'Traditional Indian tag game', sort_order: 6 },
  { id: 'table-tennis', name: 'Table Tennis', icon: '🏓', description: 'Singles & Doubles', sort_order: 7 },
  { id: 'chess', name: 'Chess', icon: '♟️', description: 'Mixed teams allowed', sort_order: 8 },
]

export const matches = [
  {
    id: 1,
    sport: 'football',
    gender: 'men',
    team_a_id: 1,
    team_b_id: 2,
    score_a: 2,
    score_b: 1,
    status: 'completed',
    winner_id: 1,
    scheduled_time: '2026-05-15T08:30:00.000Z',
    venue: 'Main Ground',
    extra_data: {},
  },
  {
    id: 2,
    sport: 'football',
    gender: 'women',
    team_a_id: 4,
    team_b_id: 5,
    score_a: 1,
    score_b: 1,
    status: 'live',
    winner_id: null,
    scheduled_time: '2026-05-15T10:30:00.000Z',
    venue: 'Main Ground',
    extra_data: {},
  },
  {
    id: 3,
    sport: 'cricket',
    gender: 'men',
    team_a_id: 5,
    team_b_id: 7,
    score_a: 145,
    score_b: 143,
    status: 'completed',
    winner_id: 5,
    scheduled_time: '2026-05-15T11:30:00.000Z',
    venue: 'Cricket Ground',
    extra_data: {},
  },
  {
    id: 4,
    sport: 'cricket',
    gender: 'women',
    team_a_id: 8,
    team_b_id: 6,
    score_a: 0,
    score_b: 0,
    status: 'upcoming',
    winner_id: null,
    scheduled_time: '2026-05-15T14:00:00.000Z',
    venue: 'Cricket Ground',
    extra_data: {},
  },
  {
    id: 5,
    sport: 'basketball',
    gender: 'men',
    team_a_id: 3,
    team_b_id: 6,
    score_a: 62,
    score_b: 58,
    status: 'completed',
    winner_id: 3,
    scheduled_time: '2026-05-15T15:00:00.000Z',
    venue: 'Indoor Court A',
    extra_data: {},
  },
  {
    id: 6,
    sport: 'basketball',
    gender: 'women',
    team_a_id: 2,
    team_b_id: 8,
    score_a: 0,
    score_b: 0,
    status: 'upcoming',
    winner_id: null,
    scheduled_time: '2026-05-15T16:30:00.000Z',
    venue: 'Indoor Court A',
    extra_data: {},
  },
  {
    id: 7,
    sport: 'badminton',
    gender: 'men',
    team_a_id: 2,
    team_b_id: 8,
    score_a: 2,
    score_b: 1,
    status: 'completed',
    winner_id: 2,
    scheduled_time: '2026-05-16T09:00:00.000Z',
    venue: 'Badminton Hall',
    extra_data: {},
  },
  {
    id: 8,
    sport: 'badminton',
    gender: 'women',
    team_a_id: 1,
    team_b_id: 7,
    score_a: 1,
    score_b: 2,
    status: 'live',
    winner_id: null,
    scheduled_time: '2026-05-16T10:00:00.000Z',
    venue: 'Badminton Hall',
    extra_data: {},
  },
  {
    id: 9,
    sport: 'volleyball',
    gender: 'men',
    team_a_id: 4,
    team_b_id: 1,
    score_a: 0,
    score_b: 0,
    status: 'upcoming',
    winner_id: null,
    scheduled_time: '2026-05-16T12:00:00.000Z',
    venue: 'Volley Court',
    extra_data: {},
  },
  {
    id: 10,
    sport: 'volleyball',
    gender: 'women',
    team_a_id: 7,
    team_b_id: 4,
    score_a: 18,
    score_b: 21,
    status: 'completed',
    winner_id: 4,
    scheduled_time: '2026-05-16T13:00:00.000Z',
    venue: 'Volley Court',
    extra_data: {},
  },
  {
    id: 11,
    sport: 'kho-kho',
    gender: 'men',
    team_a_id: 6,
    team_b_id: 3,
    score_a: 0,
    score_b: 0,
    status: 'upcoming',
    winner_id: null,
    scheduled_time: '2026-05-16T15:00:00.000Z',
    venue: 'Kho Kho Ground',
    extra_data: {},
  },
  {
    id: 12,
    sport: 'table-tennis',
    gender: 'women',
    team_a_id: 1,
    team_b_id: 3,
    score_a: 3,
    score_b: 1,
    status: 'completed',
    winner_id: 1,
    scheduled_time: '2026-05-17T09:30:00.000Z',
    venue: 'TT Hall',
    extra_data: {},
  },
  {
    id: 13,
    sport: 'chess',
    gender: 'men',
    team_a_id: 5,
    team_b_id: 6,
    score_a: 2,
    score_b: 0,
    status: 'completed',
    winner_id: 5,
    scheduled_time: '2026-05-17T11:00:00.000Z',
    venue: 'Chess Room',
    extra_data: {},
  },
  {
    id: 14,
    sport: 'chess',
    gender: 'women',
    team_a_id: 8,
    team_b_id: 2,
    score_a: 0,
    score_b: 0,
    status: 'upcoming',
    winner_id: null,
    scheduled_time: '2026-05-17T12:00:00.000Z',
    venue: 'Chess Room',
    extra_data: {},
  },
]

export function cloneSeedData() {
  return {
    colleges: JSON.parse(JSON.stringify(colleges)),
    sports: JSON.parse(JSON.stringify(sports)),
    matches: JSON.parse(JSON.stringify(matches)),
    sessions: [],
  }
}

export function buildLeaderboard(sourceMatches, sourceColleges, gender = 'all', sport = null) {
  const collegesById = new Map(sourceColleges.map(college => [String(college.id), college]))
  const rows = sourceColleges.map(college => {
    const playedMatches = sourceMatches.filter(match => {
      if (match.status !== 'completed') return false
      if (gender !== 'all' && match.gender !== gender) return false
      if (sport && match.sport !== sport) return false
      return String(match.team_a_id) === String(college.id) || String(match.team_b_id) === String(college.id)
    })

    let wins = 0
    let draws = 0
    let losses = 0

    playedMatches.forEach(match => {
      if (String(match.winner_id) === String(college.id)) {
        wins += 1
      } else if (!match.winner_id && match.score_a === match.score_b) {
        draws += 1
      } else {
        losses += 1
      }
    })

    return {
      id: college.id,
      short_name: college.short_name,
      full_name: college.full_name,
      matches_played: playedMatches.length,
      wins,
      draws,
      losses,
      total_points: wins * 3 + draws,
    }
  })

  rows.sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points
    if (b.wins !== a.wins) return b.wins - a.wins
    return a.short_name.localeCompare(b.short_name)
  })

  return rows
}
