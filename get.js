const fs = require('fs')
const { DateTime } = require('luxon')
const getOrdinalSuffix = require('lissa-ordinal-suffix')
const axios = require('axios')
var parser = require('vdata-parser')

// Load files 
const schedules = JSON.parse(
  fs.readFileSync('src/_data/schedules.json', 'utf-8')
)
const dates = JSON.parse(
  fs.readFileSync('src/_data/dates.json', 'utf-8')
)
const localEvents = JSON.parse(
  fs.readFileSync('src/_data/localEvents.json', 'utf-8')
)

// Global Helper Functions
// Binary date search
function singleDateSearch(list, date) {
  low = 0
  high = list.length - 1

  while (low <= high) {
    mid = (low + high)
    mid_date = list[mid].date

    if (mid_date == date) {
      return mid
    }
    else if (mid_date < date) {
      low = mid + 1
    }
    else {
      high = mid - 1
    }
  }
  return -1
}

// Format iCal Dates
function formatCalDate(date) {
  const year = date.value.slice(0, 4);
  const month = date.value.slice(4, 6);
  const day = date.value.slice(6, 8);
  return `${month}/${day}/${year}`;
}

// Is a date summer
function isSummer(dateStr) {
  const date = DateTime.fromFormat(dateStr, 'MM/dd/yyyy');
  const start = DateTime.fromObject({ year: 2023, month: 6, day: 2 });
  const end = DateTime.fromObject({ year: 2023, month: 8, day: 16 });

  return date > start && date < end;
}

// Convert a MM/dd/yyyy date string to multiple formats
async function getDate(dateStr) {
  // get date obj
  const date = DateTime.fromFormat(dateStr, 'MM/dd/yyyy')

  // short string (used for comparisons)
  const shortDate = date.toFormat('MM/dd/yyyy')

  // day of the week
  const day = date.toFormat('cccc')

  // date string: day of the week, month, day of the month (with ordinal suffix)
  const dateString = `${day}, ${date.toFormat('MMMM')} ${getOrdinalSuffix(date.toFormat('d'))}`

  return {
    date,
    iso: date.toISODate(),
    shortDate,
    day,
    dateString
  }
}

// Get schedule for a date
async function getSchedule(dateStr) {
  const date = await getDate(dateStr)

  // Set the default to "regular"
  let id = 'regular'

  // Check for a day-specific schedule
  if (date.day === 'Saturday' || date.day === 'Sunday') {
    id = 'weekend'
  }
  if (date.day === 'Wednesday') {
    id = 'latestart'
  }

  // search for a custom schedule
  const customSchedule = singleDateSearch(dates, date.shortDate)

  // if there is a custom schedule set it
  if (customSchedule != -1) {
    id = dates[customSchedule].schedule
  }

  if (isSummer(dateStr)) {
    id = 'summer'
  }

  return {
    id: id,
    name: schedules[id].name,
    html: schedules[id].html,
  }
}

// Get games for a date
async function getGames(dateStr) {
  const date = await getDate(dateStr)

  const startDate = date.date.toISODate()
  const endDate = DateTime.fromISO(startDate).plus({ days: 30 }).toISODate()
  const gamesURL = `https://www.cifsshome.org/widget/calendar?school_id=175&ajax=1&start=${startDate}&end=${endDate}&timeZone=UTC`

  let today = []
  let upcoming = []

  try {
    const response = await axios.get(gamesURL);
    const games = response.data;

    games.forEach(game => {
      if (game.date === date.shortDate) {
        today.push(game)
      }
      upcoming.push(game)
    });
  } catch (error) {
    console.error('Error fetching games:', error);
  }

  return {
    today,
    upcoming,
  }
}

// Get events for a date
async function getEvents(dateStr) {
  const date = await getDate(dateStr)
  const eventsURL = "https://tustink12caus-2777-us-west1-01.preview.finalsitecdn.com/cf_calendar/feed.cfm?type=ical&feedID=0E73C038C4364952B1D6D90F8D1BCAF1"

  let today = []
  let upcoming = []

  // TODO: I can't even read my own code
  // Get TUSD Calandar
  try {
    const response = await axios.get(eventsURL);
    let tusdEvents = response.data
    // Convert to js object
    tusdEvents = parser.fromString(tusdEvents)
    tusdEvents = tusdEvents.VCALENDAR.VEVENT

    // Filter out events without valid dates
    .filter(event => event.DTSTART && event.DTSTART.value)

    // Format iCal events
    .map(event => ({
      date: formatCalDate(event.DTSTART),
      event: event.SUMMARY
    }))

    // Combine tusd events and local json events
    let allEvents = tusdEvents.concat(localEvents)
    // Make sure dates are sorted
    allEvents = allEvents.sort((a, b) => {
      const dateA = DateTime.fromFormat(a.date, 'MM/dd/yyyy');
      const dateB = DateTime.fromFormat(b.date, 'MM/dd/yyyy');
      return dateA.toMillis() - dateB.toMillis();
    });
    allEvents.forEach(event => {
      // Convert the event date string to a Date object
      const eventDate = DateTime.fromFormat(event.date, 'MM/dd/yyyy')

      // Calculate the time difference in milliseconds
      const timeDifference = eventDate.diff(date.date).as('milliseconds')
      // Convert milliseconds to days
      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24))
      // Events in the next 30 days
      if (daysDifference > -1 && daysDifference < 30) {
        upcoming.push(event)
      }
      // Todays events
      if (event.date === date.shortDate) {
        today.push(event)
      }
    })
  } catch (error) {
    console.error('Error fetching iCal file:', error);
  }

  return {
    today,
    upcoming,
  }
}

async function summary() {
  const dateStr = DateTime.now().setZone('America/Los_Angeles').toFormat('MM/dd/yyyy')

  const date = await getDate(dateStr)
  console.log(`${date.dateString} (${date.shortDate})`)
  // Get the schedule
  const schedule = await getSchedule(dateStr)
  console.log(`Schedule: ${schedule.name} (${schedule.id})`)
  // Get Games
  const games = await getGames(dateStr)
  console.log(`${games.upcoming.length} Upcoming Games, ${games.today.length} Today`)
  // Get Events
  const events = await getEvents(dateStr)
  console.log(`${events.upcoming.length} Upcoming Events, ${events.today.length} Today`)
}
summary()

module.exports = {
  getDate,
  getSchedule,
  getGames,
  getEvents,
}
