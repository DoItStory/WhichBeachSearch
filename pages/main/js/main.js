import { fireStoreInitialize } from '../../../js/initialize.js';
import {
  getAuth,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';
import {
  showCircularProgress,
  hideCircularProgress,
} from '../../../js/circular-progress.js';
import { ERROR } from '../../../js/error.js';
import {
  getVilageFcstBeachToday,
  getFcstBeach,
  getTodayFcstBeach,
  getMidTiaFcst,
  getRiseSunsetInfo,
  getMidLandFcst,
} from './beachInfoService.js';
import { getBaechDataListArray } from './beachDataBase.js';
import {
  weatherInfoThatDay,
  weatherIconSrc,
  todayDateRequest,
  midTermWeatherIconSrc,
  beachCategoryValueFilter,
  gatherTodayWeather,
  gather3DaysWeatherData,
  landDataSet,
  tiaDataSet,
  midWeekDaysWeatherRequest,
} from './util.js';
import {
  addDataInField,
  checkUserStore,
  createUserDoc,
} from './services.js';

const bookmarkBtn = document.querySelector('.search__bookmark-btn');
const beachName = document.querySelector('.beach-name > header');
const beachAddress = document.querySelector('.beach-address');
const searchInput = document.getElementById('search-form__input');
const searchList = document.getElementById('search-list');
const searchListContainer = document.querySelector('.list-box');
const beachNameSubmit = document.getElementById('search-form__submit');
const addBookmarkBtn = document.getElementById('bookmark-btn');
const HIDDEN_CLASSNAME = 'hidden';

async function mainScreenload() {
  showCircularProgress();
  getBaechDataListArray()
    .then(beachDataBase => {
      autoCompleteSearchTerms(beachDataBase);
      const urlParams = new URLSearchParams(window.location.search);
      const getBeachCode = urlParams.get('sendBeachCode');
      return getTheBeachData(getBeachCode, beachDataBase);
    })
    .then(beachData => {
      history.replaceState({}, null, location.pathname);
      paintMainScreen(beachData);
      handleMoreInfoBtn(beachData);
      addBookmarkBtn.addEventListener('click', function () {
        showCircularProgress();
        addBookmark(beachData);
      });
    })
    .catch(error => {
      hideCircularProgress();
      alert(`${ERROR.UNKNOWN_ERROR} main-error mainScreenload : ${error.code}`);
    });
}

function submitBeachName(beachData, input) {
  beachNameSubmit.addEventListener('click', () => {
    const submitBeachCode = beachData.filter(beach => beach.beachName == input);
    location.href = `../main/main.html?sendBeachCode=${submitBeachCode[0].beachCode}`;
  });
}

function autoCompleteSearchTerms(beachData) {
  searchInput.addEventListener('keyup', function () {
    const input = searchInput.value;
    const suggestions = beachData.filter(function (beach) {
      return beach.beachName.toLowerCase().includes(input);
    });
    searchList.innerHTML = '';

    if (searchInput.value != '' && suggestions != '') {
      searchListContainer.classList.remove(HIDDEN_CLASSNAME);
    } else {
      searchListContainer.classList.add(HIDDEN_CLASSNAME);
    }
    while (searchList.firstChild) {
      searchList.removeChild(searchList.firstChild);
    }

    if (suggestions) {
      for (let index = 0; index < 4; index++) {
        const searchListName = document.createElement('li');
        searchListName.classList.add('beach-text');
        searchListName.textContent = suggestions[index].beachName;
        searchList.appendChild(searchListName);

        searchListName.onclick = () => {
          searchInput.value = searchListName.textContent;
          const selectBeachName = searchListName.textContent;
          searchList.innerHTML = '';
          submitBeachName(beachData, selectBeachName);
        };
      }
    }
  });
}

function addBookmark(beachData) {
  const userUID = auth.currentUser.uid;
  checkUserStore(userUID, db)
    .then(docRefId => {
      if (!docRefId) {
        createUserDoc(beachData, db, userUID);
      } else {
        addDataInField(docRefId, beachData, db);
      }
    })
    .catch(error => {
      hideCircularProgress();
      alert(`${ERROR.UNKNOWN_ERROR} main-error addBookmark : ${error.code}`);
    });
}

// 지금 시간으로부터 12시간 정보 얻어오는 기능
async function getWeatherTodayData(beachCode) {
  const fcstToday = await getVilageFcstBeachToday(beachCode).catch(error => {
    alert(`${ERROR.UNKNOWN_ERROR} main-error mainScreenload : ${error.code}`);
  });
  return fcstToday;
}

// 지금 날씨 정보(강수확률, 파고) 화면에 나타내는 함수
function paintCurrentWeatherData(todayWeather) {
  const currentWeather = document.getElementById('weather-today__image');
  const currentTempBorder = document.getElementById('weather-today__temp');
  const currentWeatherIcon = document.createElement('img');
  currentWeatherIcon.src = weatherIconSrc(todayWeather[0]);
  const currentTemp = document.createElement('h2');
  currentTemp.textContent = todayWeather[0].tmp.split('.', 1) + '°C';

  currentWeather.appendChild(currentWeatherIcon);
  currentTempBorder.appendChild(currentTemp);
}

function paintCureentWaveRainData(todayWeather) {
  const weatherPopBorder = document.getElementById('weather-today__rain');
  const weatherWavBorder = document.getElementById('weather-today__wave');

  const todayWaveHeight = document.createElement('span');
  todayWaveHeight.innerHTML =
    todayWeather[0].wav.padEnd(3, '.0') + ' M' + '<br/>파고';
  const chanceOfRain = document.createElement('span');
  chanceOfRain.innerHTML = todayWeather[0].pop + '% <br/>강수확률';

  weatherWavBorder.appendChild(todayWaveHeight);
  weatherPopBorder.appendChild(chanceOfRain);
}

// 시간 날씨 리스트 화면에 나타내는 함수
function addTodayWeatherList(todayWeather) {
  const weatherArea = document.getElementById('weather_area_today');
  for (const data of todayWeather) {
    const weatherInfo = document.createElement('div');
    weatherInfo.classList.add('weather__info');
    const infoUpper = document.createElement('div');
    infoUpper.classList.add('info-upper');
    const weatherDate = document.createElement('h3');
    weatherDate.classList.add('weather__date');
    weatherDate.textContent = data.time.substring(0, 2) + ':' + '00';
    const weatherIcon = document.createElement('img');
    weatherIcon.classList.add('weather__icon');
    weatherIcon.src = weatherIconSrc(data);
    const weatherTemp = document.createElement('span');
    weatherTemp.classList.add('weather__temp');
    weatherTemp.textContent = data.tmp + '°C';
    const infoBottom = document.createElement('div');
    infoBottom.classList.add('info-bottom');
    const waveIcon = document.createElement('img');
    waveIcon.classList.add('weather__icon');
    waveIcon.src = '/assets/images/weather/wave.png';
    const weatherTide = document.createElement('span');
    weatherTide.classList.add('weather__tide');
    weatherTide.textContent = data.wav.padEnd(3, '.0') + 'M';

    infoUpper.appendChild(weatherDate);
    infoUpper.appendChild(weatherIcon);
    infoUpper.appendChild(weatherTemp);
    infoBottom.appendChild(waveIcon);
    infoBottom.appendChild(weatherTide);
    weatherInfo.appendChild(infoUpper);
    weatherInfo.appendChild(infoBottom);
    weatherArea.appendChild(weatherInfo);
  }
}
// 오늘 날씨(12시간)의 필요한 정보 받아오는 함수
function getTodayWeather(fsctBeachToday) {
  try {
    const timeValue = new Set();
    for (let data of fsctBeachToday) {
      timeValue.add(data.fcstTime);
    }
    const tmpValue = beachCategoryValueFilter(
      fsctBeachToday,
      'TMP',
      'fcstValue',
    );
    const wavValue = beachCategoryValueFilter(
      fsctBeachToday,
      'WAV',
      'fcstValue',
    );
    const popValue = beachCategoryValueFilter(
      fsctBeachToday,
      'POP',
      'fcstValue',
    );
    const skyValue = beachCategoryValueFilter(
      fsctBeachToday,
      'SKY',
      'fcstValue',
    );
    const ptyValue = beachCategoryValueFilter(
      fsctBeachToday,
      'PTY',
      'fcstValue',
    );

    return gatherTodayWeather(
      timeValue,
      tmpValue,
      wavValue,
      popValue,
      skyValue,
      ptyValue,
    );
  } catch (error) {
    hideCircularProgress();
    alert(`${ERROR.UNKNOWN_ERROR} main-error getTodayWeather : ${error.code}`);
  }
}

// 지금으로부터 3일 정보 얻어오는 기능
async function getWeather3DaysData(beachCode) {
  const fcstBeachData = await getFcstBeach(beachCode).catch(error => {
    alert(`${ERROR.UNKNOWN_ERROR} main-error mainScreenload : ${error.code}`);
  });
  return fcstBeachData;
}

// 3일의 필요한 날씨 정보를 받아오는 함수
function getWeather3days(WeatherDataArray) {
  try {
    const weekeeTmnValue = beachCategoryValueFilter(
      WeatherDataArray,
      'TMN',
      'fcstValue',
    );
    const weekeeTmxValue = beachCategoryValueFilter(
      WeatherDataArray,
      'TMX',
      'fcstValue',
    );
    const allDateValue = new Set();
    for (let data of WeatherDataArray) {
      if (data.category === 'TMX') {
        allDateValue.add(data.fcstDate);
      }
    }

    const next3Days = Array.from(allDateValue);
    const weekeePopValue = [];
    for (let date of next3Days) {
      const popDataThatDay = WeatherDataArray.filter(
        data => data.fcstDate == date,
      ).filter(filteredData => filteredData.category == 'POP');
      weekeePopValue.push(weatherInfoThatDay(popDataThatDay));
    }

    const weekeeSkyValue = [];
    for (let date of next3Days) {
      const skyDataThatDay = WeatherDataArray.filter(
        data => data.fcstDate == date,
      ).filter(filteredData => filteredData.category == 'SKY');
      weekeeSkyValue.push(weatherInfoThatDay(skyDataThatDay));
    }

    const weekeePtyValue = [];
    for (let date of next3Days) {
      const ptyDataThatDay = WeatherDataArray.filter(
        data => data.fcstDate == date,
      ).filter(filteredData => filteredData.category == 'PTY');
      weekeePtyValue.push(weatherInfoThatDay(ptyDataThatDay));
    }

    return gather3DaysWeatherData(
      weekeeTmnValue,
      weekeeTmxValue,
      weekeePopValue,
      weekeeSkyValue,
      weekeePtyValue,
      next3Days,
    );
  } catch (error) {
    hideCircularProgress();
    alert(`${ERROR.UNKNOWN_ERROR} main-error getWeather3days : ${error.code}`);
  }
}

// 주간 날씨 화면에 띄워주는 기능 (현재 3일까지만 구현)
function addWeekWeatherList(shorTermWeather) {
  const weekelyWeatherArea = document.getElementById('weekely__area');

  for (const dayWeather of shorTermWeather) {
    const weatherWeekelyDiv = document.createElement('div');
    weatherWeekelyDiv.classList.add('weather-weekely__container');
    //
    const weekelyDay = document.createElement('div');
    weekelyDay.classList.add('weekely-day');
    const weekelySpan = document.createElement('span');
    weekelySpan.textContent = dayWeather.date;
    //
    const weekelyRainDiv = document.createElement('div');
    weekelyRainDiv.classList.add('weekely-rain');
    const weekelyRainIcon = document.createElement('img');
    weekelyRainIcon.src = '/assets/images/weather/waterdrop.svg';
    const weekelyPopSpan = document.createElement('span');
    weekelyPopSpan.textContent = dayWeather.pop + '%';
    //
    const weatherIconDiv = document.createElement('div');
    weatherIconDiv.classList.add('weekely-icon');
    const weekelyWeatherIcon = document.createElement('img');
    if (dayWeather.weather) {
      weekelyWeatherIcon.src = midTermWeatherIconSrc(dayWeather);
    }
    if (dayWeather.pty && dayWeather.sky) {
      weekelyWeatherIcon.src = weatherIconSrc(dayWeather);
    }
    //
    const weekelyTempDiv = document.createElement('div');
    weekelyTempDiv.classList.add('weekely-temp');
    const weekelyTmxSpan = document.createElement('span');
    weekelyTmxSpan.textContent =
      typeof dayWeather.tmx === 'string'
        ? dayWeather.tmx.split('.', 1) + `°C /`
        : dayWeather.tmx + `°C /`;
    const weekelyTmnSpan = document.createElement('span');
    weekelyTmnSpan.textContent =
      typeof dayWeather.tmx === 'string'
        ? dayWeather.tmn.split('.', 1) + `°C`
        : dayWeather.tmn + `°C`;

    weekelyDay.appendChild(weekelySpan);
    weekelyRainDiv.appendChild(weekelyRainIcon);
    weekelyRainDiv.appendChild(weekelyPopSpan);
    weatherIconDiv.appendChild(weekelyWeatherIcon);
    weekelyTempDiv.appendChild(weekelyTmxSpan);
    weekelyTempDiv.appendChild(weekelyTmnSpan);

    weatherWeekelyDiv.appendChild(weekelyDay);
    weatherWeekelyDiv.appendChild(weekelyRainDiv);
    weatherWeekelyDiv.appendChild(weatherIconDiv);
    weatherWeekelyDiv.appendChild(weekelyTempDiv);

    weekelyWeatherArea.appendChild(weatherWeekelyDiv);
  }
}
// 어제, 오늘 데이터를 구하기 위한 api 요청
async function getYesterdayTodayData(beachCode) {
  const fcstYesterday = await getTodayFcstBeach(beachCode).catch(error => {
    alert(`${ERROR.UNKNOWN_ERROR} main-error mainScreenload : ${error.code}`);
  });
  return fcstYesterday;
}

// 오늘 날씨의 최저, 최고 기온 구하는 함수
function getTodayTempHighLow(yesterdayTodayData) {
  try {
    const lowHighTempDate = [];
    const today = todayDateRequest();
    const lowTemp = yesterdayTodayData
      .filter(data => data.fcstDate == today)
      .filter(data => data.category == 'TMN')
      .map(data => data.fcstValue);
    const highTemp = yesterdayTodayData
      .filter(data => data.fcstDate == today)
      .filter(data => data.category == 'TMX')
      .map(data => data.fcstValue);

    lowHighTempDate.push(lowTemp[0].split('.', 1));
    lowHighTempDate.push(highTemp[0].split('.', 1));
    return lowHighTempDate;
  } catch (error) {
    hideCircularProgress();
    alert(
      `${ERROR.UNKNOWN_ERROR} main-error getTodayTempHighLow : ${error.code}`,
    );
  }
}

// 오늘의 최저, 최고 기온 표시해주는 함수
function paintHighAndLowTemp(todayTempData) {
  const currentTempBorder = document.getElementById('weather-today__temp');
  const todayLowHighTemp = document.createElement('span');
  todayLowHighTemp.textContent =
    todayTempData[0] + '°C / ' + todayTempData[1] + '°C';

  currentTempBorder.appendChild(todayLowHighTemp);
}
// 3일 이후의 육상 데이터 구하는 함수
async function getAfter3DaysLandData(landCode) {
  const midLandFcstRequest = await getMidLandFcst(landCode).catch(error => {
    const errorCode = error.code;
    alert(
      `${ERROR.UNKNOWN_ERROR} main-error getAfter3DaysLandData : ${errorCode}`,
    );
  });
  const resultLandData = landDataSet(midLandFcstRequest);
  return resultLandData;
}

// 3일 이후 기온 데이터 구하는 함수
async function getAfter3DaysTiaData(cityCode) {
  const midTiaFcstRequest = await getMidTiaFcst(cityCode).catch(error => {
    const errorCode = error.code;
    alert(
      `${ERROR.UNKNOWN_ERROR} main-error getAfter3DaysTiaData : ${errorCode}`,
    );
  });
  const resultTiaData = tiaDataSet(midTiaFcstRequest);
  return resultTiaData;
}

// 일몰 일출 화면에 나타내주는 함수
function paintSunriseSunsetTime(sunriseSunseTimeData) {
  const sunriseDiv = document.getElementById('sun-time__sunrise');
  const sunsetDiv = document.getElementById('sun-time__sunset');
  const sunriseSpan = document.createElement('span');
  sunriseSpan.textContent =
    '오전 ' +
    sunriseSunseTimeData.sunrise.substring(0, 2) +
    ':' +
    sunriseSunseTimeData.sunrise.substring(2);
  const sunsetSpan = document.createElement('span');
  sunsetSpan.textContent =
    '오후 ' +
    sunriseSunseTimeData.sunset.substring(0, 2) +
    ':' +
    sunriseSunseTimeData.sunset.substring(2);

  sunriseDiv.appendChild(sunriseSpan);
  sunsetDiv.appendChild(sunsetSpan);
}

function handleMoreInfoBtn(beachData) {
  const infoBtn = document.getElementById('info-btn');
  const panoramaBtn = document.getElementById('panorama-btn');
  const goToMapBtn = document.getElementById('move-map-btn');

  infoBtn.addEventListener('click', function () {
    if (beachData[0].informationLink === 'none') {
      return alert(ERROR.NONE_MORE_BEACH_INFORMATION);
    } else {
      return window.open(beachData[0].informationLink);
    }
  });

  panoramaBtn.addEventListener('click', function () {
    if (beachData[0].panoramaLink === 'none') {
      return alert(ERROR.NONE_MORE_BEACH_INFORMATION);
    } else {
      return window.open(beachData[0].panoramaLink);
    }
  });

  goToMapBtn.addEventListener('click', function () {
    location.href = `../map/map.html?sendLat=${beachData[0].lat}&sendLon=${beachData[0].lon}`;
  });
}

async function paintMainScreen(beachData) {
  try {
    const yesterdayTodayFcstData = await getYesterdayTodayData(
      beachData[0].beachCode,
    );
    const todayHighLowTemp = getTodayTempHighLow(yesterdayTodayFcstData);
    const fcstTodayData = await getWeatherTodayData(beachData[0].beachCode);
    const todayWeather = getTodayWeather(fcstTodayData);
    const fcstWeatherData = await getWeather3DaysData(beachData[0].beachCode);
    const threeDaysWeather = getWeather3days(fcstWeatherData);
    const midLandFcst = await getAfter3DaysLandData(beachData[0].landCode);
    const midTiaFcst = await getAfter3DaysTiaData(beachData[0].cityCode);
    const midWeekDaysWeather = midWeekDaysWeatherRequest(
      midLandFcst,
      midTiaFcst,
    );
    const riseSunsetDataRequest = await getRiseSunsetInfo(
      beachData[0].lon,
      beachData[0].lat,
    );

    paintHighAndLowTemp(todayHighLowTemp);
    paintCurrentWeatherData(todayWeather);
    paintCureentWaveRainData(todayWeather);
    addTodayWeatherList(todayWeather);
    addWeekWeatherList(threeDaysWeather);
    addWeekWeatherList(midWeekDaysWeather);
    paintSunriseSunsetTime(riseSunsetDataRequest);
    hideCircularProgress();
  } catch (error) {
    alert(
      '데이터 요청 중에 에러가 발생하였습니다. 새로 고침을 해주시기 바랍니다.\n지속적인 문제가 발생한다면 관리자에게 문의 바랍니다.',
    );
    hideCircularProgress();
  }
}

function getTheBeachData(beachCode, beachData) {
  showCircularProgress();
  if (beachCode) {
    const findDataReceivedBeach = beachData.filter(
      data => data.beachCode == beachCode,
    );
    beachName.innerHTML = findDataReceivedBeach[0].beachName;
    beachAddress.innerHTML = findDataReceivedBeach[0].address;
    return findDataReceivedBeach;
  }
  if (!beachCode);
  {
    const randomBeachCode = Math.floor(Math.random() * 420) + 1;
    const findDataBeach = beachData.filter(
      data => data.beachCode == randomBeachCode,
    );
    beachName.innerHTML = findDataBeach[0].beachName;
    beachAddress.innerHTML = findDataBeach[0].address;
    return findDataBeach;
  }
}

// Start
const auth = getAuth();
onAuthStateChanged(auth, user => {
  if (user) {
    bookmarkBtn.classList.remove(HIDDEN_CLASSNAME);
  } else return;
});
const db = fireStoreInitialize();

window.onload = mainScreenload;
