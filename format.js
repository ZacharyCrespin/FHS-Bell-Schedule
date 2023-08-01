const nunjucks = require('nunjucks')

// remove duplicates in an array
function removeDuplicates(arr) {
  return arr.filter((item,
    index) => arr.indexOf(item) === index);
}

const shortEvent = '{{ event["event"] }}{% if event["time"] %} · {{ event["time"] }}{% endif %}'
function formatEvents(data, format) {
  if (format == 'quick') {
    let result =  data.map(eventData => {
      return nunjucks.renderString(shortEvent, { event: eventData });
    });
    return removeDuplicates(result);
  } else {
    console.error(`'${format}' is not a valid format`)
    return
  }
}

const shortGame = '{{ game["sport"] }} {% if game["opponent_schools"] != "TBA" %} vs {{ game["opponent_schools"] }}{% endif %}{% if game["event_title"] %} · {{ game["event_title"] }}{% endif %}'
function formatGames(data, format) {
  if (format == 'quick') {
    let result = data.map(gameData => {
      return nunjucks.renderString(shortGame, { game: gameData }).replace('Football (11 person)', 'Football');
    });
    return removeDuplicates(result);
  } else {
    console.error(`'${format}' is not a valid format`)
    return
  }
}

module.exports = {
  formatEvents,
  formatGames,
}