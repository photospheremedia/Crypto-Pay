import MarketingLayout from "./(marketing)/layout";
import MarketingHome from "./(marketing)/page";

export default function RootPage() {
  return (
    <MarketingLayout>
      <MarketingHome />
    </MarketingLayout>
  );
}
