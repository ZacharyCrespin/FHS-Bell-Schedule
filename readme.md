# API
todays info: `/api/today.json`

all games: `/api/games.json` or `/api/games.csv`

all events: `/api/events.json` or `/api/events.csv`

all schedules: `/api/schedules.json`

```js
fetch("/api/today.json")
    .then(response => {
        return response.json();
    })
    .then(response => {
        console.log(response)
    })
```