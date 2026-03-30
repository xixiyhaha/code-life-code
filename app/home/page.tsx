import { HomeTemplate } from "@/components/home/HomeTemplate";

export const revalidate = 60;

export default function HomePage() {
  return <HomeTemplate showAdminControls={false} />;
}
