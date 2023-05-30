const fs = require('fs');
const { DateTime } = require('luxon');
const getOrdinalSuffix = require('lissa-ordinal-suffix');
const axios = require('axios');
var parser = require('vdata-parser');

function singleDateSearch(list, date) {
  low = 0
  high = list.length - 1

  while (low <= high) {
    mid = (low + high) // 2
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

module.exports = async function() {
  // load files 
  const schedules = JSON.parse(
    fs.readFileSync('src/_data/schedules.json', 'utf-8')
  );

  const dates = JSON.parse(
    fs.readFileSync('src/_data/dates.json', 'utf-8')
  );

  const events = JSON.parse(
    fs.readFileSync('src/_data/events.json', 'utf-8')
  );

  // get date (in pacific time)
  const date = DateTime.now().setZone('America/Los_Angeles');

  // short string (used for comparisons)
  const shortDate = date.toFormat('MM/dd/yyyy');

  // day of the week
  const day = date.toFormat('cccc');

  // date string: day of the week, month, day of the month (with ordinal suffix)
  const dateString = `${day}, ${date.toFormat('MMMM')} ${getOrdinalSuffix(date.toFormat('d'))}`;

  console.log(`${dateString} (${shortDate})`)

  // Get the schedule
  // Set the default to "regular"
  let scheduleID = 'regular';

  // Check for a day-specific schedule
  if (day === 'Saturday' || day === 'Sunday') {
    scheduleID = 'weekend';
  }
  if (day === 'Wednesday') {
    scheduleID = 'latestart';
  }

  // search for a custom schedule
  const customSchedule = singleDateSearch(dates, shortDate)

  // if there is a custom schedule set it
  if (customSchedule != -1) {
    scheduleID = dates[customSchedule].schedule
  }

  console.log(`Schedule: ${schedules[scheduleID].name} (${scheduleID})`)

  // Get Games
  const startDate = new Date;
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30); // 30 days from now

  const gamesURL = `https://www.cifsshome.org/widget/calendar?school_id=175&ajax=1&start=${startDate.toISOString()}&end=${endDate.toISOString()}&timeZone=UTC`;

  let todayGames = []
  let upcomingGames = []

  await fetch(gamesURL)
  .then(res => res.json())
  .then(res => {
    const games = res
    games.forEach(game => {
      if (game.date == shortDate) {
        todayGames.push(game);
      }
      upcomingGames.push(game);
    });
  })
  console.log(`${upcomingGames.length} Upcoming Games, ${todayGames.length} Today`)

  // Get Events
  const eventsURL = "https://tustink12caus-2777-us-west1-01.preview.finalsitecdn.com/cf_calendar/feed.cfm?type=ical&feedID=0E73C038C4364952B1D6D90F8D1BCAF1"

  let todayEvents = []
  let upcomingEvents = []

  // Format iCal Dates
  function formatCalDate(date) {
    const year = date.value.slice(0, 4);
    const month = date.value.slice(4, 6);
    const day = date.value.slice(6, 8);
    // mm/dd/yyyy
    return `${month}/${day}/${year}`;
  }

  // Get TUSD Calandar
  await axios.get(eventsURL)
  .then(response => {
    let tusdEvents = response.data;
    // Convert to object
    tusdEvents = parser.fromString(tusdEvents);
    tusdEvents = tusdEvents.VCALENDAR.VEVENT
    // Filter out events without valid dates
    .filter(event => event.DTSTART && event.DTSTART.value)
    // Format iCal events
    .map(event => ({
      date: formatCalDate(event.DTSTART),
      event: event.SUMMARY
    }))
    // Combine tusd events and local json events
    let allEvents = tusdEvents.concat(events);
    // Make sure dates are sorted
    allEvents = allEvents.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
    allEvents.forEach(event => {
      // Convert the event date string to a Date object
      const eventDate = new Date(event.date);
      // Calculate the time difference in milliseconds
      const timeDifference = eventDate.getTime() - date.valueOf();
      // Convert milliseconds to days
      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
      // Events in the next 30 days
      if (daysDifference > -1 && daysDifference < 30) {
        upcomingEvents.push(event)
      }
      // Todays events
      if (event.date == shortDate) {
        todayEvents.push(event);
      }
    });
  })
  .catch(error => {
    console.error('Error fetching iCal file:', error);
  });

  console.log(`${upcomingEvents.length} Upcoming Events, ${todayEvents.length} Today`)

  return {
    date: {
      date,
      short: shortDate,
      string: dateString
    },
    schedule: {
      id: scheduleID,
      name: schedules[scheduleID].name,
      html: schedules[scheduleID].html
    },
    games: todayGames,
    events: todayEvents,
    upcoming: {
      games: upcomingGames,
      events: upcomingEvents
    },
  }
}
