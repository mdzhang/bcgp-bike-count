import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the new session screen by default", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "New session" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Location")).toBeInTheDocument();
    expect(screen.getByLabelText("Session date")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Start Session" }),
    ).toBeInTheDocument();
  });

  it("starts a counting session from the home screen", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("Location"), "Walnut");
    await user.click(screen.getByRole("button", { name: "Walnut St. Bridge" }));
    await user.click(screen.getByRole("button", { name: "Start Session" }));

    expect(
      screen.getByRole("heading", { name: "Walnut St. Bridge" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Start Segment" }),
    ).toBeInTheDocument();
  });
});
