'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Filters } from './UsersPage';
import { getImageUrlWithCacheBuster } from '@/lib/utils';

export interface UserListProps {
  filters: Filters;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface User {
  username: string;
  bio: string;
  createdAt: string;
  lastSeen: string;
  premium?: boolean;
  role: 'user' | 'moderator' | 'admin' | 'banned';
  stats: {
    uploads?: number;
    comments?: number;
    favorites?: number;
    likes?: number;
    tags?: number;
  };
  avatar?: string | null;
}

export function UserList({ filters, page, totalPages, onPageChange }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualTotalPages, setActualTotalPages] = useState(totalPages);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          search: filters.search,
          sortBy: filters.sortBy,
          roles: filters.roles.join(','),
          isPremium: filters.isPremium?.toString() || '',
          timeRange: filters.timeRange
        });

        const response = await fetch(`/api/users?${searchParams}`);
        if (!response.ok) throw new Error('Fehler beim Laden der Benutzer');

        const data = await response.json();
        setUsers(data.users);

        if (data.pagination && data.pagination.pages) {
          setActualTotalPages(data.pagination.pages);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filters, page]);

  if (loading) {
    return <div className="animate-pulse">Lade Benutzer...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div key={user.username}
            className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              {/* Avatar - Mit Link auf Benutzerprofil */}
              <Link href={`/user/${user.username}`} className="flex-shrink-0">
                <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <Image
                      src={getImageUrlWithCacheBuster(user.avatar)}
                      alt={`${user.username}'s avatar`}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-xl">
                      {user.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  {/* Benutzername - Mit Link auf Benutzerprofil */}
                  <Link href={`/user/${user.username}`}>
                    <h3 className="font-medium hover:underline">{user.username}</h3>
                  </Link>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      user.role === "admin"
                        ? "bg-red-500/40 text-white border border-red-500/50"
                        : user.role === "moderator"
                        ? "bg-blue-500/40 text-white border border-blue-500/50"
                        : user.role === "banned"
                        ? "bg-gray-900/80 text-white border border-gray-700/50"
                        : user.role === "premium"
                        ? "bg-purple-500/40 text-white border border-purple-500/50"
                        : "bg-gray-500/40 text-white border border-gray-500/50"
                    }`}
                  >
                    {user.role === "admin"
                      ? "ADMIN"
                      : user.role === "moderator"
                      ? "MOD"
                      : user.role === "banned"
                      ? "BANNED ✝"
                      : user.role === "premium"
                      ? "PREMIUM"
                      : "MEMBER"}
                  </span>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                  {user.bio || "No bio yet"}
                </p>

                {/* Statistiken */}
                <div className="mt-2 grid grid-cols-5 gap-2 text-xs text-gray-400">
                  <Link href={`/posts?uploader=${user.username}`} className="hover:text-purple-600 dark:hover:text-purple-400">
                    <span className="block">uploads</span>
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {user.stats?.uploads || 0}
                    </span>
                  </Link>
                  <Link href={`/comments?author=${user.username}`} className="hover:text-purple-600 dark:hover:text-purple-400">
                    <span className="block">comments</span>
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {user.stats?.comments || 0}
                    </span>
                  </Link>
                  <Link href={`/posts?liked=${user.username}`} className="hover:text-purple-600 dark:hover:text-purple-400">
                    <span className="block">likes</span>
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {user.stats?.likes || 0}
                    </span>
                  </Link>
                  <Link href={`/posts?favorited=${user.username}`} className="hover:text-purple-600 dark:hover:text-purple-400">
                    <span className="block">favorites</span>
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {user.stats?.favorites || 0}
                    </span>
                  </Link>
                  <Link href={`/tags?creator=${user.username}`} className="hover:text-purple-600 dark:hover:text-purple-400">
                    <span className="block">tags</span>
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {user.stats?.tags || 0}
                    </span>
                  </Link>
                </div>

                <div className="mt-2 space-y-0.5 text-xs text-gray-400">
                  <div>
                    Member since:{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    Last seen: {new Date(user.lastSeen).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Angepasste Paginierung mit korrekter Beschriftung */}
      {actualTotalPages >= 1 && (
        <div className="flex items-center justify-between">
          {page > 1 ? (
            <button
              onClick={() => onPageChange(page - 1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              ← Next
            </button>
          ) : (
            <div className="p-2 invisible">← Next</div>
          )}

          <div className="flex items-center space-x-2">
            {/* Dynamische Anzeige der Seitenzahlen mit intelligenter Logik */}
            {Array.from({ length: Math.min(5, actualTotalPages) }, (_, i) => {
              // Berechne die anzuzeigenden Seitenzahlen basierend auf der aktuellen Seite
              let pageNum;

              if (page <= 3) {
                // Wenn wir auf den ersten Seiten sind, zeige die ersten 5 Seiten
                pageNum = i + 1;
              } else if (page >= actualTotalPages - 2) {
                // Wenn wir auf den letzten Seiten sind, zeige die letzten 5 Seiten
                pageNum = actualTotalPages - 4 + i;
              } else {
                // Sonst zeige 2 Seiten vor und nach der aktuellen Seite
                pageNum = page - 2 + i;
              }

              // Stelle sicher, dass die Seitenzahl im gültigen Bereich liegt
              if (pageNum <= 0 || pageNum > actualTotalPages) {
                return null;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 rounded-md ${
                    pageNum === page
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {pageNum}
                </button>
              );
            }).filter(Boolean)}

            {/* "..." und letzte Seite anzeigen, wenn wir nicht in der Nähe der letzten Seite sind */}
            {page < actualTotalPages - 2 && actualTotalPages > 5 && (
              <>
                <span className="text-gray-500">...</span>
                <button
                  onClick={() => onPageChange(actualTotalPages)}
                  className={`px-3 py-1 rounded-md text-gray-600 dark:text-gray-400`}
                >
                  {actualTotalPages}
                </button>
              </>
            )}
          </div>

          {page < actualTotalPages ? (
            <button
              onClick={() => onPageChange(page + 1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              Previous →
            </button>
          ) : (
            <div className="p-2 invisible">Previous →</div>
          )}
        </div>
      )}
    </div>
  );
}
