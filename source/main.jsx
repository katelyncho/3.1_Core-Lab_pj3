import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import Draggable from "react-draggable";

window.addEventListener("load", () => {
  const root = createRoot(document.getElementById("root"));
  root.render(<App />);
});

function HealthBar({
  start = 0.1,
  accelStep = 0.05,
  accelInterval = 15000,
  tick = 50,
  onReady,
  onZero,
}) {
  const [pct, setPct] = useState(100);
  const rateRef = useRef(start);
  const firedRef = useRef(false);

  useEffect(() => {
    if (onReady)
      onReady((amt) =>
        setPct((p) => Math.max(0, Math.min(100, p + (amt || 0))))
      );
  }, [onReady]);

  useEffect(() => {
    const speedTimer = setInterval(() => {
      rateRef.current += accelStep;
    }, accelInterval);

    const drainTimer = setInterval(() => {
      setPct((p) => {
        const next = Math.max(0, p - rateRef.current);
        if (next === 0 && p !== 0) {
          console.log("short circuit!");
          if (!firedRef.current && onZero) {
            firedRef.current = true;
            onZero();
          }
        }
        return next;
      });
    }, tick);

    return () => {
      clearInterval(speedTimer);
      clearInterval(drainTimer);
    };
  }, [accelStep, accelInterval, tick, onZero]);

  return (
    <div className="healthBar">
      <div className="healthFill" style={{ width: pct + "%" }} />
    </div>
  );
}

function App() {
  const r1 = useRef(null),
    r2 = useRef(null),
    r3 = useRef(null),
    r4 = useRef(null),
    r5 = useRef(null),
    r6 = useRef(null);
  const charRef = useRef(null);
  const healRef = useRef(null);

  const [pos, setPos] = useState([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]);

  // cooldowns
  const [coolUntil, setCoolUntil] = useState([0, 0, 0, 0, 0, 0]);
  const usesRef = useRef([[], [], [], [], [], []]);
  const energyPenaltyUntil = useRef(0);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const refArr = [r1, r2, r3, r4, r5, r6];

  // heal amounts
  const healAmount = [6, 8, 12, 10, 7, 9];

  // cooldown seconds
  const generalCd = [0, 30, 10, 0, 30, 30];

  const pruneWindow = (arr, ms) => {
    const cut = Date.now() - ms;
    while (arr.length && arr[0] < cut) arr.shift();
  };

  const within30sCount = (i) => {
    const a = usesRef.current[i];
    pruneWindow(a, 30000);
    return a.length;
  };

  const startCooldown = (i, secs) => {
    if (secs <= 0) return;
    setCoolUntil((c) => {
      const cc = c.slice();
      cc[i] = Date.now() + secs * 1000;
      return cc;
    });
  };

  const isCooling = (i) => now < coolUntil[i];

  const hitCharacter = (i) => {
    const a = refArr[i].current?.getBoundingClientRect();
    const b = charRef.current?.getBoundingClientRect();
    if (!a || !b) return false;
    return !(
      a.right < b.left ||
      a.left > b.right ||
      a.bottom < b.top ||
      a.top > b.bottom
    );
  };

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

    if (isCooling(i)) return;
    if (!hitCharacter(i)) return;

    const nowMs = Date.now();

    // for energy drink
    if (i === 3) {
      if (nowMs < energyPenaltyUntil.current) {
        if (healRef.current) healRef.current(-5);
      } else {
        if (healRef.current) healRef.current(healAmount[i] || 0);
      }

      const arr = usesRef.current[i];
      pruneWindow(arr, 30000);
      arr.push(nowMs);
      if (arr.length >= 2) {
        energyPenaltyUntil.current = nowMs + 15000;
      }
      return;
    }

    if (healRef.current) healRef.current(healAmount[i] || 0);

    {
      const arr = usesRef.current[i];
      pruneWindow(arr, 30000);
      arr.push(nowMs);
    }

    if (generalCd[i] > 0) {
      startCooldown(i, generalCd[i]);
    }

    // cat cooldown
    if (i === 0) {
      if (within30sCount(0) >= 3) {
        startCooldown(0, 15);
      }
    }
  };

  return (
    <div id="app">
      <div id="characterPlace">
        <p>LIFE</p>
        <HealthBar
          onReady={(fn) => (healRef.current = fn)}
          onZero={() => {
            window.location.href = "./gameover.html";
          }}
        />

        <img
          id="characterImg"
          ref={charRef}
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
          <div
            id="item1"
            ref={r1}
            style={{ filter: isCooling(0) ? "brightness(0.6)" : "" }}
          >
            <img src="img/cat.png" alt="cat" draggable="false" />
          </div>
        </Draggable>

        <Draggable
          nodeRef={r2}
          position={pos[1]}
          onDrag={onDrag(1)}
          onStop={onStop(1)}
        >
          <div
            id="item2"
            ref={r2}
            style={{ filter: isCooling(1) ? "brightness(0.6)" : "" }}
          >
            <img src="img/shower.png" alt="shower" draggable="false" />
          </div>
        </Draggable>

        <Draggable
          nodeRef={r3}
          position={pos[2]}
          onDrag={onDrag(2)}
          onStop={onStop(2)}
        >
          <div
            id="item3"
            ref={r3}
            style={{ filter: isCooling(2) ? "brightness(0.6)" : "" }}
          >
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
            <img
              src="img/energydrink.png"
              alt="energydrink"
              draggable="false"
            />
          </div>
        </Draggable>

        <Draggable
          nodeRef={r5}
          position={pos[4]}
          onDrag={onDrag(4)}
          onStop={onStop(4)}
        >
          <div
            id="item5"
            ref={r5}
            style={{ filter: isCooling(4) ? "brightness(0.6)" : "" }}
          >
            <img src="img/friends.png" alt="friends" draggable="false" />
          </div>
        </Draggable>

        <Draggable
          nodeRef={r6}
          position={pos[5]}
          onDrag={onDrag(5)}
          onStop={onStop(5)}
        >
          <div
            id="item6"
            ref={r6}
            style={{ filter: isCooling(5) ? "brightness(0.6)" : "" }}
          >
            <img src="img/sleep.png" alt="sleep" draggable="false" />
          </div>
        </Draggable>
      </div>
    </div>
  );
}
