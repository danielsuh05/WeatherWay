let getDiffHourly = (time) => {
  const firstDate = new Date(Date.now());
  const diff = (time.getTime() - firstDate.getTime()) / 1000 / 60 / 60;

  return diff;
};

let getWeatherAtPointTime = ({ latitude, longitude }, time) => {
  console.log(latitude, longitude, time);
};

module.exports = {
  getWeatherAtPointTime,
  getDiffHourly,
};
