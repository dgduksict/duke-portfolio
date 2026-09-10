import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { Work } from "@/components/sections/work";
import { projects } from "@/data/projects";
import { dictionaries } from "@/lib/i18n";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

const en = dictionaries.en;

function cardHeadings(): string[] {
  return screen
    .getAllByRole("heading", { level: 3 })
    .map((heading) => heading.textContent ?? "");
}

beforeEach(() => {
  resetPortfolioStore();
});

describe("Work", () => {
  it("lists every project by default", () => {
    render(<Work />);
    expect(cardHeadings()).toHaveLength(projects.length);
    expect(screen.getByText(`${projects.length} ${en.work.results}`)).toBeInTheDocument();
  });

  it("narrows the grid as you type", async () => {
    const user = userEvent.setup();
    render(<Work />);

    await user.type(screen.getByLabelText(en.work.search), "gogo");

    await waitFor(() => {
      expect(cardHeadings()).toEqual(["Gogo.mn"]);
    });
  });

  it("filters by category", async () => {
    const user = userEvent.setup();
    render(<Work />);

    await user.click(screen.getByRole("button", { name: "Blockchain", pressed: false }));

    const expected = projects
      .filter((project) => project.category === "blockchain")
      .map((project) => project.title);
    await waitFor(() => {
      expect(cardHeadings().sort()).toEqual([...expected].sort());
    });
  });

  it("explains an empty result and offers a way out", async () => {
    const user = userEvent.setup();
    render(<Work />);

    await user.type(screen.getByLabelText(en.work.search), "cobol mainframe");

    expect(await screen.findByText(en.work.empty)).toBeInTheDocument();

    const clearButtons = screen.getAllByRole("button", { name: new RegExp(en.work.clear, "i") });
    await user.click(clearButtons[clearButtons.length - 1] as HTMLElement);

    await waitFor(() => {
      expect(cardHeadings()).toHaveLength(projects.length);
    });
    expect(screen.queryByText(en.work.empty)).not.toBeInTheDocument();
  });

  it("re-sorts the grid", async () => {
    const user = userEvent.setup();
    render(<Work />);

    await user.click(screen.getByRole("tab", { name: en.work.sortName }));

    await waitFor(() => {
      const titles = cardHeadings();
      expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
    });
  });

  it("opens a case study with the outcomes behind the project", async () => {
    const user = userEvent.setup();
    render(<Work />);

    await user.click(
      screen.getByRole("button", { name: `${en.work.caseStudy}: Gogo.mn` }),
    );

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Gogo.mn" })).toBeInTheDocument();
    expect(within(dialog).getByText(en.work.outcomes)).toBeInTheDocument();
    expect(usePortfolioStore.getState().selectedProjectId).toBe("gogo");

    await user.click(within(dialog).getByRole("button", { name: en.work.close }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(usePortfolioStore.getState().selectedProjectId).toBeNull();
  });

  it("renders localised copy when the language changes", () => {
    usePortfolioStore.getState().setLanguage("mn");
    render(<Work />);

    expect(
      screen.getByRole("heading", { name: dictionaries.mn.work.title }),
    ).toBeInTheDocument();
  });
});
