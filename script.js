let savedLocation = localStorage.getItem("location");
savedLocation = savedLocation.split(",");
savedLocation = [Number(savedLocation[0]), Number(savedLocation[1])];
console.log(savedLocation);

const map = L.map('map').setView(savedLocation || [0.628118,-50.199234], localStorage.getItem("zoom") || 13);
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