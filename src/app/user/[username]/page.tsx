import { Metadata } from 'next';
import { UserDetails } from './components/UserDetails';

async function getUser(username: string) {
  const mockUser = {
    username,
    bio: "", // Leere Bio als Default
    avatar: null, // Ändern zu null statt picsum
    joinDate: "2023-01-15",
    premium: true,
    stats: {
      uploads: 42,
      comments: 156,
      favorites: 89
    }
  };
  
  // Hier würde normalerweise der API-Call stehen
  // Bis dahin nutzen wir ein paar Test-Bios für verschiedene User
  if (username.toLowerCase() === 'user1') {
    mockUser.bio = "Ich poste hauptsächlich Katzenbilder 🐱";
  } else if (username.toLowerCase() === 'user2') {
    mockUser.bio = "Meme Lord 👑";
  }
  
  return mockUser;
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const user = await getUser(username);
  
  // Ersten Buchstaben groß schreiben
  const formattedUsername = user.username.charAt(0).toUpperCase() + user.username.slice(1);
  
  const userStats = `${user.stats.uploads} Uploads · ${user.stats.comments} Kommentare · ${user.stats.favorites} Favoriten`;
  const memberSince = `Mitglied seit ${new Date(user.joinDate).toLocaleDateString('de-DE', { 
    year: 'numeric',
    month: 'long'
  })}`;

  const titleSuffix = user.premium ? 'Premiumuser auf f0ck.org' : 'auf f0ck.org';
  
  return {
    title: `${formattedUsername} - ${titleSuffix}`,
    description: user.bio || `${formattedUsername}'s Profil auf f0ck.org - ${memberSince} - ${userStats}`,
    openGraph: {
      title: `${formattedUsername} - ${titleSuffix}`,
      description: user.bio 
        ? `${user.bio}\n\n${memberSince}\n${userStats}`
        : `${memberSince}\n${userStats}`,
      images: [
        {
          url: user.avatar || '/images/defaultavatar.png', // Korrigierter Pfad
          width: 400,
          height: 400,
          alt: `${user.username}'s Profilbild`,
        },
      ],
      type: 'profile',
      firstName: user.username, // Use firstName instead of nested profile object
    },
    twitter: {
      card: 'summary',
      title: `${formattedUsername} - ${titleSuffix}`,
      description: user.bio 
        ? `${user.bio} · ${memberSince}`
        : memberSince,
      images: [user.avatar || '/images/defaultavatar.png'], // Korrigierter Pfad
    },
    robots: {
      index: true,
      follow: true,
      nocache: true,
    }
  };
}

export default async function UserPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  return <UserDetails username={username} />;
}
