import { AspectRatio } from "../components/AspectRatio/AspectRatio";
import { Separator } from "../components/Separator/Separator";
import { Skeleton } from "../components/Skeleton/Skeleton";
import { Spinner } from "../components/Spinner/Spinner";
import { Badge } from "../components/Badge/Badge";
import { Alert, AlertDescription, AlertTitle } from "../components/Alert/Alert";
import { Card, CardBody, CardFooter, CardHeader } from "../components/Card/Card";
import { Progress } from "../components/Progress/Progress";
import { Avatar } from "../components/Avatar/Avatar";
import "./componentExamples.css";

export function SeparatorExample() {
  return <div className="ledger-example-stack"><span>Account details</span><Separator /><span>Payment permissions</span></div>;
}

export function SeparatorOrientationExample() {
  return <div className="ledger-example-row"><span>Overview</span><Separator orientation="vertical" /><span>Activity</span><Separator orientation="vertical" decorative={false} /><span>Settings</span></div>;
}

export function SkeletonExample() {
  return <div className="ledger-example-skeleton" aria-busy="true"><span className="ledger-example-visually-hidden" role="status">Loading account summary</span><Skeleton className="ledger-example-skeleton__avatar" /><div className="ledger-example-stack"><Skeleton className="ledger-example-skeleton__line" /><Skeleton className="ledger-example-skeleton__line ledger-example-skeleton__line--short" /></div></div>;
}

export function SpinnerExample() {
  return <div className="ledger-example-row"><Spinner size="small" /><span>Refreshing balances</span><Spinner label="Loading payment details" /></div>;
}

export function AspectRatioExample() {
  return <AspectRatio ratio={16 / 9} className="ledger-example-media"><div><strong>16:9</strong><span>Responsive media region</span></div></AspectRatio>;
}

export function BadgeExample() {
  return <div className="ledger-example-row"><Badge>Pending</Badge><Badge variant="informational">Processing</Badge><Badge variant="success">Completed</Badge><Badge variant="warning">Review</Badge><Badge variant="error">Failed</Badge></div>;
}

export function AlertExample() {
  return <Alert variant="informational"><AlertTitle>Payment cut-off approaching</AlertTitle><AlertDescription>Approve this payment before 15:30 for same-day processing.</AlertDescription></Alert>;
}

export function CardExample() {
  return <Card className="ledger-example-card"><CardHeader><strong>Operating account</strong></CardHeader><CardBody><span className="ledger-example-card__label">Available balance</span><strong className="ledger-example-card__value">£248,905.42</strong></CardBody><CardFooter>Updated today at 14:20</CardFooter></Card>;
}

export function ProgressExample() {
  return <div className="ledger-example-progress-set"><div className="ledger-example-progress"><span>Statement upload</span><Progress label="Statement upload progress" value={68} /><span>68%</span></div><div className="ledger-example-progress"><span>Connecting to bank</span><Progress label="Connecting to bank" value={null} /><span>In progress</span></div></div>;
}

export function AvatarExample() {
  return <div className="ledger-example-row"><Avatar src="/missing-avatar-small.png" alt="Ada Lovelace" fallback="AL" size="small" /><Avatar src="/missing-avatar-medium.png" alt="Grace Hopper" fallback="GH" /><Avatar src="/missing-avatar-large.png" alt="Katherine Johnson" fallback="KJ" size="large" /></div>;
}
