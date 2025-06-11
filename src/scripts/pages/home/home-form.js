import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import HomePresenter from './HomePresenter.js';
import { toLonLat } from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import Overlay from 'ol/Overlay';

export default class HomeForm {
  constructor() {
    this.storyPresenter = new HomePresenter(this);
    this.refreshCameraList = this.refreshCameraList.bind(this);
    this.activeStream = null;
    this.locationMarker = null;
    this.mapInstance = null;
  }

  async render() {
    const formTemplate = `
      <section class="container">
        <form id="storyForm" aria-labelledby="formTitle">
          <h2 id="formTitle" class="gradient-title">Add New Story</h2>
          <label for="photo">Upload Foto</label>
          <div class="file-camera-wrapper">
            <input type="file" name="photo" id="photo" accept="image/*" required aria-label="Pilih foto cerita" />
            <button type="button" id="showCameraBtn" aria-label="Tampilkan kamera">
              <i class="fas fa-camera"></i>
            </button>
          </div>
          <div id="cameraSection" style="display: none;">
            <label for="cameraSelect">Pilih Kamera</label>
            <select id="cameraSelect"></select>
            <video id="cameraStream" autoplay playsinline style="width: 100%; max-height: 200px;"></video>
            <button type="button" id="capturePhoto">Ambil Foto</button>
            <button type="button" id="retakePhoto" style="display: none;" aria-label="Ambil ulang foto">Ambil Ulang Foto</button>
            <button type="button" id="stopCamera" style="margin-left: 8px;">Nonaktifkan Kamera</button>
            <canvas id="capturedCanvas" style="display:none;"></canvas>
          </div>
          <label for="description">Deskripsi Cerita</label>
          <textarea name="description" id="description" placeholder="Tulis deskripsi cerita..." required aria-label="Tulis deskripsi cerita"></textarea>
          <label for="map">Pilih Lokasi (gunakan peta)</label>
          <label for="mapStyle">Tampilan Peta</label>
            <select id="mapStyle">
                <option value="osm">OpenStreetMap</option>
                <option value="satellite">Satelit</option>
            </select>
          <div id="mapContainer" style="position: relative; height: 200px;">
            <div id="map" style="width:100%; height:100%;"></div>
              <div id="formPopup" class="ol-popup">
               <div class="popup-content">Lokasi dipilih</div>
              </div>
          </div>
          <input type="hidden" id="lat" name="lat">
          <input type="hidden" id="lon" name="lon">
          <button type="submit" aria-label="Post Your Story">Post Story</button>
        </form>
      </section>
    `;
    return formTemplate;
  }

  async afterRender() {
    this.storyPresenter.view = this;
    await this.storyPresenter.init();
    this.initializeMapComponent();
    this.initializeFormHandlers();
    this.initializeCameraFeature();
  }

  refreshCameraList(deviceList) {
    const cameraDropdown = document.getElementById('cameraSelect');
    if (!cameraDropdown) return;
  
    cameraDropdown.innerHTML = '';
    deviceList.forEach((device, index) => {
      const optionElement = document.createElement('option');
      optionElement.value = device.deviceId;
      optionElement.textContent = device.label || `Kamera ${index + 1}`;
      cameraDropdown.appendChild(optionElement);
    });
  }

  initializeCameraFeature() {
    const elements = this.getCameraElements();
    let captureState = false;
    
    this.loadAvailableCameras(elements.cameraDropdown);
    this.bindCameraEvents(elements, captureState);
    this.setupCameraCleanup();
  }

  getCameraElements() {
    return {
      toggleButton: document.getElementById('showCameraBtn'),
      cameraPanel: document.getElementById('cameraSection'),
      videoElement: document.getElementById('cameraStream'),
      captureButton: document.getElementById('capturePhoto'),
      canvasElement: document.getElementById('capturedCanvas'),
      fileInput: document.getElementById('photo'),
      cameraDropdown: document.getElementById('cameraSelect'),
      stopButton: document.getElementById('stopCamera')
    };
  }

