# Änderungsprotokoll

## [4.0.0] - July 9, 2025 🚀 Major Design & Integration Release

### 🎨 Komplett überarbeitetes Design-System

#### 🌟 Moderne UI-Komponenten
- **Styled Components Integration**: Vollständige Integration von Styled Components für erweiterte Styling-Möglichkeiten
- **ModernSearchInput**: Neue moderne Suchkomponente mit verbesserter UX
- **UserFilterModern**: Komplett überarbeitete Benutzerfilter mit modernem Design und Animationen
- **Gradient-Buttons**: Neue Gradient-Button-Designs mit Hover-Effekten und Transformationen
- **Shimmer-Animationen**: Elegante Ladeanimationen für bessere Benutzererfahrung

#### 🎭 Erweiterte Styling-Features
- **Keyframe-Animationen**: Neue Animationen (shimmer, pulse, sparkle, rainbow, shine)
- **Dark/Light Mode Optimierungen**: Verbesserte Kontraste und Farbschemata
- **Responsive Design**: Optimierte mobile Darstellung für alle neuen Komponenten
- **CSS-in-JS**: Bessere Komponenten-Isolation und Wiederverwendbarkeit

### 🔗 Discord Integration

#### 🎮 Vollständige Discord OAuth Integration
- **Discord Login**: Nahtlose Anmeldung über Discord OAuth
- **Account-Verknüpfung**: Bestehende Accounts können mit Discord verknüpft werden
- **DiscordButton Component**: Neue wiederverwendbare Discord-Button-Komponente
- **Automatische Avatar-Synchronisation**: Discord-Avatare werden automatisch übernommen
- **Spezielle OAuth-Routen**: `/api/auth/link-discord` für Account-Verknüpfung
- **Discord-Regeln**: Erweiterte Regeln und Richtlinien für Discord-Integration

### 👥 Überarbeitete Benutzerseiten

#### 🔍 Moderne Benutzerfilter
- **UserFilterModern**: Komplett neu gestaltete Filter-Oberfläche
- **Erweiterte Suchoptionen**: Verbesserte Suche mit modernen UI-Elementen
- **Rolle-basierte Filterung**: Filterung nach Benutzerrollen (member, premium, moderator, admin, banned)
- **Premium-Status-Filter**: Spezielle Filter für Premium-Mitglieder
- **Zeitbereich-Filter**: Filterung nach Registrierungszeitraum
- **Sortieroptionen**: Erweiterte Sortierung (newest, most_active, most_posts, most_likes)

#### 📱 Mobile Optimierungen
- **Touch-optimierte Filter**: Bessere mobile Bedienung
- **Responsive Layouts**: Angepasste Layouts für verschiedene Bildschirmgrößen
- **Swipe-Gesten**: Verbesserte Touch-Interaktionen

### 🔔 Erweiterte Benachrichtigungen

#### 🔔 NotificationBell Integration
- **Navbar-Integration**: NotificationBell in der Hauptnavigation
- **Mobile Unterstützung**: Optimierte Darstellung auf mobilen Geräten
- **Echtzeit-Updates**: Live-Benachrichtigungen ohne Seitenaktualisierung
- **Verbesserte Positionierung**: Bessere Platzierung in der Benutzeroberfläche

### 🏠 Account-Seite Verbesserungen

#### ⚙️ Erweiterte Account-Verwaltung
- **Discord-Verknüpfung**: Integration der Discord-Account-Verknüpfung
- **Verbesserte Avatar-Verwaltung**: Optimierte Avatar-Upload und -Anzeige
- **Bio-Bearbeitung**: Zuverlässige Bio-Bearbeitung und -Speicherung
- **Account-Sicherheit**: Erweiterte Sicherheitseinstellungen

### 🚀 Technische Verbesserungen

#### 📦 Framework & Dependencies Updates
- **Next.js**: Update auf Version 15.3.5
- **React**: Update auf Version 19.1.0
- **npm**: Update auf Version 11.4.2
- **TailwindCSS**: Update auf Version 4.1.11
- **TypeScript**: Update auf Version 5.8.3
- **Styled Components**: Neue Integration Version 6.1.19

