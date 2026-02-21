'use server';

import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function loginUser(userId: string, passwordAttempt: string) {
    // Note: In a real production app, you should use bcrypt & salt for passwords,
    // but for a simple 2-person personal app, this is sufficient.
    const { data: user, error } = await supabase
        .from('users')
        .select('password')
        .eq('id', userId)
        .single();

    if (error || !user) {
        throw new Error('Usuario no encontrado');
    }

    if (user.password !== passwordAttempt) {
        return false;
    }

    // Set cookie that lasts 30 days
    (await cookies()).set('auth_user', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
    });

    return true;
}

export async function logoutUser() {
    (await cookies()).delete('auth_user');
}
