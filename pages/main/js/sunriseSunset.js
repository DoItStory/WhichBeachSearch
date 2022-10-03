import { xmlToJson } from './mediumTermForecast.js';

const RISE_SET_INFO_SERVICE_KEY =
  'c49IwM1m6ZGmj8bTICkOnONZr9f2dmu32k9bP2DGr8v5X7BtIeA%2FiAhEVRaiuc05bCbvyegzV%2BA7GSL59xO4pg%3D%3D';

export async function getLCRiseSetInfo(lonString, latString, dateString) {
  const url =
    'http://apis.data.go.kr/B090041/openapi/service/RiseSetInfoService/getLCRiseSetInfo';
  const reqURL =
    url +
    '?serviceKey=' +
    RISE_SET_INFO_SERVICE_KEY +
    `&longitude=${lonString}&latitude=${latString}&locdate=${dateString}&dnYn=Y`;
  const response = await fetch(reqURL);
  const xmlString = await response.text();
  const XmlNode = new DOMParser().parseFromString(xmlString, 'text/xml');
  const resultJSON = xmlToJson(XmlNode);
  return resultJSON;
}
