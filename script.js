const imagerySources = {
  "esri-clarity": "https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  "esri": "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
}

const locationSelection = [
  [-3.309120512165984,-60.220870971679695]
]

let savedLocation = localStorage.getItem("location");
if (savedLocation != null) {
  savedLocation = savedLocation.split(",");
  savedLocation = [Number(savedLocation[0]), Number(savedLocation[1])];
  console.log(savedLocation);
}

const map = L.map('map').setView(savedLocation || [-3.309120512165984,-60.220870971679695], localStorage.getItem("zoom") || 14);
L.tileLayer(imagerySources[localStorage.getItem("imagery")] || 'https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 22,
}).addTo(map);

setInterval(() => {
  let location = map.getCenter();
  location = `${location.lat},${location.lng}`;

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
    document.getElementById("imagery").innerText = "Imagery source";

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
        <button onclick="setImagery('esri-clarity')">Esri Clarity Beta</button>
        <button onclick="setImagery('esri')">Esri</button>
      </div>
    `;

    sidebar.style.opacity = "0";
    sidebar.style.transition = "0.25s ease";

    document.body.appendChild(sidebar);

    setTimeout(() => {
      sidebar.style.opacity = "1";
    });
  }
}

function setPointerEvents(value) {
  document.getElementById("reset").style.pointerEvents = value;
  document.getElementById("imagery").style.pointerEvents = value;
  document.getElementById("map").style.pointerEvents = value;
}

function setImagery(imagery) {
  L.tileLayer(imagerySources[imagery], {
    maxZoom: 22,
  }).addTo(map);

  localStorage.setItem("imagery", imagery)
}