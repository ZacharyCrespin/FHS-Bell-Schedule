from asyncio.windows_events import NULL
import json
from datetime import datetime
import pytz
import jinja2
import arrow

# Load all json data to variables
with open('public/api/dates.json') as dates:
    dates = json.load(dates)
with open('public/api/games.json') as games:
    games = json.load(games)
with open('public/api/events.json') as events:
    events = json.load(events)
with open('public/api/schedules.json') as schedules:
    schedules = json.load(schedules)

# use Pacific time even when using github actions
uspdatetime = datetime.now(pytz.timezone('US/Pacific'))

# Get todays date
# today = uspdatetime.strftime("%-m/%-d/%Y") # for linux
today = uspdatetime.strftime("%#m/%#d/%Y") # for windows
print(today)

# Get day of the week
daysOfTheWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
day = daysOfTheWeek[uspdatetime.weekday()]

# day of the week, month, day of the month
dateString = day + " " + uspdatetime.strftime("%B") + " " + arrow.get(uspdatetime).format('Do')
print(dateString)

# Cheak for a custom schedule
for Date in dates:
    if Date["Date"] == today:
        if Date["Schedule"]["id"] == "custom":
            todayScheduleID = "custom"
            todayScheduleName = Date["Schedule"]["name"]
            todayScheduleHTML = Date["Schedule"]["html"]
        else:
            todayScheduleID = Date["Schedule"]["id"]
    else:
        if day == "Saturday":
            todayScheduleID = "weekend"

        if day == "Sunday":
            todayScheduleID = "weekend"

        if day == "Wednesday":
            todayScheduleID = "latestart"

        # If its summer overwrite
        a = datetime.strptime("8/16/2022", "%m/%d/%Y")
        b = datetime.strptime(today, "%m/%d/%Y")
        delta = a - b
        daysFromToday = delta.days
        if daysFromToday > 0:
            todayScheduleID = "summer"

        # if nothing was found use Regular Schedule
        try:
            todayScheduleID
        except NameError:
            todayScheduleID = "regular"

        # get the rest of the data using the id
        todayScheduleName = schedules[todayScheduleID]["name"]
        todayScheduleHTML = schedules[todayScheduleID]["html"]
print("schedule:",todayScheduleName,"(",todayScheduleID,")")

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
            # print (daysFromToday)
print(len(events),"events,",len(upcomingEvents),"upcoming,",len(todayEvents),"today")

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
).get_template('src/index.html').render(today=dateString, scheduleName=todayScheduleName, scheduleHTML=todayScheduleHTML, games=todayGames, events=todayEvents)
# lets write the substitution to a file
with open(outputfile, 'w') as f:
    f.write(subs)

# Write upcoming.json
dictionary = {
    "games": upcomingGames,
    "events": upcomingEvents
}
with open("public/api/upcoming.json", "w") as outfile:
    json.dump(dictionary, outfile)

# Write games.html
outputfile = 'public/games.html'
subs = jinja2.Environment(
    loader=jinja2.FileSystemLoader('./')
).get_template('src/games.html').render(games=upcomingGames)
# lets write the substitution to a file
with open(outputfile, 'w') as f:
    f.write(subs)

# Write events.html
outputfile = 'public/events.html'
subs = jinja2.Environment(
    loader=jinja2.FileSystemLoader('./')
).get_template('src/events.html').render(events=upcomingEvents)
# lets write the substitution to a file
with open(outputfile, 'w') as f:
    f.write(subs)
