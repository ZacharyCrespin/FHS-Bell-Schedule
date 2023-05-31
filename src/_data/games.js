const { DateTime } = require('luxon')
const { getGames } = require('../../get')

const dateStr = DateTime.now().setZone('America/Los_Angeles').toFormat('MM/dd/yyyy')

module.exports = async function() {
  const games = await getGames(dateStr)

  return {
    today: games.today,
    upcoming: games.upcoming,
  }
}