#### 🔧 Konfigurationsverbesserungen
- **remotePatterns**: Optimierte Konfiguration mit neuer URL()-Unterstützung
- **ESLint**: Aktualisierte Konfiguration mit neuen Regeln
- **PostCSS**: Update auf TailwindCSS PostCSS Plugin
- **TypeScript**: Verbesserte Plugin-Performance

#### 🛡️ Sicherheits-Updates
- **OAuth-Sicherheit**: Verbesserte Discord OAuth-Implementierung
- **CORS-Konfiguration**: Optimierte Cross-Origin-Einstellungen
- **Session-Management**: Erweiterte Session-Sicherheit

### 🎯 UX/UI Verbesserungen

#### 🎨 Visuelle Verbesserungen
- **Konsistente Farbschemata**: Einheitliche Farben über alle Komponenten
- **Verbesserte Typografie**: Optimierte Schriftarten und -größen
- **Hover-Effekte**: Neue interaktive Hover-Animationen
- **Loading-States**: Elegante Ladeanimationen und Skeleton-Screens

#### 📱 Mobile-First Design
- **Touch-Optimierung**: Verbesserte Touch-Targets und Gesten
- **Responsive Breakpoints**: Optimierte Breakpoints für alle Geräte
- **Performance**: Schnellere Ladezeiten auf mobilen Geräten

### 🔄 API-Erweiterungen

#### 🔗 Neue Endpunkte
- **Discord OAuth**: Erweiterte OAuth-Endpunkte für Discord-Integration
- **Account-Verknüpfung**: Spezielle API-Routen für Account-Management
- **Benutzerfilter**: Optimierte API für erweiterte Benutzerfilterung

### 📊 Performance-Optimierungen

#### ⚡ Ladezeit-Verbesserungen
- **Code-Splitting**: Bessere Bundle-Aufteilung
- **Lazy Loading**: Optimiertes Laden von Komponenten
- **Caching**: Verbesserte Caching-Strategien
- **Image Optimization**: Optimierte Bildverarbeitung

## [3.5.0] -  Major Feature Release 🎉

### Hinzugefügt

#### 🔔 Vollständiges Benachrichtigungssystem
- **Echtzeit-Benachrichtigungsinfrastruktur** mit umfassender Verfolgung von Benutzerinteraktionen
- **Benachrichtigungstypen**: Kommentar, Antwort, Like, Dislike, Favorit, Erwähnung, System-Benachrichtigungen
- **Benachrichtigungsverwaltung**: Als gelesen markieren, alle löschen, granulare Einstellungen pro Kategorie
- **Erweiterte Benachrichtigungsglocke** mit Live-Zähler und Schnellvorschau
- **@Erwähnungssystem** mit automatischer Benutzername-Erkennung und Benachrichtigungsauslösern
- **Benachrichtigungs-API-Endpunkte** (`/api/notifications`) mit Filterung und Paginierung


#### 🛡️ Erweiterte Moderationssystem
- **Umfassendes Moderations-Dashboard** mit Echtzeit-Statistiken
- **Moderations-API-Endpunkte** (`/api/moderation/*`) für Aktionen, Statistiken und Content-Management
- **Benutzerverwaltungstools**: Sperren, entsperren, Rollenänderungen mit automatischer Protokollierung
- **Content-Moderation**: Genehmigen, ablehnen, löschen von Posts und Kommentaren
- **Meldesystem**: Erweiterte Kommentar- und Post-Meldung mit Verfolgung
- **Moderationsstatistiken**: Ausstehende Kommentare, gemeldete Inhalte, aktive Benutzerüberwachung
- **Bulk-Moderationsoperationen** für effizientes Content-Management

#### 🔄 Erweiterte Interaktionssystem
- **Vereinheitlichte Interaktions-API** (`/api/posts/[id]/interactions`) für alle Benutzeraktionen
- **Optimistische UI-Updates** für Like-, Dislike- und Favorit-Aktionen
- **Konsistente Interaktionsprotokollierung** und Echtzeit-Statistiken
- **Verbesserte Fehlerbehandlung** und Benutzerfeedback für alle Interaktionen
- **Benachrichtigungsintegration** für alle Interaktionstypen

#### 🏷️ Erweiterte Tag-Verwaltung
- **Erweiterte Tag-Validierung** und Normalisierung
- **Batch-Tag-Operationen** für effiziente Verwaltung
- **Verbesserte Tag-Statistiken** und Trending-Berechnungen
- **Moderationstools** für Tag-Management und Bereinigung

