import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export function setupYjs(roomName) {
  // Create a shared Yjs document
  const ydoc = new Y.Doc();

  // Connect to Yjs websocket server (you can run your own or use the public demo)
  const provider = new WebsocketProvider("wss://demos.yjs.dev", roomName, ydoc);

  // Share a text type for editor content
  const yText = ydoc.getText("monaco");

  return { ydoc, provider, yText };
}
