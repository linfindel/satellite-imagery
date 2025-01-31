const imagerySources = {
  "esri-clarity": "https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  "esri": "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
}

const locationSelection = [
  [-3.309120512165984, -60.220870971679695],
  [21.152716314425867, -11.393508911132812],
  [21.934884992425484, 89.40656661987306],
  [-6.6156712302649225, 142.85076141357425],
  [-25.45074229846076, 152.93979559923332],
  [21.626767700868484, 276.8094420433045 - 360],
  [55.345574754808545, 358.3884376528723 - 360],
  [40.82087324226509, 374.4262504577637 - 360],
  [26.174542758741925, 416.3131713867188 - 360],
  [38.988447785159956, 485.71537256240845 - 360],
  [36.12120223708309, 100.76582908630373],
  [65.75587372557506, 191.02684020996094 - 360],
  [64.0965074057439, 232.20977783203128 - 360],
  [38.87031172465583, 282.94444799423223 - 360],
  [-5.333823362859549, 432.2448921203614 - 360],
  [-5.315086182369987, 482.898817062378 - 360],
  [-38.272309504234414, 504.76873397827154 - 360],
  [53.02001757953686, 365.2067685127259 - 360],
  [53.181234389255614, 365.101870726021 - 360],
  [16.06292873127318, -319.94183063507086 + 360]
];

const zooms = [
  14,
  11,
  14,
  12,
  14,
  17,
  17,
  15,
  10,
  17,
  14,
  11,
  10,
  16,
  14,
  15,
  16,
  16,
  14,
  15
];

let geoJSONStyle = {};

let savedLocation = localStorage.getItem("location");
if (savedLocation != null) {
  savedLocation = savedLocation.split(",");
  savedLocation = [Number(savedLocation[0]), Number(savedLocation[1])];
}

const randomLocationID = Math.floor(Math.random() * locationSelection.length);

const map = L.map('map').setView(savedLocation || locationSelection[randomLocationID], localStorage.getItem("zoom") || zooms[randomLocationID] || 14);
if (localStorage.getItem("imagery") != "custom") {
  L.tileLayer(imagerySources[localStorage.getItem("imagery")] || 'https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 22,
  }).addTo(map);
}

else {
  L.tileLayer(localStorage.getItem("custom-imagery"), {
    maxZoom: 22,
  }).addTo(map);
}

function updateCoords(e) {
  const lat = e.latlng.lat.toFixed(5);
  const lng = e.latlng.lng.toFixed(5);
  const coordsString = `${lat}, ${lng}`;
  document.getElementById('coords').value = coordsString;
}

map.on('mousemove', updateCoords);

setInterval(() => {
  let location = map.getCenter();
  location = `${location.lat},${location.lng}`;

  console.log(location, map.getZoom());

  localStorage.setItem("location", location);
  localStorage.setItem("zoom", map.getZoom());
}, 1000);

function resetModal() {
  const modal = document.createElement("div");
  modal.className = "card centre";
  modal.id = "reset-modal";
  modal.innerHTML = `
    <h1>Delete data?</h1>
    <p>This will reset your saved location and preferred imagery source</p>

    <div class="row">
      <button onclick="reset()">Reset data</button>
      <button onclick="cancelReset()">Cancel</button>
    </div>
  `;

  modal.style.opacity = "0";
  modal.style.transition = "0.25s ease";

  document.body.appendChild(modal);

  // Timeout is a workaround for fade-in not triggering synchronously
  setTimeout(() => {
    modal.style.opacity = "1";
  });

  setPointerEvents("none");
}

function reset() {
  localStorage.clear();

  document.getElementById("reset-modal").style.opacity = "0";

  setTimeout(() => {
    location.reload()
  }, 250);
}

function cancelReset() {
  setPointerEvents("all");

  document.getElementById("reset-modal").style.opacity = "0";

  setTimeout(() => {
    document.getElementById("reset-modal").remove();
  }, 250);
}

