import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/auth/login";

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  signToken: jest.fn().mockReturnValue("mock.jwt.token"),
  setAuthCookie: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

import { db } from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

const mockedFindUnique = db.user.findUnique as jest.Mock;
const mockedCompare = bcrypt.compare as jest.Mock;
const mockedSignToken = signToken as jest.Mock;
const mockedSetAuthCookie = setAuthCookie as jest.Mock;

// ── Helpers ──────────────────────────────────────────────────────────────────

function mockRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
  } as unknown as NextApiResponse;
  return res;
}

function postReq(body: object): NextApiRequest {
  return { method: "POST", body, headers: {}, socket: {} } as unknown as NextApiRequest;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  const fakeUser = { id: 1, email: "admin@test.com", passwordHash: "hashed_password" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("responde 200 y setea la cookie con credenciales válidas", async () => {
    mockedFindUnique.mockResolvedValueOnce(fakeUser);
    mockedCompare.mockResolvedValueOnce(true);

    const res = mockRes();
    await handler(postReq({ email: "admin@test.com", password: "secret" }), res);

    expect(mockedFindUnique).toHaveBeenCalledWith({ where: { email: "admin@test.com" } });
    expect(mockedCompare).toHaveBeenCalledWith("secret", "hashed_password");
    expect(mockedSignToken).toHaveBeenCalledWith({ userId: 1, email: "admin@test.com" });
    expect(mockedSetAuthCookie).toHaveBeenCalledWith(res, "mock.jwt.token");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("responde 400 si falta el email", async () => {
    const res = mockRes();
    await handler(postReq({ password: "secret" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("responde 400 si falta la contraseña", async () => {
    const res = mockRes();
    await handler(postReq({ email: "admin@test.com" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("responde 401 si el usuario no existe", async () => {
    mockedFindUnique.mockResolvedValueOnce(null);

    const res = mockRes();
    await handler(postReq({ email: "noexiste@test.com", password: "secret" }), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Credenciales inválidas" });
  });

  it("responde 401 si la contraseña es incorrecta", async () => {
    mockedFindUnique.mockResolvedValueOnce(fakeUser);
    mockedCompare.mockResolvedValueOnce(false);

    const res = mockRes();
    await handler(postReq({ email: "admin@test.com", password: "wrong" }), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Credenciales inválidas" });
  });

  it("responde 405 para métodos distintos de POST", async () => {
    const res = mockRes();
    await handler({ method: "GET", body: {} } as unknown as NextApiRequest, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });
});
