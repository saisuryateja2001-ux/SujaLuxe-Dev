import jwt from "jsonwebtoken";
import type { AuthUser } from "./auth";

const JWT_SECRET = process.env.SESSION_SECRET || 'sujaluxe-secret-key-change-in-production';
const JWT_EXPIRATION = '30d';

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      userType: user.userType,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}
