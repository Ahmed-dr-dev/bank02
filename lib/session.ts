import { cookies } from 'next/headers';

const COOKIE_NAME = 'creditpro_user_id';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function getSessionProfileId(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value?.trim();
  return value || null;
}

export function setProfileIdCookie(profileId: string): string {
  return `${COOKIE_NAME}=${profileId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}`;
}

export function clearProfileIdCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
