import { HomeTemplate } from "@/components/home/HomeTemplate";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return <HomeTemplate showAdminControls={false} />;
}
