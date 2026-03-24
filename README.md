# HypeOmeter

Small tool that analyzes LinkedIn / AI posts and tries to separate **signal from hype**.

Live demo:  
https://hypeometer.vercel.app


## What it does

- Scores hype vs substance
- Estimates likelihood the post was AI-generated
- Generates a cleaner, more signal-first rewrite
- Creates shareable result pages with OG previews


## Why I built this

My LinkedIn feed lately feels like a benchmark of how confidently people can talk about AI.

Some posts are genuinely insightful.  
Some sound impressive but don’t really say anything.  
Some feel like they were written by AI… about AI… for AI.

This started as a small experiment using agentic AI / Codex to build a real app end-to-end.


## Tech stack

- Next.js (App Router)
- Vercel
- Upstash Redis (share storage)
- OpenAI / LLM scoring
- Dynamic OG image generation


## Notes

Built as an experiment to explore:

- agentic workflows
- shareable result pages
- prompt-driven analysis
- keeping UI simple while adding features


## Author

Jad El Omeiri  
Senior Software Engineer  
https://linkedin.com/in/jadelomeiri