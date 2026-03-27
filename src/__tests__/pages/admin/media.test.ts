import { formatBytes } from "@/pages/admin/media";

describe("formatBytes", () => {
  it("formatea bytes (< 1 KB)", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("formatea kilobytes (1 KB – 1 MB)", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1048575)).toBe("1024.0 KB");
  });

  it("formatea megabytes (>= 1 MB)", () => {
    expect(formatBytes(1048576)).toBe("1.0 MB");
    expect(formatBytes(5242880)).toBe("5.0 MB");
    expect(formatBytes(10485760)).toBe("10.0 MB");
  });
});
