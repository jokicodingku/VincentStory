import CONFIG from '../../config.js';

const StoryModel = {
    async fetchStories(token) {
      const response = await fetch(`${CONFIG.BASE_URL}/stories?location=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    async getStories() {
      try {
          const response = await fetch('https://story-api.dicoding.dev/v1/stories');
          if (!response.ok) {
              throw new Error('Gagal mengambil data stories');
          }
          const data = await response.json();
          return data;
      } catch (error) {
          console.error('Error:', error);
          return [];  
      }
  },
  
    async postStory(token, formData) {
      const res = await fetch(`${CONFIG.BASE_URL}/stories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      return res.json();
    },
  
    async getPlaceName(lat, lon) {
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=734bff584dcd48bbacb0e42139a0cca7`);
      const data = await response.json();
      return data.results[0]?.formatted || 'Nama tempat tidak ditemukan';
    }

    
  };
  

export default StoryModel;
