const mapContainer = document.getElementById('map__container');
const searchInputValue = document.getElementById('search-form__input');
const searchFormSubmit = document.getElementById('search-form__submit');

function initializationMap() {
  const options = {
    center: new kakao.maps.LatLng(35.15723495522564, 129.13830306583512), //지도 중심좌표.
    level: 7,
  };
  const map = new kakao.maps.Map(mapContainer, options);
  return map;
}

function loadMapScreen() {
  try {
    const beachDataBase = testData();
    printMarkersMap(beachDataBase, map);
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
  }
}

// 키워드 검색을 요청하는 함수입니다
function searchPlaces(event) {
  event.preventDefault();
  const searchValue = searchInputValue.value;
  try {
    if (!searchValue) {
      throw Error('검색하시려는 해변의 이름을 입력해주세요.');
    }
    findEnteredBeachName(searchValue);
  } catch (error) {
    const errorMessage = error.message;
    alert(`${errorMessage}`);
  }
}

// 데이터 베이스에서 키워드를 찾는 함수입니다
function findEnteredBeachName(inputValue) {
  const beachDataBase = testData();
  const foundBeachData = beachDataBase.find(beach =>
    beach.name.startsWith(inputValue),
  );
  if (!foundBeachData) {
    throw Error('검색하신 해변을 찾을 수 없습니다. 다시 입력해주세요.');
  }
  moveMarkCenter(foundBeachData);
}

// 검색된 해변으로 화면을 이동해주는 함수입니다.
function moveMarkCenter(beachData) {
  const moveLatLon = beachData.latlng;
  map.panTo(moveLatLon);
}

function printMarkersMap(beachList, map) {
  for (let i = 0; i < beachList.length; i++) {
    const marker = new kakao.maps.Marker({
      map: map,
      position: beachList[i].latlng,
      title: beachList[i].name,
      image: insertMarkerImage(),
    });
    marker.setMap(map);

    kakao.maps.event.addListener(marker, 'click', function () {
      createInfoWindows(beachList[i]).open(map, marker);
    });
  }
}

function insertMarkerImage() {
  const imageSrc = '/assets/images/pin.png';
  const imageSize = new kakao.maps.Size(30, 34);
  const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
  return markerImage;
}

function createInfoWindows(beachData) {
  const infoWindowContent = `<div class="info-window">
  <div class="info-title">
    <h3 class="info-name">
      ${beachData.name}
    </h3>
    <a href='../main/main.html?sendBeachName=${beachData.name}&sendBeachAddress=${beachData.address}'>상세 정보</a>
  </div>
  <div class="info-weather">
    <span>${beachData.temp}</span>
    <span>${beachData.icon}</span>
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
}

// 가상의(테스트) 데이터를 받아온다는 설정으로 작성 함.
function testData() {
  const testData = [];
  const TEST_BEACH_1 = {
    name: '해운대 해수욕장',
    address: '부산광역시 해운대구 우동',
    temp: '현재 27°',
    icon: '☀️',
    latlng: new kakao.maps.LatLng(35.1584224777778, 129.160646111111),
  };
  const TEST_BEACH_2 = {
    name: '광안리 해수욕장',
    address: '부산광역시 해운대구 우동',
    temp: '현재 25°',
    icon: '🌧',
    latlng: new kakao.maps.LatLng(35.1535555555556, 129.119405555556),
  };
  testData.push(TEST_BEACH_1);
  testData.push(TEST_BEACH_2);
  return testData;
}

const map = initializationMap();
loadMapScreen();
searchFormSubmit.addEventListener('click', searchPlaces);
