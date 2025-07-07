import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import db from "./db";
import { cookies } from "next/headers";

const adapter = new BetterSqlite3Adapter(db, {
    user: 'users',
    session: 'sessions'
});
const luciaInstance = new Lucia(adapter, {
    sessionCookie: {
        expires: false,
        attributes: {
            secure: process.env.NODE_ENV === 'production'
        }
    }
});

export async function createAuthSession(userId) {
    const session = await luciaInstance.createSession(userId, {})
    const sessionCookie = await luciaInstance.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

}

export async function verifyAuthSession() {
    const sessionCookie = cookies().get(luciaInstance.sessionCookieName);
    if (!sessionCookie) {
        return {
            user: null,
            session: null
        }
    }
    const sessionId = sessionCookie.value;
    if (!sessionId) {
        return {
            user: null,
            session: null
        }
    }

    const result = await luciaInstance.validateSession(sessionId);
    try {
        if (result.session && result.session.fresh) {
            const sessionCookie = luciaInstance.createSession(result.session.id);
            cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }
        if (!result.session) {
            const blankSessionCookie = luciaInstance.createBlankSessionCookie();
            cookies.set(blankSessionCookie.name, blankSessionCookie.value, blankSessionCookie.attributes);
        }
    } catch { }
    return result;
}
