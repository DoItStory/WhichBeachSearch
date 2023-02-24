const SERVICE_KEY =
  'eTqUdHesp39gFph5ZF9X2Un9Gwl6wkbWDYU/YOw2CloSW5R6T6wwB/DyVYih+LmcS4Ju9Ved7QiQ189qJU03sw==';

export function xmlToJson(xml) {
  let obj = {};
  if (xml.nodeType == 1) {
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        let attribute = xml.attributes.item(j);
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType == 3) {
    obj = xml.nodeValue;
  }

  let textNodes = [].slice.call(xml.childNodes).filter(function (node) {
    return node.nodeType === 3;
  });
  if (xml.hasChildNodes() && xml.childNodes.length === textNodes.length) {
    obj = [].slice.call(xml.childNodes).reduce(function (text, node) {
      return text + node.nodeValue;
    }, '');
  } else if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      let item = xml.childNodes.item(i);
      let nodeName = item.nodeName;
      if (typeof obj[nodeName] == 'undefined') {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof obj[nodeName].push == 'undefined') {
          let old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
}

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
