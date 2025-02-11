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
        <meta 
          name="description" 
          content={user.bio || `${formattedUsername}'s Profil auf f0ck.org - ${memberSince} - ${userStats}`}
        />
        <link rel="icon" href="/favicon.ico" />
        
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={`${formattedUsername} - ${titleSuffix}`} />
        <meta 
          property="og:description" 
          content={user.bio ? `${user.bio}\n\n${memberSince}\n${userStats}` : `${memberSince}\n${userStats}`}
        />
        <meta property="og:image" content={user.avatar || '/images/defaultavatar.png'} />
        <meta property="og:image:width" content="400" />
        <meta property="og:image:height" content="400" />
        <meta property="profile:username" content={user.username} />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${formattedUsername} - ${titleSuffix}`} />
        <meta 
          name="twitter:description" 
          content={user.bio ? `${user.bio} · ${memberSince}` : memberSince}
        />
        <meta name="twitter:image" content={user.avatar || '/images/defaultavatar.png'} />
        
        <meta name="robots" content="index,follow,nocache" />
      </Head>
      <UserDetails username={username} />
    </>
  );
}
