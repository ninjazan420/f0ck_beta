'use client';
import { RandomLogo } from "@/components/RandomLogo";
import { Footer } from "@/components/Footer";

export default function Rules() {
  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <h1 className="text-3xl font-[family-name:var(--font-geist-mono)] mb-8 text-center text-black dark:text-gray-400">
          Rules & Policies
        </h1>

        {/* Content Rating Section */}
        <section className="settings-card mb-6">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            Content Rating System
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50/50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-sm font-medium bg-green-500/40 text-white border border-green-500/50">
                  SAFE
                </span>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Safe für alle Benutzer</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Allgemein angemessene Inhalte<br />
                • Kunstwerke ohne anzüglichen Inhalt<br />
                • Landschaftsbilder, Tiere, Objekte<br />
                • Cosplay und Fotografie ohne suggestive Posen<br />
                • Allgemein geeignet für öffentliche Anzeige
              </p>
            </div>

            <div className="p-4 rounded-lg bg-yellow-50/50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-sm font-medium bg-yellow-500/40 text-white border border-yellow-500/50">
                  SKETCHY
                </span>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Suggestiver/erotischer Inhalt</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Suggestive oder erotische Darstellungen<br />
                • Künstlerische Aktdarstellung<br />
                • Cosplay mit suggestiven Posen<br />
                • Leicht anzügliche Inhalte<br />
                • Nicht für öffentliche Anzeige geeignet
              </p>
            </div>

            <div className="p-4 rounded-lg bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-sm font-medium bg-red-500/40 text-white border border-red-500/50">
                  UNSAFE
                </span>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Expliziter Inhalt</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Explizite erotische Darstellungen<br />
                • Künstlerische NSFW-Inhalte<br />
                • Nur für registrierte Benutzer sichtbar<br />
                • Standardmäßig ausgeblendet/geblurred<br />
                • Strenge Altersverifikation erforderlich
              </p>
            </div>
          </div>
        </section>

        {/* Verbotene Inhalte Section */}
        <section className="settings-card mb-6">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            Verbotene Inhalte
          </h2>
          
          <div className="p-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-red-100/50 dark:bg-red-900/30">
                <h3 className="font-medium text-red-900 dark:text-red-300 mb-2">Illegale Inhalte</h3>
                <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200 space-y-1">
                  <li>Minderjährige in jeglichem Kontext - Wird gemeldet</li>
                  <li>Nicht einvernehmliche Inhalte jeglicher Art</li>
                  <li>Reale Gewaltdarstellungen</li>
                  <li>Zoophilie und Tiermissbrauch</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-red-100/50 dark:bg-red-900/30">
                <h3 className="font-medium text-red-900 dark:text-red-300 mb-2">Persönliche Daten</h3>
                <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200 space-y-1">
                  <li>Private Informationen Dritter</li>
                  <li>Doxxing und Identitätsdiebstahl</li>
                  <li>Nicht autorisierte private Aufnahmen</li>
                  <li>Persönliche Kontaktdaten</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-red-100/50 dark:bg-red-900/30">
                <h3 className="font-medium text-red-900 dark:text-red-300 mb-2">Schädliche Inhalte</h3>
                <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200 space-y-1">
                  <li>Malware und schädliche Software</li>
                  <li>Phishing und Betrugsversuche</li>
                  <li>Spam und Werbebots</li>
                  <li>Massenwerbung ohne Genehmigung</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Allgemeine Regeln Section */}
        <section className="settings-card mb-6">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            Allgemeine Regeln
          </h2>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Tagging & Kategorisierung</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Alle Uploads müssen korrekt getaggt werden</li>
                <li>Mindestens 3 beschreibende Tags pro Upload</li>
                <li>Keine irreführenden oder Troll-Tags</li>
                <li>Korrekte Content-Rating Markierung (Safe/Sketchy/Unsafe)</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Kommentare & Interaktion</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Respektvoller Umgang mit anderen Nutzern</li>
                <li>Keine Beleidigungen oder Hassrede</li>
                <li>Keine Spam-Kommentare oder Kettenbriefe</li>
                <li>Konstruktive Kritik ist erwünscht</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Upload-Regeln</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Nur eigene Werke oder mit Erlaubnis des Urhebers</li>
                <li>Quellenangabe bei fremden Inhalten</li>
                <li>Keine mehrfachen identischen Uploads</li>
                <li>Angemessene Bildqualität (mind. 500px Breite)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Account-Richtlinien Section */}
        <section className="settings-card mb-6">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            Account-Richtlinien
          </h2>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Account-Sicherheit</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Keine Account-Weitergabe oder -Verkauf</li>
                <li>Starke Passwörter erforderlich</li>
                <li>2FA wird empfohlen</li>
                <li>Maximale Sicherheitseinstellungen für NSFW-Zugriff</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Altersbeschränkung</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Mindestalter: 18 Jahre</li>
                <li>Altersverifikation für NSFW-Inhalte</li>
                <li>Keine minderjährigen Nutzer</li>
                <li>Bei Verdacht erfolgt Account-Sperrung</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Konsequenzen Section */}
        <section className="settings-card">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            Konsequenzen bei Verstößen
          </h2>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Stufensystem</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Erste Warnung bei leichten Verstößen</li>
                <li>Temporäre Sperre bei wiederholten Verstößen</li>
                <li>Permanente Sperre bei schweren Verstößen</li>
                <li>Sofortige Löschung bei illegalen Inhalten</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Berufung</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Einspruch gegen Verwarnungen möglich</li>
                <li>Support-Kontakt: support@f0ck.org</li>
                <li>Überprüfung durch Moderatoren</li>
                <li>Entscheidung nach Einzelfallprüfung</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}
