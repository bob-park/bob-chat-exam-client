'use client';

import { useEffect, useState } from 'react';

import {
  Encodable,
  IdentitySerializer,
  JsonSerializer,
  RSocketClient,
} from 'rsocket-core';
import { Payload, ReactiveSocket } from 'rsocket-types';
import RSocketWebSocketClient from 'rsocket-websocket-client';

type ChatItem = {
  userId: string;
  contents: string;
};

export default function ChatClient() {
  const [message, setMessage] = useState<string>('');
  const [socket, setSocket] = useState<ReactiveSocket<ChatItem, Encodable>>();
  const [messages, setMessages] = useState<ChatItem[]>([]);

  useEffect(() => {
    connect();

    console.log('connect...');
  }, []);

  const messageReceiver = (payload: ChatItem) => {
    setMessages((prevMessages) => [...prevMessages, payload]);
  };
  const responder = {
    fireAndForget(payload: Payload<ChatItem, Encodable>) {
      payload.data && messageReceiver(payload.data);
    },
  };

  const send = () => {
    socket
      ?.requestResponse({
        data: {
          userId: 'Superpil',
          contents: message,
        },
        metadata: String.fromCharCode('chat'.length) + 'chat',
      })
      .subscribe({
        onComplete: (com) => {
          // console.log('com : ', com);
        },
        onError: (error) => {
          console.log(error);
        },
        onSubscribe: (subscription) => {
          // console.log('subscription', subscription);
        },
      });
  };

  const connect = () => {
    const client = new RSocketClient({
      serializers: {
        data: JsonSerializer,
        metadata: IdentitySerializer,
      },
      setup: {
        // ms btw sending keepalive to server
        keepAlive: 60000,
        // ms timeout if no keepalive response
        lifetime: 180000,
        // format of `data`
        dataMimeType: 'application/json',
        // format of `metadata`
        metadataMimeType: 'message/x.rsocket.routing.v0',
      },
      responder: responder,
      transport: new RSocketWebSocketClient({
        url: 'ws://localhost:8081/rs',
      }),
    });

    client.connect().subscribe({
      onComplete: (socket) => {
        setSocket(socket);
      },
      onError: (error) => {
        console.log(error);
      },
      onSubscribe: (cancel) => {
        console.log(cancel);
      },
    });
  };

  return (
    <div className="size-full">
      <h1>Chatting</h1>
      <input
        type="text"
        className="input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={send}>전송</button>
      <ul>
        {messages.map((item, index) => (
          <li key={index}>
            {item.userId} : {item.contents}
          </li>
        ))}
      </ul>
    </div>
  );
}
