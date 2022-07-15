import json
from datetime import date

# Load all json data to variables
with open('public/api/dates.json') as dates:
  dates = json.load(dates)
with open('public/api/games.json') as games:
  games = json.load(games)
with open('public/api/events.json') as events:
  events = json.load(events)
with open('public/api/schedules.json') as schedules:
  schedules = json.load(schedules)

# Get todays date
today = date.today().strftime("%#m/%#d/%Y")
print(today)

# GEt day of the week
daysOfTheWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
day = daysOfTheWeek[date.today().weekday()]
print(day)

# Cheak for custom schedule
for Date in dates:
  if Date["Date"] == today:
    print("Custom Schedule Found")
    todayScheduleID = "custom"
    todayScheduleName = Date["Schedule"]["name"]
    todayScheduleHTML = Date["Schedule"]["html"]
  else:
    print("Custom Not Schedule Found")
    # defalt
    todayScheduleID = "regular"

    if day == "Saturday":
      todayScheduleID = "weekend"

    if day == "Sunday":
      todayScheduleID = "weekend"

    if day == "Wednesday":
      todayScheduleID = "latestart"
    
    todayScheduleName = schedules[todayScheduleID]["name"]
    todayScheduleHTML = schedules[todayScheduleID]["html"]

# are there games today if so add it to the array
todayGames = []
for Game in games:
  if Game["Date"] == today:
    todayGames.append(Game)

# are there events today if so add it to the array
todayEvents = []
for Event in events:
  if Event["Date"] == today:
    todayEvents.append(Event)

# make the today file
dictionary = {
    "date": today,
    "schedule": {
        "name": todayScheduleName,
        "id": todayScheduleID,
        "html": todayScheduleHTML
    },
    "games": todayGames,
    "events": todayEvents
}
with open("public/api/today.json", "w") as outfile:
    json.dump(dictionary, outfile)