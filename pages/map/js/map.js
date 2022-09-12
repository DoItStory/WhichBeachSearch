const mapContainer = document.getElementById('map__container');
const INFO_WINDOW_CLASS = 'info-window';
const INFO_WINDOW_BEACH_NAME_CLASS = 'info-window__beach-name';
const INFO_WINDOW_BEACH_ADDRESS_CLASS = 'info-window__beach-address';

const options = {
  center: new kakao.maps.LatLng(35.15723495522564, 129.13830306583512), //지도 중심좌표.
  level: 7,
};
const map = new kakao.maps.Map(mapContainer, options);

function createMarkerImage() {
  const imageSrc = '/assets/images/pin.png';
  const imageSize = new kakao.maps.Size(30, 34);
  const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
  return markerImage;
}

function printMarkersMap(beachList) {
  for (let i = 0; i < beachList.length; i++) {
    const marker = new kakao.maps.Marker({
      map: map, // 마커를 표시할 지도
      position: beachList[i].latlng, // 마커를 표시할 위치
      title: beachList[i].name, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
      image: createMarkerImage(),
    });
    marker.setMap(map);

    kakao.maps.event.addListener(marker, 'click', function () {
      createInfoWindows(beachList[i]).open(map, marker);
    });
  }
}

function createInfoWindows(beachData) {
  const iwContent = `<div class="info-window">
  <div class="info-title">
    <h3 class="info-name">
      ${beachData.name}
    </h3>
    <a href=''>상세 정보</a>
  </div>
  <div class="info-weather">
    <span>${beachData.temp}</span>
    <span>${beachData.icon}</span>
  </div>
</div>`;
  const iwPosition = beachData.latlng;
  const iwRemoveable = true;
  const infowindow = new kakao.maps.InfoWindow({
    position: iwPosition,
    content: iwContent,
    removable: iwRemoveable,
  });
  return infowindow;
}

// 가상의(테스트) 데이터를 받아온다는 설정으로 작성 함.
function testData() {
  const testData = [];
  const TEST_BEACH_1 = {
    name: '해운대 해수욕장',
    temp: '현재 27°',
    icon: '☀️',
    latlng: new kakao.maps.LatLng(35.1584224777778, 129.160646111111),
  };
  const TEST_BEACH_2 = {
    name: '광안리 해수욕장',
    temp: '현재 25°',
    icon: '🌧',
    latlng: new kakao.maps.LatLng(35.1535555555556, 129.119405555556),
  };
  testData.push(TEST_BEACH_1);
  testData.push(TEST_BEACH_2);
  return testData;
}

const positions = testData();
printMarkersMap(positions);
