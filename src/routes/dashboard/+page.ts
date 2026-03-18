// src/routes/dashboard/+page.ts
import type { PageLoad } from './$types';
import type { Task } from '$lib/server/schema';

export const load: PageLoad = async ({ fetch }) => {
    // Hacemos la petición a nuestra API
    const response = await fetch('/api/tasks');
    
    // Le decimos a TypeScript que el resultado es un array de tareas
    const tasks: Task[] = await response.json();
    
    // Esto es lo que llena el objeto "data" en tu +page.svelte
    return {
        tasks
    };
};