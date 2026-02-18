import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SessionUser } from "@/lib/types";

import { SESSION_COOKIE } from "@/lib/constants";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 15;

type InternalUser = SessionUser & {
  passwordHash: string;
};

type SessionPayload = SessionUser & {
  exp: number;
};

export const createPasswordHash = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
};

const getUsers = (): InternalUser[] => {
  const username = process.env.AUTH_USERNAME;
  const passwordHash = process.env.AUTH_PASSWORD_HASH;
  const displayName = process.env.AUTH_DISPLAY_NAME;

  if (!username || !passwordHash) {
    throw new Error("Missing required auth env vars: AUTH_USERNAME, AUTH_PASSWORD_HASH");
  }

  return [
    {
      name: displayName?.trim() || username.trim(),
      username: username.trim().toLowerCase(),
      passwordHash,
    },
  ];
};

const verifyPassword = (password: string, stored: string) => {
  const [algorithm, salt, hashHex] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !hashHex) return false;

  const hashedInput = scryptSync(password, salt, 64);
  const hashBuffer = Buffer.from(hashHex, "hex");
  if (hashBuffer.length !== hashedInput.length) return false;

  return timingSafeEqual(hashBuffer, hashedInput);
};

const getSecret = () => {
  if (!process.env.AUTH_SECRET) {
    throw new Error("Missing AUTH_SECRET env var");
  }
  return process.env.AUTH_SECRET;
};

const encodeBase64Url = (value: string) => Buffer.from(value).toString("base64url");
const decodeBase64Url = (value: string) => Buffer.from(value, "base64url").toString("utf8");

const sign = (encodedPayload: string) =>
  createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url");

export const buildSessionToken = (user: SessionUser) => {
  const payload: SessionPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

export const verifySessionToken = (token: string | undefined | null): SessionUser | null => {
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = sign(encodedPayload);
  if (expectedSignature !== signature) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as SessionPayload;
    if (!payload?.name || !payload?.username || !payload?.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return {
      name: payload.name,
      username: payload.username,
    };
  } catch {
    return null;
  }
};

export const authenticate = (username: string, password: string): SessionUser | null => {
  const normalizedUsername = username.trim().toLowerCase();
  const user = getUsers().find((candidate) => candidate.username === normalizedUsername);
  if (!user) return null;

  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) return null;

  return {
    name: user.name,
    username: user.username,
  };
};

export const setSessionCookie = (response: NextResponse, token: string) => {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
};

export const clearSessionCookie = (response: NextResponse) => {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
};

export const getSessionFromRequest = (request: NextRequest) => {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
};

export const getSessionFromCookieStore = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
};
