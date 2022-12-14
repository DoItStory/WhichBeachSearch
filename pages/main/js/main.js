import {
  initializeFirebase,
  fireStoreInitialize,
} from '../../../js/initialize.js';
import {
  getAuth,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js';
import {
  showCircularProgress,
  hideCircularProgress,
} from '../../../js/circular-progress.js';
import { ERROR } from '../../../js/error.js';
import {
  getVilageFcstBeachToday,
  getFcstBeach,
  getTodayFcstBeach,
  getMidLandFcst,
  getMidTiaFcst,
  getRiseSunsetInfo,
} from './beachInfoService.js';
import { getBaechDataListArray } from './beachDataBase.js';

const bookmarkBtn = document.querySelector('.search__bookmark-btn');
const beachName = document.querySelector('.beach-name > header');
const beachAddress = document.querySelector('.beach-address');
const searchInput = document.getElementById('search-form__input');
const searchList = document.getElementById('search-list');
const searchListContainer = document.querySelector('.list-box');
const beachNameSubmit = document.getElementById('search-form__submit');
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
      handleBookmarkBtn(beachData);
    })
    .catch(error => {
      hideCircularProgress();
      const errorCode = error.code;
      alert(`${ERROR.UNKNOWN_ERROR} main-error mainScreenload : ${errorCode}`);
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
      return beach.beachName.toLowerCase().startsWith(input);
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

function handleBookmarkBtn(beachData) {
  try {
    const addBookmarkBtn = document.getElementById('bookmark-btn');
    addBookmarkBtn.addEventListener('click', function (event) {
      if (event) {
        addBookmark(beachData);
        alert('???????????? ?????????????????????.');
        hideCircularProgress();
      } else return;
    });
  } catch (error) {
    hideCircularProgress();
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error handleBookmarkBtn : ${errorCode}`);
  }
}

function addBookmark(beachData) {
  showCircularProgress();
  checkUserStore()
    .then(docRefId => {
      if (!docRefId) {
        createUserDoc(beachData);
      } else {
        addDataInField(docRefId, beachData);
      }
    })
    .catch(error => {
      hideCircularProgress();
      const errorCode = error.code;
      alert(`${ERROR.UNKNOWN_ERROR} main-error addBookmark : ${errorCode}`);
    });
}

// ????????? ??????(doc) ?????? ??????
async function createUserDoc(beachData) {
  const userUID = auth.currentUser.uid;
  if (!userUID) {
    throw ERROR(ERROR.UNDEFINED_UID);
  }
  const userBookmarkList = [
    {
      name: beachData[0].beachName,
      address: beachData[0].address,
      beachNum: beachData[0].beachCode,
    },
  ];
  await addDoc(collection(db, 'Bookmark'), {
    userBookmarkList,
    uid: userUID,
  }).catch(error => {
    hideCircularProgress();
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error createUserDoc : ${errorCode}`);
  });
}

// ???????????? ??????(map) ?????? ??????
function addDataInField(docRefId, beachData) {
  const docRef = doc(db, 'Bookmark', docRefId);
  updateDoc(docRef, {
    userBookmarkList: arrayUnion({
      name: beachData[0].beachName,
      address: beachData[0].address,
      beachNum: beachData[0].beachCode,
    }),
  }).catch(error => {
    hideCircularProgress();
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error addDataInField : ${errorCode}`);
  });
}
// ????????? uid??? ????????? ????????? ????????? ?????? ??????
async function checkUserStore() {
  const userUID = auth.currentUser.uid;
  if (!userUID) {
    throw ERROR(ERROR.UNDEFINED_UID);
  }
  const q = query(collection(db, 'Bookmark'), where('uid', '==', userUID));
  const querySnapshot = await getDocs(q).catch(error => {
    hideCircularProgress();
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error checkUserStore : ${errorCode}`);
  });
  let docRefId = '';
  querySnapshot.forEach(doc => {
    docRefId = doc.id;
  });
  return docRefId;
}