  async loadAvailableCameras(dropdown) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      dropdown.innerHTML = '';
      
      cameras.forEach((camera, idx) => {
        const option = document.createElement('option');
        option.value = camera.deviceId;
        option.text = camera.label || `Camera ${idx + 1}`;
        dropdown.append(option);
      });
    } catch (error) {
      console.warn('Gagal enumerate devices:', error);
    }
  }

  bindCameraEvents(elements, captureState) {
    const { toggleButton, cameraPanel, stopButton, cameraDropdown, captureButton } = elements;
    
    const terminateStream = () => {
      if (this.activeStream) {
        this.activeStream.getTracks().forEach(track => track.stop());
        this.activeStream = null;
        stopButton.style.display = 'none';
      }
    };

    stopButton.addEventListener('click', () => {
      terminateStream();
      cameraPanel.style.display = 'none';
      document.getElementById('photo').closest('.file-camera-wrapper').style.display = 'flex';
    });

    const activateCamera = async () => {
      terminateStream();
      try {
        const selectedDevice = cameraDropdown.value;
        const constraints = {
          video: selectedDevice ? { deviceId: { exact: selectedDevice } } : true,
        };
        
        this.activeStream = await navigator.mediaDevices.getUserMedia(constraints);
        this.handleCameraStream(elements, captureState);
        stopButton.style.display = 'inline-block';
      } catch (error) {
        alert('Gagal mengakses kamera: ' + error.message);
      }
    };

    toggleButton.addEventListener('click', () => {
      cameraPanel.style.display = 'block';
      activateCamera();
    });

    cameraDropdown.addEventListener('change', activateCamera);
    this.setupCaptureHandler(elements, captureState, activateCamera);
  }

  handleCameraStream(elements, captureState) {
    const { videoElement, canvasElement, captureButton } = elements;
    
    videoElement.srcObject = this.activeStream;
    videoElement.style.display = 'block';
    canvasElement.style.display = 'none';
    captureState = false;
    captureButton.textContent = 'Ambil Foto';
  }

  setupCaptureHandler(elements, captureState, activateCamera) {
    const { captureButton, videoElement, canvasElement, fileInput, stopButton } = elements;
    
    captureButton.addEventListener('click', () => {
      if (!captureState) {
        this.capturePhotoFromVideo(videoElement, canvasElement, fileInput);
        this.terminateActiveStream();
        captureState = true;
        captureButton.textContent = 'Ambil Ulang Foto';
      } else {
        activateCamera();
      }
    });
  }

  capturePhotoFromVideo(video, canvas, input) {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.style.display = 'block';
    video.style.display = 'none';
    video.srcObject = null;

    canvas.toBlob(blob => {
      const photoFile = new File([blob], 'captured-photo.png', { type: 'image/png' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(photoFile);
      input.files = dataTransfer.files;
    }, 'image/png');
  }

  terminateActiveStream() {
    if (this.activeStream) {
      this.activeStream.getTracks().forEach(track => track.stop());
      this.activeStream = null;
    }
  }

  setupCameraCleanup() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.terminateActiveStream();
      } else {
        const cameraSection = document.getElementById('cameraSection');
        if (cameraSection && cameraSection.style.display === 'block') {
          this.reactivateCamera();
        }
      }
    });

    window.addEventListener('beforeunload', () => this.terminateActiveStream());
  }

  async reactivateCamera() {
    const dropdown = document.getElementById('cameraSelect');
    const video = document.getElementById('cameraStream');
    
    try {
      const deviceId = dropdown.value;
      this.activeStream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      });
      video.srcObject = this.activeStream;
    } catch (error) {
      console.error('Gagal reaktivasi kamera:', error);
    }
  }

  destroy() {
    this.terminateActiveStream();
    const videoEl = document.getElementById('cameraStream');
    if (videoEl) {
      videoEl.srcObject = null;
      videoEl.style.display = 'none';
    }
    
    const cameraSection = document.getElementById('cameraSection');
    if (cameraSection) cameraSection.style.display = 'none';
  }

  addEmojiToTextarea(emojiChar) {
    const textArea = document.getElementById('description');
    textArea.value += emojiChar;
    textArea.focus();
  }

  initializeMapComponent() {
    const baseLayers = this.createMapLayers();
    this.mapInstance = this.buildMapInstance(baseLayers.osm);
    this.setupMapStyleSwitcher(baseLayers);
    this.configureUserLocation();
    this.setupMapClickHandler();
  }

  createMapLayers() {
    return {
      osm: new TileLayer({ source: new OSM() }),
      satellite: new TileLayer({
        source: new XYZ({
          url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
        }),
      })
    };
  }

  buildMapInstance(initialLayer) {
    return new Map({
      target: 'map',
      layers: [initialLayer],
      view: new View({
        center: fromLonLat([117, -0.5]),
        zoom: 5,
      }),
    });
  }

  setupMapStyleSwitcher(layers) {
    const styleSelector = document.getElementById('mapStyle');
    
    styleSelector.addEventListener('change', (event) => {
      const selectedStyle = event.target.value;
      this.mapInstance.getLayers().removeAt(0);

      const layerToAdd = selectedStyle === 'osm' ? layers.osm : layers.satellite;
      this.mapInstance.getLayers().insertAt(0, layerToAdd);
    });
  }

  configureUserLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const userPosition = fromLonLat([longitude, latitude]);
      
      this.mapInstance.getView().setCenter(userPosition);
      this.mapInstance.getView().setZoom(12);
      this.placeMarkerAtLocation(userPosition);
    });
  }

  placeMarkerAtLocation(coordinates) {
    this.locationMarker = new Feature({ geometry: new Point(coordinates) });
    this.locationMarker.setStyle(new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      }),
    }));

    const markerSource = new VectorSource({ features: [this.locationMarker] });
    const markerLayer = new VectorLayer({ source: markerSource });
    this.mapInstance.addLayer(markerLayer);
  }

  setupMapClickHandler() {
    const popupElement = document.getElementById('formPopup');
    const popupOverlay = new Overlay({
      element: popupElement,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -40]
    });
    
    this.mapInstance.addOverlay(popupOverlay);

    this.mapInstance.on('click', (clickEvent) => {
      const clickCoordinates = clickEvent.coordinate;
      const [longitude, latitude] = toLonLat(clickCoordinates);
      
      this.updateLocationInputs(latitude, longitude);
      this.displayLocationPopup(popupElement, popupOverlay, clickCoordinates, latitude, longitude);
      this.updateMarkerPosition(clickCoordinates);
    });
  }

  updateLocationInputs(lat, lon) {
    document.getElementById('lat').value = lat;
    document.getElementById('lon').value = lon;
  }

  displayLocationPopup(popup, overlay, coords, lat, lon) {
    popup.innerHTML = `
      <div class="popup-content">
        Lokasi dipilih:<br><strong>${lat.toFixed(4)}, ${lon.toFixed(4)}</strong>
      </div>
    `;
    overlay.setPosition(coords);
  }

  updateMarkerPosition(newCoordinates) {
    if (this.locationMarker) {
      this.locationMarker.getGeometry().setCoordinates(newCoordinates);
    } else {
      this.placeMarkerAtLocation(newCoordinates);
    }
  }

  initializeFormHandlers() {
    const storyForm = document.getElementById('storyForm');
    
    storyForm.addEventListener('submit', async (submitEvent) => {
      submitEvent.preventDefault();
      await this.processFormSubmission(storyForm);
    });
  }

  async processFormSubmission(form) {
    const formData = new FormData(form);

    try {
      const submissionResult = await this.storyPresenter.handleFormSubmit(formData);

      if (submissionResult.error) {
        alert(submissionResult.message);
      } else {
        alert('Story posted!');
        window.location.hash = '/home';
      }
    } catch (error) {
      alert('Posting gagal, Anda sedang offline.');
    }
  }
}