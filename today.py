import json
import urllib.request
from datetime import datetime, date, timedelta
import platform
import htmlmin
import pytz
import jinja2
import arrow

# Load all json data to variables
with open("public/api/dates.json", encoding="utf-8") as dates:
    dates = json.load(dates)
games = urllib.request.urlopen("https://www.cifsshome.org/widget/calendar?school_id=175&ajax=1&start=" + str(date.today()) + "T00%3A00%3A00Z&end=" + str(date.today()+timedelta(30)) + "T00%3A00%3A00Z&timeZone=UTC").read()
games = json.loads(games)
with open("public/api/events.json", encoding="utf-8") as events:
    events = json.load(events)
with open("public/api/schedules.json", encoding="utf-8") as schedules:
    schedules = json.load(schedules)

# use Pacific time even when using github actions
now = datetime.now(pytz.timezone("US/Pacific"))

# Get todays date
if platform.system() == "Windows":
    today = now.strftime("%#m/%#d/%Y") # for windows
else:
    today = now.strftime("%-m/%-d/%Y") # for linux
print(today)

# Get day of the week
daysOfTheWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
day = daysOfTheWeek[now.weekday()]

# day of the week, month, day of the month
dateString = f"{day}, {now.strftime('%B')} {arrow.get(now).format('Do')}"
print(dateString)

# set the default to "regular"
  # if nothing else is found it will remain
todayScheduleID = "regular"

# see if there is a day spacific schedule
if day == "Saturday":
    todayScheduleID = "weekend"
if day == "Sunday":
    todayScheduleID = "weekend"
if day == "Wednesday":
    todayScheduleID = "latestart"

# Cheak for a custom schedule
for Date in dates:
    if Date["date"] == today:
        todayScheduleID = Date["schedule"]

# get the rest of the data using the id
todayScheduleName = schedules[todayScheduleID]["name"]
todayScheduleHTML = schedules[todayScheduleID]["html"]
print(f"schedule: {todayScheduleName} ({todayScheduleID})")

# events
todayEvents = []
upcomingEvents = []
for event in events:
    a = datetime.strptime(event["date"], "%m/%d/%Y")
    b = datetime.strptime(today, "%m/%d/%Y")
    delta = a - b
    daysFromToday = delta.days

    if daysFromToday == 0:
        todayEvents.append(event)

    if daysFromToday < 30:
        if daysFromToday > -1:
            upcomingEvents.append(event)
print(len(events),"events,",len(upcomingEvents),"upcoming,",len(todayEvents),"today")

# games
todayGames = []
upcomingGames = []
for game in games:
    a = datetime.strptime(game["date"], "%m/%d/%Y")
    b = datetime.strptime(today, "%m/%d/%Y")
    delta = a - b
    daysFromToday = delta.days

    if daysFromToday == 0:
        todayGames.append(game)

    if daysFromToday < 30:
        if daysFromToday > -1:
            upcomingGames.append(game)
print(len(games),"games,",len(upcomingGames),"upcoming,",len(todayGames),"today")

# Write today.json
dictionary = {
    "date": today,
    "dateString": dateString,
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
subs = jinja2.Environment(
    loader=jinja2.FileSystemLoader("./")
).get_template("src/index.html").render(
    today=dateString,
    scheduleName=todayScheduleName,
    scheduleHTML=todayScheduleHTML,
    games=todayGames,
    events=todayEvents
)
with open("public/index.html", "w", encoding="utf-8") as f:
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
).get_template("src/events.html").render(events=upcomingEvents)
with open(outputfile, "w", encoding="utf-8") as f:
    f.write(htmlmin.minify(subs, remove_empty_space=True))

# Write games.html
outputfile = "public/games.html"
subs = jinja2.Environment(
    loader=jinja2.FileSystemLoader("./")
).get_template("src/games.html").render(games=upcomingGames)
with open(outputfile, "w", encoding="utf-8") as f:
    f.write(htmlmin.minify(subs, remove_empty_space=True))
