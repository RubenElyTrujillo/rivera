import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/content/hero";

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock("@/lib/db", () => ({
  db: {
    heroContent: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
}));

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const mockedFindFirst = db.heroContent.findFirst as jest.Mock;
const mockedUpdate = db.heroContent.update as jest.Mock;
const mockedCreate = db.heroContent.create as jest.Mock;
const mockedRequireAuth = requireAuth as jest.Mock;

// ── Helpers ──────────────────────────────────────────────────────────────────

function mockRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as NextApiResponse;
  return res;
}

const heroData = {
  id: 1,
  subtitle: "Diseño de interiores",
  titleLine1: "Rivera",
  titleLine2: "Studio",
  description: "Expertos en pisos",
  imageUrl: "/images/hero.jpg",
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("GET /api/content/hero", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna el contenido del hero con status 200", async () => {
    mockedFindFirst.mockResolvedValueOnce(heroData);

    const req = { method: "GET" } as NextApiRequest;
    const res = mockRes();
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(heroData);
  });

  it("retorna null si no hay contenido del hero", async () => {
    mockedFindFirst.mockResolvedValueOnce(null);

    const req = { method: "GET" } as NextApiRequest;
    const res = mockRes();
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(null);
  });
});

describe("PUT /api/content/hero", () => {
  beforeEach(() => jest.clearAllMocks());

  const body = {
    subtitle: "Nuevo subtitle",
    titleLine1: "Rivera",
    titleLine2: "Studio",
    description: "Desc actualizada",
    imageUrl: "/images/nuevo.jpg",
  };

  it("actualiza el hero si ya existe y el usuario está autenticado", async () => {
    mockedRequireAuth.mockReturnValueOnce({ userId: 1, email: "admin@test.com" });
    mockedFindFirst.mockResolvedValueOnce(heroData);
    mockedUpdate.mockResolvedValueOnce({ ...heroData, ...body });

    const req = { method: "PUT", body } as unknown as NextApiRequest;
    const res = mockRes();
    await handler(req, res);

    expect(mockedUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: heroData.id } }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("crea un nuevo hero si no existe registro previo", async () => {
    mockedRequireAuth.mockReturnValueOnce({ userId: 1, email: "admin@test.com" });
    mockedFindFirst.mockResolvedValueOnce(null);
    mockedCreate.mockResolvedValueOnce({ id: 2, ...body });

    const req = { method: "PUT", body } as unknown as NextApiRequest;
    const res = mockRes();
    await handler(req, res);

    expect(mockedCreate).toHaveBeenCalled();
    expect(mockedUpdate).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("retorna 401 sin autenticación (requireAuth devuelve null y responde)", async () => {
    mockedRequireAuth.mockImplementationOnce((_req: unknown, res: NextApiResponse) => {
      res.status(401).json({ error: "No autenticado" });
      return null;
    });

    const req = { method: "PUT", body } as unknown as NextApiRequest;
    const res = mockRes();
    await handler(req, res);

    expect(mockedFindFirst).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe("Método no permitido /api/content/hero", () => {
  it("responde 405 para DELETE", async () => {
    const req = { method: "DELETE" } as NextApiRequest;
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });
});
