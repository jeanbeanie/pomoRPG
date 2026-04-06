import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    base: "/pomoRPG/",
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.svg", "pwa-192.png", "pwa-512.png"],
            manifest: {
                name: "PomoRPG",
                short_name: "PomoRPG",
                description: "A gamified Pomodoro timer with RPG progression.",
                start_url: "/pomoRPG/",
                scope: "/pomoRPG/",
                display: "standalone",
                background_color: "#ffffff",
                theme_color: "#32cd32",
                icons: [
                    { src: "/pomoRPG/pwa-192.png", sizes: "192x192", type: "image/png" },
                    { src: "/pomoRPG/pwa-512.png", sizes: "512x512", type: "image/png" },
                ],
            },
        }),
    ],
})
