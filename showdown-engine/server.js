const express = require("express");
const { Teams, TeamValidator } = require("pokemon-showdown");

const app = express();
app.use(express.json({ limit: "1mb" }));

function resolveFormat(formatLabel) {
  const normalized = String(formatLabel || "")
    .trim()
    .toLowerCase();

  if (normalized.includes("regulation g")) {
    return "gen9vgc2025regg";
  }

  if (normalized.includes("regulation h") || normalized.includes("regulation i")) {
    return "gen9customgame";
  }

  if (normalized.includes("vgc 2025 reg g")) {
    return "gen9vgc2025regg";
  }

  return "gen9customgame";
}

function simplifySet(set) {
  return {
    name: set.name || set.species || "",
    item: set.item || null,
    ability: set.ability || null,
    moves: set.moves || [],
    nature: set.nature || null,
    tera_type: set.teraType || null
  };
}

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.post("/teams/validate", (request, response) => {
  const showdownText = String(request.body?.showdownText || "").trim();
  const formatRequested = String(request.body?.format || "").trim();

  if (!showdownText) {
    response.status(400).json({ detail: "Showdown text is required" });
    return;
  }

  try {
    const importedTeam = Teams.import(showdownText);
    const packedTeam = Teams.pack(importedTeam);
    const exportedTeam = Teams.export(importedTeam);
    const formatResolved = resolveFormat(formatRequested);
    const validator = new TeamValidator(formatResolved);
    const issues = validator.validateTeam(importedTeam) || [];

    response.json({
      formatRequested,
      formatResolved,
      valid: issues.length === 0,
      issues,
      packedTeam,
      exportedTeam,
      pokemon: importedTeam.map(simplifySet)
    });
  } catch (error) {
    response.status(400).json({
      detail: error instanceof Error ? error.message : "Failed to validate team with Showdown"
    });
  }
});

const port = Number(process.env.PORT || 3100);
app.listen(port, () => {
  console.log(`[showdown-engine] listening on ${port}`);
});
