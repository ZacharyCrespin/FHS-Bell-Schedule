const fs = require('fs');
const getOrdinalSuffix = require('lissa-ordinal-suffix');

module.exports = async function() {
  // Get date
  let date = new Date();

  // Create the short date (mainly for comparisons)
  shortDate = date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  shortDate = shortDate.split(",")[0]; // we don't care about the time
  console.log("🚀 ~ file: main.js:9 ~ shortDate:", shortDate)

  // Create the date string used on the homepage
  const options = {
    timeZone: 'America/Los_Angeles',
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  };
  let todayDateString = date.toLocaleDateString('en-US', options);
  todayDateString = todayDateString.replace(/(\d{1,2})/, getOrdinalSuffix(date.getDate()));
  console.log("🚀 ~ file: main.js:23 ~ todayDateString:", todayDateString)

  // load files 
  let dates
  fs.readFile('src/_data/dates.json', 'utf8', (err, data) => {
    dates = data
  });

  let events
  fs.readFile('src/_data/events.json', 'utf8', (err, data) => {
    events = data
  });

  let schedules
  fs.readFile('src/_data/schedules.json', 'utf8', (err, data) => {
    schedules = data
  });

  // Get Games
  const startDate = new Date;
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);
  const gamesURL = "https://www.cifsshome.org/widget/calendar?school_id=175&ajax=1&start=" + startDate.toISOString() + "&end=" + endDate.toISOString() + "&timeZone=UTC";

  let todayGames = []
  let upcomingGames = []

  await fetch(gamesURL)
  .then(res => res.json())
  .then(res => {
    const games = res
    games.forEach(game => {
      if (game.date = shortDate) {
        todayGames.push(game);
      }
      upcomingGames.push(game);
    });
  })

  return {
    date: {
      short: shortDate,
      string: todayDateString
    },
    games: todayGames,
    upcoming: {
      games: upcomingGames
    },
  }
}
