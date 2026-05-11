import { ADMIN_PASSWORD, buildLeaderboard, cloneSeedData } from '../data/seedData.js'
import { getItem, setItem, removeItem } from './safeStorage.js'
import { publishLiveEvent } from './liveBus.js'

const STORAGE_KEY = 'quadra.mock.db.v1'
const defaults = { timeout: 0 }

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function getInitialState() {
  return cloneSeedData()
}

function readState() {
  try {
    const raw = getItem(STORAGE_KEY)
    if (!raw) return getInitialState()
    const parsed = JSON.parse(raw)
    return {
      colleges: Array.isArray(parsed.colleges) ? parsed.colleges : getInitialState().colleges,
      sports: Array.isArray(parsed.sports) ? parsed.sports : getInitialState().sports,
      matches: Array.isArray(parsed.matches) ? parsed.matches : getInitialState().matches,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    }
  } catch {
    return getInitialState()
  }
}

function saveState(state) {
  setItem(STORAGE_KEY, JSON.stringify(state))
}

function makeError(status, message) {
  const error = new Error(message)
  error.response = { status, data: { error: message } }
  return error
}

function getTeamName(state, teamId) {
  const college = state.colleges.find(item => String(item.id) === String(teamId))
  return college ? college.short_name : null
}

function withTeamNames(state, match) {
  return {
    ...clone(match),
    team_a_name: getTeamName(state, match.team_a_id),
    team_b_name: getTeamName(state, match.team_b_id),
  }
}

function normalizeState(state) {
  return {
    colleges: Array.isArray(state.colleges) ? state.colleges : [],
    sports: Array.isArray(state.sports) ? state.sports : [],
    matches: Array.isArray(state.matches) ? state.matches : [],
    sessions: Array.isArray(state.sessions) ? state.sessions : [],
  }
}

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
}

function applyMatchFilters(matches, params) {
  let filtered = matches
  if (params.get('sport')) filtered = filtered.filter(match => match.sport === params.get('sport'))
  if (params.get('status')) filtered = filtered.filter(match => match.status === params.get('status'))
  if (params.get('gender')) filtered = filtered.filter(match => match.gender === params.get('gender'))
  return filtered
}

function sortMatches(matches) {
  return [...matches].sort((a, b) => {
    const aTime = a.scheduled_time ? new Date(a.scheduled_time).getTime() : 0
    const bTime = b.scheduled_time ? new Date(b.scheduled_time).getTime() : 0
    if (bTime !== aTime) return bTime - aTime
    return Number(b.id) - Number(a.id)
  })
}

function computeLeaderboard(state, gender = 'all', sport = null) {
  return buildLeaderboard(state.matches, state.colleges, gender, sport)
}

function handleGet(state, url) {
  const params = new URL(url, 'https://quadra.local').searchParams
  const path = new URL(url, 'https://quadra.local').pathname

  if (path === '/api/health') return { status: 200, data: { status: 'ok', source: 'mock' } }
  if (path === '/api/colleges') return { status: 200, data: clone(state.colleges).sort((a, b) => a.short_name.localeCompare(b.short_name)) }
  if (path === '/api/sports') return { status: 200, data: clone(state.sports).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.name.localeCompare(b.name)) }
  if (path === '/api/leaderboard/overall') return { status: 200, data: computeLeaderboard(state, 'all') }
  if (path.startsWith('/api/leaderboard/sport/')) {
    const sport = path.split('/').pop()
    return { status: 200, data: computeLeaderboard(state, params.get('gender') || 'all', sport) }
  }
  if (path === '/api/leaderboard') return { status: 200, data: computeLeaderboard(state, params.get('gender') || 'all') }
  if (path === '/api/matches') {
    const filtered = applyMatchFilters(state.matches.map(match => withTeamNames(state, match)), params)
    return { status: 200, data: sortMatches(filtered) }
  }
  if (path.startsWith('/api/matches/')) {
    const id = path.split('/')[3]
    const match = state.matches.find(item => String(item.id) === String(id))
    if (!match) throw makeError(404, 'Match not found')
    return { status: 200, data: withTeamNames(state, match) }
  }
  if (path === '/api/admin/verify') {
    const token = getItem('adminToken') || ''
    const valid = state.sessions.includes(token)
    return { status: valid ? 200 : 401, data: valid ? { valid: true } : { error: 'Invalid or expired token' } }
  }

  return { status: 404, data: { error: 'Not found' } }
}