### Verbessert

#### 🔧 Technische Verbesserungen
- **WebSocket-Infrastruktur** Vorbereitung für Echtzeit-Features
- **Kommentar-Polling-System** für Live-Updates (10-Sekunden-Intervalle)
- **Datenbankoptimierungen** mit verbesserter Indizierung und Query-Performance
- **Benutzerrollensystem** Erweiterung (user, premium, moderator, admin, banned)
- **API-Endpunkt-Erweiterung** mit besserer Fehlerbehandlung und Validierung
- **Speicherquota-Management** mit benutzerspezifischen Limits und Verfolgung
- **Authentifizierungsverbesserungen** mit rollenbasierter Zugriffskontrolle

#### 🎨 Benutzererfahrungsverbesserungen
- **Echtzeit-UI-Updates** für bessere Reaktionsfähigkeit
- **Erweiterte Benutzerprofile** mit Premium-Indikatoren und Rollenabzeichen
- **Verbesserte Navigation** mit Benachrichtigungsintegration
- **Bessere Fehlermeldungen** und Benutzerfeedback auf der gesamten Plattform
- **Konsistente Gestaltung** für Premium-Features und Moderationstools

### Technische Details
- **Neue API-Endpunkte**:
  - `/api/notifications` - Benachrichtigungsverwaltung
  - `/api/moderation/stats` - Moderationsstatistiken
  - `/api/moderation/actions` - Moderationsoperationen
  - `/api/posts/[id]/interactions` - Vereinheitlichte Interaktionsbehandlung
- **Datenbankschema-Updates**:
  - Benutzerrollen und Premium-Status-Verfolgung
  - Benachrichtigungsspeicherung und Indizierung
  - Interaktionsprotokollierung und Statistiken
  - Moderationsaktions-Historie
- **Frontend-Komponenten**:
  - `NotificationBell` - Echtzeit-Benachrichtigungsindikator
  - `PremiumClient` - Premium-Feature-Management
  - `SettingsPremium` - Premium-Einstellungsschnittstelle
  - Erweiterte Moderations-Dashboard-Komponenten

<details>
<summary>Vorherige Versionen (zum Erweitern klicken)</summary>

## [3.4.2]

- **Bug fixes**:
  
- /account gefixt: avatar und bio endlich bearbeitbar
- Die Reihenfolge der "Previous" und "Next" Buttons wurde umgekehrt, sodass "Next" jetzt links und "Previous" rechts steht. Die Tastaturnavigation wurde entsprechend angepasst, sodass die linke Pfeiltaste (oder 'A') zum neueren Post führt und die rechte Pfeiltaste (oder 'D') zum älteren Post. (danke vio)
- Seitenwechsler von /tags und /user entsprechend /posts ausgerichtet
- Aktualisiert die Statistiken der Likes und Dislikes korrekt, wenn ein Benutzer zwischen Like und Dislike wechselt
- Kein unendliches disliken mehr möglich

## [3.4.1]

### 🚀 Framework-Updates

- **Technologie-Aktualisierungen**:
  - Update von Next.js von 15.2.3 auf 15.3.1
  - Update von npm von 11.2.0 auf 11.3.0
  - Optimierte remotePatterns-Konfiguration mit neuer URL()-Unterstützung
  - Verbesserte TypeScript-Plugin-Performance
  
- **Bug fixes**:

  - Upload date und Upload time im post/id gefixt
  - refresh aktuallisert nicht mehr "last seen" von user LOL
  - Seitenwechsler war wegen Infinite Scroll broken
  - Stay Login ging wegen JWT-Fehler nicht; ist behoben
  - Logik von Kommentaren gefixt (Gab Approved und Rejected Kommentare, das gibt es nun nicht mehr)
  - Case sensivite nicks werden nun richtig verlinkt
  - Nicknamen markieren funktionieren nun
  - Kommentare mit Umbruch werden nun mit Umbruch übernommen

## [3.4.0]

### 😎 Fixes

- **Bugfixes**:

  - Infinite Scroll für bricht design nicht mehr
  - Gif Antworten auf Kommentare funktionieren nun
  - Avatar-Picker funktioniert nun
  - Bio gefixt

### 🔍 Optimierte Tag-Filter

