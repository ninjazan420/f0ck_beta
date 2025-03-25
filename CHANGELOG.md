# Änderungsprotokoll

## [3.1.0]

### 🎨 Verbesserte Benutzeroberfläche

- **Optimierter Light Mode**:
  - Umfassende Unterstützung des Light Mode über alle Komponenten
  - Verbesserte Kontraste und Lesbarkeit im hellen Design
  - Konsistente Darstellung in beiden Themes

### 🎬 Erweiterte Medienunterstützung

- **Verbesserte Videointegration**:
  - Video-Vorschau während des Upload-Prozesses implementiert
  - Korrektur der Aktivitäts-Feed-Typen für Video- und Bildinhalte
  - Optimierte Erkennung und Anzeige von Medientypen

### 🔒 Datenschutz & Sicherheit

- **Erweiterte Inhaltsfilterung**:
  - Aktivierung von Unschärfe-Effekten für NSFW-Inhalte basierend auf Benutzereinstellungen
  - Verbesserte Filtermechanismen für sensible Inhalte
  - Erweiterte Benutzerkontrolle über Inhaltssichtbarkeit

### 🛠️ Technische Verbesserungen

- **Systemoptimierungen**:
  - Korrektur der Boolean-Verarbeitung in der Switch-Komponente
  - Optimierte Middleware für lokale Entwicklungsumgebungen
  - Verbesserte WebSocket-Implementation ohne Domain-Abhängigkeiten
  - Behebung von Kommentar-Listener-Fehlern
  - Optimierte Dateinamenverarbeitung durch Entfernung von Domainnamen
  - Aktualisiertes Favicon für bessere Markenerkennung

## [3.0.1]

### 🎬 Video-Upload-Funktionalität

- **Vollständige Video-Upload-Unterstützung**:
  - Implementation einer robusten Video-Upload-Funktion
  - Chunked Uploads für effiziente Übertragung großer Videodateien
  - Automatische Thumbnail-Generierung für Videos
  - Optimierte Videodarstellung mit angepasstem Player

### 🗳️ Verbessertes Voting-System

- **Überarbeitetes Abstimmungssystem**:
  - Voting-System komplett überarbeitet und neu positioniert
  - Korrigierte Voting-Position auf der /post/id-Seite für bessere Benutzerfreundlichkeit
  - Effizientere Verarbeitung von Benutzerinteraktionen
  - Verbesserte visuelle Rückmeldungen bei Abstimmungen

### 🧹 Optimierte Datenbankverwaltung

- **Erweiterte Bereinigungsfunktionen**:
  - Automatisches Entfernen von Datenbank-Arrays beim Löschen von Posts
  - Vollständige Bereinigung zugehöriger Mediendateien bei Post-Löschung
  - Verbesserte Integrität der Benutzerdaten nach Post-Entfernung
  - Optimierte Speichernutzung durch effiziente Dateilöschung

### 🛡️ Verbesserte Moderatorenwerkzeuge

- **Erweiterte Moderationsfunktionen**:
  - Überarbeitete Moderator-Tools für effizientere Content-Verwaltung
  - Erweiterte Logging-Funktionen für Moderationsaktionen
  - Verbesserte API-Endpunkte für Moderationsaufgaben
  - Sicherheitsupdates für Moderatorenzugriffe

### 🧩 UI/UX-Verbesserungen

- **Optimierte Benutzeroberfläche**:
  - Neues Switch-Design in Einstellungen und Benachrichtigungen
  - Unterstützung für anonyme Antworten und Reports aktiviert
  - Verbesserte visuelle Konsistenz über alle Komponenten hinweg
  - Optimierte Mobilansicht für verbesserte Benutzerfreundlichkeit

### 🔒 Sicherheitsverbesserungen

- **Kritische Fehlerbehebungen**:
  - Behebung von CVE-2025-29927 für verbesserte Plattformsicherheit
  - Verstärkte Validierung von Benutzeraktionen
  - Verbesserte Fehlerbehandlung und Logging
  - Erhöhte Sicherheit bei Dateiuploads


## [2.7.0]

### 🎮 Verbesserte Navigation und Benutzerfreundlichkeit

