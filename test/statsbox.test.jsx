import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import StatsBox from "../src/components/EditorSidePanel/StatsBox.jsx";

const mockState = vi.hoisted(() => ({
  tables: [],
  relationships: [],
  database: "mysql",
  areasCount: 0,
  notesCount: 0,
  typesCount: 0,
  enumsCount: 0,
}));

vi.mock("react-i18next", () => ({
  initReactI18next: {
    type: "3rdParty",
    init: () => {},
  },
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

vi.mock("../src/hooks", () => ({
  useDiagram: () => ({
    tables: mockState.tables,
    relationships: mockState.relationships,
    database: mockState.database,
  }),
  useAreas: () => ({ areasCount: mockState.areasCount }),
  useNotes: () => ({ notesCount: mockState.notesCount }),
  useTypes: () => ({ typesCount: mockState.typesCount }),
  useEnums: () => ({ enumsCount: mockState.enumsCount }),
}));

const renderStatsBox = () => renderToStaticMarkup(React.createElement(StatsBox));

const expectStat = (html, label, value) => {
  const labelIndex = html.indexOf(`>${label}<`);
  expect(labelIndex).toBeGreaterThan(-1);
  const valueIndex = html.indexOf(`>${value}<`, labelIndex);
  expect(valueIndex).toBeGreaterThan(-1);
};

beforeEach(() => {
  mockState.tables = [];
  mockState.relationships = [];
  mockState.database = "mysql";
  mockState.areasCount = 0;
  mockState.notesCount = 0;
  mockState.typesCount = 0;
  mockState.enumsCount = 0;
});

describe("StatsBox", () => {
  it("renders core stats and max depth for empty diagrams", () => {
    const html = renderStatsBox();

    expectStat(html, "tables", 0);
    expectStat(html, "relationships", 0);
    expectStat(html, "subject_areas", 0);
    expectStat(html, "notes", 0);
    expectStat(html, "Max depth", 0);

    expect(html).not.toContain(">types<");
    expect(html).not.toContain(">enums<");
  });

  it("includes types and enums when the database supports them", () => {
    mockState.database = "postgresql";
    mockState.tables = [{ id: "t1" }];
    mockState.typesCount = 3;
    mockState.enumsCount = 2;

    const html = renderStatsBox();

    expectStat(html, "tables", 1);
    expectStat(html, "types", 3);
    expectStat(html, "enums", 2);
  });

  it("computes max depth from relationships while ignoring invalid edges", () => {
    mockState.tables = [
      { id: "a" },
      { id: "b" },
      { id: "c" },
      { id: "d" },
    ];
    mockState.relationships = [
      { startTableId: "a", endTableId: "b" },
      { startTableId: "b", endTableId: "c" },
      { startTableId: "c", endTableId: "d" },
      { startTableId: "a", endTableId: "missing" },
    ];

    const html = renderStatsBox();

    expectStat(html, "relationships", 4);
    expectStat(html, "Max depth", 3);
  });
});
