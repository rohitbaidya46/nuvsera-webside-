import { TokenAction } from "@/components/site/TokenAction";

export const metadata = { title: "Unsubscribe", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <section className="section">
      <div className="container-x max-w-xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-fg">Unsubscribe</h1>
        <p className="lead mt-4 mb-8">Newsletter from Nuvsera Technology.</p>
        <TokenAction endpoint="/api/newsletter/unsubscribe" token={token} label="Unsubscribe me" done="You have been unsubscribed. We are sorry to see you go." />
      </div>
    </section>
  );
}
