export type AdditionalAccessId = "developer";

export interface AdditionalAccessDefinition {
  id: AdditionalAccessId;
  name: string;
  description: string;
}

export const additionalAccessCatalogue = [
  {
    id: "developer",
    name: "Developer",
    description: "Access to developer tools, banking APIs and integrations.",
  },
] as const satisfies readonly AdditionalAccessDefinition[];
