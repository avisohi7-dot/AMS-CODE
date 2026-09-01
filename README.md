# AMS — AI Faceless Football Shorts

Generates finished, vertical (1080x1920) short-form videos about football
(voiceover + burned-in karaoke captions + background) for TikTok/Reels/Shorts,
end to end, with zero paid APIs required to get a first video out the door.

## How it works

```
ams/content   -> picks or generates a script (hook, facts, call-to-action)
ams/audio     -> text-to-speech narration
ams/captions  -> times & renders karaoke-style captions from the narration
ams/visuals   -> background video (procedural, or real football clips via Pexels)
ams/video     -> composites everything into output/<job>/final.mp4
ams/publish   -> queues the video for manual upload, or posts via TikTok/IG APIs
                 if you've set up your own developer app credentials
```

Everything is provider-pluggable via environment variables (see `.env.example`
below) — start fully offline, upgrade pieces (better voice, real stock
footage, LLM-written scripts) as you go.

## Setup

```bash
# system deps (Debian/Ubuntu)
sudo apt-get install -y ffmpeg espeak-ng

pip install -r requirements.txt
```

## Generate a video

```bash
python scripts/generate_video.py                     # one random offline topic
python scripts/generate_video.py --count 5            # a batch
python scripts/generate_video.py --category records   # pick a content bucket
python scripts/generate_video.py --queue               # also add to the publish queue
```

Output lands in `output/<slug>-<id>/`:
- `final.mp4` — the finished vertical video
- `captions.srt` — subtitle file (also useful if TikTok auto-captions poorly)
- `caption.txt` — ready-to-paste TikTok caption + hashtags (written by `--queue`)
- `metadata.json` — everything in one place

## Posting to TikTok

TikTok does not let anyone auto-post to an arbitrary account without an
approved developer app — that's a platform rule, not a limitation of this
code. Two paths:

1. **Manual (recommended to start):** run with `--queue`, open the video from
   `output/`, upload it in the TikTok app, paste `caption.txt`. Takes under a
   minute and lets you preview before it goes live.
2. **Automated:** register a TikTok developer app, get it approved for the
   `video.publish` scope, complete OAuth, set `TIKTOK_ACCESS_TOKEN`, then use
   `ams.publish.tiktok.publish_video(...)`. It defaults to posting as
   `SELF_ONLY` (private) so nothing goes public without you reviewing it
   first in-app.

## Environment variables (`.env`)

| Variable | Purpose | Default |
|---|---|---|
| `SCRIPT_PROVIDER` | `offline` (curated fact bank) / `anthropic` / `openai` | `offline` |
| `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` | for LLM-written scripts via `--prompt` | — |
| `TTS_PROVIDER` | `offline` (espeak-ng) / `gtts` / `elevenlabs` / `openai` | `offline` |
| `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` | higher-quality voice | — |
| `OPENAI_TTS_VOICE` | voice name for OpenAI TTS | `alloy` |
| `BACKGROUND_PROVIDER` | `procedural` (generated pitch motion graphic) / `pexels` | `procedural` |
| `PEXELS_API_KEY` | real football stock footage backgrounds | — |
| `IG_ACCESS_TOKEN`, `IG_BUSINESS_ACCOUNT_ID` | Instagram Reels auto-publish | — |
| `TIKTOK_ACCESS_TOKEN` | TikTok Content Posting API | — |

## Growing this into a money-making channel

- **Consistency beats production value.** 1-3 posts/day of 20-45s videos in a
  tight niche (e.g. only "football records," or only "tactics explained")
  trains the algorithm and your audience faster than occasional polished ones.
- **Hook in the first 1.5s.** The offline topic bank already leads with a
  question/surprising-stat hook — keep that pattern if you write your own.
- **Real footage clears more often than pure procedural graphics** for
  watch-time on football content; consider a Pexels or your-own-clips
  library once a topic bank is proven to hook viewers.
- **Monetization paths once you have views:** TikTok Creator Rewards Program
  (needs 10k+ followers & 100k+ views/30 days), brand/affiliate deals in
  football gear or betting-adjacent apps (check local regulations), driving
  traffic to a YouTube long-form channel or a paid Discord/newsletter.
- **Compliance:** don't use copyrighted match footage/broadcast clips without
  rights — that's the #1 reason football fan accounts get takedowns. Stick to
  stock footage, your own graphics, or clearly-licensed highlights.
