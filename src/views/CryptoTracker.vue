<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="dark">
        <ion-title>💰 Crypto Tracker</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <div v-if="loading" class="ion-text-center ion-padding-top">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Memuat data...</p>
      </div>

      <div v-else-if="error" class="ion-text-center ion-padding-top">
        <ion-text color="danger">
          <h2>Gagal memuat data 😢</h2>
          <p>{{ error }}</p>
          <ion-button @click="fetchCryptoData" expand="block" fill="outline" color="primary">Coba Lagi</ion-button>
        </ion-text>
      </div>

      <ion-grid v-else>
        <ion-row class="ion-justify-content-center">
          <ion-col size="12" size-md="6" size-lg="4" v-for="coin in coins" :key="coin.id">
            <ion-card class="crypto-card">
              <ion-card-header>
                <ion-card-title class="ion-text-wrap">{{ coin.name }} ({{ coin.symbol }})</ion-card-title>
                <ion-card-subtitle>Rank: #{{ coin.rank }}</ion-card-subtitle>
              </ion-card-header>

              <ion-card-content>
                <h1 class="price-usd">${{ formatPrice(coin.price_usd) }}</h1>

                <ion-list lines="none" class="ion-no-padding">
                  <ion-item class="ion-no-padding">
                    <ion-label>
                      <h2 class="ion-text-sm">Perubahan 24j:</h2>
                      <p :class="getChangeClass(coin.percent_change_24h)">
                        {{ formatChange(coin.percent_change_24h) }}%
                        <ion-icon :icon="getChangeIcon(coin.percent_change_24h)" :color="getChangeColor(coin.percent_change_24h)"></ion-icon>
                      </p>
                    </ion-label>
                  </ion-item>
                  <ion-item class="ion-no-padding">
                    <ion-label>
                      <h2 class="ion-text-sm">Market Cap:</h2>
                      <p class="ion-text-sm">{{ formatCurrency(coin.market_cap_usd) }}</p>
                    </ion-label>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-footer class="ion-text-center ion-padding">
        <ion-label>
          <p style="font-size: 0.8em; color: var(--ion-color-medium);">
            Data dari api.coinlore.net - by m.rikihidayat
          </p>
        </ion-label>
      </ion-footer>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, IonItem, IonLabel,
  IonText, IonButton, IonFooter, IonIcon
} from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { caretUpSharp, caretDownSharp } from 'ionicons/icons';

// Definisikan tipe data koin sesuai API Coinlore
interface Coin {
  id: string;
  symbol: string;
  name: string;
  nameid: string;
  rank: number;
  price_usd: string;
  percent_change_24h: string;
  price_btc: string;
  market_cap_usd: string;
}

const coins = ref<Coin[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const API_URL = 'https://api.coinlore.net/api/tickers/';

/**
 * Mengambil data koin dari API Coinlore.
 */
async function fetchCryptoData() {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Ambil 10 koin teratas untuk tampilan awal
    coins.value = data.data.slice(0, 10).map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      nameid: coin.nameid,
      rank: Number(coin.rank),
      price_usd: coin.price_usd,
      percent_change_24h: coin.percent_change_24h,
      price_btc: coin.price_btc,
      market_cap_usd: coin.market_cap_usd,
    }));

  } catch (e: any) {
    console.error("Fetching data failed:", e);
    error.value = e.message || 'Terjadi kesalahan saat mengambil data.';
  } finally {
    loading.value = false;
  }
}

function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (num >= 100) {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (num >= 1) {
    return num.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  } else {
    return num.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
  }
}

function formatChange(change: string): string {
  const num = parseFloat(change);
  return num.toFixed(2);
}

function getChangeClass(change: string): string {
  const num = parseFloat(change);
  return num > 0 ? 'change-positive' : num < 0 ? 'change-negative' : 'change-neutral';
}

function getChangeColor(change: string): 'success' | 'danger' | 'medium' {
  const num = parseFloat(change);
  return num > 0 ? 'success' : num < 0 ? 'danger' : 'medium';
}

function getChangeIcon(change: string) {
  const num = parseFloat(change);
  return num > 0 ? caretUpSharp : num < 0 ? caretDownSharp : '';
}

function formatCurrency(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return '-';

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(num);
}

onMounted(() => {
  fetchCryptoData();
});
</script>

<style scoped>
/* Tema Gelap (Dark Mode) yang Elegan */
ion-content {
  --background: #121212;
}

ion-toolbar {
  --background: #1e1e1e; 
  color: #fff;
  border-bottom: 1px solid #333;
}

ion-title {
  font-weight: 700;
  color: var(--ion-color-primary, #3880ff);
}

.crypto-card {
  --background: #1e1e1e;
  color: #ffffff;
  border-radius: 16px; /* Lebih bulat */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.7);
  transition: all 0.3s ease;
  border: 1px solid #333; /* Border halus */
}

.crypto-card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.9);
}

ion-card-header {
  padding-bottom: 0;
}

ion-card-title {
  font-weight: bold;
  font-size: 1.4em;
  color: #ffffff; 
}

ion-card-subtitle {
  color: #999;
  font-size: 0.9em;
  margin-top: 5px;
}

.price-usd {
  font-size: 2.5em;
  font-weight: 800;
  margin-top: 10px;
  margin-bottom: 10px;
  color: #00ff95; /* Warna hijau neon untuk harga */
}

ion-list, ion-item {
  --background: transparent;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  --min-height: 40px;
  color: #ccc;
}

ion-label h2 {
    font-size: 0.9em;
    font-weight: 500;
    color: #666;
}

ion-label p {
    font-size: 1.1em;
    font-weight: 600;
    margin: 0;
}

.change-positive {
  color: var(--ion-color-success, #2dd36f);
}

.change-negative {
  color: var(--ion-color-danger, #eb445a);
}

.change-neutral {
  color: var(--ion-color-medium, #92949c);
}

ion-icon {
  vertical-align: middle;
  margin-left: 5px;
}

ion-footer {
  --background: #1e1e1e;
  border-top: 1px solid #333;
}

/* Mengatur ulang warna untuk mode terang */
@media (prefers-color-scheme: light) {
  ion-content {
    --background: #f4f5f8;
  }
  ion-toolbar {
    --background: #ffffff;
    color: #121212;
  }
  .crypto-card {
    --background: #ffffff;
    color: #121212;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #ddd;
  }
  .price-usd {
    color: var(--ion-color-primary, #3880ff); 
  }
  ion-card-title {
    color: var(--ion-color-dark) !important;
  }
}
</style>