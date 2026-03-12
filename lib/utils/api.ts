import { NextResponse } from 'next/server';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function unauthorized(message = 'No autorizado') {
  return error(message, 401);
}

export function notFound(message = 'No encontrado') {
  return error(message, 404);
}

export function serverError(message = 'Error interno del servidor') {
  return error(message, 500);
}

/**
 * Wrapper para manejar errores en cualquier route handler
 */
export function withErrorHandler<Req extends Request = Request>(
  handler: (req: Req) => Promise<NextResponse>
) {
  return async (req: Req): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error inesperado';
      console.error('[API Error]', message);

      // Errores conocidos → 400, resto → 500
      const isKnown = [
        'No autorizado',
        'Saldo insuficiente',
        'Usuario no encontrado',
        'ya está registrado',
        'Credenciales inválidas',
      ].some((m) => message.includes(m));

      return isKnown ? error(message, 400) : serverError(message);
    }
  };
}
