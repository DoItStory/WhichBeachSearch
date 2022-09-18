const BEACH_INFO_SERVICE_KEY =
  'DnqahC7Oj+ryIm2AlkiWQr+DVjZDHv9/I4U79tgfopjyNp2aOfvpA5gC5+yC6uWPYU1VgICsIBV2xCZ/h4czDg==';

function getKorDate() {
  const korDate = new Date(new Date().getTime() + 9 * 3600 * 1000);
  return korDate;
}

function getTodayDate() {
  const korDate = getKorDate();
  const todayDate = new Date(korDate.toISOString().split('T')[0]);
  return todayDate;
}

// 단기예보(KST) 기준 시간 획득
function getNearestBaseDate() {
  // 한국 표준시 +9h
  const korDate = getKorDate();
  const todayDate = getTodayDate();
  const currentHour = korDate.getUTCHours();

  if (currentHour < 3) {
    return new Date(todayDate.getTime() - 1 * 3600 * 1000);
  }

  // 02:00, 05:00, 08:00, 11:00, 14:00, 17:00, 20:00, 23:00
  let minHour = 2;
  for (let baseHour = 2; baseHour < 23; baseHour += 3) {
    // Base time 기준 한 시간 뒤 부터의 정보를 얻어오므로.. +1
    if (baseHour + 1 <= currentHour) {
      minHour = baseHour;
    }
  }
  return new Date(todayDate.getTime() + minHour * 3600 * 1000);
}

export async function getVilageFcstBeachToday(beachNum) {
  const baseDate = getNearestBaseDate();
  const dateString = baseDate
    .toISOString()
    .split('T')[0]
    .replaceAll('-', '');
    
  const timeString = baseDate.toISOString().substr(11, 5).replace(':', '');
  const result = await axios({
    method: 'get',
    url: 'https://apis.data.go.kr/1360000/BeachInfoservice/getVilageFcstBeach',
    headers: { Accept: '*/*' },
    params: {
      serviceKey: BEACH_INFO_SERVICE_KEY,
      numOfRows: 5000,
      pageNo: 1,
      dataType: 'JSON',
      base_date: dateString,
      base_time: timeString,
      beach_num: beachNum,
    },
  });

  const dataArray = result.data.response.body.items.item;
  const startTime = new Date(
    getTodayDate().getTime() + new Date().getHours() * 3600 * 1000,
  ).getTime();
  const endTime = new Date(startTime + 24 * 3600 * 1000).getTime();

  // 현재 시간 이후 ~ 내일 현재시간 까지의 데이터 가져오기
  const parsingDataArray = [];
  for (let i = 0; i < dataArray.length; i++) {
    const fcstDate = dataArray[i].fcstDate;
    const fcstHour = dataArray[i].fcstTime.substring(0, 2);
    const currentDateString =
      fcstDate.substring(0, 4) +
      '-' +
      fcstDate.substring(4, 6) +
      '-' +
      fcstDate.substring(6, 8);
    const currentTime = new Date(
      new Date(currentDateString).getTime() + fcstHour * 3600 * 1000,
    ).getTime();
    if (startTime <= currentTime && currentTime <= endTime) {
      parsingDataArray.push(dataArray[i]);
    }
  }
  return parsingDataArray;
}
