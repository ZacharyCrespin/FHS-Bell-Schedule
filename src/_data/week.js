const { DateTime } = require('luxon')
const { getDate, getSchedule } = require('../../get')

async function getWeekDates() {
  const today = DateTime.now().setZone('America/Los_Angeles')
  const startOfWeek = today.startOf('week')
  const endOfWeek = today.endOf('week')
  let dates = []
  let day = startOfWeek;
  while (day <= endOfWeek) {
    if (day.weekday >= 1 && day.weekday <= 5) {
      dates.push(day.toFormat('MM/dd/yyyy'));
    }
    day = day.plus({ days: 1 });
  }
  return dates;
}

module.exports = async function() {
  const dates = await getWeekDates()
  let allData = []
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const dateData = await getDate(date)
    const scheduleData = await getSchedule(date)
    const data = {
      date: dateData,
      schedule: scheduleData
    }
    allData.push(data)
  }
  return allData
}