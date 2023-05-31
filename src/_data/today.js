const { DateTime } = require('luxon')
const { getDate, getSchedule } = require('../../get')

const dateStr = DateTime.now().setZone('America/Los_Angeles').toFormat('MM/dd/yyyy')

module.exports = async function() {
  const date = await getDate(dateStr)

  const schedule = await getSchedule(dateStr)

  return {
    date,
    schedule,
  }
}
