import { PILLARS } from "./pillars";

export type Scores = Record<number, (number | null)[]>; // pillarId -> [q1..q5]

export const emptyScores = (): Scores => {
  const s: Scores = {};
  PILLARS.forEach((p) => (s[p.id] = [null, null, null, null, null]));
  return s;
};

export const pillarTotal = (vals: (number | null)[]) =>
  vals.reduce<number>((a, b) => a + (b ?? 0), 0);

export const pillarAvg = (vals: (number | null)[]) => {
  const filled = vals.filter((v): v is number => v !== null);
  if (filled.length === 0) return 0;
  return filled.reduce((a, b) => a + b, 0) / filled.length;
};

export const isPillarComplete = (vals: (number | null)[]) =>
  vals.every((v) => v !== null);

export interface BindingConstraint {
  pillarId: number;
  pillarName: string;
  tier: string;
  total: number;
  constraintScore: number;
  evidence: { question: string; score: number }[];
}

export const computeBindingConstraint = (scores: Scores): BindingConstraint => {
  let best: BindingConstraint | null = null;
  for (const p of PILLARS) {
    const total = pillarTotal(scores[p.id]);
    const cs = 25 * p.weight - total * p.weight;
    if (!best || cs > best.constraintScore) {
      const vals = scores[p.id];
      const indexed = vals.map((v, i) => ({ v: v ?? 0, i }));
      indexed.sort((a, b) => a.v - b.v);
      const evidence = indexed.slice(0, 2).map((x) => ({
        question: p.questions[x.i],
        score: x.v,
      }));
      best = {
        pillarId: p.id,
        pillarName: p.name,
        tier: p.tier,
        total,
        constraintScore: cs,
        evidence,
      };
    }
  }
  return best!;
};

export interface CompanyInputs {
  arr: number;
  avgDeal: number;
  winRate: number;
  forecastAcc: number;
  pipelineCov: number;
  numAEs: number;
  nrr: number;
  currency?: "₹" | "$";
}

export const computeImpact = (i: CompanyInputs) => {
  const winRate = i.winRate / 100;
  const forecastAcc = i.forecastAcc / 100;
  const winImprovement = i.numAEs * i.avgDeal * 0.05 * 4;
  const forecastImprovement = i.arr * (1 - forecastAcc) * 0.25;
  const pipelineQuality = i.arr * 0.08;
  const nrrImprovement = i.arr * 0.05;
  const total = winImprovement + forecastImprovement + pipelineQuality + nrrImprovement;
  return { winImprovement, forecastImprovement, pipelineQuality, nrrImprovement, total };
};

export const formatMoney = (n: number, currency = "$") =>
  `${currency} ${Math.round(n).toLocaleString()}`;

export const statusFor = (total: number) => {
  if (total >= 20) return { label: "Operational", color: "#10B981" };
  if (total >= 15) return { label: "Needs attention", color: "#F59E0B" };
  if (total >= 10) return { label: "At risk", color: "#F97316" };
  return { label: "Critical", color: "#BE3455" };
};
