export const ComingSoon = ({ pageName }: { pageName: string }) => {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{pageName}</h1>
        <p>Weitere Features folgen...</p>
      </div>
    </main>
  );
};
