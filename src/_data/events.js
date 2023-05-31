const { DateTime } = require('luxon')
const { getEvents } = require('../../get')

const dateStr = DateTime.now().setZone('America/Los_Angeles').toFormat('MM/dd/yyyy')

module.exports = async function() {
  const events = await getEvents(dateStr)

  return {
    today: events.today,
    upcoming: events.upcoming,
  }
}
