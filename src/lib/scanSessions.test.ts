import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the supabase client BEFORE importing the module under test.
const updateEq = vi.fn().mockResolvedValue({ data: null, error: null });
const updateBuilder = { eq: updateEq };
const update = vi.fn(() => updateBuilder);

const insertSingle = vi.fn().mockResolvedValue({ data: { id: "new-session-id" }, error: null });
const insertSelect = vi.fn(() => ({ single: insertSingle }));
const insert = vi.fn(() => ({ select: insertSelect }));

const fromMock = vi.fn((..._args: any[]) => ({ insert, update }));
const getUserMock = vi.fn().mockResolvedValue({ data: { user: { id: "user-1", email: "u@example.com" } } });
const invokeMock = vi.fn((..._args: any[]) => Promise.resolve({ data: null, error: null }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: any[]) => fromMock(...args),
    auth: { getUser: () => getUserMock() },
    functions: { invoke: (...args: any[]) => invokeMock(...args) },
  },
}));

import {
  autosavePillarScores,
  createInProgressSession,
  deserializeScores,
} from "@/lib/scanSessions";
import { PILLARS } from "@/scan/pillars";
import { emptyScores, isPillarComplete } from "@/scan/calc";

beforeEach(() => {
  fromMock.mockClear();
  insert.mockClear();
  insertSelect.mockClear();
  insertSingle.mockClear();
  update.mockClear();
  updateEq.mockClear();
  getUserMock.mockClear();
});

describe("scanSessions — serialize/deserialize", () => {
  it("deserializeScores restores partial pillar scores and leaves the rest null", () => {
    const stored = [
      { pillar_number: 1, pillar_name: "P1", tier: "Foundation", scores: [5, 4, 3, 2, 1], total: 15 },
      { pillar_number: 2, pillar_name: "P2", tier: "Foundation", scores: [3, 3, null, null, null], total: 6 },
    ];
    const scores = deserializeScores(stored);

    expect(scores[1]).toEqual([5, 4, 3, 2, 1]);
    expect(scores[2]).toEqual([3, 3, null, null, null]);
    expect(scores[3]).toEqual([null, null, null, null, null]);
    expect(isPillarComplete(scores[1])).toBe(true);
    expect(isPillarComplete(scores[2])).toBe(false);
  });

  it("deserializeScores returns all-null scores when given empty/invalid input", () => {
    const scores = deserializeScores(null);
    for (const p of PILLARS) {
      expect(scores[p.id]).toEqual([null, null, null, null, null]);
    }
  });
});

describe("scanSessions — autosave", () => {
  it("autosavePillarScores writes serialized pillar_scores to the session row", async () => {
    const scores = emptyScores();
    scores[1] = [4, 4, 4, 4, 4];
    scores[3] = [2, 2, null, null, null];

    await autosavePillarScores("sess-123", scores);

    expect(fromMock).toHaveBeenCalledWith("scan_sessions");
    expect(update).toHaveBeenCalledTimes(1);
    expect(updateEq).toHaveBeenCalledWith("id", "sess-123");

    const payload: any = (update.mock.calls[0] as any[])[0];
    expect(Array.isArray(payload.pillar_scores)).toBe(true);
    expect(payload.pillar_scores).toHaveLength(PILLARS.length);

    const p1 = payload.pillar_scores.find((r: any) => r.pillar_number === 1);
    const p3 = payload.pillar_scores.find((r: any) => r.pillar_number === 3);
    expect(p1.scores).toEqual([4, 4, 4, 4, 4]);
    expect(p1.total).toBe(20);
    expect(p3.scores).toEqual([2, 2, null, null, null]);
    expect(p3.total).toBe(4);
    expect(payload.updated_at).toEqual(expect.any(String));
  });
});

describe("scanSessions — createInProgressSession", () => {
  it("inserts an in_progress row scoped to the current user and returns the id", async () => {
    const id = await createInProgressSession({
      arr: 50_000_000,
      avgDeal: 500_000,
      winRate: 22,
      forecastAcc: 61,
      pipelineCov: 3.2,
      numAEs: 8,
      nrr: 98,
    });

    expect(id).toBe("new-session-id");
    expect(fromMock).toHaveBeenCalledWith("scan_sessions");
    const payload: any = (insert.mock.calls[0] as any[])[0];
    expect(payload.status).toBe("in_progress");
    expect(payload.completed).toBe(false);
    expect(payload.user_id).toBe("user-1");
    expect(payload.company_inputs.arr).toBe(50_000_000);
    expect(sessionStorage.getItem("nerve_scan_session_id")).toBe("new-session-id");
  });

  it("returns null when the user is signed out", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null } });
    const id = await createInProgressSession({
      arr: 1, avgDeal: 1, winRate: 1, forecastAcc: 1, pipelineCov: 1, numAEs: 1, nrr: 1,
    });
    expect(id).toBeNull();
    expect(insert).not.toHaveBeenCalled();
  });
});

describe("scanSessions — resume index logic", () => {
  // Mirrors the ScanNew page's resume calculation:
  //   PILLARS.findIndex((p) => !isPillarComplete(scores[p.id]))
  // This guarantees a resumed scan jumps to the first incomplete pillar.
  it("resumes at the first pillar with any missing answer", () => {
    const stored = [
      { pillar_number: 1, scores: [5, 4, 3, 2, 1] },
      { pillar_number: 2, scores: [3, 3, 3, 3, 3] },
      { pillar_number: 3, scores: [4, 4, null, null, null] },
      { pillar_number: 4, scores: [null, null, null, null, null] },
    ];
    const scores = deserializeScores(stored);
    const firstIncomplete = PILLARS.findIndex((p) => !isPillarComplete(scores[p.id]));
    expect(firstIncomplete).toBe(2); // 0-indexed → P3
  });

  it("resumes at pillar 0 when nothing has been answered", () => {
    const scores = deserializeScores(null);
    const firstIncomplete = PILLARS.findIndex((p) => !isPillarComplete(scores[p.id]));
    expect(firstIncomplete).toBe(0);
  });

  it("returns -1 when every pillar is complete (caller treats this as finished)", () => {
    const stored = PILLARS.map((p) => ({
      pillar_number: p.id,
      scores: [3, 3, 3, 3, 3],
    }));
    const scores = deserializeScores(stored);
    const firstIncomplete = PILLARS.findIndex((p) => !isPillarComplete(scores[p.id]));
    expect(firstIncomplete).toBe(-1);
  });
});
