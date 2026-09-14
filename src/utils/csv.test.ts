import { describe, expect, it } from "vitest";
import {
  OBSERVATION_COMBOS,
  createTestSegments,
  createTestSession,
  entryFromForm,
} from "../test/fixtures";
import { formatCsvTime, generateCsv } from "./csv";

const CSV_HEADER =
  "start_time,end_time,direction,riding_surface,gender,helmet,indego,emoto,ebike,scooter,notes";

function parseCsv(csv: string): string[][] {
  return csv.split("\n").map((line) => {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (char === "," && !inQuotes) {
        fields.push(current);
        current = "";
        continue;
      }
      current += char;
    }

    fields.push(current);
    return fields;
  });
}

describe("generateCsv", () => {
  it("includes the expected header row", () => {
    const csv = generateCsv({}, createTestSegments());
    expect(csv.split("\n")[0]).toBe(CSV_HEADER);
  });

  it("formats segment times in ET to minute precision", () => {
    const session = createTestSession();
    const [segment] = createTestSegments(session);
    const csv = generateCsv(
      {
        0: [
          entryFromForm(OBSERVATION_COMBOS[0].form, {
            id: "entry-1",
          }),
        ],
      },
      [segment],
    );

    const [, row] = parseCsv(csv);
    expect(row[0]).toBe(formatCsvTime(segment.startTime));
    expect(row[1]).toBe(formatCsvTime(segment.endTime));
    expect(row[0]).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2} ET$/);
    expect(row[0]).not.toContain(":00.000");
  });

  it.each(OBSERVATION_COMBOS)(
    "serializes the $name observation combo",
    ({ form, expectedRow }) => {
      const [segment] = createTestSegments();
      const csv = generateCsv(
        {
          0: [
            entryFromForm(form, {
              id: "entry-1",
            }),
          ],
        },
        [segment],
      );

      const lines = csv.split("\n");
      expect(lines).toHaveLength(2);

      const [, row] = parseCsv(csv);
      expect(row).toEqual([
        formatCsvTime(segment.startTime),
        formatCsvTime(segment.endTime),
        expectedRow.direction,
        expectedRow.ridingSurface,
        expectedRow.gender,
        expectedRow.helmet ? "true" : "false",
        expectedRow.indego ? "true" : "false",
        expectedRow.emoto ? "true" : "false",
        expectedRow.ebike ? "true" : "false",
        expectedRow.scooter ? "true" : "false",
        expectedRow.notes,
      ]);
    },
  );

  it("outputs multiple observations across segments in order", () => {
    const segments = createTestSegments();
    const csv = generateCsv(
      {
        0: [
          entryFromForm(OBSERVATION_COMBOS[0].form, { id: "entry-1" }),
          entryFromForm(OBSERVATION_COMBOS[1].form, { id: "entry-2" }),
        ],
        1: [entryFromForm(OBSERVATION_COMBOS[2].form, { id: "entry-3" })],
      },
      segments,
    );

    const rows = parseCsv(csv);
    expect(rows).toHaveLength(4);
    expect(rows[1][4]).toBe("M");
    expect(rows[2][4]).toBe("F");
    expect(rows[3][7]).toBe("true");
    expect(rows[3][10]).toBe('Said "hello"');
  });
});
