function updateClock(){
  var date = new Date();
  var h = date.getHours();
  var m = date.getMinutes();
  var s = date.getSeconds();
  var session = "AM";
  if(h == 0){
    h = 12;
  }
  if(h > 12){
    h = h - 12;
    session = "PM";
  }
  if(m < 10){
    m = "0" + m
  }
  if(s < 10){
    s = "0" + s
  }
  var time = h + ":" + m + ":" + s + " " + session;
  document.getElementById("clock").innerHTML = time;
  setTimeout(updateClock, 1000);
}
updateClock();