interface SendMessageRequest {
  room: {
    id: number;
  };
  userId: string;
  contents: string;
}

interface ChatRoomResponse {
  id: number;
  name: string;
}

interface ChatMessageResponse {
  id: number;
  room?: ChatRoomResponse;
  userId: string;
  contents: string;
  createdDate: Date;
}
