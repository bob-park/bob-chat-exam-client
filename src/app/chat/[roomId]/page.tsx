import ChatClient from '@/app/chat/[roomId]/_component/ChatClient';

export default function ChatRoomPage({
  params,
  searchParams,
}: {
  params: { roomId: number };
  searchParams: { userId: string };
}) {
  const { roomId } = params;
  const { userId } = searchParams;

  return (
    <div className="size-full">
      <ChatClient roomId={roomId} userId={userId} />
    </div>
  );
}
