const { DateTime } = require('luxon')
const { getDate, getSchedule, getEvents, getGames } = require('../../get')

// const dateStr = DateTime.now().setZone('America/Los_Angeles').plus({ days: 1 }).toFormat('MM/dd/yyyy')
const dateStr = '06/01/2024' // Shut down site

module.exports = async function() {
  const date = await getDate(dateStr)

  const schedule = await getSchedule(dateStr)

  const events = await getEvents(dateStr, false)
  const games = await getGames(dateStr, false)

  return {
    date,
    schedule,
    events,
    games,
  }
}
