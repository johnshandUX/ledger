import { useId, type ReactNode } from "react";
import "./Conversation.css";
export function ConversationAction({ title, children, actions }: Readonly<{ title: string; children?: ReactNode; actions: ReactNode }>) { const titleId = useId(); return <section className="ledger-conversation-action" aria-labelledby={titleId}><h3 id={titleId}>{title}</h3>{children}<div className="ledger-conversation-action__actions">{actions}</div></section>; }
