const { DateTime } = require('luxon')
const { getDate, getSchedule, getEvents, getGames } = require('../../get')

// const dateStr = DateTime.now().setZone('America/Los_Angeles').toFormat('MM/dd/yyyy')
const dateStr = '05/31/2024' // Shut down site

module.exports = async function() {
  const date = await getDate(dateStr)

  const schedule = await getSchedule(dateStr)

  const events = await getEvents(dateStr)
  const games = await getGames(dateStr)

  return {
    date,
    schedule,
    events,
    games,
  }
}