function handlePost(state, url, body) {
  const path = new URL(url, 'https://quadra.local').pathname

  if (path === '/api/admin/login') {
    if (body?.password === ADMIN_PASSWORD) {
      const token = `mock-admin-${Date.now()}-${Math.random().toString(16).slice(2)}`
      state.sessions.push(token)
      setItem('adminToken', token)
      saveState(state)
      return { status: 200, data: { token, success: true } }
    }
    throw makeError(401, 'Invalid password')
  }

  if (path === '/api/admin/logout') {
    removeItem('adminToken')
    saveState(state)
    return { status: 200, data: { success: true } }
  }

  if (path === '/api/colleges') {
    const college = {
      id: nextId(state.colleges),
      full_name: body.full_name,
      short_name: body.short_name,
    }
    state.colleges.push(college)
    saveState(state)
    publishLiveEvent('leaderboard-update')
    return { status: 200, data: college }
  }

  if (path === '/api/sports') {
    const sport = {
      id: String(body.id || body.name || '').toLowerCase().replace(/\s+/g, '-'),
      name: body.name,
      icon: body.icon || '🏆',
      description: body.description || '',
      sort_order: state.sports.reduce((max, item) => Math.max(max, Number(item.sort_order) || 0), 0) + 1,
    }
    state.sports.push(sport)
    saveState(state)
    publishLiveEvent('matches-updated')
    publishLiveEvent('leaderboard-update')
    return { status: 200, data: sport }
  }

  if (path === '/api/matches') {
    const match = {
      id: nextId(state.matches),
      sport: body.sport,
      gender: body.gender || 'men',
      team_a_id: Number(body.team_a_id),
      team_b_id: Number(body.team_b_id),
      team_a_name: getTeamName(state, body.team_a_id),
      team_b_name: getTeamName(state, body.team_b_id),
      score_a: Number(body.score_a || 0),
      score_b: Number(body.score_b || 0),
      scheduled_time: body.scheduled_time || null,
      venue: body.venue || '',
      status: body.status || 'upcoming',
      winner_id: body.winner_id ?? null,
      extra_data: body.extra_data || {},
    }
    state.matches.push(match)
    saveState(state)
    publishLiveEvent('matches-updated')
    publishLiveEvent('leaderboard-update')
    return { status: 200, data: withTeamNames(state, match) }
  }

  if (/^\/api\/matches\/\d+\/score$/.test(path)) {
    const id = Number(path.split('/')[3])
    const match = state.matches.find(item => Number(item.id) === id)
    if (!match) throw makeError(404, 'Match not found')
    match.score_a = Number(body.score_a || 0)
    match.score_b = Number(body.score_b || 0)
    saveState(state)
    publishLiveEvent('score-updated', withTeamNames(state, match))
    publishLiveEvent('matches-updated')
    publishLiveEvent('leaderboard-update')
    return { status: 200, data: withTeamNames(state, match) }
  }

  if (/^\/api\/matches\/\d+\/status$/.test(path)) {
    const id = Number(path.split('/')[3])
    const match = state.matches.find(item => Number(item.id) === id)
    if (!match) throw makeError(404, 'Match not found')
    match.status = body.status || match.status
    match.winner_id = body.winner_id ?? null
    saveState(state)
    publishLiveEvent('status-updated', withTeamNames(state, match))
    publishLiveEvent('matches-updated')
    publishLiveEvent('leaderboard-update')
    return { status: 200, data: withTeamNames(state, match) }
  }

  throw makeError(404, 'Not found')
}

