function formatTime(time) {
  // Convert time to lowercase, remove spaces, and remove preceding 0
  return time.toLowerCase().replace(/\s/g, '').replace(/^0+/, '');
}

function formatRange(rangeStr) {
  const [startTime, endTime] = rangeStr.split('-');
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

function formatTimeString(inputStr) {
  if (inputStr.includes('-')) {
    return formatRange(inputStr);
  } else {
    return formatTime(inputStr);
  }
}

module.exports = {
  formatTimeString,
}
