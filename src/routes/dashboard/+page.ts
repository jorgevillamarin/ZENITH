// src/routes/dashboard/+page.ts
import type { PageLoad } from './$types';
import type { Task, Category } from '$lib/server/schema';

export const load: PageLoad = async ({ fetch }) => {
    const [tasksRes, categoriesRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/categories')
    ]);
    
    let tasks: any[] = [];
    let categories: Category[] = [];
    
    if (tasksRes.ok) {
        const data = await tasksRes.json();
        tasks = Array.isArray(data) ? data : [];
    }
    
    if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        categories = Array.isArray(data) ? data : [];
    }
    
    const activeTasks = tasks.filter((task: any) => !task.completed);
    
    return {
        tasks: activeTasks,
        categories: categories
    };
};