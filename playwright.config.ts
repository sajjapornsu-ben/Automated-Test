import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default defineConfig({
  testDir: './',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  /* 🛠️ รายงานผล Allure และ HTML */
  reporter: [
    ['list'],
    ['html', { open: 'on-failure' }],
    ['allure-playwright', { outputFolder: 'allure-results' }]
  ],

  use: {
    launchOptions: {
      slowMo: 200,
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  /* 📂 ปรับกลับเป็นมาตรฐานเพื่อให้ปุ่มรันกลับมา */
  projects: [
    {
      name: 'chromium', 
      use: { ...devices['Desktop Chrome'] },
      // ✅ ลบ testMatch ออกแล้ว เพื่อให้เห็นทุกไฟล์ในเครื่อง
    },
  ],
});