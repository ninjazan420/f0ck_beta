import Head from 'next/head';
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

export default async function UserPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await getUser(username);

  const formattedUsername = user.username.charAt(0).toUpperCase() + user.username.slice(1);
  const userStats = `${user.stats.uploads} Uploads · ${user.stats.comments} Kommentare · ${user.stats.favorites} Favoriten`;
  const memberSince = `Mitglied seit ${new Date(user.joinDate).toLocaleDateString('de-DE', { 
    year: 'numeric',
    month: 'long'
  })}`;
  const titleSuffix = user.premium ? 'Premiumuser auf f0ck.org' : 'auf f0ck.org';

  return (
    <>
      <Head>
        <title>{`${formattedUsername} - ${titleSuffix}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <UserDetails username={username} />
    </>
  );
}