// ?????? ?????????????????? 12?????? ?????? ???????????? ??????
async function getWeatherTodayData(beachCode) {
  const fcstToday = await getVilageFcstBeachToday(beachCode).catch(error => {
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error mainScreenload : ${errorCode}`);
  });
  return fcstToday;
}

// ?????? ?????? ??????(????????????, ??????) ????????? ???????????? ??????
function paintCurrentWeatherData(todayWeather) {
  const currentWeather = document.getElementById('weather-today__image');
  const currentTempBorder = document.getElementById('weather-today__temp');
  const currentWeatherIcon = document.createElement('img');
  currentWeatherIcon.src = weatherIconSrc(todayWeather[0]);
  const currentTemp = document.createElement('h2');
  currentTemp.textContent = todayWeather[0].tmp + '??C';

  currentWeather.appendChild(currentWeatherIcon);
  currentTempBorder.appendChild(currentTemp);
}

function paintCureentWaveRainData(todayWeather) {
  const weatherPopBorder = document.getElementById('weather-today__rain');
  const weatherWavBorder = document.getElementById('weather-today__wave');

  const todayWaveHeight = document.createElement('span');
  todayWaveHeight.innerHTML =
    todayWeather[0].wav.padEnd(3, '.0') + ' M' + '<br/>??????';
  const chanceOfRain = document.createElement('span');
  chanceOfRain.innerHTML = todayWeather[0].pop + '% <br/>????????????';

  weatherWavBorder.appendChild(todayWaveHeight);
  weatherPopBorder.appendChild(chanceOfRain);
}

// ?????? ?????? ????????? ????????? ???????????? ??????
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
    weatherTemp.textContent = data.tmp + '??C';
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
// ?????? ??????(12??????)??? ????????? ?????? ???????????? ??????
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
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error getTodayWeather : ${errorCode}`);
  }
}
// ????????? ?????? ?????? ????????? ????????? ??????
function beachCategoryValueFilter(collectionData, categoryStr, findValueStr) {
  try {
    let result;
    switch (findValueStr) {
      case 'fcstValue':
        result = collectionData
          .filter(data => data.category == categoryStr)
          .map(filteredData => filteredData.fcstValue);
        break;
      case 'fcstDate':
        result = collectionData
          .filter(data => data.category == categoryStr)
          .map(filteredData => filteredData.fcstDate);
        break;
    }
    return result;
  } catch (error) {
    hideCircularProgress();
    const errorCode = error.code;
    alert(
      `${ERROR.UNKNOWN_ERROR} main-error beachCategoryValueFilter : ${errorCode}`,
    );
  }
}

// ??????(12??????) ?????? ?????? ???????????? ??????
function gatherTodayWeather(timeArr, tmpArr, wavArr, popArr, skyArr, ptyArr) {
  try {
    const timeArray = Array.from(timeArr);

    const weatherCollection = [];
    for (let i = 0; i < tmpArr.length; i++) {
      weatherCollection[i] = {
        time: timeArray[i],
        tmp: tmpArr[i],
        wav: wavArr[i],
        pop: popArr[i],
        sky: skyArr[i],
        pty: ptyArr[i],
      };
    }

    return weatherCollection;
  } catch (error) {
    hideCircularProgress();
    const errorCode = error.code;
    alert(
      `${ERROR.UNKNOWN_ERROR} main-error beachCategoryValueFilter : ${errorCode}`,
    );
  }
}

// ?????????????????? 3??? ?????? ???????????? ??????
async function getWeather3DaysData(beachCode) {
  const fcstBeachData = await getFcstBeach(beachCode).catch(error => {
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error mainScreenload : ${errorCode}`);
  });
  return fcstBeachData;
}

// 3?????? ????????? ?????? ????????? ???????????? ??????
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
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error getWeather3days : ${errorCode}`);
  }
}

// ???????????? ???????????? ?????? ??? ?????? ??? ???????????? ??????
function weatherInfoThatDay(dateFilteredArr) {
  const sortMax = dateFilteredArr
    .map(filteredData => filteredData.fcstValue)
    .sort(function (a, b) {
      return b - a;
    });

  return sortMax[0];
}

// 3??? ?????? ????????? ???????????? ??????
function gather3DaysWeatherData(
  weekeeTmn,
  weekeeTmx,
  weekeePop,
  weekeeSky,
  weekeePty,
  dateData,
) {
  try {
    const threeDayOfTheWeek = getDayWeek(dateData);
    const threeWeatherCollection = [];
    for (let i = 0; i < weekeeTmn.length; i++) {
      threeWeatherCollection[i] = {
        date: threeDayOfTheWeek[i],
        tmn: weekeeTmn[i],
        tmx: weekeeTmx[i],
        pop: weekeePop[i],
        sky: weekeeSky[i],
        pty: weekeePty[i],
      };
    }
    return threeWeatherCollection;
  } catch (error) {
    hideCircularProgress();
    const errorCode = error.code;
    alert(
      `${ERROR.UNKNOWN_ERROR} main-error gather3DaysWeatherData : ${errorCode}`,
    );
  }
}

