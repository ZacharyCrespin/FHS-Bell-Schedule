import json
from datetime import datetime
import pytz
import jinja2
import arrow
import htmlmin
import platform

# Load all json data to variables
with open("public/api/dates.json", encoding="utf-8") as dates:
    dates = json.load(dates)
with open("public/api/games.json", encoding="utf-8") as games:
    games = json.load(games)
with open("public/api/events.json", encoding="utf-8") as events:
    events = json.load(events)
with open("public/api/schedules.json", encoding="utf-8") as schedules:
    schedules = json.load(schedules)

# use Pacific time even when using github actions
uspdatetime = datetime.now(pytz.timezone("US/Pacific"))

# Get todays date
if platform.system() == "Windows":
    today = uspdatetime.strftime("%#m/%#d/%Y") # for windows
else:
    today = uspdatetime.strftime("%-m/%-d/%Y") # for linux
print(today)

# Get day of the week
daysOfTheWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
day = daysOfTheWeek[uspdatetime.weekday()]

# day of the week, month, day of the month
dateString = day + ", " + uspdatetime.strftime("%B") + " " + arrow.get(uspdatetime).format("Do")
print(dateString)

if day == "Saturday":
    todayScheduleID = "weekend"

if day == "Sunday":
    todayScheduleID = "weekend"

if day == "Wednesday":
    todayScheduleID = "latestart"

# Cheak for a custom schedule
for Date in dates:
    if Date["Date"] == today:
        todayScheduleID = Date["Schedule"]

# if nothing was found use Regular Schedule
try: todayScheduleID
except NameError: todayScheduleID = "regular"

# get the rest of the data using the id
todayScheduleName = schedules[todayScheduleID]["name"]
todayScheduleHTML = schedules[todayScheduleID]["html"]
print("schedule:",todayScheduleName,"("+todayScheduleID+")")

generator = "Python " + platform.python_version()

# events
todayEvents = []
upcomingEvents = []
for Event in events:
    a = datetime.strptime(Event["Date"], "%m/%d/%Y")
    b = datetime.strptime(today, "%m/%d/%Y")
    delta = a - b
    daysFromToday = delta.days

    if daysFromToday == 0:
        todayEvents.append(Event)

    if daysFromToday < 30:
        if daysFromToday > -1:
            upcomingEvents.append(Event)
print(len(events),"events,",len(upcomingEvents),"upcoming,",len(todayEvents),"today")

# games
todayGames = []
upcomingGames = []
for Game in games:
    a = datetime.strptime(Game["Date"], "%m/%d/%Y")
    b = datetime.strptime(today, "%m/%d/%Y")
    delta = a - b
    daysFromToday = delta.days

    if daysFromToday == 0:
        todayGames.append(Game)

    if daysFromToday < 30:
        if daysFromToday > -1:
            upcomingGames.append(Game)
print(len(games),"games,",len(upcomingGames),"upcoming,",len(todayGames),"today")

# Write today.json
dictionary = {
    "date": today,
    "schedule": {
        "id": todayScheduleID,
        "name": todayScheduleName,
        "html": todayScheduleHTML
    },
    "games": todayGames,
    "events": todayEvents
}
with open("public/api/today.json", "w", encoding="utf-8") as outfile:
    json.dump(dictionary, outfile)

# Write index.html
outputfile = "public/index.html"
subs = jinja2.Environment(
    loader=jinja2.FileSystemLoader("./")
).get_template("src/index.html").render(today=dateString, scheduleName=todayScheduleName, scheduleHTML=todayScheduleHTML, games=todayGames, gamesToday=len(todayGames), events=todayEvents, eventsToday=len(todayEvents), generator=generator)
with open(outputfile, "w", encoding="utf-8") as f:
    f.write(htmlmin.minify(subs, remove_empty_space=True))

# Write upcoming.json
dictionary = {
    "games": upcomingGames,
    "events": upcomingEvents
}
with open("public/api/upcoming.json", "w", encoding="utf-8") as outfile:
    json.dump(dictionary, outfile)

# Write events.html
outputfile = "public/events.html"
subs = jinja2.Environment(
    loader=jinja2.FileSystemLoader("./")
).get_template("src/events.html").render(events=upcomingEvents, generator=generator)
with open(outputfile, "w", encoding="utf-8") as f:
    f.write(htmlmin.minify(subs, remove_empty_space=True))

# Write games.html
outputfile = "public/games.html"
subs = jinja2.Environment(
    loader=jinja2.FileSystemLoader("./")
).get_template("src/games.html").render(games=upcomingGames, generator=generator)
with open(outputfile, "w", encoding="utf-8") as f:
    f.write(htmlmin.minify(subs, remove_empty_space=True))
