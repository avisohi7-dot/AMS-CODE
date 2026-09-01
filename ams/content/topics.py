"""Offline football fact/story bank, grouped by content category.

Each entry is self-contained enough to become a 20-45s short: a hook line,
2-4 body beats, and a closer. No network access required.
"""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Topic:
    category: str
    hook: str
    beats: list[str]
    cta: str
    hashtags: list[str] = field(default_factory=list)

    @property
    def title(self) -> str:
        return self.hook.strip("? .!")[:70]


TOPICS: list[Topic] = [
    Topic(
        category="records",
        hook="Did you know one man has scored over 850 career goals?",
        beats=[
            "Cristiano Ronaldo has found the net more than eight hundred and fifty times for club and country.",
            "That is more than most entire teams score in a decade.",
            "He's done it across four different leagues, at four World Cups, and into his forties.",
        ],
        cta="Comment the number you think he retires on.",
        hashtags=["football", "soccer", "ronaldo", "goals", "fyp"],
    ),
    Topic(
        category="records",
        hook="This goalkeeper once went 1,275 minutes without conceding.",
        beats=[
            "Gianluigi Buffon set a Serie A shutout record that stood for over a decade.",
            "That's more than fourteen full matches in a row without letting one in.",
            "It took a penalty to finally beat him.",
        ],
        cta="Tag a keeper who needs to see this.",
        hashtags=["football", "goalkeeper", "buffon", "cleansheet", "fyp"],
    ),
    Topic(
        category="transfers",
        hook="Barcelona once sold a player for 41 million... who became worth 222 million.",
        beats=[
            "Neymar left Barca for Paris Saint-Germain in 2017 for a world record fee.",
            "Barcelona had bought him years earlier for a fraction of that price.",
            "The transfer market has never been the same since.",
        ],
        cta="What transfer shocked you the most? Drop it below.",
        hashtags=["football", "transfer", "neymar", "psg", "fyp"],
    ),
    Topic(
        category="tactics",
        hook="Why do modern teams play with a back three instead of four?",
        beats=[
            "A back three lets wing-backs bomb forward while still keeping central cover.",
            "It creates a numbers advantage in midfield build-up play.",
            "Coaches like Conte and Guardiola have used it to control games without the ball.",
        ],
        cta="Which formation does your team use? Let me know.",
        hashtags=["football", "tactics", "formation", "coaching", "fyp"],
    ),
    Topic(
        category="history",
        hook="The World Cup was almost cancelled forever after 1942.",
        beats=[
            "World War Two forced FIFA to skip the tournament in 1942 and 1946.",
            "The trophy itself was hidden inside a shoebox under a bed in Italy to keep it from being stolen.",
            "It returned in 1950, hosted by Brazil, and never stopped since.",
        ],
        cta="Save this for your next football trivia night.",
        hashtags=["football", "worldcup", "history", "fifa", "fyp"],
    ),
    Topic(
        category="records",
        hook="One team went 49 league games unbeaten. Nobody has matched it.",
        beats=[
            "Arsenal's 'Invincibles' went the entire 2003-04 Premier League season without a loss.",
            "The unbeaten run actually stretched to 49 games across two seasons before it ended.",
            "No Premier League side has gone a full season unbeaten since.",
        ],
        cta="Do you think it'll ever happen again? Comment yes or no.",
        hashtags=["football", "arsenal", "invincibles", "premierleague", "fyp"],
    ),
    Topic(
        category="players",
        hook="Messi was almost rejected by Barcelona for being too short.",
        beats=[
            "At 13, Messi had a growth hormone deficiency that most clubs wouldn't pay to treat.",
            "Barcelona agreed to cover his treatment and signed him on a contract written on a napkin.",
            "That napkin decision helped create the greatest player of his generation.",
        ],
        cta="Would your club have taken that risk? Tell me below.",
        hashtags=["football", "messi", "barcelona", "napkin", "fyp"],
    ),
    Topic(
        category="rules",
        hook="Why can't a goalkeeper pick up a back-pass with their hands?",
        beats=[
            "The back-pass rule was introduced in 1992 to stop teams stalling for time.",
            "Before that, defenders could just roll the ball back to the keeper endlessly to run down the clock.",
            "It's one of the biggest rule changes that shaped how modern football is played.",
        ],
        cta="Which football rule confuses you the most?",
        hashtags=["football", "rules", "referee", "history", "fyp"],
    ),
    Topic(
        category="records",
        hook="A 17 year old once scored 5 goals in a single Champions League match.",
        beats=[
            "Kylian Mbappe and other prodigies have rewritten the record books at teenage ages.",
            "But it was a teenage forward's hat-trick pace that made scouts panic across Europe.",
            "Age has stopped meaning anything at the top level of the game.",
        ],
        cta="Who's the best teenager in football right now?",
        hashtags=["football", "wonderkid", "championsleague", "youngstar", "fyp"],
    ),
    Topic(
        category="money",
        hook="The most expensive football boots ever made cost 4.6 million dollars.",
        beats=[
            "They were covered in over 200 grams of gold and diamonds for a single exhibition match.",
            "Most professional boots cost less than 300 dollars to produce.",
            "Sponsorship money in football has completely changed what's 'normal' spending.",
        ],
        cta="Would you ever wear boots like that? Comment below.",
        hashtags=["football", "boots", "luxury", "sponsorship", "fyp"],
    ),
]


def get_topics(category: str | None = None) -> list[Topic]:
    if not category:
        return list(TOPICS)
    return [t for t in TOPICS if t.category == category]


def categories() -> list[str]:
    return sorted({t.category for t in TOPICS})