// ?????? ????????? ??????
function getDayWeek(dateArr) {
  try {
    const dayWeek = [];
    for (let day of dateArr) {
      const yyyyMMdd = String(day);
      const sYear = yyyyMMdd.substring(0, 4);
      const sMonth = yyyyMMdd.substring(4, 6);
      const sDate = yyyyMMdd.substring(6, 8);
      const date = new Date(Number(sYear), Number(sMonth) - 1, Number(sDate));
      const week = ['???', '???', '???', '???', '???', '???', '???'];
      dayWeek.push(week[date.getDay()] + '??????');
    }
    return dayWeek;
  } catch (error) {
    hideCircularProgress();
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error getDayWeek : ${errorCode}`);
  }
}

// ?????? ????????? ????????? ??????
function weatherIconSrc(weatherDayArr) {
  const rainSunny = '/assets/images/weather/drizzle-sunny.svg';
  const mostlyCloudy = '/assets/images/weather/mostly-cloudy.svg';
  const rainSnow = '/assets/images/weather/rain-snow.svg';
  const rain = '/assets/images/weather/rain.svg';
  const snow = '/assets/images/weather/snow.svg';
  const sunny = '/assets/images/weather/sunny.svg';

  const skyCode = weatherDayArr.sky;
  const ptyCode = weatherDayArr.pty;
  let imageSrc = '';

  if (skyCode == '1') {
    if (ptyCode == '0') {
      imageSrc = sunny;
    } else if (ptyCode == '1' || ptyCode == '4') {
      imageSrc = rainSunny;
    } else if (ptyCode == '2') {
      imageSrc = rainSnow;
    } else if (ptyCode == '3') imageSrc = snow;
  } else {
    if (ptyCode == '0') {
      imageSrc = mostlyCloudy;
    } else if (ptyCode == '1' || ptyCode == '4') {
      imageSrc = rain;
    } else if (ptyCode == '2') {
      imageSrc = rainSnow;
    } else if (ptyCode == '3') imageSrc = snow;
  }
  return imageSrc;
}
// ?????? ?????? ?????? ????????? ?????? ??????
function midTermWeatherIconSrc(midWeatherDayArr) {
  const rainSunny = '/assets/images/weather/drizzle-sunny.svg';
  const mostlyCloudy = '/assets/images/weather/mostly-cloudy.svg';
  const rainSnow = '/assets/images/weather/rain-snow.svg';
  const rain = '/assets/images/weather/rain.svg';
  const snow = '/assets/images/weather/snow.svg';
  const sunny = '/assets/images/weather/sunny.svg';

  const weatherString = midWeatherDayArr.weather;
  let imageSrc = '';

  switch (weatherString) {
    case '??????':
      imageSrc = sunny;
      break;
    case '????????????':
    case '??????':
      imageSrc = mostlyCloudy;
      break;
    case '???????????? ???':
    case '???????????? ?????????':
    case '????????? ???':
    case '????????? ?????????':
      imageSrc = rain;
      break;
    case '???????????? ???':
    case '????????? ???':
      imageSrc = snow;
      break;
    case '???????????? ???/???':
    case '????????? ???/???':
      imageSrc = rainSnow;
      break;
  }

  return imageSrc;
}

// ?????? ?????? ????????? ???????????? ?????? (?????? 3???????????? ??????)
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
    weekelyTmxSpan.textContent = dayWeather.tmx.substring(0, 2) + `??C /`;
    const weekelyTmnSpan = document.createElement('span');
    weekelyTmnSpan.textContent = dayWeather.tmn.substring(0, 2) + `??C`;

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
// ??????, ?????? ???????????? ????????? ?????? api ??????
async function getYesterdayTodayData(beachCode) {
  const fcstYesterday = await getTodayFcstBeach(beachCode).catch(error => {
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error mainScreenload : ${errorCode}`);
  });
  console.log(fcstYesterday);
  return fcstYesterday;
}

