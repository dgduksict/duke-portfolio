import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Segmented, Slider, Switch, ToggleChip } from "@/components/ui/controls";

describe("Segmented", () => {
  const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
  ] as const;

  it("marks the selected option and reports changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Segmented ariaLabel="Choice" options={options} value="a" onChange={onChange} />,
    );

    expect(screen.getByRole("tab", { name: "Alpha" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Beta" })).toHaveAttribute("aria-selected", "false");

    await user.click(screen.getByRole("tab", { name: "Beta" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith("b");
  });

  it("exposes an accessible tablist", () => {
    render(<Segmented ariaLabel="Choice" options={options} value="a" onChange={vi.fn()} />);
    expect(screen.getByRole("tablist", { name: "Choice" })).toBeInTheDocument();
  });
});

describe("Slider", () => {
  it("renders the current value and emits numbers", () => {
    const onChange = vi.fn();

    render(
      <Slider
        label="Screens"
        value={6}
        min={4}
        max={12}
        valueLabel="6"
        hint="4 included"
        onChange={onChange}
      />,
    );

    const input = screen.getByLabelText("Screens");
    expect(input).toHaveValue("6");
    expect(screen.getByText("4 included")).toBeInTheDocument();

    // jsdom does not implement range-input keyboard stepping, so drive the
    // change event directly the way the browser would.
    fireEvent.change(input, { target: { value: "7" } });
    expect(onChange).toHaveBeenCalledExactlyOnceWith(7);
  });

  it("respects the declared bounds", () => {
    render(
      <Slider label="Integrations" value={0} min={0} max={8} valueLabel="0" onChange={vi.fn()} />,
    );

    const input = screen.getByLabelText("Integrations");
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("max", "8");
  });
});

describe("Switch", () => {
  it("reflects and toggles its checked state", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Switch checked={false} onChange={onChange} label="Design system" description="Tokens" />,
    );

    const control = screen.getByRole("switch", { name: /design system/i });
    expect(control).toHaveAttribute("aria-checked", "false");

    await user.click(control);
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
  });
});

describe("ToggleChip", () => {
  it("reports its pressed state", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <ToggleChip active onClick={onClick}>
        Blockchain
      </ToggleChip>,
    );

    const chip = screen.getByRole("button", { name: "Blockchain" });
    expect(chip).toHaveAttribute("aria-pressed", "true");

    await user.click(chip);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
