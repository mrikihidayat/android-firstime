<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar class="gradient-toolbar">
        <ion-title>
          <div class="header-title">
            <span>{{ UI_TEXT.APP_TITLE }}</span>
            <span class="weather-emoji">🌤️</span>
          </div>
        </ion-title>
      </ion-toolbar>
      <!-- Navbar Created By -->
      <ion-toolbar class="author-toolbar">
        <div class="author-text">
          {{ UI_TEXT.CREATED_BY }}
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="weather-content">
      <div v-if="state.loading" class="loading-container">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p class="loading-text">{{ UI_TEXT.LOADING }}</p>
      </div>

      <div v-else-if="state.error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h2>{{ UI_TEXT.ERROR_TITLE }}</h2>
        <p>{{ state.error }}</p>
        <ion-button @click="loadWeatherData" expand="block" class="retry-button">
          <ion-icon slot="start" :icon="icons.refreshOutline"></ion-icon>
          {{ UI_TEXT.RETRY_BUTTON }}
        </ion-button>
      </div>

      <div v-else class="weather-container">
        <!-- Current Weather Card -->
        <ion-card class="current-weather-card">
          <div class="weather-gradient">
            <div class="weather-main">
              <div class="location-info">
                <h1>Jakarta</h1>
                <p class="location-detail">
                  <ion-icon :icon="icons.locationOutline"></ion-icon>
                  {{ state.metadata.latitude }}°, {{ state.metadata.longitude }}°
                </p>
              </div>
              <div class="current-temp">
                <div class="temp-display">{{ currentTemp }}°</div>
                <ion-icon 
                  :icon="WeatherUtils.getTempIcon(currentTemp)" 
                  :class="['weather-icon', WeatherUtils.getTempColorClass(currentTemp)]">
                </ion-icon>
              </div>
            </div>
            <div class="weather-stats">
              <div class="stat-item">
                <ion-icon :icon="icons.thermometerOutline"></ion-icon>
                <div class="stat-content">
                  <div class="stat-value">{{ maxTemp }}°</div>
                  <div class="stat-label">{{ UI_TEXT.HIGHEST }}</div>
                </div>
              </div>
              <div class="stat-item">
                <ion-icon :icon="icons.thermometerOutline"></ion-icon>
                <div class="stat-content">
                  <div class="stat-value">{{ minTemp }}°</div>
                  <div class="stat-label">{{ UI_TEXT.LOWEST }}</div>
                </div>
              </div>
              <div class="stat-item">
                <ion-icon :icon="icons.timeOutline"></ion-icon>
                <div class="stat-content">
                  <div class="stat-value">{{ currentTime }}</div>
                  <div class="stat-label">WIB</div>
                </div>
              </div>
            </div>
          </div>
        </ion-card>

        <!-- Hourly Forecast -->
        <div class="section-header">
          <h2>{{ UI_TEXT.HOURLY_FORECAST }}</h2>
          <p>{{ todayDate }}</p>
        </div>

        <div class="hourly-container">
          <div class="hourly-scroll">
            <div class="hourly-item" v-for="(item, index) in next24Hours" :key="index">
              <div class="hour-time">{{ formatTime(item.time) }}</div>
              <ion-icon 
                :icon="WeatherUtils.getTempIcon(item.temperature_2m)" 
                :class="['hour-icon', WeatherUtils.getTempColorClass(item.temperature_2m)]">
              </ion-icon>
              <div class="hour-temp">{{ item.temperature_2m }}°</div>
            </div>
          </div>
          <div class="scroll-indicator scroll-indicator-left">
            <ion-icon :icon="icons.chevronBackOutline"></ion-icon>
          </div>
          <div class="scroll-indicator scroll-indicator-right">
            <ion-icon :icon="icons.chevronForwardOutline"></ion-icon>
          </div>
        </div>

        <!-- 7-Day Forecast Card -->
        <div class="section-header" style="margin-top: 24px;">
          <h2>{{ UI_TEXT.WEEKLY_FORECAST }}</h2>
        </div>

        <ion-card class="forecast-card">
          <ion-list lines="none" class="forecast-list">
            <ion-item v-for="(day, index) in dailyForecast" :key="index" class="forecast-item">
              <div class="day-info">
                <div class="day-name">{{ day.dayName }}</div>
                <div class="day-date">{{ day.date }}</div>
              </div>
              <div class="day-icon">
                <ion-icon 
                  :icon="WeatherUtils.getTempIcon(day.avgTemp)" 
                  :class="WeatherUtils.getTempColorClass(day.avgTemp)">
                </ion-icon>
              </div>
              <div class="day-temps">
                <span class="temp-high">{{ day.maxTemp }}°</span>
                <div class="temp-bar">
                  <div class="temp-bar-fill" :style="{ width: getTempBarWidth(day.maxTemp) }"></div>
                </div>
                <span class="temp-low">{{ day.minTemp }}°</span>
              </div>
            </ion-item>
          </ion-list>
        </ion-card>

        <!-- Footer -->
        <div class="footer-info">
          <ion-icon :icon="icons.cloudDownloadOutline"></ion-icon>
          <span>{{ UI_TEXT.FOOTER_TEXT }}</span>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner,
  IonButton, IonCard, IonList, IonItem, IonIcon
} from '@ionic/vue';
import { ref, computed, onMounted } from 'vue';
import { 
  sunnySharp, sunnyOutline, cloudyOutline, thermometerOutline,
  locationOutline, timeOutline, refreshOutline, cloudDownloadOutline,
  chevronBackOutline, chevronForwardOutline
} from 'ionicons/icons';

