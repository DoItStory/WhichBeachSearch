const mapContainer = document.getElementById('map__container');

const options = {
  center: new kakao.maps.LatLng(35.15723495522564, 129.13830306583512), //지도 중심좌표.
  level: 7,
};

const map = new kakao.maps.Map(mapContainer, options);
