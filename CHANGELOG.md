# Changelog

Alle wichtigen Änderungen am Projekt werden in dieser Datei dokumentiert.

## [1.6.0] -

### 🏷️ Tag-System - Vollständig implementiert

- **Posts mit Tags organisieren und finden**: Das komplette Tag-System ist jetzt live! Nutzer können ihre Uploads mit bis zu 10 Tags versehen und so die Auffindbarkeit und Organisation von Inhalten verbessern.
- **Vereinfachte Tag-Struktur**: Ein einheitliches Tag-System ohne Kategorien-Unterscheidung macht das Taggen intuitiver und benutzerfreundlicher.
- **Leistungsstarke Tag-Suche**: Finde genau das, was du suchst - filtere Posts anhand von Tags und kombiniere diese mit anderen Suchkriterien.
- **Verbesserte Benutzererfahrung**:
  - Klare Fehlermeldung bei Erreichen des Limits von 10 Tags pro Upload
  - Optimierte Tag-Filter mit intuitiver, aufgeräumter Oberfläche
  - Intelligente Tag-Validierung für konsistente Taxonomie

### 🔍 Wichtige Funktionsverbesserungen

- **Reverse Image Search repariert**: Die Bildersuche nach ähnlichen Bildern funktioniert jetzt zuverlässig.
- **Optimiertes Filter-Verhalten**: Das Verhalten der Filter für "Safe", "Sketchy" und "Unsafe" Inhalte wurde verbessert und logischer gestaltet.
- **Anonyme Beiträge vereinfacht**: Entfernung irreführender Links zu "Anonymous" in Kommentaren und Uploads, da es keinen expliziten Anonymous-Account gibt.

### 🎨 UI-Verbesserungen

- **Konsistentes Avatar-Design**: Avatare in der Userbox unter /post/id wurden auf ein einheitliches, kantiges Design angepasst.
- **Verbesserte visuelle Hierarchie** für eine klarere Benutzeroberfläche.

### 🛠️ Technische Verbesserungen

- Vollständige Überarbeitung des Tag-Modells in der Datenbank
- Optimierte API-Endpunkte für Tag-Operationen
- Verbesserte Leistung bei Tag-basierten Suchanfragen

## [1.5.0] -

### 🔍 Verbesserte Suchfunktion

- Filter von /posts live geschaltet mit umfangreichen Suchoptionen
- Unterstützung für Filterung nach Uploader, Kommentator, Likes und Datum
- Sortieroptionen implementiert (neueste, älteste, meiste Likes, meiste Kommentare)
- Paginierung mit Seitennavigator an echte Seiten angepasst

### 📱 Mobile Optimierung

- Postgrid auf mobile Geräte optimiert
- Responsives Layout verbessert für verschiedene Bildschirmgrößen
- Anpassungen für bessere Touch-Interaktion

### 🚀 Leistungsverbesserungen

- Infinite Scroll für flüssigere Benutzererfahrung implementiert
- Speicherung von Benutzereinstellungen im localStorage für persistente Filtereinstellungen
- Optimierte API-Endpunkte mit Unterstützung für Offset und Limit
- Verbesserte Performance durch effizientere Datenbankabfragen

## [1.4.0] -

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

## [1.3.0] -

### 💬 Kommentarsystem-Erweiterung

- Live-Kommentarfunktion aktiviert
- Kommentar-Moderationssystem freigeschaltet
- Antwort-Threading mit verschachtelten Reaktionen
- Bearbeiten und Löschen von Kommentaren für Benutzer
- GIF-Unterstützung in Kommentaren mit GIPHY-Integration
- Option für anonymes Kommentieren

## [1.2.2] -

### 👤 Verbesserungen der Benutzerprofile

- Korrektur der Anzeige von Benutzer-Bios in Posts
- Standardisierte Darstellung von Benutzerstatistiken über alle Komponenten hinweg
- Verbesserte Konsistenz der Benutzerprofilinformationen
- Bessere Organisation von Benutzermetadaten

### 🖼️ UI/UX-Verfeinerungen

- Optimierte Darstellung der Statistiken auf der Startseite
- Entfernung der redundanten Statistikbox in den Post-Ansichten
- Verbesserte visuelle Konsistenz in der gesamten Anwendung

## [1.2.0] -

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

## [1.1.1] -

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

## [1.1.0] -

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

## [1.0.7] -

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

## [1.0.6] -

### 🎨 Erweitertes Kommentarsystem

- GIPHY-Integration mit Attributierung
- Verbesserte Medienanzeige
- Premium-Benutzerabzeichen
- Bessere Antwortformatierung

### 🚀 Leistungsoptimierungen

### 🎯 UI/UX-Verbesserungen
