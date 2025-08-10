import React, { useRef, useEffect } from "react";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { useSyncDemo } from "@tldraw/sync";
export default function Whiteboard() {
  const store = useSyncDemo({ roomId: "Arjun's-Room" }); // change roomId later

  return (
    <div
      style={{
        position: "fixed",
        inset: 150,
        height: "50vh",
        width: "30vw",
        // border: "2px solid black",
        // borderRadius: "20px",
      }}
    >
      <Tldraw
        options={{ maxPages: 1 }}
        onMount={(editor) => {
          console.log(editor);
        }}
        store={store}
      />
    </div>
  );
}
