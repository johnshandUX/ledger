import type { Meta, StoryObj } from "@storybook/react-vite";
import { CardExample } from "../../examples/componentExamples";
import { Card, CardBody } from "./Card";
const meta = { title: "Components/Card", component: Card, tags: ["autodocs"], parameters: { layout: "centered" }, args: { children: <CardBody>Related content</CardBody> } } satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AccountSummary: Story = { render: () => <CardExample /> };
export const BodyOnly: Story = { render: () => <div style={{ width: 360 }}><Card><CardBody>Use a Card only when the surface improves grouping.</CardBody></Card></div> };
