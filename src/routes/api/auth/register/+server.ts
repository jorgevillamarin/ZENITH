import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { hashPassword, verifyPassword } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request }) => {
    let body: any;
    try {
        body = await request.json();
    } catch {
        throw error(400, 'El cuerpo debe ser JSON válido');
    }
    
    const { name, lastname, email, password } = body;
    
    if (!name || !lastname || !email || !password) {
        throw error(400, 'Todos los campos son obligatorios');
    }
    
    if (password.length < 8) {
        throw error(400, 'La contraseña debe tener al menos 8 caracteres');
    }
    
    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).get();
    if (existing) {
        throw error(400, 'Ya existe una cuenta con este correo');
    }
    
    const fullName = `${name} ${lastname}`;
    const hashedPassword = await hashPassword(password);
    
    const [newUser] = await db.insert(users).values({
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: fullName.trim()
    }).returning();

    return json({ 
        success: true, 
        message: 'Cuenta creada exitosamente',
        user: { id: newUser.id, email: newUser.email, name: newUser.name }
    }, { status: 201 });
};