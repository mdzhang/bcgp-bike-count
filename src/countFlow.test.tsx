import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CountSession from "./components/CountSession";
import {
  UI_OBSERVATION_COMBOS,
  createTestSegments,
  createTestSession,
} from "./test/fixtures";
import { generateCsv } from "./utils/csv";
import type { PersistedCountState } from "./utils/persistedSession";
import { createFreshAppState } from "./utils/persistedSession";

function renderActiveCountSession() {
  const session = createTestSession();
  const initialCountState: PersistedCountState = {
    ...createFreshAppState(session),
    segmentStates: {
      0: {
        status: "running",
        startedAt: new Date("2026-09-14T11:35:00.000Z"),
      },
    },
  };
  let latestState = initialCountState;
  const onPersist = vi.fn((state: PersistedCountState) => {
    latestState = state;
  });

  render(
    <CountSession
      session={session}
      initialCountState={initialCountState}
      onPersist={onPersist}
      onNewSession={vi.fn()}
    />,
  );

  return { session, getLatestState: () => latestState };
}

async function submitObservation(
  user: ReturnType<typeof userEvent.setup>,
  combo: (typeof UI_OBSERVATION_COMBOS)[number],
) {
  if (combo.form.ridingSurface === "sidewalk") {
    await user.click(screen.getByRole("button", { name: /Sidewalk/i }));
  } else if (combo.form.ridingSurface === "against_traffic") {
    await user.click(screen.getByRole("button", { name: /Against Traffic/i }));
  }

  if (combo.form.directionAxis === "ns") {
    await user.click(screen.getByRole("button", { name: "North/South" }));
    if (combo.form.direction === "S") {
      await user.click(screen.getByRole("button", { name: "North/South" }));
    }
  } else if (combo.form.direction === "W") {
    await user.click(screen.getByRole("button", { name: "East/West" }));
  }

  if (combo.form.gender === "F") {
    await user.click(screen.getByRole("button", { name: /Female/i }));
  } else if (combo.form.gender === "X") {
    await user.click(screen.getByRole("button", { name: /Unknown/i }));
  }

  if (combo.form.helmet) {
    await user.click(screen.getByRole("button", { name: "Helmet" }));
  }

  if (combo.form.indego) {
    await user.click(screen.getByRole("button", { name: "Indego" }));
  }

  if (combo.form.mobilityType === "emoto") {
    await user.click(screen.getByRole("button", { name: /E-Moto/i }));
  } else if (combo.form.mobilityType === "ebike") {
    await user.click(screen.getByRole("button", { name: /E-Bike/i }));
  } else if (combo.form.mobilityType === "scooter") {
    await user.click(screen.getByRole("button", { name: /Scooter/i }));
  }

  await user.click(screen.getByRole("button", { name: "Submit" }));
}

describe("counting flow", () => {
  it("records different observation combos and exports expected csv", async () => {
    const user = userEvent.setup();
    const { session, getLatestState } = renderActiveCountSession();

    for (const combo of UI_OBSERVATION_COMBOS) {
      await submitObservation(user, combo);
    }

    await user.click(screen.getByRole("button", { name: "End Session" }));
    const dialog = screen.getByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "End Session" }),
    );

    expect(
      screen.getByText(
        new RegExp(`Recorded counts \\(${UI_OBSERVATION_COMBOS.length}\\)`),
      ),
    ).toBeInTheDocument();

    const csv = generateCsv(
      getLatestState().segmentEntries,
      createTestSegments(session),
    );

    expect(csv.split("\n")[0]).toBe(
      "start_time,end_time,direction,riding_surface,gender,helmet,indego,emoto,ebike,scooter,notes",
    );
    expect(csv.split("\n")).toHaveLength(UI_OBSERVATION_COMBOS.length + 1);
    expect(csv).toContain(
      "east/west,on_street,M,false,false,false,false,false,",
    );
    expect(csv).toContain(
      "north/south,sidewalk,F,true,true,false,false,false,",
    );
    expect(csv).toContain(
      "east/west,on_street,F,false,false,false,false,true,",
    );
  });
});
