import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import Draggable from "react-draggable";

function eventLogger(e, data) {
  console.log("Event:", e.type, "Data:", data);
}

function App() {
  const nodeRef = useRef(null);

  return (
    <div id="app">
      <Draggable
        nodeRef={nodeRef}
        axis="x"
        handle=".handle"
        defaultPosition={{ x: 0, y: 0 }}
        position={null}
        grid={[25, 25]}
        scale={1}
        onStart={eventLogger}
        onDrag={eventLogger}
        onStop={eventLogger}
      >
        <div ref={nodeRef}>
          <div className="handle">Drag from here</div>
          <div>This readme is really dragging on...</div>
        </div>
      </Draggable>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);

// zz

// window.addEventListener("load", () => {
//   const root = createRoot(document.getElementById("root"));
//   root.render(<App />);
// });

// function HealthBar() {
//   const [pct, setPct] = useState(100);

//   useEffect(() => {
//     const id = setInterval(() => {
//       setPct((p) => {
//         const next = Math.max(0, p - 0.2);
//         if (next === 0 && p !== 0) {
//           console.log("short circuit!");
//         }
//         return next;
//       });
//     }, 50);
//     return () => clearInterval(id);
//   }, []);

//   return (
//     <div className="healthBox">
//       <div className="healthFill" style={{ width: pct + "%" }} />
//     </div>
//   );
// }

// function App() {
//   const items = [
//     "cat.png",
//     "energydrink.png",
//     "food.png",
//     "friends.png",
//     "sleep.png",
//     "shower.png",
//   ];

//   return (
//     <div id="app">
//       <div id="characterPlace">
//         <p>LIFE</p>
//         <HealthBar />
//         <img
//           id="characterImg"
//           src="img/character.png"
//           alt="character"
//           draggable="false"
//         />
//       </div>

//       <div id="gridContainer">
//         <img id="item1" src="img/cat.png" alt="cat" draggable="false" />
//         <img
//           id="item2"
//           src="img/energydrink.png"
//           alt="energydrink"
//           draggable="false"
//         />
//         <img id="item3" src="img/food.png" alt="food" draggable="false" />
//         <img id="item4" src="img/friends.png" alt="friends" draggable="false" />
//         <img id="item5" src="img/sleep.png" alt="sleep" draggable="false" />
//         <img id="item6" src="img/shower.png" alt="shower" draggable="false" />
//       </div>
//     </div>
//   );
// }
