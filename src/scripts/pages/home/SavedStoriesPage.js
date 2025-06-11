import { idbHelper } from '../../utils/idbHelper.js';
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

class SavedStoriesPage {
  constructor() {
    this.homePresenter = new HomePresenter(this);
    this.storiesData = [];
  }

  async render() {
    const pageContent = `
      <section class="container">
        <h2>Daftar Cerita Tersimpan</h2>
        <hr/>
        <div id="savedStoriesContainer" class="story-list" aria-live="polite" role="list" aria-label="Saved Story List"></div>
      </section>
    `;
    return pageContent;
  }

  async afterRender() {
    try {
      this.storiesData = await idbHelper.getAllStories();
      this.displayStoriesList(this.storiesData);
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  }

  displayStoriesList(storiesArray) {
    const containerElement = document.getElementById('savedStoriesContainer');
    containerElement.innerHTML = '';

    storiesArray.forEach((storyData) => {
      const storyCard = this.buildStoryCard(storyData);
      containerElement.appendChild(storyCard);

      // Render map jika ada koordinat
      const hasCoordinates = storyData.lat && storyData.lon;
      if (hasCoordinates) {
        this.initializeStoryMap(storyData);
      }
    });
  }

  buildStoryCard(storyInfo) {
    const cardElement = document.createElement('div');
    cardElement.className = 'story-card';
    cardElement.setAttribute('role', 'listitem');
    cardElement.setAttribute('tabindex', '0');

    const timeStampFormatted = this.getFormattedDateTime(storyInfo.createdAt);
    const userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(storyInfo.name)}`;
    const smallAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(storyInfo.name)}&size=32`;

    // Build HTML content
    let cardContent = `
      <div class="story-header">
        <img src="${userAvatar}" class="avatar" alt="Avatar pengguna ${storyInfo.name}" />
        <span class="username">${storyInfo.name}</span>
      </div>
    `;

    // Add location section if coordinates exist
    if (storyInfo.lat && storyInfo.lon) {
      cardContent += this.generateLocationSection(storyInfo);
    }

    // Add photo section if photo exists
    if (storyInfo.photoUrl) {
      cardContent += this.generatePhotoSection(storyInfo);
    }

    // Add story body
    cardContent += `
      <div class="story-body" style="margin-top:8px;">
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <img src="${smallAvatar}" class="body-avatar" alt="Avatar pengguna ${storyInfo.name}" style="width:32px; height:32px; border-radius:16px;" />
          <div class="body-content" style="flex-grow: 1; max-width: calc(100% - 48px);">
            <span style="font-weight: bold; font-size: 1rem; display: block;">${storyInfo.name}</span>
            <p style="margin: 0; font-size: 0.95rem; line-height: 1.2; text-align:left; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${storyInfo.description}</p>
            <div class="story-date-time" style="font-size: 0.8rem; color: #666; margin-top: 4px;">${timeStampFormatted}</div>
            <button class="delete-story-btn" data-id="${storyInfo.id}">Hapus</button>
          </div>
        </div>
      </div>
    `;

    cardElement.innerHTML = cardContent;

    // Attach delete functionality
    this.attachDeleteHandler(cardElement, storyInfo.id);

    return cardElement;
  }

  attachDeleteHandler(cardElement, storyId) {
    const deleteButton = cardElement.querySelector('.delete-story-btn');
    deleteButton.addEventListener('click', async () => {
      try {
        await idbHelper.deleteStory(storyId);
        cardElement.remove();
      } catch (error) {
        console.error('Error deleting story:', error);
      }
    });
  }

  initializeStoryMap(storyData) {
    const mapTargetId = `map-${storyData.id}`;
    const coordinates = [storyData.lon, storyData.lat];
    const centerPoint = fromLonLat(coordinates);

    // Create map instance
    const mapInstance = new Map({
      target: mapTargetId,
      layers: [
        new TileLayer({ 
          source: new OSM() 
        })
      ],
      view: new View({
        center: centerPoint,
        zoom: 14,
      }),
    });

    // Store map reference and coordinates
    const mapElement = document.getElementById(mapTargetId);
    mapElement.dataset.lat = storyData.lat;
    mapElement.dataset.lon = storyData.lon;
    mapElement._ol_instance = mapInstance;

    // Add marker to map
    this.addMapMarker(mapInstance, coordinates);

    // Add click event for place name
    mapInstance.on('click', () => {
      setTimeout(() => {
        this.homePresenter.getPlaceName(storyData.lat, storyData.lon, storyData.id);
      }, 50);
    });
  }

  addMapMarker(mapInstance, coordinates) {
    const markerGeometry = new Point(fromLonLat(coordinates));
    const markerFeature = new Feature({ geometry: markerGeometry });
    
    const markerStyle = new Style({ 
      image: new Icon({ 
        src: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' 
      }) 
    });
    
    markerFeature.setStyle(markerStyle);

    const markerSource = new VectorSource({ features: [markerFeature] });
    const markerLayer = new VectorLayer({ source: markerSource });
    
    mapInstance.addLayer(markerLayer);
  }

  getFormattedDateTime(dateString) {
    const dateObject = new Date(dateString);
    
    const dateOptions = {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
    };
    
    const timeOptions = {
      hour: '2-digit', 
      minute: '2-digit',
    };
    
    const datePart = dateObject.toLocaleDateString(undefined, dateOptions);
    const timePart = dateObject.toLocaleTimeString(undefined, timeOptions);
    
    return `${datePart} ${timePart}`;
  }

  generateLocationSection(storyData) {
    const latFixed = storyData.lat.toFixed(4);
    const lonFixed = storyData.lon.toFixed(4);
    const mapsUrl = `https://www.google.com/maps?q=${storyData.lat},${storyData.lon}`;
    
    return `
      <div class="story-location">
        <span class="coordinates">${latFixed}, ${lonFixed}</span>
        <a href="${mapsUrl}" target="_blank" class="location-link">Lihat di Peta</a>
      </div>
      <div id="map-${storyData.id}" class="story-map" style="height:300px; width:100%; margin-top:8px;"></div>
    `;
  }

  generatePhotoSection(storyData) {
    return `
      <div class="story-image">
        <img src="${storyData.photoUrl}" alt="Foto cerita" style="width:100%; height:auto; margin:8px 0;" />
      </div>
    `;
  }

  showPopupTempatNama(storyId, placeName) {
    const targetMapContainer = document.querySelector(`#map-${storyId}`);
    if (!targetMapContainer) return;

    const mapInstance = targetMapContainer._ol_instance;
    if (!mapInstance) return;

    // Create popup element
    const popupElement = document.createElement('div');
    popupElement.className = 'ol-popup';
    
    const popupStyles = `
      background: white;
      padding: 5px 10px;
      border: 1px solid black;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
    `;
    
    popupElement.style.cssText = popupStyles;
    popupElement.innerText = placeName;

    // Create and configure overlay
    const popupOverlay = new Overlay({
      element: popupElement,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -30],
    });

    // Add overlay to map
    mapInstance.addOverlay(popupOverlay);
    
    const longitude = parseFloat(targetMapContainer.dataset.lon);
    const latitude = parseFloat(targetMapContainer.dataset.lat);
    const overlayPosition = fromLonLat([longitude, latitude]);
    
    popupOverlay.setPosition(overlayPosition);
  }
}

export default SavedStoriesPage;