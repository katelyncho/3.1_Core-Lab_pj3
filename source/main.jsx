import { useState } from "react";
import { createRoot } from "react-dom/client";

window.addEventListener("load", () => {
  const root = createRoot(document.getElementById("root"));
  root.render(<App />);
});

function App() {
  const items = [
    "cat.png",
    "energydrink.png",
    "food.png",
    "friends.png",
    "sleep.png",
    "shower.png",
  ];

  return (
    <div id="app">
      <div id="characterPlace">
        <img
          id="characterImg"
          src="img/character.png"
          alt="character"
          draggable="false"
        />
      </div>

      <div id="gridContainer">
        <img id="item1" src="img/cat.png" alt="cat" draggable="false" />
        <img
          id="item2"
          src="img/energydrink.png"
          alt="energydrink"
          draggable="false"
        />
        <img id="item3" src="img/food.png" alt="food" draggable="false" />
        <img id="item4" src="img/friends.png" alt="friends" draggable="false" />
        <img id="item5" src="img/sleep.png" alt="sleep" draggable="false" />
        <img id="item6" src="img/shower.png" alt="shower" draggable="false" />
      </div>
    </div>
  );
}
