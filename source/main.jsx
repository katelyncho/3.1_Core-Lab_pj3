import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import Draggable from "react-draggable";

window.addEventListener("load", () => {
  const root = createRoot(document.getElementById("root"));
  root.render(<App />);
});

function HealthBar() {
  const [pct, setPct] = useState(100);

  useEffect(() => {
    const id = setInterval(() => {
      setPct((p) => {
        const next = Math.max(0, p - 0.2);
        if (next === 0 && p !== 0) console.log("short circuit!");
        return next;
      });
    }, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="healthBar">
      <div className="healthFill" style={{ width: pct + "%" }} />
    </div>
  );
}

function App() {
  const r1 = useRef(null);
  const r2 = useRef(null);
  const r3 = useRef(null);
  const r4 = useRef(null);
  const r5 = useRef(null);
  const r6 = useRef(null);

  const [pos, setPos] = useState([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]);

  const onDrag = (i) => (_e, data) => {
    setPos((p) => {
      const cp = p.slice();
      cp[i] = { x: data.x, y: data.y };
      return cp;
    });
  };

  const onStop = (i) => () => {
    setPos((p) => {
      const cp = p.slice();
      cp[i] = { x: 0, y: 0 };
      return cp;
    });
  };

  return (
    <div id="app">
      <div id="characterPlace">
        <p>LIFE</p>
        <HealthBar />
        <img
          id="characterImg"
          src="img/character.png"
          alt="character"
          draggable="false"
        />
      </div>

      <div id="gridContainer">
        <Draggable
          nodeRef={r1}
          position={pos[0]}
          onDrag={onDrag(0)}
          onStop={onStop(0)}
        >
          <div id="item1" ref={r1}>
            <img src="img/cat.png" alt="cat" draggable="false" />
          </div>
        </Draggable>

        <Draggable
          nodeRef={r2}
          position={pos[1]}
          onDrag={onDrag(1)}
          onStop={onStop(1)}
        >
          <div id="item2" ref={r2}>
            <img
              src="img/energydrink.png"
              alt="energydrink"
              draggable="false"
            />
          </div>
        </Draggable>

        <Draggable
          nodeRef={r3}
          position={pos[2]}
          onDrag={onDrag(2)}
          onStop={onStop(2)}
        >
          <div id="item3" ref={r3}>
            <img src="img/food.png" alt="food" draggable="false" />
          </div>
        </Draggable>

        <Draggable
          nodeRef={r4}
          position={pos[3]}
          onDrag={onDrag(3)}
          onStop={onStop(3)}
        >
          <div id="item4" ref={r4}>
            <img src="img/friends.png" alt="friends" draggable="false" />
          </div>
        </Draggable>

        <Draggable
          nodeRef={r5}
          position={pos[4]}
          onDrag={onDrag(4)}
          onStop={onStop(4)}
        >
          <div id="item5" ref={r5}>
            <img src="img/sleep.png" alt="sleep" draggable="false" />
          </div>
        </Draggable>

        <Draggable
          nodeRef={r6}
          position={pos[5]}
          onDrag={onDrag(5)}
          onStop={onStop(5)}
        >
          <div id="item6" ref={r6}>
            <img src="img/shower.png" alt="shower" draggable="false" />
          </div>
        </Draggable>
      </div>
    </div>
  );
}
