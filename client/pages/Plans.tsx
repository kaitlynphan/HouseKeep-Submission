export default function Plans() {
  return (
    <section className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight">Future Plans</h1>
      <p className="text-muted-foreground mt-2 max-w-prose">
        Coming soon! HouseKeep is always improving. Check back for future updates on long-term preparedness goals, sustainability improvements, and project timelines.
      </p>
      <div className="mt-6">
        <p className="text-muted-foreground mt-1 max-w-prose">
          Future features include:
        </p>
        <ul className="mt-4 space-y-2 text-muted-foreground">
          <li>• Automatic check-ins with emergency contacts</li>
          <li>• Carbon monoxide detection upkeep</li>
          <li>• Cord safety reminders</li>
        </ul>
      </div>
    </section>
  );
}
