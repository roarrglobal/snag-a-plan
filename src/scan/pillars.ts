export type Tier = "Foundation" | "Execution" | "Compounding" | "AI Layer";

export interface Pillar {
  id: number;
  code: string;
  name: string;
  tier: Tier;
  weight: number;
  questions: string[];
}

export const PILLARS: Pillar[] = [
  {
    id: 1,
    code: "P1",
    name: "Revenue Strategy & ICP",
    tier: "Foundation",
    weight: 1.5,
    questions: [
      "Is your ICP defined with firmographic and behavioural specificity, or is it a description of who you have sold to historically?",
      "Does your revenue strategy have a written prioritisation rule for when pipeline volume conflicts with ICP quality?",
      "Can every AE articulate your differentiation in the language of the economic buyer, not the product?",
      "Is your addressable market sized from the bottom up using verified account data, or estimated from top-down industry reports?",
      "Does your strategy include a 12-month assumption set that would trigger a strategy revision if violated?",
    ],
  },
  {
    id: 2,
    code: "P2",
    name: "Revenue Growth & Pipeline",
    tier: "Foundation",
    weight: 1.5,
    questions: [
      "Is your pipeline sourced through a repeatable, documented motion, or is it primarily dependent on individual AE initiative?",
      "Does your pipeline coverage ratio reflect quality-adjusted opportunity count, or raw volume?",
      "Is lead-to-opportunity conversion tracked by source with documented quality thresholds?",
      "Can you predict next quarter's pipeline generation within 15% accuracy based on current inputs?",
      "Is pipeline health reviewed at the deal level weekly with a documented advancement or exit decision?",
    ],
  },
  {
    id: 3,
    code: "P3",
    name: "Revenue Operations",
    tier: "Foundation",
    weight: 1.5,
    questions: [
      "Is there a single source of truth for pipeline data that all revenue leaders use without reconciliation?",
      "Are CRM hygiene standards enforced with automated alerts, or managed through manual inspection?",
      "Is your forecast produced with a documented methodology, or through manager judgment applied to CRM data?",
      "Are revenue operations metrics reviewed at the same cadence and with the same rigour as financial metrics?",
      "Is there a documented escalation path when data quality falls below threshold before forecast submission?",
    ],
  },
  {
    id: 4,
    code: "P4",
    name: "Deal Closure",
    tier: "Execution",
    weight: 1.2,
    questions: [
      "Does your sales process have defined exit criteria for each stage, or do deals advance based on rep judgment?",
      "Is MEDDPICC or equivalent applied consistently to all opportunities above your deal-size threshold?",
      "Are mutual action plans used in all late-stage deals, with customer sign-off on milestones?",
      "Is your discount authority matrix documented and enforced, or managed through ad hoc approval?",
      "Are deal reviews conducted with a forensic focus on the economic buyer's decision criteria, not the product's capabilities?",
    ],
  },
  {
    id: 5,
    code: "P5",
    name: "Leadership Capability",
    tier: "Execution",
    weight: 1.2,
    questions: [
      "Does your revenue leadership team have a documented operating cadence with defined inputs, outputs, and accountability?",
      "Are frontline managers spending more than 50% of their time on individual rep skill development?",
      "Is rep performance assessed on leading indicators such as pipeline quality and activity patterns, or only on closed revenue?",
      "Is there a documented skill development path for AEs progressing from transactional to enterprise selling?",
      "When a rep misses quota, is the root cause identified as structural, skill, or motivation within 30 days?",
    ],
  },
  {
    id: 6,
    code: "P6",
    name: "Revenue Retention & NRR",
    tier: "Compounding",
    weight: 1.3,
    questions: [
      "Is NRR measured by cohort and by segment, or only as a company aggregate?",
      "Is there a documented early warning system for churn risk that triggers action 90 or more days before renewal?",
      "Are expansion motions such as upsell and cross-sell assigned to a named owner with quota accountability?",
      "Is customer health scoring automated from product usage data, or reliant on CS team subjective assessment?",
      "Is churn attributed to a root cause category at every loss — product gap, commercial misalignment, competitive loss, or relationship failure?",
    ],
  },
  {
    id: 7,
    code: "P7",
    name: "Gen-AI Governance",
    tier: "AI Layer",
    weight: 1.0,
    questions: [
      "Is there a documented policy governing which revenue functions use AI tools and under what data-sharing constraints?",
      "Are AI-generated revenue forecasts reviewed by a human with decision authority before board or investor communication?",
      "Is your AI vendor stack evaluated for data residency compliance with the jurisdictions your customers operate in?",
      "Is there a process for detecting and correcting AI-generated errors in customer-facing content before distribution?",
      "Does your AI governance framework include a named accountability owner, not a committee without individual authority?",
    ],
  },
  {
    id: 8,
    code: "P8",
    name: "AI Commercial Stack",
    tier: "AI Layer",
    weight: 1.0,
    questions: [
      "Are AI tools in your revenue stack evaluated on measured productivity impact, or adopted based on category reputation?",
      "Is there duplication in your AI commercial stack where two tools produce outputs that a human must manually reconcile?",
      "Are your AEs trained on AI tool outputs as inputs to their judgment, or do they treat AI outputs as final answers?",
      "Is the ROI of your AI commercial stack reviewed quarterly against the labour cost it was intended to reduce?",
      "Is there a documented integration between your AI tools and your CRM, or do AI insights live outside the system of record?",
    ],
  },
];

export const NERVE = {
  navy: "#0A1628",
  cobalt: "#0047AB",
  crimson: "#BE3455",
};

export const CALENDLY_URL = "https://calendly.com/mahesh/revenue-integrity";
