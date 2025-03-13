# Änderungsprotokoll

## 2.3.0

### Funktionen hinzugefügt
- Komplett überarbeitete Moderationsseite mit Tab-Navigation
  - Verbesserte Benutzeroberfläche mit separaten Tabs für Übersicht, Kommentare, Aktivitätslog und Aktionen
  - Intuitivere Navigation zwischen den verschiedenen Moderationsbereichen
  - Optimierte Darstellung der Moderationsaktivitäten
- Moderationsroute für Tags hinzugefügt
  - Neue Funktionen zur Verwaltung von Tags für Moderatoren
  - Löschfunktion für problematische oder unerwünschte Tags
  - Verbesserte Übersicht über Tag-Aktivitäten im Aktivitätslog
- Tag-Bearbeitungsfunktion für normale Benutzer
  - Benutzer können nun selbst Tags zu ihren Beiträgen hinzufügen und bearbeiten
  - Vereinfachte Benutzeroberfläche für die Tag-Verwaltung
  - Verbesserte Tag-Validierung und Fehlermeldungen

### Fehlerbehebungen
- Behebung eines Race-Condition-Problems beim Hochladen von Dateien
  - Stabilere Verarbeitung von Uploads, insbesondere bei mehreren gleichzeitigen Anfragen
  - Zuverlässigere Thumbnail-Generierung
- Tag- und NSFW-Filter auf der /posts-Seite korrigiert, die nach API-Aktualisierung nicht angewendet wurden
  - Filter werden nun korrekt beibehalten, wenn die Seite aktualisiert wird
  - Konsistente Filterergebnisse bei Seitennavigation
- Verschiedene Pfadkorrekturen für eine bessere Navigation
- Umfangreiche Sicherheitsupdates zur Verbesserung des Datenschutzes
- Probleme beim Avatar-Upload behoben, die zu fehlerhaften Darstellungen führen konnten

## [2.2.0]

### 🔧 Technische Verbesserungen

- **API-Optimierungen**:
  - Korrektur der params.id Verwendung mit await: `const id = Number(await params.id)`
  - Behebung des Fehlers "params should be awaited before using its properties"
  - Entfernung von anonymen Links aus der Dokumentation
  - Sehr umfangreiche Sicherheitsverbesserungen und API-Optimierungen

## [2.1.0] -

### 🛡️ Verbessertes Moderationssystem

- **Umfassende Moderationstools**:
  - Vollständige Implementierung der Kommentarsperrung für Posts
  - Verbesserte Moderatorenfunktionen direkt auf der Post-Seite
  - Intuitive Bedienoberfläche für Moderatoren
  - Konsistente Sperrung von Kommentaren bei deaktivierten Posts

### 📚 Wiki-System

- **Neue Wiki-Funktionalität**:
  - Hinzufügung eines Wiki-Systems zur Dokumentation
  - Wiki-Verzeichnis zur .gitignore hinzugefügt für lokale Wikis
  - Verbesserte Benutzerdokumentation

### 🐛 Fehlerbehebungen

- **Verbesserte Kommentarfunktionen**:
  - Behoben: Kommentarboxen respektieren jetzt korrekt den deaktivierten Status
  - Verbesserte visuelle Rückmeldung für deaktivierte Kommentare
  - Konsistente Statusanzeige für Kommentardeaktivierung

## [2.0.0] -

### 🚀 State of the Art der Beta-Website

Diese Version markiert einen wichtigen Meilenstein für das f0ck.org Projekt und fasst alle Verbesserungen und Funktionen der bisherigen Beta-Versionen zusammen. Version 2.0.0 repräsentiert den aktuellen Stand der Technik der Beta-Website mit einem stabilen Fundament für zukünftige Entwicklungen.

### 🖼️ Umfassendes Medien-System

- **Vollständig funktionierendes Upload-System**:
  - Unterstützung für anonyme Uploads ohne Kontoerfordernis
  - Optimierte Bild- und Videoverarbeitung mit automatischer Thumbnailgenerierung
  - Fortschrittliche Dateityp-Validierung und Fehlerbehandlung
  - Copy & Paste-Funktionalität und direktes Hochladen via Image-Grabbing
  - Zuverlässige Verarbeitung von Thumbnails und Originalbildern

### 🏷️ Komplettes Tag-System

- **Organisieren und Finden von Inhalten mit Tags**:
  - Bis zu 10 Tags pro Upload für bessere Auffindbarkeit
  - Vereinfachte Tag-Struktur ohne Kategorien-Unterscheidung
  - Leistungsstarke Tag-Suche mit kombinierbaren Suchkriterien
  - Intelligente Tag-Validierung für konsistente Taxonomie

### 💬 Erweiterte Kommentarfunktionen

- **Umfassendes Kommentar-System**:
  - Live-Kommentare mit WebSocket-Integration
  - GIF- und Emoji-Unterstützung durch GIPHY-Integration
  - Erweiterte Funktionen: Bearbeiten, Löschen, Zitieren
  - Antwort-Threading für verschachtelte Diskussionen
  - Unterstützung für anonymes Kommentieren

### 🔍 Erweiterte Suchfunktionen

- **Fortschrittliche Filter- und Suchoptionen**:
  - Umfangreiche Filtermöglichkeiten (Uploader, Kommentator, Likes, Datum)
  - Flexible Sortieroptionen (neueste, älteste, meiste Likes, meiste Kommentare)
  - Reverse Image Search für ähnliche Bildersuche
  - Unterstützung für Registrierungszeitraum-Filter
  - Intelligente Paginierung mit Seitennavigator

