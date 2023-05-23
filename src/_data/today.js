const fs = require('fs');
const { DateTime, Interval } = require('luxon');
const getOrdinalSuffix = require('lissa-ordinal-suffix');
const axios = require('axios');
var parser = require('vdata-parser');
const { stringify } = require('querystring');

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

  // get date
  const date = DateTime.now().setZone('America/Los_Angeles');

  // short string (used for comparisons)
  const shortDate = date.toFormat('M/d/yyyy');

  // day of the week
  const day = date.toFormat('cccc')

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

  console.log(`schedule: ${scheduleID}`)

  // Get Games
  const startDate = new Date;
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30); // 30 days from now

  const gamesURL = "https://www.cifsshome.org/widget/calendar?school_id=175&ajax=1&start=" + startDate.toISOString() + "&end=" + endDate.toISOString() + "&timeZone=UTC";

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

  await axios.get(eventsURL)
  .then(response => {
    let iCalData = response.data;
    iCalData = parser.fromString(iCalData)
    const events = iCalData.VCALENDAR.VEVENT
    upcomingEvents = events
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
