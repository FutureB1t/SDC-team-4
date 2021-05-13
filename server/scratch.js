const results = await db.query(
  sql`
    SELECT
      u.user_id AS id,
      u.display_name,
      ${nestQuerySingle(
        sql`
          SELECT
            m.user_id AS id,
            m.display_name
          FROM
            users m
          WHERE
            m.user_id = u.manager_id
        `
      )} AS manager,
      ${nestQuery(
        sql`
          SELECT
            t.team_id AS id,
            t.display_name
          FROM
            user_teams ut
          JOIN
            teams t USING (team_id)
          WHERE
            ut.user_id = u.user_id
        `
      )} AS teams
    FROM users u
  `,
);

[
  {
    "id": 1,
    "display_name": "Forbes",
    "manager": null,
    "teams": [
      {
        "id": 1,
        "display_name": "Awesome Team"
      },
      {
        "id": 2,
        "display_name": "Team of One"
      }
    ]
  },
  {
    "id": 2,
    "display_name": "John",
    "manager": null,
    "teams": [
      {
        "id": 1,
        "display_name": "Awesome Team"
      }
    ]
  },
  {
    "id": 3,
    "display_name": "Joe",
    "manager": {
      "id": 1,
      "display_name": "Forbes"
    },
    "teams": []
  }
]