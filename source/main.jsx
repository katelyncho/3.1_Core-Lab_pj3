import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import Draggable from "react-draggable";

window.addEventListener("load", () => {
  const root = createRoot(document.getElementById("root"));
  root.render(<App />);
});

function HealthBar({
  start = 0.2,
  accelStep = 0.8,
  accelInterval = 3000,
  tick = 40,
  onReady,
  onZero,
}) {
  const bar = React.useRef(null),
    pctRef = React.useRef(1),
    fired = React.useRef(false);
  React.useEffect(() => {
    if (!onReady) return;
    onReady((amt = 0) => {
      const v = Math.max(0, Math.min(1, pctRef.current + amt / 100));
      pctRef.current = v;
      if (bar.current) bar.current.style.transform = `scaleX(${v})`;
    });
  }, [onReady]);

  React.useEffect(() => {
    let raf,
      last = performance.now(),
      t0 = last,
      step = 0;
    let rate = (start * (1000 / tick)) / 100;
    const loop = (now) => {
      const health = (now - last) / 1000;
      const wantStep = Math.floor((now - t0) / accelInterval);
      while (step < wantStep) {
        rate *= 1 + accelStep;
        step++;
      }
      const prev = pctRef.current,
        next = Math.max(0, prev - rate * health);
      if (next !== prev) {
        pctRef.current = next;
        if (bar.current) bar.current.style.transform = `scaleX(${next})`;
        if (next === 0 && !fired.current && onZero) {
          fired.current = true;
          onZero();
        }
      }
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [start, accelStep, accelInterval, tick, onZero]);

  return (
    <div className="healthBar">
      <div
        ref={bar}
        className="healthFill"
        style={{
          transformOrigin: "left",
          transform: "scaleX(1)",
          willChange: "transform",
        }}
      />
    </div>
  );
}

function App() {
  const [score, setScore] = useState(0);
  const swapTimer = useRef(null);

  const r1 = useRef(null),
    r2 = useRef(null),
    r3 = useRef(null),
    r4 = useRef(null),
    r5 = useRef(null),
    r6 = useRef(null);
  const charRef = useRef(null);
  const healRef = useRef(null);

  // tracking items drag positions
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
  const waitUntil = useRef(0);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  //scoring system
  useEffect(() => {
    const el = document.getElementById("score");
    const id = setInterval(() => {
      setScore((s) => {
        const ns = s + 10;
        if (el) el.textContent = "Score: " + ns;
        localStorage.setItem("scoring", String(ns));
        return ns;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // item references array
  const refArr = [r1, r2, r3, r4, r5, r6];

  // heal amounts
  const healAmount = [10, 10, 10, 20, 20, 30];

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

    // change character animation
    {
      const s = refArr[i].current?.querySelector("img")?.src;
      if (s && charRef.current) {
        charRef.current.src =
          "img/" +
          s
            .split("/")
            .pop()
            .replace(/\.png$/i, ".gif");
        if (swapTimer.current) clearTimeout(swapTimer.current);
        swapTimer.current = setTimeout(() => {
          charRef.current.src = "img/character.gif";
          swapTimer.current = null;
        }, 3000);
      }
    }

    const nowMs = Date.now();

    // for energy drink
    if (i === 3) {
      if (nowMs < waitUntil.current) {
        if (healRef.current) healRef.current(-5);
      } else {
        if (healRef.current) healRef.current(healAmount[i] || 0);
      }

      const arr = usesRef.current[i];
      pruneWindow(arr, 30000);
      arr.push(nowMs);
      if (arr.length >= 2) {
        waitUntil.current = nowMs + 15000;
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
        <p id="life">LIFE</p>
        <HealthBar
          onReady={(fn) => (healRef.current = fn)}
          onZero={() => {
            localStorage.setItem("scoring", String(score));
            window.location.href = "./gameover.html";
          }}
        />

        <img
          id="characterImg"
          ref={charRef}
          src="img/character.gif"
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
