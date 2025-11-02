import { mount } from '@vue/test-utils'
// Jalur import diperbaiki untuk menunjuk ke halaman yang baru di folder 'views'
import CryptoTracker from '@/views/CryptoTracker.vue'
import { describe, expect, test } from 'vitest'

describe('CryptoTracker.vue', () => {
  test('renders the new app title and loading state', () => {
    // Mounting komponen baru
    const wrapper = mount(CryptoTracker)
    
    // Uji tampilan judul baru dari komponen yang telah direvisi
    expect(wrapper.text()).toContain('Crypto Live Tracker')

    // Uji status loading awal (karena data API dimuat setelah mount)
    expect(wrapper.text()).toContain('Memuat data...')
  })
})