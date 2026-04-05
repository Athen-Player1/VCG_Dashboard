const express = require("express");
const { BattleStream, Teams, TeamValidator, getPlayerStreams } = require("pokemon-showdown");
const { RandomPlayerAI } = require("pokemon-showdown/dist/sim/tools/random-player-ai");

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

function resolveBattleFormat(formatLabel) {
  const normalized = String(formatLabel || "")
    .trim()
    .toLowerCase();

  if (normalized.includes("regulation g") || normalized.includes("vgc 2025 reg g")) {
    return "gen9vgc2025regg";
  }

  return "gen9doublescustomgame";
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

async function runSingleBattle({ format, packedTeamA, packedTeamB, seed }) {
  const streams = getPlayerStreams(new BattleStream());
  const p1 = new RandomPlayerAI(streams.p1, { seed: [seed, seed + 1, seed + 2, seed + 3] });
  const p2 = new RandomPlayerAI(streams.p2, {
    seed: [seed + 4, seed + 5, seed + 6, seed + 7]
  });
  const log = [];
  let winner = "";

  void p1.start();
  void p2.start();

  const consume = (async () => {
    for await (const chunk of streams.omniscient) {
      log.push(chunk);
      const winnerLine = chunk
        .split("\n")
        .find((line) => line.startsWith("|win|") || line.startsWith("|tie"));
      if (winnerLine?.startsWith("|win|")) {
        winner = winnerLine.replace("|win|", "").trim();
      }
    }
  })();

  await streams.omniscient.write(
    `>start ${JSON.stringify({ formatid: format })}\n` +
      `>player p1 ${JSON.stringify({ name: "Alpha", team: packedTeamA })}\n` +
      `>player p2 ${JSON.stringify({ name: "Beta", team: packedTeamB })}`
  );
  await consume;

  return {
    winner: winner || "Unknown",
    log
  };
}

app.post("/simulate/batch", async (request, response) => {
  const packedTeamA = String(request.body?.packedTeamA || "").trim();
  const packedTeamB = String(request.body?.packedTeamB || "").trim();
  const format = resolveBattleFormat(request.body?.format || "");
  const games = Math.max(1, Math.min(Number(request.body?.games || 10), 20));

  if (!packedTeamA || !packedTeamB) {
    response.status(400).json({ detail: "Both packed teams are required" });
    return;
  }

  try {
    const results = [];
    let p1Wins = 0;
    let p2Wins = 0;

    for (let index = 0; index < games; index += 1) {
      const result = await runSingleBattle({
        format,
        packedTeamA,
        packedTeamB,
        seed: 1000 + index * 10
      });
      results.push({
        game: index + 1,
        winner: result.winner,
        excerpt: result.log.slice(-8)
      });
      if (result.winner === "Alpha") {
        p1Wins += 1;
      } else if (result.winner === "Beta") {
        p2Wins += 1;
      }
    }

    response.json({
      formatResolved: format,
      games,
      p1Wins,
      p2Wins,
      results
    });
  } catch (error) {
    response.status(500).json({
      detail: error instanceof Error ? error.message : "Failed to run battle batch"
    });
  }
});

const port = Number(process.env.PORT || 3100);
app.listen(port, () => {
  console.log(`[showdown-engine] listening on ${port}`);
});
