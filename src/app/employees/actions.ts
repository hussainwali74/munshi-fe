'use server'

import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getEmployees() {
    const session = await getSession()
    if (!session) return []

    const { data, error } = await getDb()
        .from('employees')
        .select('*')
        .eq('user_id', session.userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Fetch employees error:', error)
        return []
    }

    return data
}

export async function addEmployee(formData: FormData) {
    const session = await getSession()
    if (!session) throw new Error('Not authenticated')

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const role = formData.get('role') as string
    const salary = formData.get('salary') ? parseFloat(formData.get('salary') as string) : null
    const joinDate = formData.get('joinDate') as string

    const { error } = await getDb().from('employees').insert({
        user_id: session.userId,
        name,
        phone,
        role,
        salary,
        join_date: joinDate,
        status: 'active'
    })

    if (error) {
        console.error('Employee creation error:', error)
        throw new Error('Failed to add employee')
    }

    revalidatePath('/employees')
}

export async function deleteEmployee(id: string) {
    const session = await getSession()
    if (!session) throw new Error('Not authenticated')

    const { error } = await getDb()
        .from('employees')
        .delete()
        .eq('id', id)
        .eq('user_id', session.userId)

    if (error) {
        console.error('Delete employee error:', error)
        throw new Error('Failed to delete employee')
    }

    revalidatePath('/employees')
}

export async function updateEmployee(formData: FormData) {
    const session = await getSession()
    if (!session) throw new Error('Not authenticated')

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const role = formData.get('role') as string
    const salary = formData.get('salary') ? parseFloat(formData.get('salary') as string) : null
    const joinDate = formData.get('joinDate') as string
    const status = formData.get('status') as string || 'active'

    const { error } = await getDb()
        .from('employees')
        .update({
            name,
            phone,
            role,
            salary,
            join_date: joinDate,
            status
        })
        .eq('id', id)
        .eq('user_id', session.userId)

    if (error) {
        console.error('Employee update error:', error)
        throw new Error('Failed to update employee')
    }

    revalidatePath('/employees')
}
