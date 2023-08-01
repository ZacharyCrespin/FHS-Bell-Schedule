const fs = require('fs')
const { DateTime } = require('luxon')
const getOrdinalSuffix = require('lissa-ordinal-suffix')
const axios = require('axios')
var parser = require('vdata-parser')
const { formatEvents, formatGames} = require('./format')

// Load Files
const schedules = JSON.parse(fs.readFileSync('schedules.json', 'utf-8'))
const dates = JSON.parse(fs.readFileSync('dates.json', 'utf-8'))
const localEvents = JSON.parse(fs.readFileSync('events.json', 'utf-8'))

// Helper Functions
// Binary date search
function singleDateSearch(list, date) {
  date = DateTime.fromFormat(date, 'MM/dd/yyyy')

  let low = 0
  let high = list.length - 1

  while (low <= high) {
    let mid = Math.floor((low + high) / 2)
    let midDate = DateTime.fromFormat(list[mid].date, 'MM/dd/yyyy')

    if (midDate.equals(date)) {
      return mid
    } else if (midDate < date) {
      low = mid + 1
    } else {
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

// Is a date summer(2023)?
function isSummer(dateStr) {
  const date = DateTime.fromFormat(dateStr, 'MM/dd/yyyy');
  const start = DateTime.fromObject({ year: 2023, month: 6, day: 2 });
  const end = DateTime.fromObject({ year: 2023, month: 8, day: 16 });

  return date > start && date < end;
}

// Main Get Functions
// Convert a MM/dd/yyyy date string to multiple formats
async function getDate(dateStr) {
  // get date obj
  const date = DateTime.fromFormat(dateStr, 'MM/dd/yyyy')

  // short string (used for comparisons)
  const short = date.toFormat('MM/dd/yyyy')

  // day of the week
  const day = date.toFormat('cccc')

  // date string: day of the week, month, day of the month (with ordinal suffix)
  const string = `${day}, ${date.toFormat('MMMM')} ${getOrdinalSuffix(date.toFormat('d'))}`

  return {
    date,
    day,
    short,
    string
  }
}

// Get schedule for a date
async function getSchedule(dateStr) {
  const date = await getDate(dateStr)

  // Set the default to 'regular'
  let id = 'regular'

  // Check for a day-specific schedule
  if (date.day === 'Saturday' || date.day === 'Sunday') {
    id = 'weekend'
  }
  if (date.day === 'Wednesday') {
    id = 'latestart'
  }

  // Cheak if it's summer
  if (isSummer(dateStr)) {
    id = 'summer'
  }

  // Search for a custom schedule
  const custom = singleDateSearch(dates, date.short)

  // If there's a custom schedule set it
  if (custom != -1) {
    id = dates[custom].schedule
  }

  return {
    id: id,
    name: schedules[id].name,
    html: schedules[id].html,
  }
}

// Get games for a date
async function getGames(dateStr, includeUpcoming = true, format) {
  const date = await getDate(dateStr)

  const start = date.date.toISODate()
  let end = DateTime.fromISO(start).plus({ days: 30 }).toISODate()
  if (!includeUpcoming) {
    end = DateTime.fromISO(start).plus({ days: 1 }).toISODate()
  }
  const gamesURL = `https://www.cifsshome.org/widget/calendar?school_id=175&ajax=1&start=${start}&end=${end}&timeZone=UTC`

  let today = []
  let upcoming = []

  try {
    const response = await axios.get(gamesURL);
    const games = response.data;

    games.forEach(game => {
      // Make sure it's actually a game
      if (game.event_type === 'Game') {
        if (game.date === date.short) {
          today.push(game)
        }
        if (includeUpcoming) {
          upcoming.push(game)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching games:', error);
  }

  if (format) {
    today = formatGames(today, format)
    upcoming = formatGames(upcoming, format)
  }

  return {
    today,
    upcoming,
  }
}

// Get events for a date
async function getEvents(dateStr, includeUpcoming = true, format) {
  const date = await getDate(dateStr)
  const eventsURL = "https://tustink12caus-2777-us-west1-01.preview.finalsitecdn.com/cf_calendar/feed.cfm?type=ical&feedID=0E73C038C4364952B1D6D90F8D1BCAF1"

  let today = []
  let upcoming = []

  // Get TUSD calandar events
  try {
    const response = await axios.get(eventsURL);
    let tusdEvents = response.data
    // Convert to iCal to js object
    tusdEvents = parser.fromString(tusdEvents)
    // Get only the event list 
    tusdEvents = tusdEvents.VCALENDAR.VEVENT

    // Filter out events without valid dates
    .filter(event => event.DTSTART && event.DTSTART.value)

    // Format iCal events to match local events
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

    // Add events to appropriate lists 
    allEvents.forEach(event => {
      // Convert the event date string to a Date object
      const eventDate = DateTime.fromFormat(event.date, 'MM/dd/yyyy')
      // Calculate the time difference in milliseconds
      const timeDifference = eventDate.diff(date.date).as('milliseconds')
      // Convert milliseconds to days
      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24))
      // Events in the next 30 days
      if (includeUpcoming && daysDifference >= 0 && daysDifference < 30) {
        upcoming.push(event)
      }
      // Events today
      if (event.date === date.short) {
        today.push(event)
      }
    })
  } catch (error) {
    console.error('Error Getting Events:', error);
  }

  if (format) {
    today = formatEvents(today, format)
    upcoming = formatEvents(upcoming, format)
  }

  return {
    today,
    upcoming,
  }
}

module.exports = {
  getDate,
  getSchedule,
  getGames,
  getEvents,
}
