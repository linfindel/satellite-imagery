let savedLocation = localStorage.getItem("location");
if (savedLocation != null) {
  savedLocation = savedLocation.split(",");
  savedLocation = [Number(savedLocation[0]), Number(savedLocation[1])];
  console.log(savedLocation);
}

const map = L.map('map').setView(savedLocation || [-3.309120512165984,-60.220870971679695], localStorage.getItem("zoom") || 14);
L.tileLayer('https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 22,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

setInterval(() => {
  let location = map.getCenter();
  location = `${location.lat},${location.lng}`;

  localStorage.setItem("location", location);
  localStorage.setItem("zoom", map.getZoom());
}, 1000);