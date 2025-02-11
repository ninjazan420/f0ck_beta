// ...existing code...

// Ersetze die User-Rolle-Logik mit dieser korrekten Prüfung
const getUserRole = (userId: string) => {
  if (userId === '123456') return 'admin';
  // Weitere Admin-IDs hier prüfen, falls nötig
  return user.role || 'member';
};

// Im JSX, ersetze den Avatar-Container
<div className={`relative ${
  user.premium ? 'before:absolute before:inset-0 before:rounded-full before:p-[2px] before:bg-gradient-to-r before:from-purple-400 before:to-pink-600' : ''
}`}>
  <div className={`relative ${user.premium ? 'p-[2px]' : ''}`}>
    <Image
      src={user.avatar || '/default-avatar.png'}
      alt={`${user.nickname}'s avatar`}
      width={128}
      height={128}
      className="rounded-full"
    />
  </div>
</div>

// Ersetze den Role-Badge
<span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
  getUserRole(user.id) === 'admin' ? 'bg-red-500/40 text-white border border-red-500/50' :
  getUserRole(user.id) === 'moderator' ? 'bg-blue-500/40 text-white border border-blue-500/50' :
  user.premium ? 'bg-purple-500/40 text-white border border-purple-500/50' :
  'bg-gray-500/40 text-white border border-gray-500/50'
}`}>
  {getUserRole(user.id) === 'admin' ? 'ADMIN' :
   getUserRole(user.id) === 'moderator' ? 'MOD' :
   user.premium ? 'PREMIUM' : 'MEMBER'}
</span>

// ...existing code...
