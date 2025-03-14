'use client';

import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { RandomLogo } from "@/components/RandomLogo";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col items-center">
      <div className="flex-1 flex flex-col items-center w-full">
        {/* Top Section - Logo and Welcome */}
        <div className="flex flex-col items-center gap-4 pt-12 pb-8">
          <RandomLogo />

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
              Anonymous Imageboard platform for sharing Memes, Cats, and more
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Beta Version 2.5.0 - We build something new...
            </p>
          </div>
        </div>

        {/* Featured Post Section */}
        <FeaturedPostSection />

        {/* Stats Section - wird über API geladen */}
        <StatsSection />
      </div>
      <Footer />
    </div>
  );
}

// Client Component für Featured Post
import { useEffect, useState } from "react";

// Definiere zuerst einen Typ für den Featured Post
interface Author {
  username: string;
  avatar?: string;
}

interface FeaturedPost {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
  author?: Author;
  stats?: {
    comments: number;
  };
  tags?: string[];
  createdAt: string | number | Date;
}

function FeaturedPostSection() {
  const [featuredPost, setFeaturedPost] = useState<FeaturedPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedPost() {
      try {
        const response = await fetch('/api/featured');
        const data = await response.json();
        
        if (data.featured) {
          setFeaturedPost(data.featured);
        }
      } catch (error) {
        console.error('Error fetching featured post:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedPost();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
      </div>
    );
  }

  if (!featuredPost) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <Link 
          href="/posts" 
          className="block relative aspect-[16/9] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 hover:opacity-90 transition-opacity"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-4 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors">
              Explore Posts
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
        <Link href={`/post/${featuredPost.id}`}>
          <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img 
              src={featuredPost.imageUrl} 
              alt={featuredPost.title}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
        </Link>
        
        <div className="p-4 bg-white dark:bg-gray-900">
          <Link href={`/post/${featuredPost.id}`} className="hover:underline">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{featuredPost.title}</h2>
          </Link>
          
          {featuredPost.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{featuredPost.description}</p>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              {featuredPost.author && (
                <Link href={`/user/${featuredPost.author.username}`} className="flex items-center hover:underline">
                  {featuredPost.author.avatar ? (
                    <img 
                      src={featuredPost.author.avatar} 
                      alt={featuredPost.author.username}
                      className="w-6 h-6 rounded mr-2"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center text-white text-xs mr-2">
                      {featuredPost.author.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-gray-700 dark:text-gray-300">{featuredPost.author.username}</span>
                </Link>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <Link href={`/post/${featuredPost.id}`} className="flex items-center hover:text-blue-500 transition-colors">
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>{featuredPost.stats?.comments || 0}</span>
              </Link>
              
              <Link href={`/post/${featuredPost.id}`} className="flex items-center hover:text-blue-500 transition-colors">
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                <span>{Array.isArray(featuredPost.tags) ? featuredPost.tags.length : 0}</span>
              </Link>
              
              <Link href={`/post/${featuredPost.id}`} className="hover:text-blue-500 transition-colors">
                {new Date(featuredPost.createdAt).toLocaleDateString()}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Client Component für Stats
function StatsSection() {
  const [stats, setStats] = useState({ 
    activeUsers: 0, 
    newPosts: 0, 
    newComments: 0,
    newTags: 0,
    totalTags: 0
  });
  
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setStats({
          ...data,
          newTags: data.newTags || 0,
          totalTags: data.totalTags || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 space-y-8 mb-8 mt-6">
      <div className="flex justify-between items-center rounded-lg p-4 bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
        <Link href="/users" className="text-center flex-1 hover:opacity-80 transition-opacity">
          <div className="text-xl font-light tracking-tight text-gray-900 dark:text-gray-300">{stats.activeUsers}</div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-500">Active Users</div>
        </Link>
        
        <div className="h-10 w-px bg-gray-200 dark:bg-gray-700"></div>
        
        <Link href="/posts" className="text-center flex-1 hover:opacity-80 transition-opacity">
          <div className="text-xl font-light tracking-tight text-gray-900 dark:text-gray-300">{stats.newPosts}</div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-500">New Posts</div>
        </Link>
        
        <div className="h-10 w-px bg-gray-200 dark:bg-gray-700"></div>
        
        <Link href="/comments" className="text-center flex-1 hover:opacity-80 transition-opacity">
          <div className="text-xl font-light tracking-tight text-gray-900 dark:text-gray-300">{stats.newComments}</div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-500">Comments</div>
        </Link>
        
        <div className="h-10 w-px bg-gray-200 dark:bg-gray-700"></div>
        
        <Link href="/tags" className="text-center flex-1 hover:opacity-80 transition-opacity">
          <div className="text-xl font-light tracking-tight text-gray-900 dark:text-gray-300">{stats.newTags}</div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-500">New Tags</div>
        </Link>
      </div>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400 font-[family-name:var(--font-geist-mono)]">
        More features coming soon...
      </div>
    </div>
  );
}
