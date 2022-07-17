import json
from datetime import date
import jinja2

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

# Get day of the week
daysOfTheWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
day = daysOfTheWeek[date.today().weekday()]

# Cheak for custom schedule
for Date in dates:
    if Date["Date"] == today:
        print("Custom Schedule Found")
        todayScheduleID = "custom"
        todayScheduleName = Date["Schedule"]["name"]
        todayScheduleHTML = Date["Schedule"]["html"]
    else:
        print("No Custom Schedule Found")
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

# games
todayGames = []
upcommingGames = []
for Game in games:
    from datetime import datetime
    a = datetime.strptime(Game["Date"], "%m/%d/%Y")
    b = datetime.strptime(today, "%m/%d/%Y")
    delta = a - b
    daysFromToday = delta.days

    if daysFromToday == 0:
        todayGames.append(Game)

    if daysFromToday < 30:
        if daysFromToday > 0:
            upcommingGames.append(Game)
            # print (daysFromToday)

# events
todayEvents = []
upcommingEvents = []
for Event in events:
    from datetime import datetime
    a = datetime.strptime(Event["Date"], "%m/%d/%Y")
    b = datetime.strptime(today, "%m/%d/%Y")
    delta = a - b
    daysFromToday = delta.days

    if daysFromToday == 0:
        todayEvents.append(Event)

    if daysFromToday < 30:
        if daysFromToday > 0:
            upcommingEvents.append(Event)
            # print (daysFromToday)

# Write today.json
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

# Write index.html
outputfile = 'public/index.html'
subs = jinja2.Environment(
    loader=jinja2.FileSystemLoader('./')
).get_template('src/index.html').render(date=today, scheduleName=todayScheduleName, scheduleHTML=todayScheduleHTML, games=todayGames, events=todayEvents)
# lets write the substitution to a file
with open(outputfile, 'w') as f:
    f.write(subs)

# Write games.html
outputfile = 'public/games.html'
subs = jinja2.Environment(
    loader=jinja2.FileSystemLoader('./')
).get_template('src/games.html').render(games=upcommingGames)
# lets write the substitution to a file
with open(outputfile, 'w') as f:
    f.write(subs)

# Write events.html
outputfile = 'public/events.html'
subs = jinja2.Environment(
    loader=jinja2.FileSystemLoader('./')
).get_template('src/events.html').render(events=upcommingEvents)
# lets write the substitution to a file
with open(outputfile, 'w') as f:
    f.write(subs)
