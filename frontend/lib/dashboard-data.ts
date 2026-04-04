import { getDashboardData, getTeam } from "./api";
import { DashboardData, Team } from "./types";

export const fallbackData: DashboardData = {
  activeFormat: "Offline Preview",
  teams: [
    {
      id: "preview-team",
      name: "Offline Preview Team",
      format: "Regulation H",
      archetype: "Prototype",
      notes:
        "Frontend fallback while the API is unavailable. Once the backend is up, live data will replace this preview automatically.",
      tags: ["Preview"],
      members: [
        {
          name: "Incineroar",
          item: "Sitrus Berry",
          ability: "Intimidate",
          types: ["Fire", "Dark"],
          moves: ["Fake Out", "Parting Shot", "Knock Off", "Flare Blitz"],
          role: "Pivot",
          image:
            "https://img.pokemondb.net/sprites/scarlet-violet/normal/incineroar.png"
        },
        {
          name: "Flutter Mane",
          item: "Focus Sash",
          ability: "Protosynthesis",
          types: ["Ghost", "Fairy"],
          moves: ["Moonblast", "Shadow Ball", "Icy Wind", "Protect"],
          role: "Speed control",
          image:
            "https://img.pokemondb.net/sprites/scarlet-violet/normal/flutter-mane.png"
        },
        {
          name: "Raging Bolt",
          item: "Leftovers",
          ability: "Protosynthesis",
          types: ["Electric", "Dragon"],
          moves: ["Thunderclap", "Draco Meteor", "Snarl", "Protect"],
          role: "Bulky offense",
          image:
            "https://img.pokemondb.net/sprites/scarlet-violet/normal/raging-bolt.png"
        },
        {
          name: "Ogerpon-W",
          item: "Wellspring Mask",
          ability: "Water Absorb",
          types: ["Grass", "Water"],
          moves: ["Ivy Cudgel", "Horn Leech", "Follow Me", "Spiky Shield"],
          role: "Pivot",
          image:
            "https://img.pokemondb.net/sprites/scarlet-violet/normal/ogerpon-wellspring.png"
        },
        {
          name: "Landorus",
          item: "Choice Scarf",
          ability: "Intimidate",
          types: ["Ground", "Flying"],
          moves: ["Stomping Tantrum", "Rock Slide", "U-turn", "Tera Blast"],
          role: "Speed pressure",
          image:
            "https://img.pokemondb.net/sprites/scarlet-violet/normal/landorus-therian.png"
        },
        {
          name: "Amoonguss",
          item: "Rocky Helmet",
          ability: "Regenerator",
          types: ["Grass", "Poison"],
          moves: ["Spore", "Rage Powder", "Pollen Puff", "Protect"],
          role: "Support",
          image:
            "https://img.pokemondb.net/sprites/scarlet-violet/normal/amoonguss.png"
        }
      ]
    },
    {
      id: "preview-secondary",
      name: "Offline Trick Room Bench",
      format: "Regulation H",
      archetype: "Trick Room",
      notes: "Secondary preview team for layout validation.",
      tags: ["Preview"],
      members: [
        {
          name: "Farigiraf",
          item: "Safety Goggles",
          ability: "Armor Tail",
          types: ["Normal", "Psychic"],
          moves: ["Trick Room", "Helping Hand", "Hyper Voice", "Protect"],
          role: "Setter",
          image:
            "https://img.pokemondb.net/sprites/scarlet-violet/normal/farigiraf.png"
        },
        {
          name: "Bloodmoon Ursaluna",
          item: "Life Orb",
          ability: "Mind's Eye",
          types: ["Ground", "Normal"],
          moves: ["Blood Moon", "Earth Power", "Hyper Voice", "Protect"],
          role: "Sweeper",
          image:
            "https://img.pokemondb.net/sprites/scarlet-violet/normal/ursaluna-bloodmoon.png"
        },
        {
          name: "Torkoal",
          item: "Charcoal",
          ability: "Drought",
          types: ["Fire"],
          moves: ["Eruption", "Heat Wave", "Body Press", "Protect"],
          role: "Endgame",
          image:
            "https://img.pokemondb.net/sprites/scarlet-violet/normal/torkoal.png"
        },
        {
          name: "Amoonguss",
          item: "Sitrus Berry",
          ability: "Regenerator",
          types: ["Grass", "Poison"],
          moves: ["Spore", "Rage Powder", "Pollen Puff", "Protect"],
          role: "Support",
          image:
            "https://img.pokemondb.net/sprites/scarlet-violet/normal/amoonguss.png"
        },
        {
          name: "Incineroar",
          item: "Safety Goggles",
          ability: "Intimidate",
          types: ["Fire", "Dark"],
          moves: ["Fake Out", "Parting Shot", "Flare Blitz", "Knock Off"],
          role: "Pivot",
          image:
            "https://img.pokemondb.net/sprites/scarlet-violet/normal/incineroar.png"
        },
        {
          name: "Iron Hands",
          item: "Assault Vest",
          ability: "Quark Drive",
          types: ["Fighting", "Electric"],
          moves: ["Fake Out", "Drain Punch", "Wild Charge", "Heavy Slam"],
          role: "Glue",
          image:
            "https://img.pokemondb.net/sprites/scarlet-violet/normal/iron-hands.png"
        }
      ]
    }
  ],
  threats: [
    {
      name: "Miraidon",
      threatLevel: "High",
      reason: "Electric terrain offense overloads passive positions fast.",
      counterplay: "Lean on speed control and disciplined tera timing."
    },
    {
      name: "Landorus",
      threatLevel: "Medium",
      reason: "Ground spread damage punishes clustered weaknesses.",
      counterplay: "Preserve your clean Water and Ice lines."
    },
    {
      name: "Hard Trick Room",
      threatLevel: "Medium",
      reason: "If room goes up for free, the tempo flips hard.",
      counterplay: "Bring taunt, deny setup, and prep a slow-mode fallback."
    }
  ],
  weaknessSummary: [
    "Offline mode is active because the API was unreachable.",
    "The layout still renders sample weakness cards so the dashboard stays usable.",
    "Start the FastAPI container to replace these with live analysis data.",
    "Showdown import remains available once the backend is online."
  ],
  recommendations: [
    "Bring up the API service to enable live team parsing and seeded dashboard data.",
    "Keep the frontend fallback so local UI work is never blocked by backend downtime.",
    "Next step is persistence for saved teams in PostgreSQL.",
    "Then we can add compare-vs-meta flows on top of real stored teams."
  ],
  metaTeams: [
    {
      id: "preview-meta-1",
      name: "Miraidon Offense",
      format: "Regulation H",
      archetype: "Fast Special Offense",
      core: ["Miraidon", "Flutter Mane", "Urshifu", "Incineroar"],
      pressurePoints: ["Electric terrain", "speed pressure", "immediate damage"],
      plan: [
        "Respect terrain turns and avoid exposing your defensive tera too early.",
        "Use Fake Out plus speed control to buy one positioning cycle.",
        "Trade aggressively into their frailer backline once pace is stabilized."
      ]
    },
    {
      id: "preview-meta-2",
      name: "Farigiraf Room",
      format: "Regulation H",
      archetype: "Hard Trick Room",
      core: ["Farigiraf", "Bloodmoon Ursaluna", "Amoonguss", "Torkoal"],
      pressurePoints: ["priority denial", "slow-mode pressure", "redirection"],
      plan: [
        "Double the setter if you can do it without losing your whole board.",
        "Keep a bulkier line in the back in case room goes up anyway.",
        "Don’t overvalue Fake Out into Armor Tail structures."
      ]
    }
  ]
};

export async function loadDashboardData(): Promise<DashboardData> {
  try {
    return await getDashboardData();
  } catch {
    return fallbackData;
  }
}

export async function loadTeamById(teamId: string): Promise<Team | undefined> {
  try {
    return await getTeam(teamId);
  } catch {
    const data = await loadDashboardData();
    return data.teams.find((team) => team.id === teamId);
  }
}
