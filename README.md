# 🔤 Phonics Learning Hub

An interactive, **toddler-friendly** phonics learning web app for ages 3–7. Built with pure HTML, CSS, and JavaScript — no build tools required. Works offline after first load.

**Live App:** [https://athishsreeram.github.io/Phonics/](https://athishsreeram.github.io/Phonics/)

---

## ✨ Features

- **26 interactive activities** across 6 learning stages
- **🔊 Global sound toggle** — one tap to mute/unmute, saved across sessions
- **🎨 5 material packs** — Default, Animals, Food, Objects, Vehicles
- **📱 iPad + tablet first** — all buttons meet 56px minimum tap targets
- **🎯 Quiz modes** on Alphabet, Rhyme, Sight Words, and more
- **⭐ Progress tracking** via localStorage
- **🎉 Confetti & feedback** animations on correct answers
- **🔤 Speech synthesis** — all words and letters spoken aloud
- **Fully responsive** — works on mobile, iPad, and desktop

---

## 📂 Project Structure

```
Phonics/
├── index.html               # 🏠 Main hub — all 6 stages
├── alphabet.html            # 🔤 Alphabet A–Z with quiz
├── cvc.html                 # 🔠 CVC word blending + spinner
├── sight-words.html         # 👁️ Sight word flash cards
├── rhyme.html               # 🎵 Rhyme families + quiz
├── vowels.html              # 🗣️ Vowels A E I O U
├── digraphs.html            # 🔠 Digraph practice
├── ... (other pages)        # See index.html for full list
│
├── css/
│   └── shared.css           # 🎨 All shared styles (toddler-friendly)
│
├── js/
│   ├── audio.js             # 🔊 Speech synthesis + sound effects
│   ├── materials.js         # 📦 Material packs system
│   └── ui.js                # 🎭 Feedback, confetti, helpers
│
└── README.md
```

---

## 🎨 Material Packs

Switch learning materials from the top navigation bar dropdown.

| Pack | Theme | Best For |
|------|-------|----------|
| 📚 Default | Classic phonics words | General learning |
| 🐾 Animals | Animal names + facts | Animal lovers |
| 🍎 Food | Yummy food words | Kitchen time |
| 🎒 Objects | Everyday things | Home / classroom |
| 🚗 Vehicles | Cars, planes, ships | Transport fans |

### Adding a New Material Pack

Open `js/materials.js` and add a new entry to the `PACKS` object:

```js
mypack: {
  name: 'My Pack',       // Display name
  emoji: '🌟',           // Icon for selector
  description: 'My custom words',

  // CVC words grouped by vowel sound
  cvc: {
    a: ['cat', 'bat', 'hat'],
    e: ['bed', 'red', 'hen'],
    i: ['big', 'pig', 'sit'],
    o: ['hot', 'pot', 'dog'],
    u: ['bug', 'cup', 'run'],
  },

  // Optional: word sets with emoji and fun facts
  wordSets: [
    { word: 'cat', emoji: '🐱', fact: 'Cats say meow!' },
  ],

  // Sight words by level (4 levels)
  sightWords: [
    ['the', 'and', 'a'],     // Level 1
    ['he', 'she', 'we'],     // Level 2
    ['was', 'are', 'has'],   // Level 3
    ['they', 'what', 'from'], // Level 4
  ],

  // Rhyme families
  rhymes: [
    { family: '-at', words: ['cat', 'bat', 'hat', 'mat'] },
  ]
}
```

---

## 🔊 Audio System

The audio module (`js/audio.js`) uses the **Web Speech API** — no audio files needed.

| Feature | Description |
|---------|-------------|
| `AudioManager.speak(text)` | Speak text aloud |
| `AudioManager.speakLetter(letter)` | Speak letter + phoneme |
| `AudioManager.spellWord(word)` | Spell letter-by-letter then say word |
| `AudioManager.playTone(type)` | Play `correct`, `wrong`, `click`, `star`, `pop` |
| `AudioManager.toggle()` | Toggle sound on/off |

The audio preference is saved in `localStorage` as `phonics_audio`.

---

## 🛠️ Running Locally

```bash
# Clone the repository
git clone https://github.com/athishsreeram/Phonics.git
cd Phonics

# Option 1: Python (built-in)
python3 -m http.server 8080

# Option 2: Node.js
npx serve .

# Open in browser
open http://localhost:8080
```

> ⚠️ Must be served via HTTP (not `file://`) for the Web Speech API to work.

---

## 🚀 GitHub Pages Deployment

1. Push to the `main` branch
2. Go to **Settings → Pages**
3. Set source to `Deploy from branch: main / (root)`
4. Your app is live at `https://yourusername.github.io/Phonics/`

---

## 📱 iPad / Tablet Support

All UI elements meet Apple's Human Interface Guidelines:
- Minimum tap target: **56px × 56px**
- Fonts start at **18px base** (scales to 22px on large screens)
- Fixed-position navigation with safe area insets
- No hover-only interactions
- Scroll-friendly layouts with no overflow traps

---

## 🗺️ Learning Stages

| Stage | Focus | Activities |
|-------|-------|-----------|
| 🌱 Stage 1 | Alphabet & Sounds | Alphabet A–Z, Phonic Sets 1–2 |
| 🌿 Stage 2 | Vowels & CVC | Vowels, CVC Words, Rhyme, Listen & Choose |
| 🌳 Stage 3 | Digraphs & Blends | Digraph Practice, Digraph Test, Consonant Blends |
| ✨ Stage 4 | Magic E & Long Vowels | Magic E, Long Vowels |
| 📖 Stage 5 | Reading | Sight Words, Read Practice, Mini Stories, Word Match |
| ✍️ Stage 6 | Writing | Letter Tracing, Sentence Builder |

---

## 🤝 Contributing

- Suggest new material packs via Issues
- Report bugs or UI issues
- All content is for personal/classroom use only

---

## 📜 License

Personal and classroom use only. Do not redistribute or sell.

[![License: Personal Use Only](https://img.shields.io/badge/License-Personal%20Use%20Only-red)](.)
