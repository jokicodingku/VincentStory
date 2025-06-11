import StoryModel from './storymodel.js';
import NotificationHelper from '../../notification-helper.js';
import { idbHelper } from '../../utils/idbHelper.js';

class HomePresenter {
  constructor(view) {
    this.view = view;
    this.storyModel = StoryModel;
    this.stream = null;
    this.currentDevice = null;
  }

saveToIndexedDB = (story) => {
  return idbHelper.saveStory(story)
    .then(() => {
      this.view.showSuccessMessage('Cerita berhasil disimpan offline!');
    });
};

isStorySaved = (id) => {
  return idbHelper.getStory(id).then((story) => !!story);
};  

  async init() {
    await this.initializeCameraDevices();
    const token = localStorage.getItem('token');
    const data = await this.storyModel.fetchStories(token);
    return data.listStory;
  }

  
  
  async toggleCamera() {
    if (this.stream) {
      this.stopCamera();
    } else {
      this.startCamera();
    }
  }
  
  async startCamera() {
    try {
      const constraints = {
        video: { deviceId: this.currentDevice ? { exact: this.currentDevice } : undefined }
      };
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.view.showCameraSection();
      this.view.setCameraStream(this.stream);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  }
  
  stopCamera() {
    if (this.stream) {
      const tracks = this.stream.getTracks();
      tracks.forEach(track => track.stop());
      this.view.hideCameraSection();
      this.stream = null;
    }
    if (this._cameraSetupDone) return;
    this._cameraSetupDone = true;
  }
  
  async switchCameraDevice(deviceId) {
    this.currentDevice = deviceId;
    if (this.stream) {
      this.stopCamera();
      this.startCamera();
    }
  }
  
  async initializeCameraDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
  
      if (this.view?.updateCameraDevices instanceof Function) {
        this.view.updateCameraDevices(videoDevices);
      }
  
      if (videoDevices.length > 0) {
        this.currentDevice = videoDevices[0].deviceId;
      }
    } catch (err) {
      console.error("Error accessing devices:", err);
    }
  }
  
  
  retakePhoto() {
    this.view.retakeImage();
  }
  

  async handleFormSubmit(formData) {
    const token = localStorage.getItem('token');
    const result = await this.storyModel.postStory(token, formData);
  
    if (!result.error) {
      const description = formData.get('description');
      NotificationHelper.showStoryNotification(description);
    }
  
    return result;
  }
  

  showPopup(lat, lon) {
    const placeName = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
    this.view.showPopup(placeName, lat, lon);
  }

  async getPlaceName(lat, lon, storyId) {
    try {
      const placeName = await StoryModel.getPlaceName(lat, lon); 
      this.view.showPopupTempatNama(storyId, placeName);
    } catch (error) {
      this.view.showPopupTempatNama(storyId, 'Gagal memuat nama tempat');
    }
  }

  async afterRender() {
    try {
        const stories = await StoryModel.getStories(); 
        this.view.displayStories(stories);
    } catch (error) {
        console.error('Error saat merender stories:', error);
    }
  }

  setupLogoutListener() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '/logout';
      });
    }
  }
  
  
}

export default HomePresenter;
