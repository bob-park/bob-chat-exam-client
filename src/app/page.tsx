'use client';

import { FormEvent, useState } from 'react';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  // state
  const [roomId, setRoomId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  // handle
  const handleEnter = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    router.push(`/chat/${roomId}?userId=${userId}`);
  };

  return (
    <div className="h-screen w-full p-10">
      <form
        className="flex size-full flex-row items-center justify-center gap-5 p-10"
        onSubmit={handleEnter}
      >
        <input
          className="input input-bordered flex-1"
          placeholder="chat room id"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <input
          className="input input-bordered w-[150px] flex-none"
          placeholder="user ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button type="submit" className="btn flex-none">
          Enter
        </button>
      </form>
    </div>
  );
}
