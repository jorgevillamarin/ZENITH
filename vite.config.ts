import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    // Añadimos tailwindcss() antes de sveltekit()
    plugins: [tailwindcss(), sveltekit()] 
});