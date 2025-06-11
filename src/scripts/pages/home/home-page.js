import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Overlay from 'ol/Overlay';
import HomePresenter from './HomePresenter.js';

export default class HomePage {
  constructor() {
    this.homePresenter = new HomePresenter(this);
    this.isPageRendered = false;
  }

  async render() {
    const htmlContent = `
      <section class="container">
        <h1>Welcome to CeritaVincent!</h1>
        <div class="add-story-container">
          <span class="add-story-text">Tambah Story Barumu Sekarang!</span>
          <button id="addStoryBtn">Tambah Story</button>
        </div>
        <hr/>
        <div id="storiesContainer" class="story-list" aria-live="polite" role="list" aria-label="User Story List"></div>
      </section>
    `;
    return htmlContent;
  }

  async afterRender() {
    if (this.isPageRendered) return; 
    this.isPageRendered = true;
  
    let storyData = [];
  
    try {
      storyData = await this.homePresenter.init(); 
    } catch (error) {
      console.warn('Gagal fetch stories (mungkin offline):', error);
    }
  
    this.initializeAddStoryButton();
    this.homePresenter.setupLogoutListener();
    this.displayStories(storyData); 
  }

  initializeAddStoryButton() {
    const addButton = document.getElementById('addStoryBtn');
    addButton.addEventListener('click', () => {
      window.location.hash = '#/home-form';
    });

    const userToken = localStorage.getItem('token');
    const navigationList = document.getElementById('nav-list');
    const existingLink = navigationList.querySelector('a[href="#/saved"]');
    
    if (userToken && !existingLink) {
      const savedMenuItem = document.createElement('li');
      savedMenuItem.innerHTML = '<a href="#/saved">Disimpan</a>';
      navigationList.appendChild(savedMenuItem);
    }
  }
  
  displayStories = (storyList) => {
    const containerElement = document.querySelector('#storiesContainer');
    containerElement.innerHTML = '';

    storyList.forEach((storyItem) => {
      const storyCard = this.buildStoryElement(storyItem);
      containerElement.appendChild(storyCard);

      if (storyItem.lat && storyItem.lon) {
        this.createMapVisualization(storyItem);
      }

      const saveButton = storyCard.querySelector('.save-story-btn');

      this.homePresenter.isStorySaved(storyItem.id)
        .then((savedStatus) => {
          if (savedStatus) {
            saveButton.textContent = 'Tersimpan';
            saveButton.disabled = true;
          }
        });

      saveButton.addEventListener('click', () => {
        this.homePresenter.saveToIndexedDB(storyItem)
          .then(() => {
            saveButton.textContent = 'Tersimpan';
            saveButton.disabled = true;
          })
          .catch(err => {
            console.error('Gagal simpan cerita:', err);
          });
      });
    });
  }

  showSuccessMessage = (messageText) => {
    alert(messageText);
  };

  buildStoryElement(storyData) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('story-card');
    cardElement.setAttribute('role', 'listitem');
    cardElement.setAttribute('tabindex', '0');

    const dateTimeString = this.convertDateTime(storyData.createdAt);
  
    cardElement.innerHTML = `
      <div class="story-header">
        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(storyData.name)}" class="avatar" alt="Avatar pengguna ${storyData.name}" />
        <span class="username">${storyData.name}</span>
      </div>
      ${storyData.lat && storyData.lon ? this.generateLocationHTML(storyData) : ''}
      ${storyData.photoUrl ? this.generateImageHTML(storyData) : ''}
      <div class="story-body" style="margin-top:8px;">
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(storyData.name)}&size=32" class="body-avatar" alt="Avatar pengguna ${storyData.name}" style="width:32px; height:32px; border-radius:16px;" />
          <div class="body-content" style="flex-grow: 1; max-width: calc(100% - 48px);">
            <span style="font-weight: bold; font-size: 1rem; display: block;">${storyData.name}</span>
            <p style="margin: 0; font-size: 0.95rem; line-height: 1.2; text-align:left; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${storyData.description}</p>
            <div class="story-date-time" style="font-size: 0.8rem; color: #666; margin-top: 4px;">${dateTimeString}</div>
            <button class="save-story-btn" data-id="${storyData.id}">Simpan</button>
          </div>
        </div>
      </div>
    `;
  
