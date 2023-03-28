import { hideCircularProgress } from '../../../js/circular-progress.js';
import { ERROR } from '../../../js/error.js';

// 요일 구하는 함수
export function getDayWeek(dateArr) {
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

// 데이터를 오름차순 정렬 후 최대 값 리턴하는 함수
export function weatherInfoThatDay(dateFilteredArr) {
  const sortMax = dateFilteredArr
    .map(filteredData => filteredData.fcstValue)
    .sort(function (a, b) {
      return b - a;
    });

  return sortMax[0];
}

// 날씨 아이콘 구하는 함수
export function weatherIconSrc(weatherDayArr) {
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

// 오늘의 날짜 얻는 함수
export function todayDateRequest() {
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

// 중기 날씨 정보 아이콘 결정 함수
export function midTermWeatherIconSrc(midWeatherDayArr) {
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

// 원하는 날씨 정보 데이터 필터링 함수
export function beachCategoryValueFilter(
  collectionData,
  categoryStr,
  findValueStr,
) {
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

// 4~7일의 요일 구하는 함수
export function getMidWeekDays() {
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


// 오늘(12시간) 날씨 정보 모아주는 함수
export function gatherTodayWeather(timeArr, tmpArr, wavArr, popArr, skyArr, ptyArr) {
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

// 3일 날씨 정보를 모아주는 함수
export function gather3DaysWeatherData(
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

// 육상(4~7일) 데이터를 객체 형식으로 모아서 리턴해주는 함수
export function landDataSet(midLandFcstData) {
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

// 기온(4~7일) 데이터를 객체 형식으로 모아서 리턴해주는 함수
export function tiaDataSet(tiaFcstData) {
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

// 4~7일 중기 육상, 기온, 날짜 데이터 배열로 모으는 함수
export function midWeekDaysWeatherRequest(landFcst, tiaFcst) {
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
