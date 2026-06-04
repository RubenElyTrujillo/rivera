import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminMetrics } from "@/components/admin/dashboard/AdminMetrics";

global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("AdminMetrics", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("renders loading skeletons while fetching", () => {
    mockFetch.mockImplementation(
      () =>
        new Promise(() => {}) as ReturnType<typeof fetch>
    );
    render(<AdminMetrics />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders metric cards after successful fetch", async () => {
    const now = new Date().toISOString();
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, coverImage: "img1.jpg" },
          { id: 2, coverImage: null },
          { id: 3, coverImage: "img3.jpg" },
        ]),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([1, 2, 3, 4, 5, 6, 7, 8]),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([1, 2, 3, 4, 5]),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, updatedAt: now, showMaterials: true, showShowroom: true }),
      } as unknown as Response);

    render(<AdminMetrics />);

    await waitFor(() => {
      expect(screen.getByText("Total Productos")).toBeInTheDocument();
    });
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // Sin imágenes (1 product with null coverImage)
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("renders with zero values when API returns zeros", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, updatedAt: null, showMaterials: true, showShowroom: true }),
      } as unknown as Response);

    render(<AdminMetrics />);

    await waitFor(() => {
      expect(screen.getByText("Total Productos")).toBeInTheDocument();
    });
    const zeroElements = screen.getAllByText("0");
    expect(zeroElements.length).toBe(5);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("handles fetch error gracefully", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: false,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: false,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: false,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: false,
      } as unknown as Response);

    render(<AdminMetrics />);

    await waitFor(() => {
      const metrics = document.querySelectorAll(".bg-white");
      expect(metrics.length).toBe(0);
    });
  });
});
