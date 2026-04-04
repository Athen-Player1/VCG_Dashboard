from app.data.sample_data import dashboard_data
from app.services.team_store import list_teams


def build_dashboard_payload() -> dict:
    return {
        "activeFormat": dashboard_data["activeFormat"],
        "teams": list_teams(),
        "threats": dashboard_data["threats"],
        "weaknessSummary": dashboard_data["weaknessSummary"],
        "recommendations": dashboard_data["recommendations"],
        "metaTeams": dashboard_data["metaTeams"],
    }
