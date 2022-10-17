import { ERROR } from '../../../js/error.js';
import { getBaechDataListArray } from '../../main/js/beachDataBase.js';

const mapContainer = document.getElementById('map__container');
const searchInputValue = document.getElementById('search-form__input');
const searchFormSubmit = document.getElementById('search-form__submit');

function initializationMap() {
  try {
    const options = {
      center: new kakao.maps.LatLng(35.15723495522564, 129.13830306583512), //지도 중심좌표.
      level: 7,
    };
    const map = new kakao.maps.Map(mapContainer, options);
    return map;
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(`${ERROR.UNKNOWN_ERROR} ${errorCode}: ${errorMessage}`);
  }
}

function loadMapScreen() {
  getBaechDataListArray()
    .then(beachData => {
      printMarkersMap(beachData, map);
      const urlParams = new URLSearchParams(window.location.search);
      mainToMoverMap(urlParams);
      searchFormSubmit.addEventListener('click', async function (event) {
        if (event) {
          event.preventDefault();
          searchPlaces(beachData);
        }
      });
      history.replaceState({}, null, location.pathname);
    })
    .catch(error => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(`${ERROR.UNKNOWN_ERROR} ${errorCode}: ${errorMessage}`);
    });
}

function mainToMoverMap(urlParameter) {
  const BeachLocation = {
    lat: urlParameter.get('sendLat'),
    lon: urlParameter.get('sendLon'),
  };
  if (BeachLocation.lat === null && BeachLocation.lon === null) {
    BeachLocation.lat = 35.1584224777778;
    BeachLocation.lon = 129.160646111111;
    return moveMarkCenter(BeachLocation);
  }

  if (BeachLocation.lat != '' && BeachLocation.lon != '') {
    return moveMarkCenter(BeachLocation);
  }
}

// 키워드 검색을 요청하는 함수입니다
function searchPlaces(beachData) {
  const searchValue = searchInputValue.value;
  try {
    if (!searchValue) {
      throw Error(ERROR.SEARCH_VALUE_NOT_ENTERED);
    }
    findEnteredBeachName(searchValue, beachData);
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(`${errorCode}: ${errorMessage}`);
  }
}

// 데이터 베이스에서 키워드를 찾는 함수입니다
function findEnteredBeachName(inputValue, beachData) {
  try {
    const foundBeachData = beachData.find(beach =>
      beach.beachName.startsWith(inputValue),
    );
    if (!foundBeachData) {
      throw Error(ERROR.SEARCH_VALUE_NOT_FOUND);
    }
    moveMarkCenter(foundBeachData);
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(`${errorCode}: ${errorMessage}`);
  }
}

// 검색된 해변으로 화면을 이동해주는 함수입니다.
function moveMarkCenter(beachData) {
  try {
    const moveLatLon = new kakao.maps.LatLng(beachData.lat, beachData.lon);
    map.panTo(moveLatLon);
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(`${ERROR.UNKNOWN_ERROR} ${errorCode}: ${errorMessage}`);
  }
}

function printMarkersMap(beachData, map) {
  try {
    for (let data of beachData) {
      const marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(data.lat, data.lon),
        title: data.name,
        image: insertMarkerImage(),
      });
      marker.setMap(map);

      kakao.maps.event.addListener(marker, 'click', function () {
        createInfoWindows(data).open(map, marker);
      });
    }
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(`${ERROR.UNKNOWN_ERROR} ${errorCode}: ${errorMessage}`);
  }
}

function insertMarkerImage() {
  try {
    const imageSrc = '/assets/images/pin.png';
    const imageSize = new kakao.maps.Size(30, 34);
    const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
    return markerImage;
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(`${ERROR.UNKNOWN_ERROR} ${errorCode}: ${errorMessage}`);
  }
}

function createInfoWindows(beachData) {
  try {
    const infoWindowContent = `<div class="info-window">
    <div class="info-title">
      <h3 class="info-name">
        ${beachData.beachName}
      </h3>
      <a href='../main/main.html?sendBeachCode=${beachData.beachCode}'>상세 정보</a>
    </div>
  </div>`;
    const infoWindowPosition = beachData.latlng;
    const infoWindowRemoveable = true;
    const infoWindow = new kakao.maps.InfoWindow({
      position: infoWindowPosition,
      content: infoWindowContent,
      removable: infoWindowRemoveable,
    });
    return infoWindow;
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(`${ERROR.UNKNOWN_ERROR} ${errorCode}: ${errorMessage}`);
  }
}

const map = initializationMap();
loadMapScreen();
