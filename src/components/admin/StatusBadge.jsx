import { campaignStatus } from '../../utils/establishments';
export default function StatusBadge({ item }) { const status = campaignStatus(item); return <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>; }
