import jwt from 'jsonwebtoken';

const JWT_SECRET  = process.env.JWT_SECRET!;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN ?? '7d';

export interface JwtPayload {
  userId: string;
  phone:  string;
  iat?:   number;
  exp?:   number;
}

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

/**
 * Extrae y verifica el JWT del header Authorization.
 * Retorna el payload o null si es inválido.
 */
export function getTokenPayload(request: Request): JwtPayload | null {
  try {
    const auth  = request.headers.get('authorization') ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Versión que lanza error si no hay token válido (para rutas protegidas)
 */
export function requireAuth(request: Request): JwtPayload {
  const payload = getTokenPayload(request);
  if (!payload) throw new Error('No autorizado');
  return payload;
}