function imagerySourceSidebar() {
  if (document.getElementById("sidebar")) {
    document.getElementById("sidebar").style.opacity = "0";
    document.getElementById("imagery").innerText = "Settings";

    setTimeout(() => {
      document.getElementById("sidebar").remove();
    }, 250);
  }

  else {
    document.getElementById("imagery").innerText = "Close sidebar";

    const sidebar = document.createElement("div");
    sidebar.className = "sidebar";
    sidebar.id = "sidebar";
    sidebar.innerHTML = `
      <h1>Imagery source</h1>

      <div class="column">
        <button id="esri-clarity" onclick="setImagery('esri-clarity')">Esri Clarity Beta</button>
        <button id="esri" onclick="setImagery('esri')">Esri</button>
        <input id="custom" onchange="setImagery('custom')" onclick="setImagery('custom')" placeholder="Custom tileset URL">
      </div>

      <p></p>
      
      <button id="borders" onclick="toggleBorders()">${borders == null ? "Show borders" : "Hide borders"}</button>

      <h1>GeoJSON</h1>

      <div class="column">
        <input oninput="updateGeoJSONStyle()" id="geojson-colour" type="text" placeholder="Colour">
        <input oninput="updateGeoJSONStyle()" id="geojson-weight" type="number" placeholder="Weight">
        <input oninput="updateGeoJSONStyle()" id="geojson-opacity" type="number" placeholder="Opacity">
        <hr style="width: 100%; border-color: rgba(0, 0, 0, 0.25);">
        <button id="upload-geojson" onclick="uploadGeoJSON()">Upload GeoJSON file</button>
      </div>

      <p style="margin-top: auto;">Made with <img src="blobcat.png" alt="A cute illustrated cat holding a large heart" style="height: 2.5rem; transform: translateY(0.5rem)"> by <a href="https://linfindel.github.io" target="_blank">Cirilla</a></p>
    `;

    sidebar.style.opacity = "0";
    sidebar.style.transition = "0.25s ease";

    document.body.appendChild(sidebar);

    if (localStorage.getItem("custom-imagery")) {
      document.getElementById("custom").value = localStorage.getItem("custom-imagery");
    }

    setTimeout(() => {
      sidebar.style.opacity = "1";
    });
  }
}

setInterval(() => {
  if (document.getElementById("sidebar")) {
    if (localStorage.getItem("imagery") == "esri") {
      document.getElementById("esri").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      document.getElementById("esri-clarity").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
      document.getElementById("custom").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
    }

    else if (localStorage.getItem("imagery") == "esri-clarity" || !localStorage.getItem("imagery")) {
      document.getElementById("esri-clarity").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      document.getElementById("esri").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
      document.getElementById("custom").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
    }

    else {
      document.getElementById("custom").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      document.getElementById("esri-clarity").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
      document.getElementById("esri").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
    }
  }
}, 100);

function setPointerEvents(value) {
  document.getElementById("reset").style.pointerEvents = value;
  document.getElementById("imagery").style.pointerEvents = value;
  document.getElementById("map").style.pointerEvents = value;
}

function setImagery(imagery) {
  if (imagery != "custom") {
    L.tileLayer(imagerySources[imagery], {
      maxZoom: 22,
    }).addTo(map);
  }

  else {
    localStorage.setItem("custom-imagery", document.getElementById("custom").value);

    L.tileLayer(localStorage.getItem("custom-imagery"), {
      maxZoom: 22,
    }).addTo(map);
  }

  localStorage.setItem("imagery", imagery)
}

document.addEventListener("keyup", (e) => {
  e.preventDefault();
  e.key = e.key.toLowerCase();

  if (e.key == " ") {
    screenshotMode();
  }
})

function screenshotMode() {
  if (document.getElementById("bottom-row").style.opacity == 1) {
    document.getElementById("bottom-row").style.opacity = 0;

    if (document.getElementById("sidebar")) {
      document.getElementById("sidebar").style.opacity = 0;
    }

    setPointerEvents("none");

    const popup = document.createElement("div");
    popup.className = "card centre";
    popup.innerHTML = "<p>Press Space to exit screenshot mode</p>";
    popup.style.opacity = "0";
    popup.style.transition = "0.25s ease";

    document.body.appendChild(popup);

    setTimeout(() => {
      popup.style.opacity = "1";
    });

    setTimeout(() => {
      popup.style.opacity = "0";

      setTimeout(() => {
        popup.remove();
      }, 250);
    }, 2000);
  }

  else {
    document.getElementById("bottom-row").style.opacity = 1;

    if (document.getElementById("sidebar")) {
      document.getElementById("sidebar").style.opacity = 1;
    }

    setPointerEvents("all");
  }
}

