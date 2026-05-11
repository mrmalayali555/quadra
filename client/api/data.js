const DEFAULT_OWNER = 'mrmalayali555'
const DEFAULT_REPO = 'quadra'
const DEFAULT_BRANCH = 'main'
const DEFAULT_FILE_PATH = 'data.json'

function getConfig() {
  const token = process.env.GITHUB_TOKEN || ''
  const owner = process.env.GITHUB_OWNER || DEFAULT_OWNER
  const repo = process.env.GITHUB_REPO || DEFAULT_REPO
  const branch = process.env.GITHUB_BRANCH || DEFAULT_BRANCH
  const filePath = process.env.GITHUB_DATA_FILE || DEFAULT_FILE_PATH

  return { token, owner, repo, branch, filePath }
}

function makeApiUrl(owner, repo, filePath) {
  return `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`
}

async function githubRequest(url, options = {}) {
  const response = await fetch(url, options)
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GitHub API ${response.status}: ${text}`)
  }
  return response.json()
}

function decodeBase64Json(content) {
  const decoded = Buffer.from(content, 'base64').toString('utf8')
  return JSON.parse(decoded)
}

function encodeBase64Json(data) {
  return Buffer.from(JSON.stringify(data, null, 2), 'utf8').toString('base64')
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { token, owner, repo, branch, filePath } = getConfig()

  if (!token) {
    res.status(500).json({ error: 'Missing GITHUB_TOKEN on server' })
    return
  }

  const apiUrl = makeApiUrl(owner, repo, filePath)
  const commonHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  try {
    if (req.method === 'GET') {
      const fileInfo = await githubRequest(`${apiUrl}?ref=${encodeURIComponent(branch)}`, {
        method: 'GET',
        headers: commonHeaders,
      })

      const data = decodeBase64Json(fileInfo.content)
      res.status(200).json(data)
      return
    }

    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      if (!body || typeof body !== 'object') {
        res.status(400).json({ error: 'Invalid JSON body' })
        return
      }

      const fileInfo = await githubRequest(`${apiUrl}?ref=${encodeURIComponent(branch)}`, {
        method: 'GET',
        headers: commonHeaders,
      })

      const updatePayload = {
        message: `Update tournament data (${new Date().toISOString()})`,
        content: encodeBase64Json(body),
        sha: fileInfo.sha,
        branch,
      }

      const result = await githubRequest(apiUrl, {
        method: 'PUT',
        headers: {
          ...commonHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      })

      res.status(200).json({ ok: true, commit: result.commit?.sha || null })
      return
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unexpected server error' })
  }
}
