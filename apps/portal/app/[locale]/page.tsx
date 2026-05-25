import MarketingLayout from "./(marketing)/layout";
import MarketingHome from "./(marketing)/page";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RootPage({ params }: Props) {
  return (
    <MarketingLayout>
      <MarketingHome params={params} />
    </MarketingLayout>
  );
}