function uploadGeoJSON() {
  let input = document.createElement("input");
  input.type = "file";
  input.accept = ".geojson";
  input.onchange = () => {
    let file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
          const geojsonData = JSON.parse(event.target.result);
          L.geoJSON(geojsonData, {style: geoJSONStyle}).addTo(map);
      };
      reader.readAsText(file);
    }
  }

  input.click();
}

function updateGeoJSONStyle() {
  geoJSONStyle = {
    "color": document.getElementById("geojson-colour").value,
    "weight": document.getElementById("geojson-weight").value,
    "opacity": document.getElementById("geojson-opacity").value
  }
}

function goToCoords() {
  const coords = document.getElementById("coords").value;

  if (coords.match(/^-?\d+\.\d+,\s*-?\d+\.\d+$/)) {
    let coordsParts = coords.split(",");
    map.setView([coordsParts[0], coordsParts[1]], 14);
  }

  else if (coords.match(/^([-+]?\d+\.\d+)°([NS]),\s*([-+]?\d+\.\d+)°([EW])$/)) {
    const match = coords.match(/^([-+]?\d+\.\d+)°([NS]),\s*([-+]?\d+\.\d+)°([EW])$/);
    
    const lat = parseFloat(match[1]);
    const latDirection = match[2];

    const lon = parseFloat(match[3]);
    const lonDirection = match[4];

    const decimalLat = latDirection === 'N' ? lat : -lat;
    const decimalLon = lonDirection === 'E' ? lon : -lon;

    map.setView([decimalLat, decimalLon], 14);
  }

  else if (coords.match(/^(\d{1,3})°(\d{1,2})'(\d{1,2})"([NSEW])\s*,\s*(\d{1,3})°(\d{1,2})'(\d{1,2})"([NSEW])$/)) {
    const match = coords.match(/^(\d{1,3})°(\d{1,2})'(\d{1,2})"([NSEW])\s*,\s*(\d{1,3})°(\d{1,2})'(\d{1,2})"([NSEW])$/);

    const latDegrees = parseInt(match[1]);
    const latMinutes = parseInt(match[2]);
    const latSeconds = parseInt(match[3]);
    const latDirection = match[4];

    const lonDegrees = parseInt(match[5]);
    const lonMinutes = parseInt(match[6]);
    const lonSeconds = parseInt(match[7]);
    const lonDirection = match[8];

    const latitude = latDegrees + (latMinutes / 60) + (latSeconds / 3600);
    const longitude = lonDegrees + (lonMinutes / 60) + (lonSeconds / 3600);

    const finalLatitude = latDirection === 'S' ? -latitude : latitude;
    const finalLongitude = lonDirection === 'W' ? -longitude : longitude;

    map.setView([finalLatitude, finalLongitude], 14);
  }

  else if (coords.match(/^(\d{1,2})°(\d{1,2}\.\d{1,2})'([NS]),\s*(\d{1,3})°(\d{1,2}\.\d{1,2})'([EW])$/)) {
    const match = coords.match(/^(\d{1,2})°(\d{1,2}\.\d{1,2})'([NS]),\s*(\d{1,3})°(\d{1,2}\.\d{1,2})'([EW])$/);

    const latDegrees = parseFloat(match[1]);
    const latMinutes = parseFloat(match[2]);
    const latDirection = match[3];

    const lonDegrees = parseFloat(match[4]);
    const lonMinutes = parseFloat(match[5]);
    const lonDirection = match[6];

    let decimalLat = latDegrees + (latMinutes / 60);
    let decimalLon = lonDegrees + (lonMinutes / 60);

    if (latDirection === 'S') {
        decimalLat *= -1;
    }
    if (lonDirection === 'W') {
        decimalLon *= -1;
    }

    map.setView([decimalLat, decimalLon], 14);
  }

  else if (coords == "") {
   // 
  }

  else {
    alert("Invalid coordinates");
  }
}

let bordersGeoJSON;
let borders;

fetch("countries.geojson")
.then(response => response.json())
.then(data => {
  bordersGeoJSON = data;
})

function toggleBorders() {
  if (borders == null) {
    borders = L.geoJSON(bordersGeoJSON, {style: {color: "#ffffff", fillColor: "transparent", weight: 2.5}}).addTo(map);
    document.getElementById("borders").innerText = "Hide borders";
  }

  else {
    borders.remove()
    borders = null;

    document.getElementById("borders").innerText = "Show borders";
  }
}