import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { categories, tasks } from '$lib/server/schema';

export const load: PageServerLoad = async () => {
    try {
        const allTasks = await db.select().from(tasks).all();
        const allCategories = await db.select().from(categories).all();
        
        const categoriesWithTasks = allCategories.map(cat => ({
            category: cat,
            tasks: allTasks.filter((t: any) => t.categoryId === cat.id && !t.completed)
        }));
        
        const uncategorized = allTasks.filter((t: any) => !t.categoryId && !t.completed);
        
        return { catData: categoriesWithTasks, sinCat: uncategorized };
    } catch (err) {
        console.error('Error:', err);
        return { catData: [], sinCat: [] };
    }
};