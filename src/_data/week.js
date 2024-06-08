const { DateTime } = require('luxon')
const { getDate, getSchedule, getEvents, getGames } = require('../../get')

async function getWeekDates() {
  // const today = DateTime.now().setZone('America/Los_Angeles')
  const today = DateTime.fromFormat('05/31/2024', 'MM/dd/yyyy') // Shut down site

  let startOfWeek = today.startOf('week')
  let endOfWeek = today.endOf('week')

  // Make weeks start on Sunday
  if (today.weekday == 7) {
    startOfWeek = today.startOf('week').plus({ weeks: 1})
    endOfWeek = today.endOf('week').plus({ weeks: 1})
  }

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
    const eventData = await getEvents(date, false)
    const gameData = await getGames(date, false)

    const data = {
      date: dateData,
      schedule: scheduleData,
      events: eventData.today,
      games: gameData.today,
    }
    allData.push(data)
  }
  return allData
}