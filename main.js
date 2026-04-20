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
  const logEl = document.getElementById('incident-log')

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

  if (state.incidents.length > 0) {
    const recentIncidents = state.incidents.slice(-5).reverse()
    logEl.innerHTML = `
      <h3>Recent Incident Log</h3>
      ${recentIncidents
        .map(
          (inc) => `
        <div class="incident-entry">
          <span class="date">${new Date(inc.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}</span>
          ${inc.note ? ` &mdash; ${inc.note}` : ''}
          ${inc.streak > 0 ? ` <span style="color:#666">(ended ${inc.streak}-day streak)</span>` : ''}
        </div>
      `
        )
        .join('')}
    `
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
