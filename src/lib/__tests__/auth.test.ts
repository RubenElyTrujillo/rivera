import { signToken, verifyToken, getTokenFromRequest, requireAuth } from "@/lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";

// ── Helpers ──────────────────────────────────────────────────────────────────

function mockRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
  } as unknown as NextApiResponse;
  return res;
}

function reqWithCookie(cookie: string): NextApiRequest {
  return { cookies: { rivera_admin_token: cookie }, headers: {} } as unknown as NextApiRequest;
}

function reqWithBearer(token: string): NextApiRequest {
  return { cookies: {}, headers: { authorization: `Bearer ${token}` } } as unknown as NextApiRequest;
}

function reqWithNoAuth(): NextApiRequest {
  return { cookies: {}, headers: {} } as unknown as NextApiRequest;
}

// ── signToken / verifyToken ───────────────────────────────────────────────────

describe("signToken + verifyToken", () => {
  const payload = { userId: 1, email: "admin@test.com" };

  it("firma y verifica un token válido", () => {
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(1);
    expect(decoded?.email).toBe("admin@test.com");
  });

  it("retorna null para un token malformado", () => {
    expect(verifyToken("token.invalido.xxx")).toBeNull();
  });

  it("retorna null para una cadena vacía", () => {
    expect(verifyToken("")).toBeNull();
  });

  it("retorna null para un token firmado con distinto secreto", () => {
    // Genera un JWT con secreto incorrecto manualmente
    const fakeToken =
      "eyJhbGciOiJIUzI1NiJ9" +
      ".eyJ1c2VySWQiOjEsImVtYWlsIjoiYUBiLmNvbSJ9" +
      ".firmaFalsa";
    expect(verifyToken(fakeToken)).toBeNull();
  });
});

// ── getTokenFromRequest ───────────────────────────────────────────────────────

describe("getTokenFromRequest", () => {
  it("extrae el token desde la cookie", () => {
    const token = signToken({ userId: 1, email: "x@x.com" });
    const req = reqWithCookie(token);
    expect(getTokenFromRequest(req)).toBe(token);
  });

  it("extrae el token desde el header Authorization Bearer", () => {
    const token = signToken({ userId: 2, email: "y@y.com" });
    const req = reqWithBearer(token);
    expect(getTokenFromRequest(req)).toBe(token);
  });

  it("retorna null cuando no hay cookie ni header", () => {
    expect(getTokenFromRequest(reqWithNoAuth())).toBeNull();
  });

  it("la cookie tiene prioridad sobre el header Bearer", () => {
    const cookieToken = signToken({ userId: 1, email: "cookie@test.com" });
    const bearerToken = signToken({ userId: 2, email: "bearer@test.com" });
    const req = {
      cookies: { rivera_admin_token: cookieToken },
      headers: { authorization: `Bearer ${bearerToken}` },
    } as unknown as NextApiRequest;
    expect(getTokenFromRequest(req)).toBe(cookieToken);
  });
});

// ── requireAuth ───────────────────────────────────────────────────────────────

describe("requireAuth", () => {
  it("retorna el payload para una request autenticada correctamente", () => {
    const token = signToken({ userId: 5, email: "admin@rivera.com" });
    const req = reqWithCookie(token);
    const res = mockRes();
    const result = requireAuth(req, res);
    expect(result).not.toBeNull();
    expect(result?.userId).toBe(5);
  });

  it("responde 401 y retorna null si no hay token", () => {
    const req = reqWithNoAuth();
    const res = mockRes();
    const result = requireAuth(req, res);
    expect(result).toBeNull();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No autenticado" });
  });

  it("responde 401 y retorna null si el token es inválido", () => {
    const req = reqWithCookie("token.invalido");
    const res = mockRes();
    const result = requireAuth(req, res);
    expect(result).toBeNull();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token inválido o expirado" });
  });
});
