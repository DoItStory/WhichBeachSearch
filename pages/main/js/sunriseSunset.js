const RISE_SET_INFO_SERVICE_KEY =
  'c49IwM1m6ZGmj8bTICkOnONZr9f2dmu32k9bP2DGr8v5X7BtIeA%2FiAhEVRaiuc05bCbvyegzV%2BA7GSL59xO4pg%3D%3D';

const SERVICE_KEY =
  'c49IwM1m6ZGmj8bTICkOnONZr9f2dmu32k9bP2DGr8v5X7BtIeA/iAhEVRaiuc05bCbvyegzV+A7GSL59xO4pg==';

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

export async function getLCRiseSetInfo(lonString, latString, dateString) {
  const result = await axios({
    method: 'get',
    url: 'http://apis.data.go.kr/B090041/openapi/service/RiseSetInfoService/getLCRiseSetInfo',
    headers: { Accept: '*/*' },
    params: {
      serviceKey: SERVICE_KEY,
      longitude: lonString,
      latitude: latString,
      locdate: dateString,
      dnYn: 'Y',
    },
  });

  const xmlNode = new DOMParser().parseFromString(result.data, 'text/xml');
  const resultJSON = xmlToJson(xmlNode);
  return resultJSON.response.body.items.item;
}