- **Verbesserte Filterseite**:
  - Deutlich schnellere Ladezeiten für die Tag-Filterseite
  - Neue Sortierung für Statistiken mit "Trending" als Standardeinstellung
  - Optimierte Ladestrategie: Nur 20 Tags werden gleichzeitig geladen
  - Verbesserte Anzeige von Zeitfiltern (+week und +today)

### 🔄 Verbesserte Benutzerinteraktion

- **Optimierte Routen und Antworten**:
  - Korrigierte Routen für bessere Navigation
  - Behobene Datumsfilter für präzisere Zeiteinstellungen
  - Korrigierte Session-Antworten für stabilere Benutzersitzungen
  - CSS-Anpassungen an Buttons für verbesserte Benutzerfreundlichkeit

### 🔗 Verbesserte Kommentarfunktionen

- **Optimierte Verlinkungen**:
  - Behobene Kommentar-Hotlinks zu externen URLs
  - Verbesserte Darstellung von externen Links in Kommentaren

### 🧹 Systemoptimierungen

- **Vereinfachte Struktur**:
  - Entfernung von Pools (vorübergehend)
  - Entfernung der Beta-Authentifizierung
  - Optimierte Callback-Funktionen für reduzierte Ladezeiten
  - "Stay logged in" Funktion hinzugefügt

## [3.3.0]

### 🏷️ Erweiterte Tag-Funktionalität

- **Verbesserte Tag-Verwaltung**:
  - Unterstützung für Copy & Paste mehrerer Tags gleichzeitig
  - Automatische Trennung von mehreren Wörtern in einzelne Tags
  - Batch-Tagging für mehrere Uploads auf einmal
  - Optimierte Tag-Verarbeitung für effizienteres Tagging

### 👤 Anonyme Uploads

- **Verbesserte Privatsphäre**:
  - Entfernung von Statistiken und Avataren für anonyme Uploads
  - Optimierte Darstellung für nicht angemeldete Benutzer
  - Verbesserte Benutzerfreundlichkeit für anonyme Uploads

### 📌 Fixes

- **Korrektur der Pin-Funktion**:
  - Angepinnte Beiträge werden nun korrekt auf der ersten Seite angezeigt
  - Behebung der Paginierung für angepinnte Beiträge
  - Verbesserte Konsistenz der Beitragsanzeige
  - Statistiken sind gefixt

## [3.2.0]

### 💬 Erweiterte Kommentarfunktionen

- **@-Erwähnungen in Kommentaren**:
  - Benutzer können nun mit @username in Kommentaren erwähnt werden
  - Automatische Benachrichtigungen bei Erwähnungen
  - Intelligente Username-Vorschläge während der Eingabe
  - Benutzerfreundliche Autofill-Funktion für schnelleres Erwähnen

### 🏷️ Verbessertes Tag-System

- **Optimierte Tag-Anforderungen**:
  - Mindestanzahl von 3 Tags für jeden Upload eingeführt
  - Maximale Tag-Anzahl auf 15 erhöht für bessere Inhaltsorganisation
  - Verbesserte Validierung der Tag-Eingaben

### 🔔 Verbesserte Moderationswerkzeuge

- **Echtzeitberichte für Kommentare**:
  - Live-Verfolgung von gemeldeten Kommentaren für Moderatoren
  - Schnellere Reaktionszeiten bei problematischen Inhalten
  - Verbesserte Übersicht über gemeldete Inhalte

### 📊 Angepasste Benutzeroberfläche

- **Überarbeitetes Voting-System**:
  - Voting-Elemente von Overlay in die Seitenleiste verschoben
  - Intuitiveres Voting-Verhalten mit besserer Sichtbarkeit
  - Konsistente Positionierung über alle Ansichten

- **Verbesserte Datenschutzeinstellungen**:
  - Post-Statistiken für anonyme Benutzer ausgeblendet
  - Klarere Unterscheidung zwischen anonymen und angemeldeten Benutzern

### 🔄 Interaktionserweiterungen

- **Neue Benachrichtigungsfunktionen**:
  - Teilen-Banner hinzugefügt für einfacheres Verbreiten von Inhalten
  - Feedback-Banner für verbesserte Benutzerinteraktion
  - Intuitivere Benutzerführung für soziale Funktionen

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
