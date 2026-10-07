import { describe, expect, it } from "vitest";
import { availableComponentManifest, componentManifest, getAvailableComponentDefinition } from "./componentManifest";

describe("component manifest lifecycle", () => {
  it("keeps implementation lifecycle separate from publication status", () => {
    const planned = componentManifest.filter((component) => component.lifecycle === "Planned");
    expect(planned.length).toBeGreaterThan(0);
    expect(planned.every((component) => component.publication === "Unpublished" && component.entry === null)).toBe(true);
  });

  it("does not expose planned records as available component routes", () => {
    expect(availableComponentManifest.every((component) => component.lifecycle !== "Planned" && component.publication !== "Unpublished")).toBe(true);
    expect(getAvailableComponentDefinition("tabs")).toBeUndefined();
    expect(getAvailableComponentDefinition("button")?.entry).toBe("root");
  });

  it("uses unique names and slugs across implemented and planned records", () => {
    expect(new Set(componentManifest.map(({ name }) => name)).size).toBe(componentManifest.length);
    expect(new Set(componentManifest.map(({ slug }) => slug)).size).toBe(componentManifest.length);
  });
});
