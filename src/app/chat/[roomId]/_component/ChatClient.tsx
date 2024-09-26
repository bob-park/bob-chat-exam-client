'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

import cx from 'classnames';
import {
  Encodable,
  IdentitySerializer,
  JsonSerializer,
  RSocketClient,
} from 'rsocket-core';
import { Payload, ReactiveSocket } from 'rsocket-types';
import RSocketWebSocketClient from 'rsocket-websocket-client';
import TimeAgo from 'timeago-react';
import * as timeago from 'timeago.js';
import ko from 'timeago.js/lib/lang/ko';

timeago.register('ko', ko);

function ChatMessage({
  message,
  isMe,
}: {
  message: ChatMessageResponse;
  isMe: boolean;
}) {
  return (
    <div className={cx('chat', `chat-${isMe ? 'end' : 'start'}`)}>
      <div className="chat-header">
        <div
          className={cx(
            'flex',
            'flex-row',
            'gap-5',
            isMe && 'flex-row-reverse',
          )}
        >
          <strong>{isMe ? '나' : message.userId}</strong>
        </div>
      </div>
      <div
        className={cx(
          'chat-bubble',
          isMe && 'chat-bubble-primary',
          'max-w-[80%]',
        )}
      >
        <article className="text-pretty">{message.contents}</article>
      </div>
      <div className="chat-footer opacity-50">
        <TimeAgo className="" datetime={message.createdDate} locale="ko" />
      </div>
    </div>
  );
}

export default function ChatClient({
  roomId,
  userId,
}: {
  roomId: number;
  userId: string;
}) {
  // ref
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // state
  const [inputMessage, setInputMessage] = useState<string>('');
  const [socket, setSocket] =
    useState<ReactiveSocket<SendMessageRequest, Encodable>>();
  const [chatMessages, setChatMessages] = useState<ChatMessageResponse[]>([]);

  useEffect(() => {
    connect();

    console.log('connect...');

    return () => {
      socket?.close();
    };
  }, []);

  useEffect(() => {
    chatMessagesRef.current?.scroll({
      behavior: 'smooth',
      top: chatMessagesRef.current.scrollHeight,
    });
  }, [chatMessages]);

  const messageReceiver = (payload: ChatMessageResponse) => {
    setChatMessages((prev) => [...prev, payload]);
  };
  const responder = {
    fireAndForget(payload: Payload<ChatMessageResponse, Encodable>) {
      payload.data && messageReceiver(payload.data);
    },
  };

  const send = (sendMessage: SendMessageRequest) => {
    socket
      ?.requestResponse({
        data: sendMessage,
        metadata: `${String.fromCharCode('chat.message'.length)}chat.message`,
      })
      .subscribe({
        onComplete: () => {},
        onError: (error) => {
          console.log(error);
        },
        onSubscribe: () => {},
      });
  };

  const connect = () => {
    const client = new RSocketClient({
      serializers: {
        data: JsonSerializer,
        metadata: IdentitySerializer,
      },
      setup: {
        payload: {
          data: {
            id: roomId,
          },
          metadata: `${String.fromCharCode('connect'.length)}connect`,
        },
        keepAlive: 60000,
        lifetime: 180000,
        dataMimeType: 'application/json',
        metadataMimeType: 'message/x.rsocket.routing.v0',
      },
      responder,
      transport: new RSocketWebSocketClient({
        url: 'ws://localhost:8081/rs',
      }),
    });

    client.connect().subscribe({
      onComplete: (comSocket) => {
        setSocket(comSocket);
      },
      onError: (error) => {
        console.log(error);
      },
      onSubscribe: (cancel) => {
        console.log(cancel);
      },
    });
  };

  // handle
  const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    send({
      room: {
        id: roomId,
      },
      userId,
      contents: inputMessage,
    });

    setInputMessage('');
  };

  return (
    <div className="size-full p-10">
      <div className="flex flex-col gap-5">
        {/* chats */}
        <div
          className="h-[500px] overflow-auto"
          ref={chatMessagesRef}
          id="chatMessagesBox"
        >
          {chatMessages.map((chatMessage) => (
            <ChatMessage
              key={`chat-message-${chatMessage.id}`}
              message={chatMessage}
              isMe={chatMessage.userId === userId}
            />
          ))}
        </div>

        {/* input */}
        <div className="">
          <form className="flex flex-row gap-1" onSubmit={handleSendMessage}>
            <input
              className="input input-bordered flex-1"
              name="chat-input"
              placeholder="message"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button className="btn btn-primary flex-none" type="submit">
              전송
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
