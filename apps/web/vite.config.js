import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // Avoid Node-specific globals like __dirname in ESM config
            '@': new URL('./src', import.meta.url).pathname,
        },
    },
    server: {
        host: '0.0.0.0',
        port: 3000,
        hmr: {
            host: 'localhost',
            port: 3000,
        },
        watch: {
            usePolling: true,
        },
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
});