### 👤 Verbesserte Benutzeroberfläche

- **Optimierte Navigation und Benutzerfreundlichkeit**:
  - Neues Avatar-System mit verbesserten Funktionalitäten
  - Verbesserte Post-Navigation mit Unterstützung für Pfeiltasten
  - Responsives Design für mobile Geräte optimiert
  - Persistent Benutzereinstellungen im localStorage
  - Verbesserte Darstellung von Benutzerstatistiken und Metadaten

### 🛠️ Technische Verbesserungen

- **Fortschrittliche Infrastruktur**:
  - Bessere Umgebungsvariablen-Verwaltung
  - Optimierte API-Endpunkte mit effizienten Datenbankabfragen
  - Verbesserte Leistung durch Lazy Loading und effiziente Datenverarbeitung

### 🚀 Leistungsoptimierungen

- **Schnellere und flüssigere Benutzererfahrung**:
  - Infinite Scroll für nahtloses Browsen
  - Optimierte Ladezeiten für Medieninhalte
  - Verbesserte Bildverarbeitung und -anzeige
  - Effizienteres Laden von Benutzeraktivitäten

### 🔒 Sicherheitsverbesserungen

- **Verbesserte Sicherheit und Moderation**:
  - Rollenbasierte Zugriffssteuerung
  - Moderation-System für Kommentare und Inhalte
  - Verbesserte Benutzervalidierung
  - Automatische Spam-Erkennung

### 🛠️ Fehlerbehebungen

- **Umfangreiche Bugfixes**:
  - Tag-System vollständig funktionsfähig mit zuverlässiger Inhaltsorganisation
  - Korrekte Darstellung und Verlinkung von Thumbnails und Originalbildern
  - Behoben: "Sketchy"/"Unsafe" Posts laden jetzt beim ersten Besuch korrekt
  - Reparierte Aktivitäts-Feeds auf /users/id und /account
  - Korrigierte Meta-Titel und verbesserte SEO
  - Optimierte Fehlerbehandlung in verschiedenen Komponenten

## [1.8.0] -

### 🖼️ Verbesserte Medienverarbeitung

- **Upload-System optimiert**: 
  - Korrektur der Upload-Route für zuverlässige Verarbeitung von Thumbnails und Originalbildern
  - Verbesserte Fehlerbehandlung bei Bildverarbeitung

### 👤 Verbesserte Benutzeroberfläche

- **Avatar-System überarbeitet**: Optimierung und Fehlerbehebung bei Benutzeravataren
- **Verbesserte Navigation**:
  - Post/ID Navigation vollständig überarbeitet für eine reibungslosere Benutzererfahrung
  - Intuitivere Benutzerführung zwischen zusammenhängenden Inhalten
- **Bessere SEO und Social Sharing**: Implementation von og:title Tags für optimierte Darstellung in sozialen Medien und robots.txt hinzugefügt

### 🚀 Leistungsoptimierungen

- **Effizienteres Laden von Benutzeraktivitäten**: Implementierung von Lazy Loading für Recent Activity Feeds
- **Schnellere Ladezeiten**: Optimierte Verarbeitung von Medieninhalten

### 🛠️ Fehlerbehebungen

- **Tag-System vollständig funktionsfähig**: Umfassende Fehlerbehebung im Tag-System für verlässliche Inhaltsorganisation
- **Optimierte Bildverarbeitung**: Korrekte Darstellung und Verlinkung von Thumbnails und Originalbildern

## [1.7.0] -

### 👤 Verbesserte Benutzeroberfläche

- **Neue Avatar-Funktionen**: Implementation eines neu gestalteten Account-Cards mit verbesserten Avatar-Funktionalitäten für Benutzer
- **Optimierte Navigation zwischen Posts**: 
  - Unterstützung für Pfeil-Links/Rechts und A/D-Tasten zum Blättern durch Posts
  - Post-Navigator repariert, sodass nur der aktuelle Zustand berücksichtigt wird
- **Verbesserte Metadaten**: Hinzufügen von og:title Tags für bessere Darstellung in sozialen Medien und Suchmaschinen

### 🚀 Neue Funktionalitäten

- **Erweiterte Upload-Möglichkeiten**: 
  - Copy & Paste-Funktion implementiert
  - Direktes Hochladen über Image-Grabbing hinzugefügt
- **Technische Verbesserungen**:
  - UUID Linter-Fehler durch Hinzufügen von uuid.d.ts behoben
- **Optimierte Benutzeraktivität**: Implementation von Lazy Loading für Recent Activity Feeds für verbesserte Performance

### 🛠️ Fehlerbehebungen

- **Reparierte Filter und Suche**:
  - Registrierungszeitraum-Filter wiederhergestellt
  - Yandex in der Reverse-Image-Search repariert
  - Tag-System vollständig funktionsfähig
- **Verbesserte Bildanzeige**:
  - Korrektur von Thumbnail- und Bild-URLs in der Upload-Route
  - Problem mit nicht ladenden "Sketchy"/"Unsafe" Posts beim ersten Besuch behoben
- **Optimierte Feeds**:
  - Aktivitäts-Feed auf /users/id und /account repariert, der manchmal nicht geladen wurde

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
