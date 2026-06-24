import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { PILLARS } from "./pillars";
import { Scores, pillarAvg } from "./calc";

export function RadarPanel({ scores, large = false }: { scores: Scores; large?: boolean }) {
  const data = PILLARS.map((p) => ({
    axis: large ? p.name : p.code,
    fullName: p.name,
    value: pillarAvg(scores[p.id]),
  }));

  return (
    <div
      style={{
        background: "#0A1628",
        border: "1px solid rgba(0,71,171,0.2)",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <ResponsiveContainer width="100%" height={large ? 500 : 280}>
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "rgba(255,255,255,0.85)", fontSize: large ? 12 : 11 }}
          />
          <PolarRadiusAxis
            domain={[0, 5]}
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
            stroke="rgba(255,255,255,0.2)"
            axisLine={false}
          />
          <Radar
            dataKey="value"
            stroke="#0047AB"
            strokeWidth={2}
            fill="#0047AB"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
