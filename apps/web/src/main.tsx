import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - ma'lumotlar 5 daqiqa davomida yangi hisoblanadi
      gcTime: 10 * 60 * 1000, // 10 minutes - cache 10 daqiqa davomida saqlanadi (eski cacheTime)
      retry: 1, // 1 marta qayta urinish
      refetchOnWindowFocus: false, // Oyna fokuslanganda avtomatik yangilash o'chirilgan
      refetchOnReconnect: true, // Internet qayta ulanganda yangilash
      refetchOnMount: true, // Komponent mount bo'lganda yangilash
    },
    mutations: {
      retry: 0, // Mutation'lar uchun qayta urinish yo'q
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);

