---
title: Song Hub - Wav2Text
emoji: 🎵
colorFrom: indigo
colorTo: pink
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# 🎵 Song Hub — Wav2Text (God-Mode Edition)

An AI-powered music transcription and streaming dashboard featuring real-time audio visualization, synchronized lyrics matching song tempo, word-level neon glowing karaoke, and a floating mini player bubble.

## ✨ Features

- **🧠 Multilingual AI Transcription**: Transcribes songs in their original language (Hindi, Telugu, Tamil, Punjabi, English, Spanish, Korean, etc.) using Whisper AI.
- **⏱️ Synchronized LRC Lyrics**: Matches the exact speed and tempo of the song using millisecond LRC timestamps.
- **✨ Neon Color Word Glow**: Currently sung words pulsate in vivid neon colors and scroll seamlessly with playback.
- **🫧 Floating Mini Player Bubble**: Minimize the player to a spinning vinyl bubble on the right side to browse other songs while audio continues uninterrupted.
- **🎧 Audio Streaming**: Full cloud library with Spotify, Apple, and Jamendo integration with local playback and offline mode.
- **⏩ Speed Controller**: 0.75x, 1.0x, 1.25x, and 1.5x playback rates with real-time synchronized karaoke tracking.

## 🚀 Deployment on Hugging Face Spaces

1. Create a new Space at [huggingface.co/new-space](https://huggingface.co/new-space).
2. Choose **Docker** as the Space SDK (Blank).
3. Connect your GitHub repository `TalupulaYaswanth/Song_Hub` or push to the Space's Git remote.
4. Hugging Face Spaces will automatically build the `Dockerfile` and serve on port `7860`.
