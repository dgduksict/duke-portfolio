import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { Contact } from "@/components/sections/contact";
import { dictionaries } from "@/lib/i18n";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

const en = dictionaries.en;

beforeEach(() => {
  resetPortfolioStore();
});

describe("Contact", () => {
  it("renders the contact details from the profile data", () => {
    render(<Contact />);
    expect(screen.getByText("bdulguunod@gmail.com")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: en.contact.title })).toBeInTheDocument();
  });

  it("blocks submission and explains what is missing", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.click(screen.getByRole("button", { name: new RegExp(en.contact.send, "i") }));

    expect(await screen.findByText(en.contact.errors.name)).toBeInTheDocument();
    expect(screen.getByText(en.contact.errors.email)).toBeInTheDocument();
    expect(screen.getByText(en.contact.errors.message)).toBeInTheDocument();
    expect(screen.queryByText(en.contact.sent)).not.toBeInTheDocument();
  });

  it("clears a field error as soon as it is corrected", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.click(screen.getByRole("button", { name: new RegExp(en.contact.send, "i") }));
    expect(await screen.findByText(en.contact.errors.name)).toBeInTheDocument();

    await user.type(screen.getByLabelText(en.contact.name), "Duke");
    await waitFor(() => {
      expect(screen.queryByText(en.contact.errors.name)).not.toBeInTheDocument();
    });
  });

  it("rejects a malformed email address", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText(en.contact.name), "Duke");
    await user.type(screen.getByLabelText(en.contact.email), "not-an-email");
    await user.type(
      screen.getByLabelText(en.contact.message),
      "A short brief about the project we want to build.",
    );
    await user.click(screen.getByRole("button", { name: new RegExp(en.contact.send, "i") }));

    expect(await screen.findByText(en.contact.errors.email)).toBeInTheDocument();
  });

  it("confirms receipt once a valid brief is submitted", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText(en.contact.name), "Duke");
    await user.type(screen.getByLabelText(en.contact.email), "duke@example.com");
    await user.type(
      screen.getByLabelText(en.contact.message),
      "We want an AI newsletter pipeline for our newsroom.",
    );
    await user.click(screen.getByRole("button", { name: new RegExp(en.contact.send, "i") }));

    expect(await screen.findByText(en.contact.sent, {}, { timeout: 3000 })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: en.contact.sendAnother }));
    expect(await screen.findByLabelText(en.contact.name)).toHaveValue("");
  });

  it("pulls a generated estimate into the message field", async () => {
    render(<Contact />);

    usePortfolioStore.getState().setBriefDraft("Estimated total: $18,508");

    await waitFor(() => {
      expect(screen.getByLabelText(en.contact.message)).toHaveValue("Estimated total: $18,508");
    });
    expect(screen.getByText(en.contact.quoteAttached)).toBeInTheDocument();
    // the draft is consumed so a second visit does not overwrite typing
    expect(usePortfolioStore.getState().briefDraft).toBe("");
  });

  it("switches every label when the language changes", () => {
    usePortfolioStore.getState().setLanguage("mn");
    render(<Contact />);

    expect(
      screen.getByRole("heading", { name: dictionaries.mn.contact.title }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(dictionaries.mn.contact.name)).toBeInTheDocument();
  });
});