// Import modules
import { weatherService } from '../services/weather.service';
import { WeatherUtils } from '../configurations/weather.utils';
import { UI_TEXT, WEATHER_CONFIG } from '../interfaces/weather.constants';
import type { WeatherState } from '../services/weather.types';

// Icons
const icons = {
  sunnySharp,
  sunnyOutline,
  cloudyOutline,
  thermometerOutline,
  locationOutline,
  timeOutline,
  refreshOutline,
  cloudDownloadOutline,
  chevronBackOutline,
  chevronForwardOutline
};

// State
const state = ref<WeatherState>({
  weatherData: [],
  metadata: { 
    latitude: 0, 
    longitude: 0, 
    unit: '°C',
    timezone: WEATHER_CONFIG.TIMEZONE
  },
  loading: true,
  error: null
});

// Computed Properties
const currentTemp = computed(() => 
  WeatherUtils.getCurrentTemp(state.value.weatherData)
);

const maxTemp = computed(() => 
  WeatherUtils.getMaxTemp(state.value.weatherData)
);

const minTemp = computed(() => 
  WeatherUtils.getMinTemp(state.value.weatherData)
);

const currentTime = computed(() => 
  WeatherUtils.getCurrentTime()
);

const todayDate = computed(() => 
  WeatherUtils.getTodayDate()
);

const next24Hours = computed(() => 
  state.value.weatherData.slice(0, WEATHER_CONFIG.HOURS_TO_DISPLAY)
);

const dailyForecast = computed(() => 
  WeatherUtils.processDailyForecast(state.value.weatherData)
);

// Methods
const formatTime = (isoTime: string): string => {
  return WeatherUtils.formatHourOnly(isoTime, state.value.metadata.timezone);
};

const getTempBarWidth = (temp: number): string => {
  return WeatherUtils.getTempBarWidth(temp, minTemp.value, maxTemp.value);
};

async function loadWeatherData() {
  state.value.loading = true;
  state.value.error = null;
  state.value.weatherData = [];
  
  try {
    const { weatherData, metadata } = await weatherService.fetchWeatherData();
    state.value.weatherData = weatherData;
    state.value.metadata = metadata;
  } catch (e: any) {
    console.error("Fetching data failed:", e);
    state.value.error = e.message || 'Terjadi kesalahan saat mengambil data.';
  } finally {
    state.value.loading = false;
  }
}

// Lifecycle
onMounted(() => {
  loadWeatherData();
});

// Export utils untuk template
defineExpose({ WeatherUtils });
</script>

<style scoped>
/* Global Styles */
.weather-content {
  --background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}

.gradient-toolbar {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: white;
}

.author-toolbar {
  --background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  --color: white;
  --min-height: 36px;
  --padding-top: 0;
  --padding-bottom: 0;
}

.author-text {
  text-align: center;
  font-size: 0.85em;
  font-weight: 500;
  padding: 8px 0;
  opacity: 0.95;
  letter-spacing: 0.3px;
}

.header-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
}

.weather-emoji {
  font-size: 1.3em;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: white;
}

.loading-text {
  margin-top: 16px;
  font-size: 1.1em;
  opacity: 0.9;
}

