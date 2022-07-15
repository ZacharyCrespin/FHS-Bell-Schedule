let url = "api/today.json";

fetch(url)
    .then(response => {
        return response.json();
    })
    .then(response => {
        document.getElementById("scheduleName").innerHTML = response.schedule.name;
        document.getElementById("date").innerHTML = response.date;
        document.getElementById("schedule").innerHTML = response.schedule.html
        if (response.games.length > 0) {
            response.games.forEach(element => {
                var tag = document.createElement("p");
                var text = document.createTextNode(element);
                tag.appendChild(text);
                var element = document.getElementById("games");
                element.appendChild(tag);
            });
        } else {
            document.getElementById("games").innerHTML = "None"
        }
        if (response.events.length > 0) {
            response.events.forEach(element => {
                var tag = document.createElement("p");
                var text = document.createTextNode(element.Event);
                tag.appendChild(text);
                var element = document.getElementById("events");
                element.appendChild(tag);
            });
        } else {
            document.getElementById("events").innerHTML = "None"
        }
    })