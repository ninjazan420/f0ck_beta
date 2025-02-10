# f0ck.org Beta v1

f0ck.org ist eine anonyme Imageboard-Plattform, entwickelt in TypeScript und TailwindCSS. Basierend auf szurubooru, Danbooru und anderen Imageboards, bietet es hohe Privatsphäre mit optionalen Benutzerkonten und minimaler Moderation.

## Features

- 🔒 Vollständig anonym nutzbar
- 👤 Optionale Benutzerkonten für erweiterte Features
- 🎨 Modernes, responsives Design mit TailwindCSS
- 🚀 Hochperformante Next.js 14 Architektur
- 🔍 Fortschrittliches Tag-System
- 🌓 Dark/Light Mode
- 🖼️ Unterstützung für verschiedene Medienformate
- 🛡️ Fokus auf Privatsphäre
- 📱 Mobile-First Ansatz

## Neue Features & Updates

### Version 1.0.1 (29. Jan 2024)
- ✨ Neue Rules-Seite hinzugefügt
- 🔄 Navigation um Rules-Link erweitert
- 📱 Verbesserte mobile Navigation
- 📄 Erweiterte Dokumentation
- 🎨 Konsistentes Design-System implementiert

### Version 1.0.2 (31. Jan 2024)
- ✨ Upload-System implementiert
  - 🖼️ Thumbnail-Vorschau für Bilder
  - 🏷️ Tag-System mit max. 10 Tags pro Upload
  - 📊 Unterstützung für verschiedene Dateiformate (JPG, PNG, GIF, WebP, MP4, etc.)
  - 🔒 Content Rating System (Safe, Sketchy, Unsafe)
  - 📝 Datei-Informationen (Größe, Abmessungen, Format)
  - 🔄 Max. 5 gleichzeitige Uploads
- 🎨 Einstellungsseite hinzugefügt
  - 🌓 Dark/Light Mode Toggle
  - 👁️ NSFW Blur Option
  - 📧 Email Sichtbarkeit
  - 💬 DM Einstellungen
  - 🎞️ GIF Autoplay
  - 🖼️ Thumbnail-Qualität
- 📝 Registrierungsseite hinzugefügt
  - 👤 Benutzerregistrierung
  - 📋 Feature-Übersicht
  - 📜 ToS Integration

## Quick Start

Entwicklungsserver starten:

```bash
npm run dev
# oder
yarn dev
```

Der Server startet unter [http://localhost:3000](http://localhost:3000).

## Technologie-Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Fonts**: Geist Sans & Geist Mono
- **Deployment**: Vercel

## Projektstruktur

```
src/
├── app/
│   ├── layout.tsx     # Root Layout mit Meta-Tags
│   ├── page.tsx       # Homepage
│   ├── rules/         # Rules Sektion
│   │   └── page.tsx   # Rules Page
│   ├── help/          # Help Sektion
│   │   └── page.tsx   # Help Page
│   └── globals.css    # Globale Styles
├── components/
│   ├── Navbar.tsx     # Navigation Komponente
│   ├── Footer.tsx     # Footer Komponente
│   └── ComingSoon.tsx # Platzhalter für zukünftige Features
└── public/
    └── logos/         # Logo Assets

```

## Komponenten

### Navbar
- Hauptnavigation mit zwei Menügruppen (links/rechts)
- Responsive Design
- Geist Mono Font Integration
- Hover-Effekte

### Footer
- Community Links
- Build-Informationen
- Support-Links
- Responsive Layout

### ComingSoon
- Platzhalter für in Entwicklung befindliche Seiten
- Einheitliches Design
- Informative Benutzerführung

## Seiten

### Rules (/rules)
- Umfassende Nutzungsrichtlinien
- Terms of Use
- Verbotene Inhalte
- Datenschutzrichtlinien
- DMCA Informationen

### Help (/help)
- Plattform-Informationen
- Registrierungsprozess
- Account-Management
- Unterstützte Dateitypen

## Support

Du kannst das Projekt unterstützen auf [Ko-fi](https://ko-fi.com/f0ck_org)

## Verlinkte Dienste

- [f0ck.org Main](https://f0ck.org)
- [ShareX Server](https://sx.f0ck.org)
- [Discord Community](https://discord.gg/SmWpwGnyrU)
- [TeamSpeak 3](ts3server://ts.f0ck.org)

## License

© 2024 f0ck.org Team. Alle Rechte vorbehalten.
