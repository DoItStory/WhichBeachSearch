const mapContainer = document.getElementById('map__container');
const options = {
  center: new kakao.maps.LatLng(35.15723495522564, 129.13830306583512), //지도 중심좌표.
  level: 7,
};
const map = new kakao.maps.Map(mapContainer, options);

function printMarkersMap(beachList) {
  for (let i = 0; i < beachList.length; i++) {
    const marker = new kakao.maps.Marker({
      map: map, // 마커를 표시할 지도
      position: beachList[i].latlng, // 마커를 표시할 위치
      title: beachList[i].name, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
    });
    marker.setMap(map);
  }
}

// 가상의(테스트) 데이터를 받아온다는 설정으로 작성 함.
function testData() {
  const testData = [];
  const TEST_BEACH_1 = {
    name: '해운대 해수욕장',
    address: '',
    latlng: new kakao.maps.LatLng(35.1584224777778, 129.160646111111),
  };
  const TEST_BEACH_2 = {
    name: '광안리 해수욕장',
    address: '',
    latlng: new kakao.maps.LatLng(35.1535555555556, 129.119405555556),
  };
  testData.push(TEST_BEACH_1);
  testData.push(TEST_BEACH_2);
  return testData;
}

const positions = testData();
printMarkersMap(positions);
