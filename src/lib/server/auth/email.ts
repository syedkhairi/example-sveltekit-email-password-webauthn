import { db } from '$lib/server/db/index';
import * as table from '$lib/server/db/schema';
import { sql, eq } from 'drizzle-orm';

export function verifyEmailInput(email: string): boolean {
	return /^.+@.+\..+$/.test(email) && email.length < 256;
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
    const row = await db
        .$count(
            table.user,
            eq(table.user.email, email)
        )
    // const row = await db.execute(sql`SELECT COUNT(*) FROM user WHERE email = ${email}`);
    console.log(row);
    return row === 0;
}
