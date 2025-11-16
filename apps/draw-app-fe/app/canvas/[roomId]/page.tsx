import { RoomCanvas } from "@/components/RoomCanvas";

// Force dynamic rendering - don't pre-generate this page at build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CanvasPage({ 
    params 
}: {
    params: Promise<{ roomId: string }>
}) {
    const { roomId } = await params;
    console.log(roomId);

    return <RoomCanvas roomId={roomId} />
}