- **Optimierte Benutzerstatistiken**:
  - Statistiken unter /user/id und /post sind nun klickbar und führen zu entsprechenden Uploads
  - Verbesserte Benutzerinteraktion durch intuitivere Navigationselemente
  - Konsistente Darstellung von Statistiken über alle Komponenten hinweg
- **Überarbeitete Tags-Seite**:
  - Komplette Neugestaltung der /tags-Seite für bessere Übersichtlichkeit
  - Kompaktere Tag-Boxen für effizientere Raumnutzung
  - Verbesserte visuelle Hierarchie mit klarer Statistik-Anzeige
  - Bessere Darstellung von Tag-Autoren und zugehörigen Informationen
- **Optimierte Benutzerverwaltung**:
  - Seitenwechsler von /users angepasst, um auf direkten "ist"-Zustand zu kommen
  - Verbesserte Pagination mit intelligenterer Seitennummerierung
  - Optimierte Performance bei der Anzeige von Benutzerverzeichnissen

### 🔧 Technische Verbesserungen

- **Datenbank-Optimierungen**:
  - Tag-System erweitert: Autor zu Tags in der Datenbank hinzugefügt, damit Filter korrekt funktionieren
  - Korrektur des Post-Counters in MongoDB beim Löschen von Bildern über das Moderator-Panel
  - Verbesserte Datenintegrität und Konsistenz bei Benutzerinteraktionen
- **Backend-Anpassungen**:
  - Aktualisierte Kontakt-Email
  - Optimierte API-Endpunkte für Tag-bezogene Operationen
  - Verbesserte Fehlerbehandlung bei Benutzerfilterung

## [2.6.0]

### 💎 Komplett überarbeitetes Benachrichtigungssystem

- **Neugestaltung der Notifikationsseite und Benachrichtigungsglocke**:
  - Vollständige Neugestaltung der Notifikationsseite mit verbesserter Organisation und Filterung
  - Neu gestaltete Benachrichtigungsglocke für bessere Sichtbarkeit und Interaktion
  - Verbesserte visuelle Darstellung von Benachrichtigungen mit klarer Prioritisierung
  - Optimierte Gruppierung verwandter Benachrichtigungen
- **Neue Benachrichtigungsfunktionen**:
  - "Hat geantwortet" Status für klarere Konversationsverfolgung hinzugefügt
  - Erweiterte Benachrichtigungstypen für verschiedene Benutzerinteraktionen
  - Verbesserte Kontextinformationen in Benachrichtigungen

### 🎨 Integration von Styled Components

- **Erweiterte Styling-Möglichkeiten**:
  - Styled Components als zusätzliche Styling-Lösung implementiert
  - Verbesserte Komponenten-Isolation und Wiederverwendbarkeit
  - Erweiterte Theming-Funktionen für konsistentes Design
  - Bessere Trennung von Styling-Belangen in komplexen Komponenten

### 📱 Mobile Verbesserungen

- **Optimierte mobile Benutzererfahrung**:
  - Notifikationsglocke für mobile Geräte hinzugefügt und optimiert
  - Reihenfolge der Navbar geändert: Benutzername und Avatar stehen jetzt ganz rechts
  - Verbesserte Touch-Schnittstellen für Benachrichtigungsinteraktionen
  - Responsive Design-Verbesserungen für verschiedene Bildschirmgrößen

### 🔍 Erweiterte Kommentarfunktionen

- **Verbesserte Kommentarfunktionalität**:
  - Filter in Kommentaren aktiviert für bessere Übersichtlichkeit
  - Verbesserte Darstellung von Kommentar-Threads
  - Optimierte Benachrichtigungen für Kommentare mit klarerem Kontext
  - Beschleunigte Ladezeiten für Kommentare und Antworten

## [2.5.0]

### 🌟 Verbesserte Interaktionssysteme

- **Umfassendes Like- und Dislike-System**:
  - Vollständige Implementierung der Like- und Dislike-Funktionalität
  - Optimistisches UI-Update für unmittelbare Benutzerrückmeldung
  - Konsistente Verarbeitung von Benutzerinteraktionen über alle Seiten hinweg
  - ModLog-Einträge für alle Interaktionen zur besseren Nachverfolgung

