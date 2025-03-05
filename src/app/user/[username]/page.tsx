import { UserDetails } from './components/UserDetails';
import { Metadata } from 'next';
import { generateMetadata as baseMetadata } from '../../metadata';
import User from '@/models/User';

type UserRole = 'user' | 'premium' | 'moderator' | 'admin' | 'banned';

async function getUser(username: string) {
  try {
    // Versuche, den Benutzer aus der Datenbank zu laden
    // Hier sollte der tatsächliche Datenbankaufruf erfolgen
    // const user = await User.findOne({ username });
    
    // Für Entwicklungszwecke verwenden wir ein Mock-Objekt
    const mockUser = {
      username,
      bio: "", // Leere Bio als Default
      avatar: null, // Kein Avatar als Default
      joinDate: "2023-01-15",
      premium: false,
      role: 'user' as UserRole, 
      stats: {
        uploads: 42,
        comments: 156,
        favorites: 89
      }
    };
    
    // Spezielle Benutzer für Testzwecke
    // In der realen Implementierung sollte dies aus der Datenbank kommen
    const specialUsers: Record<string, UserRole> = {
      'ninja': 'admin',
      '123456': 'moderator',
      'premium1': 'premium',
      'banned1': 'banned'
    };
    
    if (specialUsers[username.toLowerCase()]) {
      mockUser.role = specialUsers[username.toLowerCase()];
      if (mockUser.role === 'premium' || mockUser.role === 'moderator' || mockUser.role === 'admin') {
        mockUser.premium = true;
      }
    }
    
    return mockUser;
  } catch (error) {
    console.error("Error fetching user:", error);
    // Fallback auf Basic-User wenn Fehler auftreten
    return {
      username,
      bio: "",
      avatar: null,
      joinDate: new Date().toISOString(),
      premium: false,
      role: 'user' as UserRole,
      stats: { uploads: 0, comments: 0, favorites: 0 }
    };
  }
}

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const user = await getUser(params.username);
  
  const formattedUsername = user.username.charAt(0).toUpperCase() + user.username.slice(1);
  
  // Definiere den Role-Text basierend auf der Rolle des Benutzers
  let roleText = '';
  
  switch (user.role) {
    case 'admin':
      roleText = 'Admin of f0ck.org';
      break;
    case 'moderator':
      roleText = 'Moderator of f0ck.org';
      break;
    case 'premium':
      roleText = 'Premium user of f0ck.org';
      break;
    case 'banned':
      roleText = 'Banned user of f0ck.org';
      break;
    default:
      roleText = 'User of f0ck.org';
  }
  
  // Format: "Username - Role of f0ck.org | f0ck.org"
  const title = `${formattedUsername} - ${roleText}`;
  
  // Verwende die Bio als Beschreibung, wenn vorhanden, sonst eine Standard-Beschreibung
  const description = user.bio 
    ? `${formattedUsername}'s profile: ${user.bio}` 
    : `Check out ${formattedUsername}'s profile on f0ck.org`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: user.avatar ? [user.avatar] : undefined,
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: user.avatar ? [user.avatar] : undefined,
    }
  };
}

export default async function UserPage({ params }: { params: { username: string } }) {
  return <UserDetails username={params.username} />;
}