// ?????? ????????? ??????, ?????? ?????? ????????? ??????
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

    lowHighTempDate.push(lowTemp[0].substr(0, 2));
    lowHighTempDate.push(highTemp[0].substr(0, 2));
    return lowHighTempDate;
  } catch (error) {
    hideCircularProgress();
    const errorCode = error.code;
    alert(
      `${ERROR.UNKNOWN_ERROR} main-error getTodayTempHighLow : ${errorCode}`,
    );
  }
}
// ????????? ?????? ?????? ??????
function todayDateRequest() {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    return year + month + day;
  } catch (error) {
    hideCircularProgress();
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error todayDateRequest : ${errorCode}`);
  }
}

// ????????? ??????, ?????? ?????? ??????????????? ??????
function paintHighAndLowTemp(todayTempData) {
  const currentTempBorder = document.getElementById('weather-today__temp');
  const todayLowHighTemp = document.createElement('span');
  todayLowHighTemp.textContent =
    todayTempData[0] + '??C / ' + todayTempData[1] + '??C';

  currentTempBorder.appendChild(todayLowHighTemp);
}
// 3??? ????????? ?????? ????????? ????????? ??????
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
// ??????(4~7???) ???????????? ?????? ???????????? ????????? ??????????????? ??????
function landDataSet(midLandFcstData) {
  try {
    const midLandDataArray = [];
    for (let data of Object.values(midLandFcstData)) {
      midLandDataArray.push(data);
    }

    const midLandRequiredDataSet = [];
    let contactNum = 0;
    for (let i = 0; i < 4; i++) {
      midLandRequiredDataSet[i] = {
        rnSt: midLandDataArray[2 + contactNum],
        wf: midLandDataArray[15 + contactNum],
      };
      contactNum = contactNum + 2;
    }
    return midLandRequiredDataSet;
  } catch (error) {
    hideCircularProgress();
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error landDataSet : ${errorCode}`);
  }
}
// 3??? ?????? ?????? ????????? ????????? ??????
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
// ??????(4~7???) ???????????? ?????? ???????????? ????????? ??????????????? ??????
function tiaDataSet(tiaFcstData) {
  try {
    const midTempDataArray = [];
    for (let data of Object.values(tiaFcstData)) {
      midTempDataArray.push(data);
    }

    const midTempRequiredDataSet = [];
    let contactNum = 0;
    for (let i = 0; i < 4; i++) {
      midTempRequiredDataSet[i] = {
        taMin: midTempDataArray[7 + contactNum],
        taMax: midTempDataArray[10 + contactNum],
      };
      contactNum = contactNum + 6;
    }
    return midTempRequiredDataSet;
  } catch (error) {
    hideCircularProgress();
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error tiaDataSet : ${errorCode}`);
  }
}

// 4~7?????? ?????? ????????? ??????
function getMidWeekDays() {
  try {
    const midWeekDays = [];
    for (let Days = 0; Days < 4; Days++) {
      const today = new Date();
      const year = today.getFullYear();
      const month = ('0' + (today.getMonth() + 1)).slice(-2);
      today.setDate(today.getDate() + (4 + Days));
      const day = ('0' + today.getDate()).slice(-2);
      const daysDate = year + month + day;
      midWeekDays.push(daysDate);
    }
    return midWeekDays;
  } catch (error) {
    hideCircularProgress();
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error getMidWeekDays : ${errorCode}`);
  }
}

// 4~7??? ?????? ??????, ??????, ?????? ????????? ????????? ????????? ??????
function midWeekDaysWeatherRequest(landFcst, tiaFcst) {
  try {
    const midWeekDateArray = getMidWeekDays();
    const dayOfTheWeek = getDayWeek(midWeekDateArray);
    const midWeekDaysWeatherData = [];
    for (let i = 0; i < 4; i++) {
      midWeekDaysWeatherData[i] = {
        date: dayOfTheWeek[i],
        pop: landFcst[i].rnSt,
        weather: landFcst[i].wf,
        tmn: tiaFcst[i].taMin,
        tmx: tiaFcst[i].taMax,
      };
    }
    return midWeekDaysWeatherData;
  } catch (error) {
    hideCircularProgress();
    const errorCode = error.code;
    alert(
      `${ERROR.UNKNOWN_ERROR} main-error midWeekDaysWeatherRequest : ${errorCode}`,
    );
  }
}

// ?????? ?????? ????????? ??????????????? ??????
function paintSunriseSunsetTime(sunriseSunseTimeData) {
  const sunriseDiv = document.getElementById('sun-time__sunrise');
  const sunsetDiv = document.getElementById('sun-time__sunset');
  const sunriseSpan = document.createElement('span');
  sunriseSpan.textContent =
    '?????? ' +
    sunriseSunseTimeData.sunrise.substring(0, 2) +
    ':' +
    sunriseSunseTimeData.sunrise.substring(2);
  const sunsetSpan = document.createElement('span');
  sunsetSpan.textContent =
    '?????? ' +
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
  const midWeekDaysWeather = midWeekDaysWeatherRequest(midLandFcst, midTiaFcst);
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
    const randomBeachCode = Math.floor(Math.random() * 218) + 1;
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
