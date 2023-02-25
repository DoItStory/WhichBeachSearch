const SERVICE_KEY =
  'eTqUdHesp39gFph5ZF9X2Un9Gwl6wkbWDYU/YOw2CloSW5R6T6wwB/DyVYih+LmcS4Ju9Ved7QiQ189qJU03sw==';

export async function getRequestMidLandFcst(cityCode, baseDateTime) {
  const result = await axios({
    method: 'get',
    url: 'http://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst',
    headers: { Accept: '*/*' },
    params: {
      serviceKey: SERVICE_KEY,
      numOfRows: 10,
      pageNo: 1,
      dataType: 'JSON',
      regId: cityCode,
      tmFc: baseDateTime,
    },
  });
  return result.data.response.body.items.item;
}

export async function getRequestMidTiaFcst(cityCode, baseDateTime) {
  const result = await axios({
    method: 'get',
    url: 'http://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa',
    headers: { Accept: '*/*' },
    params: {
      serviceKey: SERVICE_KEY,
      numOfRows: 10,
      pageNo: 1,
      dataType: 'JSON',
      regId: cityCode,
      tmFc: baseDateTime,
    },
  });
  return result.data.response.body.items.item;
}
