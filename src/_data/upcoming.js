const { DateTime } = require('luxon')
const { getSchedule } = require('../../get')

module.exports = async function() {
  let allData = []
  let i = 1
  while (i < 6) {
    let date = DateTime.now().plus({ days: i }).setZone('America/Los_Angeles')
    let dateStr = date.toFormat('MM/dd/yyyy')
    let day = date.toFormat('cccc')
    const scheduleData = await getSchedule(dateStr)
    const data = {
      day,
      schedule: scheduleData
    }
    allData.push(data)
    i++
  }
  return allData
}