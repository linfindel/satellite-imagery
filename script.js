const imagerySources = {
  "esri-clarity": "https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  "esri": "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  "google-satellite": "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  "google-hybrid": "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
}

let borders = null;
let bordersGeoJSON = null;
let borderStreamPercentage = 0;
let geoJSONStyle = {};

let savedLocation = localStorage.getItem("location");
if (savedLocation != null) {
  savedLocation = savedLocation.split(",");
  savedLocation = [Number(savedLocation[0]), Number(savedLocation[1])];
}

const map = L.map('map').setView(savedLocation || [20, 0], localStorage.getItem("zoom") || 3);
if (localStorage.getItem("imagery") != "custom") {
  L.tileLayer(imagerySources[localStorage.getItem("imagery")] || 'https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 22,
    noWrap: true
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
        <button id="google-satellite" onclick="setImagery('google-satellite')">Google Satellite</button>
        <button id="google-hybrid" onclick="setImagery('google-hybrid')">Google Hybrid</button>
        <input id="custom" onchange="setImagery('custom')" onclick="setImagery('custom')" placeholder="Custom tileset URL">
      </div>

      <p></p>
      
      <button ${bordersGeoJSON == null ? "disabled" : ""} id="borders" onclick="toggleBorders()">${bordersGeoJSON == null ? "Downloading borders..." : (borders == null ? "Show borders" : "Hide borders")}</button>

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
      document.getElementById("google-hybrid").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
      document.getElementById("google-satellite").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
      document.getElementById("custom").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
    }

    else if (localStorage.getItem("imagery") == "esri-clarity" || !localStorage.getItem("imagery")) {
      document.getElementById("esri-clarity").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      document.getElementById("esri").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
      document.getElementById("google-hybrid").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
      document.getElementById("google-satellite").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
      document.getElementById("custom").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
    }

    else if (localStorage.getItem("imagery") == "google-satellite") {
      document.getElementById("google-satellite").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      document.getElementById("esri").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
      document.getElementById("esri-clarity").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
      document.getElementById("google-hybrid").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
      document.getElementById("custom").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
    }

    else if (localStorage.getItem("imagery") == "google-hybrid") {
      document.getElementById("google-hybrid").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      document.getElementById("esri").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
      document.getElementById("esri-clarity").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
      document.getElementById("google-satellite").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
      document.getElementById("custom").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
    }

    else {
      document.getElementById("custom").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      document.getElementById("esri-clarity").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
      document.getElementById("esri").style.backgroundColor = "rgba(0, 0, 0, 0.25)";
    }

    try {
      if (bordersGeoJSON != null) {
        document.getElementById("borders").innerText = borders == null ? "Show borders" : "Hide borders";
        document.getElementById("borders").removeAttribute("disabled");
      }
  
      else {
        document.getElementById("borders").innerText = `Downloading borders... ${borderStreamPercentage}%`;
      }
    }

    catch {
      //
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
    document.getElementById("coords").style.opacity = 0;

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
    document.getElementById("coords").style.opacity = 1;

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

const geoJsonStream = new ReadableStream({
  async start(controller) {
    try {
      const response = await fetch("countries.geojson");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const contentLength = response.headers.get("Content-Length");
      const totalBytes = contentLength ? parseInt(contentLength, 10) : null;
      let loadedBytes = 0;

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        loadedBytes += value.length;
        if (totalBytes) {
          borderStreamPercentage = Math.round((loadedBytes / totalBytes) * 100);
        }

        chunks.push(decoder.decode(value, { stream: true }));
        controller.enqueue(value);
      }

      bordersGeoJSON = JSON.parse(chunks.join(''));
      controller.close();
    } catch (error) {
      controller.error(error);
    }
  }
});

const reader = geoJsonStream.getReader();
reader.read().then(function processText({ done, value }) {
  if (done) {
    console.log("Finished reading the borders GeoJSON stream");
    return;
  }

  return reader.read().then(processText);
});


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