import { PlaygroundExamples } from "./PlaygroundExamples";

export const metadata = { title: "Playground" };
export default function PlaygroundPage() { return <main id="main-content" className="page-shell inner-page"><div className="page-heading"><p className="eyebrow">Playground</p><h1>Explore ideas through real Ledger building blocks.</h1><p className="page-intro">Select a prompt to inspect a predefined interface example. This scaffold does not send text to an AI service or generate arbitrary responses.</p></div><PlaygroundExamples /></main>; }
