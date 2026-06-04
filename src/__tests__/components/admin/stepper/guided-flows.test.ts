import { guidedFlows, getGuidedFlow } from "@/components/admin/stepper/guided-flows";

describe("guidedFlows registry", () => {
  it("exports three guided flows", () => {
    expect(guidedFlows).toHaveLength(3);
  });

  it("has agregar-producto flow with 6 steps", () => {
    const flow = getGuidedFlow("agregar-producto");
    expect(flow).toBeDefined();
    expect(flow?.steps).toHaveLength(6);
    expect(flow?.saveMethod).toBe("POST");
  });

  it("has agregar-proyecto flow with 6 steps", () => {
    const flow = getGuidedFlow("agregar-proyecto");
    expect(flow).toBeDefined();
    expect(flow?.steps).toHaveLength(6);
    expect(flow?.saveMethod).toBe("POST");
  });

  it("has actualizar-hero flow with 5 steps", () => {
    const flow = getGuidedFlow("actualizar-hero");
    expect(flow).toBeDefined();
    expect(flow?.steps).toHaveLength(5);
    expect(flow?.saveMethod).toBe("PUT");
  });

  it("returns undefined for unknown flow id", () => {
    const flow = getGuidedFlow("unknown-flow");
    expect(flow).toBeUndefined();
  });

  it("each flow has required properties", () => {
    guidedFlows.forEach((flow) => {
      expect(flow.id).toBeDefined();
      expect(flow.label).toBeDefined();
      expect(flow.description).toBeDefined();
      expect(flow.steps).toBeDefined();
      expect(flow.steps.length).toBeGreaterThan(0);
      expect(flow.saveEndpoint).toBeDefined();
      expect(flow.saveMethod).toBeDefined();
    });
  });
});