/* Error State */
.error-container {
  padding: 32px;
  text-align: center;
  color: white;
}

.error-icon {
  font-size: 4em;
  margin-bottom: 16px;
}

.error-container h2 {
  margin-bottom: 8px;
}

.retry-button {
  margin-top: 24px;
  --background: white;
  --color: #667eea;
}

/* Weather Container */
.weather-container {
  padding: 16px;
  padding-bottom: 32px;
}

/* Current Weather Card */
.current-weather-card {
  margin: 0;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.weather-gradient {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
  backdrop-filter: blur(10px);
  padding: 24px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.weather-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.location-info h1 {
  font-size: 2em;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.location-detail {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.9;
  font-size: 0.9em;
  margin: 0;
}

.current-temp {
  display: flex;
  align-items: center;
  gap: 12px;
}

.temp-display {
  font-size: 4em;
  font-weight: 700;
  line-height: 1;
}

.weather-icon {
  font-size: 3em;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.weather-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-item ion-icon {
  font-size: 1.5em;
  opacity: 0.8;
}

.stat-value {
  font-size: 1.3em;
  font-weight: 700;
}

.stat-label {
  font-size: 0.85em;
  opacity: 0.8;
}

/* Section Header */
.section-header {
  margin: 24px 0 16px 0;
  color: white;
}

.section-header h2 {
  font-size: 1.3em;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.section-header p {
  opacity: 0.9;
  font-size: 0.9em;
  margin: 0;
}

/* Hourly Forecast Scroll */
.hourly-container {
  position: relative;
}

.hourly-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 0 16px 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  scroll-behavior: smooth;
}

.hourly-scroll::-webkit-scrollbar {
  display: none;
}

.scroll-indicator {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
  animation: pulse-arrow 2s ease-in-out infinite;
  pointer-events: none;
}

.scroll-indicator ion-icon {
  font-size: 1.5em;
  color: #667eea;
}

.scroll-indicator-left {
  left: -8px;
}

.scroll-indicator-right {
  right: -8px;
}

@keyframes pulse-arrow {
  0%, 100% { 
    transform: translateY(-50%) scale(1);
    opacity: 0.8;
  }
  50% { 
    transform: translateY(-50%) scale(1.1);
    opacity: 1;
  }
}

.hourly-item {
  flex: 0 0 auto;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: white;
  min-width: 80px;
  transition: transform 0.2s;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hourly-item:hover {
  transform: translateY(-4px);
}

.hour-time {
  font-size: 0.9em;
  font-weight: 600;
  opacity: 0.9;
}

.hour-icon {
  font-size: 2em;
}

.hour-temp {
  font-size: 1.2em;
  font-weight: 700;
}

/* Forecast Card */
.forecast-card {
  margin: 0;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
}

.forecast-list {
  background: transparent;
}

.forecast-item {
  --padding-start: 20px;
  --padding-end: 20px;
  --inner-padding-end: 0;
  --min-height: 70px;
}

.forecast-item::part(native) {
  display: flex;
  align-items: center;
  gap: 16px;
}

.day-info {
  flex: 0 0 100px;
}

.day-name {
  font-weight: 700;
  font-size: 1em;
  color: #333;
}

.day-date {
  font-size: 0.85em;
  color: #666;
  margin-top: 2px;
}

.day-icon {
  flex: 0 0 40px;
  display: flex;
  justify-content: center;
}

.day-icon ion-icon {
  font-size: 1.8em;
}

.day-temps {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}

.temp-high {
  color: #333;
  min-width: 35px;
  text-align: right;
}

.temp-bar {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.temp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.temp-low {
  color: #666;
  min-width: 35px;
}

/* Temperature Colors */
.temp-danger {
  color: #ff6b6b;
}

.temp-warning {
  color: #ffa726;
}

.temp-primary {
  color: #42a5f5;
}

.temp-medium {
  color: #78909c;
}

/* Footer */
.footer-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  padding: 16px;
  color: white;
  opacity: 0.8;
  font-size: 0.85em;
}

/* Responsive */
@media (max-width: 576px) {
  .temp-display {
    font-size: 3em;
  }
  
  .weather-icon {
    font-size: 2.5em;
  }
  
  .weather-stats {
    gap: 12px;
  }
  
  .stat-value {
    font-size: 1.1em;
  }
  
  .day-info {
    flex: 0 0 80px;
  }
}

@media (min-width: 768px) {
  .weather-container {
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>