    return cardElement;
  }

  createSaveButtonInterface() {
    document.getElementById('save-actions-container').innerHTML = `
      <button id="save-story-btn" class="save-story-btn">Simpan Cerita</button>
    `;

    document.getElementById('save-story-btn').addEventListener('click', async () => {
      alert('Fitur simpan cerita dipanggil!');
    });
  }

  convertDateTime(dateInput) {
    const dateObject = new Date(dateInput);
    const dateFormatted = dateObject.toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
    const timeFormatted = dateObject.toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit'
    });
    return `${dateFormatted} ${timeFormatted}`;
  }

  generateLocationHTML(storyInfo) {
    return `
      <div class="story-location">
        <span class="coordinates">${storyInfo.lat.toFixed(4)}, ${storyInfo.lon.toFixed(4)}</span>
        <a href="https://www.google.com/maps?q=${storyInfo.lat},${storyInfo.lon}" target="_blank" class="location-link">Lihat di Peta</a>
      </div>
      <div id="map-${storyInfo.id}" class="story-map" style="height:300px; width:100%; margin-top:8px;"></div>
    `;
  }

  generateImageHTML(storyInfo) {
    return `
      <div class="story-image">
        <img src="${storyInfo.photoUrl}" alt="Foto cerita" style="width:100%; height:auto; margin:8px 0;" />
      </div>
    `;
  }

  createMapVisualization(storyInfo) {
    const mapInstance = new Map({
      target: `map-${storyInfo.id}`,
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({
        center: fromLonLat([storyInfo.lon, storyInfo.lat]),
        zoom: 14,
      }),
    });
  
    const mapElement = document.getElementById(`map-${storyInfo.id}`);
    mapElement.dataset.lat = storyInfo.lat;
    mapElement.dataset.lon = storyInfo.lon;
    mapElement._ol_instance = mapInstance;
  
    const locationFeature = new Feature({ 
      geometry: new Point(fromLonLat([storyInfo.lon, storyInfo.lat])) 
    });
    const markerStyle = new Style({ 
      image: new Icon({ src: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' }) 
    });
    locationFeature.setStyle(markerStyle);
  
    const vectorDataSource = new VectorSource({ features: [locationFeature] });
    const vectorMapLayer = new VectorLayer({ source: vectorDataSource });
    mapInstance.addLayer(vectorMapLayer);
  
    mapInstance.on('click', (clickEvent) => {
      const clickCoordinate = clickEvent.coordinate;
      const markerCoordinate = fromLonLat([storyInfo.lon, storyInfo.lat]);
      const coordinateDistance = Math.sqrt(
        Math.pow(clickCoordinate[0] - markerCoordinate[0], 2) + 
        Math.pow(clickCoordinate[1] - markerCoordinate[1], 2)
      );
    
      if (coordinateDistance < 100) { 
        setTimeout(() => {
          this.homePresenter.getPlaceName(storyInfo.lat, storyInfo.lon, storyInfo.id);
        }, 50); 
      }
    });
  }

  displayLocationPopup(storyId, locationName) {
    const targetMapContainer = document.querySelector(`#map-${storyId}`);
    if (!targetMapContainer) return;

    const mapRef = targetMapContainer._ol_instance;
    if (!mapRef) return;

    const popupElement = document.createElement('div');
    popupElement.className = 'ol-popup';
    popupElement.style.cssText = `
      background: white;
      padding: 5px 10px;
      border: 1px solid black;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
    `;
    popupElement.innerText = locationName;

    const mapOverlay = new Overlay({
      element: popupElement,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -30],
    });

    mapRef.addOverlay(mapOverlay);
    mapOverlay.setPosition(fromLonLat([
      parseFloat(targetMapContainer.dataset.lon), 
      parseFloat(targetMapContainer.dataset.lat)
    ]));
  }
}