### 📌 Neue Post-Management-Funktionen

- **Pinned Posts Feature implementiert**:
  - Möglichkeit, wichtige Beiträge an der Spitze der Seite anzupinnen
  - Verbesserte Sichtbarkeit für wichtige Informationen
  - Intuitives Pin/Unpin-System für Administratoren
  - "unfeature" Typ-Never-Fehler behoben für zuverlässige Funktionalität

### 🔔 Benachrichtigungssystem

- **Verbesserte Benachrichtigungen für Benutzerinteraktionen**:
  - Echtzeitbenachrichtigungen für Likes, Dislikes und Favoriten
  - Klare Rückmeldung bei allen Benutzerinteraktionen
  - Optimierte Verarbeitung und Zustellung von Benachrichtigungen

### 📊 Überarbeitete Statistiken

- **Neu gestalteter Statistikbereich auf der Startseite**:
  - Visuelle Verbesserungen zur besseren Datenvisualisierung
  - Ersetzung von Template-Daten durch Echtzeit-Daten
  - Effizientere Aktualisierung von Beitragsstatistiken

### 🖼️ Medienverbesserungen

- **Optimierte Bildanzeige**:
  - Korrigierte Bildvorschau in Metadaten für besseres Social Sharing
  - Verbesserte Darstellung von Bildern in verschiedenen Kontexten

### 🛠️ Technische Verbesserungen

- **Vereinheitlichte API-Endpunkte**:
  - Neue Interactions-API für konsistente Handhabung aller Benutzerinteraktionen
  - Optimierte Datenverarbeitung mit verbesserten Fehlerbehandlungen
  - Effizientere Batches für Aktualisierung von Statistiken

## [2.4.0]

### 🌟 Neues Feature-System

- **"Featured Post" Option hinzugefügt**:
  - Moderatoren und Admins können nun Beiträge auf der Startseite hervorheben
  - Neue API-Endpunkte für die Verwaltung von Featured Posts
  - ModLog-Einträge für Feature/Unfeature-Aktionen
  - Visuelle Kennzeichnung von Featured Posts

### 🏠 Verbessertes Frontend

- **Komplettes Redesign der Startseite**:
  - Moderneres Layout mit hervorgehobenen Beiträgen
  - Verbesserte Statistikdarstellung mit detaillierteren Informationen
  - Reaktionsschnellere Benutzeroberfläche für alle Geräte
  - Neue PostPreview-Komponente für einheitliche Darstellung

### 🔗 Optimiertes Social Sharing

- **Verbesserte Metadaten für Social Media**:
  - OG-Titel und Bilder für bessere Vorschau in sozialen Netzwerken
  - Optimierte Social-Sharing-Previews
  - Verbesserte SEO durch strukturierte Metadaten

### 🛠️ Technische Verbesserungen

- **Erweiterte Datenmodelle**:
  - Neues SiteSettings-Modell für globale Einstellungen
  - Erweitertes ModLog-System mit neuen Aktionstypen
  - Verbesserte WebSocket-Verbindungen für Kommentare

## [2.3.0]

### 🔧 Komplett überarbeitete Moderationsseite

- Verbesserte Benutzeroberfläche mit separaten Tabs für Übersicht, Kommentare, Aktivitätslog und Aktionen
- Intuitivere Navigation zwischen den verschiedenen Moderationsbereichen
- Optimierte Darstellung der Moderationsaktivitäten

### 🏷️ Moderationsroute für Tags

- Neue Funktionen zur Verwaltung von Tags für Moderatoren
- Löschfunktion für problematische oder unerwünschte Tags
- Verbesserte Übersicht über Tag-Aktivitäten im Aktivitätslog

### ✏️ Tag-Bearbeitungsfunktion für normale Benutzer

- Benutzer können nun selbst Tags zu ihren Beiträgen hinzufügen und bearbeiten
- Vereinfachte Benutzeroberfläche für die Tag-Verwaltung
- Verbesserte Tag-Validierung und Fehlermeldungen

### 🐛 Fehlerbehebungen

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

### 🎨 Neue Funktionalitäten

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
