import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/quotation";

// ── Mock de fetch global ──────────────────────────────────────────────────────
const mockFetch = jest.fn();
global.fetch = mockFetch;

// ── Helpers ──────────────────────────────────────────────────────────────────

function mockRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as NextApiResponse;
  return res;
}

function postReq(body: object): NextApiRequest {
  return { method: "POST", body } as unknown as NextApiRequest;
}

function getReq(): NextApiRequest {
  return { method: "GET", body: {} } as unknown as NextApiRequest;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/quotation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.N8N_QUOTATION_WEBHOOK_URL;
  });

  it("responde 200 con datos válidos (sin webhook configurado)", async () => {
    const res = mockRes();
    await handler(
      postReq({ name: "Juan", phone: "123", surface: "Piso", area: "50", location: "CDMX", message: "" }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("responde 400 si falta el tipo de superficie", async () => {
    const res = mockRes();
    await handler(
      postReq({ name: "Juan", phone: "123", surface: "", area: "50", location: "CDMX", message: "" }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("superficie") }),
    );
  });

  it("responde 405 para métodos distintos de POST", async () => {
    const res = mockRes();
    await handler(getReq(), res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("llama al webhook de n8n si está configurado", async () => {
    process.env.N8N_QUOTATION_WEBHOOK_URL = "https://n8n.example.com/webhook/test";
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, text: async () => "" });

    const res = mockRes();
    await handler(
      postReq({ name: "Ana", phone: "555", surface: "Cerámica", area: "30", location: "GDL", message: "urgente" }),
      res,
    );

    expect(mockFetch).toHaveBeenCalledWith(
      "https://n8n.example.com/webhook/test",
      expect.objectContaining({ method: "POST" }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("sigue respondiendo 200 aunque el webhook falle", async () => {
    process.env.N8N_QUOTATION_WEBHOOK_URL = "https://n8n.example.com/webhook/test";
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const res = mockRes();
    await handler(
      postReq({ name: "Ana", phone: "555", surface: "Mármol", area: "20", location: "MTY", message: "" }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
