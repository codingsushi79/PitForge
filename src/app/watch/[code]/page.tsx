import WatchTelemetry from "@/components/watch-telemetry";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <WatchTelemetry shareCode={code.toUpperCase()} />;
}
