// src/routes/dashboard/resueltos/+page.ts
import type { PageLoad } from './$types';
import type { Task } from '$lib/server/schema';

export const load: PageLoad = async ({ fetch }) => {
    const response = await fetch('/api/tasks');
    const tasks: Task[] = await response.json();
    
    const resolvedTasks = tasks.filter(task => task.completed);
    
    return {
        tasks: resolvedTasks
    };
};
