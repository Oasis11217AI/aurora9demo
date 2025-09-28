export const HOWTO_GOVERNANCE = `
#1 Goal
Wrap agent actions with controls: load policy → scan → enforce → approval → log.

#2 Columns
Left: Proposed Changes — what will change and why.
Middle: Control Timeline — the order of checks.
Right: KPIs — proposals, negatives, rollback-ready.

#3 Buttons
Start Demo: runs the flow and enables approval.
Approve Changes: logs a governance receipt with rollback token.

#4 What each control does
PII Scan: mask emails/phones; re-scan.
Model Card: allowlist models/versions.
Change Bands: cap risky changes (e.g., budget +25%).
Approval: human rationale if outside bands.

#5 Receipt (why it matters)
Immutable log for audit; includes policy pack, change set, rollback token, timestamp.
`;

export const HOWTO_PPC = `
#1 Goal
Hit target ROAS per campaign with bounded risk.

#2 Table columns (left)
Match: exact/phrase/broad
CTR: clicks ÷ impressions
CPC: spend ÷ clicks
ROAS: sales ÷ spend
ACoS: spend ÷ sales
Bid: current keyword bid

#3 Policy
targetROAS, minClicks, bidFloor, bidCeil, maxReallocPct.

#4 Actions
BID up/down by ROAS gap/lift (clamped to floors/ceilings).
NEG keyword if high clicks and zero orders.
Budget shift from low to high ROAS campaign (capped).

#5 Buttons
Start PPC Run → animate timeline to Approval.
Approve Changes → mint receipt + rollback token.

#6 Reading “Proposed Actions”
BID  campaign/adgroup "keyword" [match]  $old → $new  — rationale
NEG  campaign/adgroup "keyword" [match]  — reason
BUDGET  from → to  $amount  — rationale
`;

export const HOWTO_INVENTORY = `
#1 Goal
Avoid stockouts while controlling working capital.

#2 Scenario columns (left)
On Hand: current units.
On Order: pipeline units.
Daily Sales: average demand.
Lead Time: days to receive a PO.

#3 Math
LTD = dailySales × leadTime
Safety Buffer = LTD × policy%
ROP = LTD + Buffer
Proposed PO = max(0, ROP − (On Hand + On Order)) → capped → rounded to case pack.

#4 Buttons
Start Demo → calculates proposals.
Approve POs → creates receipt with PO lines.

#5 Why it helps
Explains the “why” per SKU (rationale) and logs an auditable receipt.
`;

export const HOWTO_COMPLIANCE = `
#1 Goal
Prove safe, governed autonomy for agents.

#2 Findings table
Risk, Title, Detail, Remediation.

#3 Controls
Policy load → PII scan → Model card → Guardrails → Approval → Apply & Immutable log.

#4 KPIs
Issues found, actions blocked, time to approval, rollback ready.

#5 Receipt
Contains policy pack, controls applied, exceptions, rollback token, timestamp.
`;

export const HOWTO_PRICING = `
#1 Goal
Explain tiers clearly and enable export.

#2 Columns
Tier — plan name
Monthly/Yearly — recurring prices
Key Features — core value points

#3 Actions
Export table as CSV, view technical format, or download JSON.
`;
