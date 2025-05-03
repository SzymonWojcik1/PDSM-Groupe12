'use client';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Bienvenue sur votre tableau de bord</h1>
      <p className="text-gray-700">
        Sélectionnez une section dans le menu de gauche pour commencer.
      </p>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <Card title="Bénéficiaires" href="/beneficiaires" description="Gérer les bénéficiaires enregistrés dans le système." />
        <Card title="Activités" href="/activites" description="Consulter ou créer de nouvelles activités." />
        <Card title="Projets" href="/projets" description="Accéder à la liste des projets et leurs détails." />
        <Card title="Partenaires" href="/partenaires" description="Visualiser les partenaires associés aux projets." />
        <Card title="Cadre logique" href="/cadre-logique" description="Voir les cadres logiques." />
      </section>
    </div>
  );
}

function Card({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
    >
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      <p className="text-gray-600 text-sm">{description}</p>
    </a>
  );
}
