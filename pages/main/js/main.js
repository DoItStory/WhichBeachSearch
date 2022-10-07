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

const bookmarkBtn = document.querySelector('.search__bookmark-btn');
const beachName = document.querySelector('.beach-name > header');
const beachAddress = document.querySelector('.beach-address');
const HIDDEN_CLASSNAME = 'hidden';

async function mainScreenload() {
  try {
    showCircularProgress();
    const urlParams = new URLSearchParams(window.location.search);
    const getbeachName = urlParams.get('sendBeachName');
    const getbeachAddress = urlParams.get('sendBeachAddress');
    if (getbeachName && getbeachAddress) {
      beachName.innerHTML = getbeachName;
      beachAddress.innerHTML = getbeachAddress;
      hideCircularProgress();
    } else {
      beachName.innerHTML = '해운대 해수욕장';
      beachAddress.innerHTML = '부산광역시 해운대구 우동';
      hideCircularProgress();
    }
  } catch (error) {
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error mainScreenload : ${errorCode}`);
  }

  showCircularProgress();
  const yesterdayTodayFcstData = await getYesterdayTodayData();
  const todayHighLowTemp = getTodayTempHighLow(yesterdayTodayFcstData);
  const fcstTodayData = await getWeatherTodayData();
  const todayWeather = getTodayWeather(fcstTodayData);
  const fcstWeatherData = await getWeather3DaysData();
  const threeDaysWeather = getWeather3days(fcstWeatherData);
  const midLandFcst = await getAfter3DaysLandData();
  const midTiaFcst = await getAfter3DaysTiaData();
  const midWeekDaysWeather = midWeekDaysWeatherRequest(midLandFcst, midTiaFcst);
  const riseSunsetDataRequest = await getRiseSunsetInfo(
    '129.161686',
    '35.1588527',
  );
  paintCurrentWeatherData(todayWeather);
  paintCureentWaveRainData(todayWeather);
  paintHighAndLowTemp(todayHighLowTemp);
  addWeekWeatherList(threeDaysWeather);
  addTodayWeatherList(todayWeather);
  addWeekWeatherList(midWeekDaysWeather);
  paintSunriseSunsetTime(riseSunsetDataRequest);
  hideCircularProgress();
}

function handleBookmarkBtn() {
  showCircularProgress();
  checkUserStore()
    .then(docRefId => {
      if (!docRefId) {
        createUserDoc();
      } else {
        addDataInField(docRefId);
      }
      hideCircularProgress();
    })
    .catch(error => {
      hideCircularProgress();
      const errorCode = error.code;
      alert(
        `${ERROR.UNKNOWN_ERROR} main-error handleBookmarkBtn : ${errorCode}`,
      );
    });
}

// 새로운 문서(doc) 생성 함수
async function createUserDoc() {
  const userUID = auth.currentUser.uid;
  if (!userUID) {
    throw ERROR(ERROR.UNDEFINED_UID);
  }
  const userBookmarkList = [
    {
      name: '해운대 해수욕장',
      address: '부산광역시 해운대구 우동',
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

// 즐겨찾기 정보(map) 추가 함수
function addDataInField(docRefId) {
  const docRef = doc(db, 'Bookmark', docRefId);
  updateDoc(docRef, {
    userBookmarkList: arrayUnion({
      name: '명사십리 해수욕장',
      address: '전라남도 완도군',
    }),
  }).catch(error => {
    hideCircularProgress();
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error addDataInField : ${errorCode}`);
  });
}
// 유저의 uid가 포함된 문서가 있는지 찾는 함수
async function checkUserStore() {
  const userUID = auth.currentUser.uid;
  if (!userUID) {
    throw ERROR(UNDEFINED_UID);
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

// 지금 시간으로부터 12시간 정보 얻어오는 기능
async function getWeatherTodayData() {
  const fcstToday = await getVilageFcstBeachToday(304).catch(error => {
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error mainScreenload : ${errorCode}`);
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
  currentTemp.textContent = todayWeather[0].tmp + '°C';

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
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error getTodayWeather : ${errorCode}`);
  }
}
// 원하는 날씨 정보 데이터 필터링 함수
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

// 오늘(12시간) 날씨 정보 모아주는 함수
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

// 지금으로부터 3일 정보 얻어오는 기능
async function getWeather3DaysData() {
  const fcstBeachData = await getFcstBeach(304).catch(error => {
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error mainScreenload : ${errorCode}`);
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
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error getWeather3days : ${errorCode}`);
  }
}

// 데이터를 오름차순 정렬 후 최대 값 리턴하는 함수
function weatherInfoThatDay(dateFilteredArr) {
  const sortMax = dateFilteredArr
    .map(filteredData => filteredData.fcstValue)
    .sort(function (a, b) {
      return b - a;
    });

  return sortMax[0];
}

// 3일 날씨 정보를 모아주는 함수
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

// 요일 구하는 함수
function getDayWeek(dateArr) {
  try {
    const dayWeek = [];
    for (let day of dateArr) {
      const yyyyMMdd = String(day);
      const sYear = yyyyMMdd.substring(0, 4);
      const sMonth = yyyyMMdd.substring(4, 6);
      const sDate = yyyyMMdd.substring(6, 8);
      const date = new Date(Number(sYear), Number(sMonth) - 1, Number(sDate));
      const week = ['일', '월', '화', '수', '목', '금', '토'];
      dayWeek.push(week[date.getDay()] + '요일');
    }
    return dayWeek;
  } catch (error) {
    hideCircularProgress();
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error getDayWeek : ${errorCode}`);
  }
}

// 날씨 아이콘 구하는 함수
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
// 중기 날씨 정보 아이콘 결정 함수
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
    case '맑음':
      imageSrc = sunny;
      break;
    case '구름많음':
    case '흐림':
      imageSrc = mostlyCloudy;
      break;
    case '구름많고 비':
    case '구름많고 소나기':
    case '흐리고 비':
    case '흐리고 소나기':
      imageSrc = rain;
      break;
    case '구름많고 눈':
    case '흐리고 눈':
      imageSrc = snow;
      break;
    case '구름많고 비/눈':
    case '흐리고 비/눈':
      imageSrc = rainSnow;
      break;
  }

  return imageSrc;
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
    weekelyTmxSpan.textContent = dayWeather.tmx.substring(0, 2) + `°C /`;
    const weekelyTmnSpan = document.createElement('span');
    weekelyTmnSpan.textContent = dayWeather.tmn.substring(0, 2) + `°C`;

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
async function getYesterdayTodayData() {
  const fcstYesterday = await getTodayFcstBeach(304).catch(error => {
    const errorCode = error.code;
    alert(`${ERROR.UNKNOWN_ERROR} main-error mainScreenload : ${errorCode}`);
  });
  console.log(fcstYesterday);
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
// 오늘의 날짜 얻는 함수
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

// 오늘의 최저, 최고 기온 표시해주는 함수
function paintHighAndLowTemp(todayTempData) {
  const currentTempBorder = document.getElementById('weather-today__temp');
  const todayLowHighTemp = document.createElement('span');
  todayLowHighTemp.textContent =
    todayTempData[0] + '°C / ' + todayTempData[1] + '°C';

  currentTempBorder.appendChild(todayLowHighTemp);
}
// 3일 이후의 육상 데이터 구하는 함수
async function getAfter3DaysLandData() {
  const midLandFcstRequest = await getMidLandFcst('11H20000').catch(error => {
    const errorCode = error.code;
    alert(
      `${ERROR.UNKNOWN_ERROR} main-error getAfter3DaysLandData : ${errorCode}`,
    );
  });
  const resultLandData = landDataSet(midLandFcstRequest);
  return resultLandData;
}
// 육상(4~7일) 데이터를 객체 형식으로 모아서 리턴해주는 함수
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
// 3일 이후 기온 데이터 구하는 함수
async function getAfter3DaysTiaData() {
  const midTiaFcstRequest = await getMidTiaFcst('11H20201').catch(error => {
    const errorCode = error.code;
    alert(
      `${ERROR.UNKNOWN_ERROR} main-error getAfter3DaysTiaData : ${errorCode}`,
    );
  });
  const resultTiaData = tiaDataSet(midTiaFcstRequest);
  return resultTiaData;
}
// 기온(4~7일) 데이터를 객체 형식으로 모아서 리턴해주는 함수
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

// 4~7일의 요일 구하는 함수
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

// 4~7일 중기 육상, 기온, 날짜 데이터 배열로 모으는 함수
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

// Start
const auth = getAuth();
onAuthStateChanged(auth, user => {
  if (user) {
    bookmarkBtn.classList.remove(HIDDEN_CLASSNAME);
  } else return;
});
const db = fireStoreInitialize();

const addBookmarkBtn = document.getElementById('bookmark-btn');
addBookmarkBtn.addEventListener('click', handleBookmarkBtn);

window.onload = mainScreenload;
