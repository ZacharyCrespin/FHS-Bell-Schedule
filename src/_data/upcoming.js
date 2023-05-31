const { DateTime } = require('luxon')
const { getDate, getSchedule } = require('../../get')

module.exports = async function() {
  let allData = []
  let i = 1
  while (i < 6) {
    let date = DateTime.now().plus({ days: i }).setZone('America/Los_Angeles')
    let dateStr = date.toFormat('MM/dd/yyyy')
    const dateData = await getDate(dateStr)
    const scheduleData = await getSchedule(dateStr)
    const data = {
      date: dateData,
      schedule: scheduleData
    }
    allData.push(data)
    i++
  }
  return allData
}