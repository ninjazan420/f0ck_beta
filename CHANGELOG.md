# Changelog

Alle wichtigen Änderungen am Projekt werden in dieser Datei dokumentiert.

## [1.4.0] - 2024-03-30

### 🔄 Updates

- Moderationsseite verbessert mit zusätzlichen Funktionen
- Funktionierender Kommentar-Stream implementiert
- Reported Content-System vorbereitet
- API-Route zum Löschen von Kommentaren durch Moderatoren hinzugefügt
- Zitatfunktion für Kommentare hinzugefügt
- Badges in Kommentaren implementiert, die gesperrte Benutzer in der Filterliste respektieren

### 💬 Vollständige Kommentarfunktion

- Erweiterte Kommentarfunktion mit GIF- und Emoji-Integration
- Bearbeiten und Löschen von Kommentaren durch Benutzer implementiert
- Verbessertes Antwort-Threading für verschachtelte Diskussionen
- API-Endpunkte für Kommentarverwaltung (GET, POST, PATCH, DELETE)
- Verbesserte Fehlerbehandlung für Kommentare
- Unterstützung für anonyme Kommentare ohne Anmeldung
- Erweitertes Berechtigungssystem für Kommentarmoderation

### 🛠️ Fixes

- Routes und Hotlinks für Kommentare behoben
- Meta-Titel für /user/nickname korrigiert
- Fix implementiert, der übrig gebliebene MongoDB-Objekt-IDs automatisch löscht

## [1.3.0] - 2024-03-15

### 💬 Kommentarsystem-Erweiterung

- Live-Kommentarfunktion aktiviert
- Kommentar-Moderationssystem freigeschaltet
- Antwort-Threading mit verschachtelten Reaktionen
- Bearbeiten und Löschen von Kommentaren für Benutzer
- GIF-Unterstützung in Kommentaren mit GIPHY-Integration
- Option für anonymes Kommentieren

## [1.2.2] - 2024-03-02

### 👤 Verbesserungen der Benutzerprofile

- Korrektur der Anzeige von Benutzer-Bios in Posts
- Standardisierte Darstellung von Benutzerstatistiken über alle Komponenten hinweg
- Verbesserte Konsistenz der Benutzerprofilinformationen
- Bessere Organisation von Benutzermetadaten

### 🖼️ UI/UX-Verfeinerungen

- Optimierte Darstellung der Statistiken auf der Startseite
- Entfernung der redundanten Statistikbox in den Post-Ansichten
- Verbesserte visuelle Konsistenz in der gesamten Anwendung

## [1.2.0] - 2024-03-02

### 🐳 Docker-Integration

- Docker-Unterstützung für einfache Bereitstellung und Konsistenz zwischen Umgebungen
- Vereinfachter Produktionsbuild mit `docker compose`
- Persistenter Uploads-Ordner
- Optimierte Konfiguration für MongoDB Atlas

### 🛠️ Technische Verbesserungen

- Bessere Umgebungsvariablen-Verwaltung
- Optimiertes Datei-Upload-System
- Verbesserte Berechtigungen für Uploads
- Aktualisierte Abhängigkeiten

## [1.1.1] - 2024-02-20

### 🖼️ UI/UX-Verbesserungen

- Bessere Metadaten-Verwaltung auf allen Seiten
- Behobene Probleme mit der Anzeige von Benutzerrollen
- Verbessertes responsives Design
- Erweiterte Logo-Funktionalität
- Bessere Unterstützung für den Dark Mode

### 🔒 Sicherheitsverbesserungen

- Verbesserte rollenbasierte Zugriffssteuerung
- Bessere Fehlerbehandlung
- Verbesserte Benutzervalidierung

### 🚀 Leistungsoptimierungen

- Schnellere Seitenladezeiten
- Reduzierte Bundle-Größe
- Verbesserte Bildladeprozesse

## [1.1.0] - 2024-02-01

### 🎨 Upload-System

- Anonyme Uploads ohne Kontoerfordernis
- Verbesserte Bildverarbeitung
- Bessere Fehlerbehandlung
- Fortschrittsanzeigen
- Validierung von Dateitypen
- Automatische Bildoptimierung

### 👤 Verbesserungen am Benutzersystem

- Optionales Kontosystem
- Verbesserte Rollenabzeichen
- Unterstützung für anonymes Posten
- Bessere Datumsformatierung
- Standard-Avatare für anonyme Beiträge

### 🖼️ Verbesserungen der Bildanzeige

- Verbessertes Rasterlayout
- Bessere Bildskalierung
- Verbesserte mobile Ansicht
- Schnellere Ladezeiten
- Optimierte Thumbnails

## [1.0.7] - 2024-01-15

### 💬 Erweitertes Kommentarsystem

- WebSocket-Integration für Live-Updates
- Automatische Spam-Erkennung
- Rollenbasiertes Moderationssystem
- Meldefunktion
- Aktivitätsfeed in Benutzerprofilen
- Verbesserungen beim Kommentar-Threading

### 👤 Verbesserungen des Benutzersystems

- Rollenabzeichen (Admin, Mod, Premium)
- Aktivitätsverfolgung
- Profilstatistiken

### 🔒 Sicherheitsupdates

- Spam-Schutz
- Bearbeitung von Meldungen
- Moderationswerkzeuge

## [1.0.6] - 2024-01-01

### 🎨 Erweitertes Kommentarsystem

- GIPHY-Integration mit Attributierung
- Verbesserte Medienanzeige
- Premium-Benutzerabzeichen
- Bessere Antwortformatierung

### 🚀 Leistungsoptimierungen

### 🎯 UI/UX-Verbesserungen