function handlePut(state, url, body) {
  const path = new URL(url, 'https://quadra.local').pathname

  if (/^\/api\/colleges\/\d+$/.test(path)) {
    const id = Number(path.split('/').pop())
    const college = state.colleges.find(item => Number(item.id) === id)
    if (!college) throw makeError(404, 'College not found')
    college.full_name = body.full_name
    college.short_name = body.short_name
    saveState(state)
    publishLiveEvent('matches-updated')
    publishLiveEvent('leaderboard-update')
    return { status: 200, data: college }
  }

  if (/^\/api\/sports\/[^/]+$/.test(path)) {
    const id = path.split('/').pop()
    const sport = state.sports.find(item => String(item.id) === String(id))
    if (!sport) throw makeError(404, 'Sport not found')
    sport.name = body.name
    sport.icon = body.icon
    sport.description = body.description
    saveState(state)
    publishLiveEvent('matches-updated')
    return { status: 200, data: sport }
  }

  if (/^\/api\/matches\/\d+$/.test(path)) {
    const id = Number(path.split('/').pop())
    const match = state.matches.find(item => Number(item.id) === id)
    if (!match) throw makeError(404, 'Match not found')
    match.sport = body.sport || match.sport
    match.gender = body.gender || match.gender
    match.team_a_id = body.team_a_id ? Number(body.team_a_id) : match.team_a_id
    match.team_b_id = body.team_b_id ? Number(body.team_b_id) : match.team_b_id
    match.team_a_name = getTeamName(state, match.team_a_id)
    match.team_b_name = getTeamName(state, match.team_b_id)
    match.scheduled_time = body.scheduled_time || match.scheduled_time
    match.venue = body.venue || match.venue
    match.status = body.status || match.status
    saveState(state)
    publishLiveEvent('matches-updated')
    publishLiveEvent('leaderboard-update')
    return { status: 200, data: withTeamNames(state, match) }
  }

  throw makeError(404, 'Not found')
}

function handleDelete(state, url) {
  const path = new URL(url, 'https://quadra.local').pathname

  if (/^\/api\/colleges\/\d+$/.test(path)) {
    const id = Number(path.split('/').pop())
    state.colleges = state.colleges.filter(item => Number(item.id) !== id)
    saveState(state)
    publishLiveEvent('matches-updated')
    publishLiveEvent('leaderboard-update')
    return { status: 200, data: { success: true } }
  }

  if (/^\/api\/sports\/[^/]+$/.test(path)) {
    const id = path.split('/').pop()
    state.sports = state.sports.filter(item => String(item.id) !== String(id))
    saveState(state)
    publishLiveEvent('matches-updated')
    return { status: 200, data: { success: true } }
  }

  if (/^\/api\/matches\/\d+$/.test(path)) {
    const id = Number(path.split('/').pop())
    state.matches = state.matches.filter(item => Number(item.id) !== id)
    saveState(state)
    publishLiveEvent('matches-updated')
    publishLiveEvent('leaderboard-update')
    return { status: 200, data: { success: true } }
  }

  throw makeError(404, 'Not found')
}

async function request(method, url, body) {
  const state = normalizeState(readState())

  try {
    if (method === 'GET') return { data: handleGet(state, url).data }
    if (method === 'POST') return { data: handlePost(state, url, body).data }
    if (method === 'PUT') return { data: handlePut(state, url, body).data }
    if (method === 'DELETE') return { data: handleDelete(state, url).data }
    throw makeError(405, 'Method not allowed')
  } catch (error) {
    if (error.response) throw error
    throw makeError(500, error.message || 'Request failed')
  }
}

const axiosLike = {
  defaults,
  get: (url) => request('GET', url),
  post: (url, body) => request('POST', url, body),
  put: (url, body) => request('PUT', url, body),
  delete: (url) => request('DELETE', url),
}

export default axiosLike
