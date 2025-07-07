'use server';

import { createAuthSession } from "@/lib/auth";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createUser, getUserByEmail } from "@/lib/user";
import { redirect } from "next/navigation";

export async function signup(previousFormState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    let errors = {};
    if (!email.includes('@')) {
        errors.email = 'Please enter a valid password';
    }

    if (password.trim().length < 8) {
        errors.password = 'Password must be atleast 8 characters long';
    }
    if (Object.keys(errors).length > 0) {
        return {
            errors,
        }
    }
    // store the user in a database 
    const hashedPassword = hashUserPassword(password);
    try{
        const userId = createUser(email, hashedPassword)
        createAuthSession(userId);
        redirect('/training');
    }catch(error){
        if(error.code === 'SQLITE_CONSTRAINT_UNIQUE'){
            return {
                errors:{
                    email: 'This email already exists'
                }
            }
        }
        throw error;
    } 
}

export async function login(prevFormState, formData){
    const email = formData.get('email');
    const password = formData.get('password');

    const existingUser = getUserByEmail(email);
    if(!existingUser){
        return {
            errors:{
                email: 'Could not authenticate user , please check the credentials.'
            }
        }
    }
    const isValidPassword = verifyPassword(existingUser.password, password);
    if(!isValidPassword){
        return{
            errors:{
                password: 'Could not authenticate user , please check the credentials.'
            }
        }
    }
    await createAuthSession(existingUser.id);
    redirect('/training');
}

export async function auth(mode, prevFormState, formData){
    if(mode === 'login'){
        return login(prevFormState, formData)
    }
    return signup(prevFormState, formData);
}