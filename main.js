const STORAGE_KEY = 'days-since-itav'

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  return JSON.parse(raw)
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function getDefaultState() {
  return {
    lastIncidentDate: new Date().toISOString(),
    record: 0,
    totalIncidents: 0,
    incidents: [],
  }
}

function daysSince(dateStr) {
  const now = new Date()
  const then = new Date(dateStr)
  const diffMs = now - then
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

function getCounterClass(days) {
  if (days === 0) return 'danger'
  if (days <= 2) return 'warning'
  if (days >= 14) return 'great'
  return 'good'
}

function render(state) {
  const days = daysSince(state.lastIncidentDate)
  const counterEl = document.getElementById('counter')
  const recordEl = document.getElementById('record')
  const incidentsEl = document.getElementById('incidents')
  const lastIncidentEl = document.getElementById('last-incident')
  const sidebarListEl = document.getElementById('sidebar-list')
  const sidebarCountEl = document.getElementById('sidebar-count')

  counterEl.textContent = days
  counterEl.className = `counter ${getCounterClass(days)}`

  const currentRecord = Math.max(state.record, days)
  recordEl.textContent = currentRecord
  incidentsEl.textContent = state.totalIncidents

  if (state.totalIncidents > 0) {
    const date = new Date(state.lastIncidentDate)
    lastIncidentEl.textContent = `Last incident: ${date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`
  } else {
    lastIncidentEl.textContent = 'No incidents recorded yet. Enjoy the peace.'
  }

  // Render sidebar
  sidebarCountEl.textContent = `${state.incidents.length} issue${state.incidents.length !== 1 ? 's' : ''}`

  if (state.incidents.length > 0) {
    const allIncidents = [...state.incidents].reverse()
    sidebarListEl.innerHTML = allIncidents
      .map((inc, i) => {
        const num = state.incidents.length - i
        const date = new Date(inc.date)
        return `
          <div class="sidebar-entry">
            <div class="entry-number">INCIDENT #${num}</div>
            <div class="entry-date">${date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}</div>
            <div class="entry-time">${date.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}</div>
            ${inc.note ? `<div class="entry-note">${inc.note}</div>` : ''}
            ${inc.streak > 0 ? `<div class="entry-streak">Ended a ${inc.streak}-day streak</div>` : ''}
          </div>
        `
      })
      .join('')
  } else {
    sidebarListEl.innerHTML = '<div class="sidebar-empty">No incidents yet. Fingers crossed.</div>'
  }
}

function reportIncident(state) {
  const currentDays = daysSince(state.lastIncidentDate)

  const note = prompt('What happened? (optional)')

  state.record = Math.max(state.record, currentDays)
  state.totalIncidents++
  state.incidents.push({
    date: new Date().toISOString(),
    streak: currentDays,
    note: note || '',
  })
  state.lastIncidentDate = new Date().toISOString()

  saveState(state)

  const signInner = document.querySelector('.sign-inner')
  const counterEl = document.getElementById('counter')

  signInner.classList.add('flash')
  counterEl.classList.add('shake')

  setTimeout(() => {
    signInner.classList.remove('flash')
    counterEl.classList.remove('shake')
  }, 1000)

  render(state)
}

// Init
let state = loadState()
if (!state) {
  state = getDefaultState()
  saveState(state)
}

render(state)

document.getElementById('reset-btn').addEventListener('click', () => {
  reportIncident(state)
})

// Update counter at midnight
setInterval(() => render(state), 60000)
