import { render, screen } from "@testing-library/react";
import { MetricCard } from "@/components/admin/dashboard/MetricCard";

describe("MetricCard", () => {
  it("renders label and value", () => {
    render(<MetricCard label="Total Productos" value={42} icon="Package" />);
    expect(screen.getByText("Total Productos")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders with numeric value", () => {
    render(<MetricCard label="Usuarios" value={1250} icon="FileText" />);
    expect(screen.getByText("1250")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(<MetricCard label="Test" value={0} icon="Package" />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders without trend when not provided", () => {
    render(<MetricCard label="Test" value={10} icon="Package" />);
    expect(screen.queryByText(/\+\d+%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument();
  });

  it("renders positive trend indicator", () => {
    render(<MetricCard label="Test" value={10} icon="Package" trend={{ value: 12, direction: "up" }} />);
    expect(screen.getByText("+12%")).toBeInTheDocument();
  });

  it("renders negative trend indicator", () => {
    render(<MetricCard label="Test" value={10} icon="Package" trend={{ value: 5, direction: "down" }} />);
    expect(screen.getByText("-5%")).toBeInTheDocument();
  });

  it("displays trend label when provided", () => {
    render(
      <MetricCard
        label="Ingresos"
        value={1000}
        icon="FileText"
        trend={{ value: 8, direction: "up", label: "vs mes anterior" }}
      />
    );
    expect(screen.getByText("vs mes anterior")).toBeInTheDocument();
  });
});
