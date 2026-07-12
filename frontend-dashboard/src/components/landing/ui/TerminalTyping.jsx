import React, { useState, useEffect, useRef } from "react";

const SEQUENCE = [
  { text: "npm login", bright: true },
  { text: " --registry=https://npm.pkg.github.com", bright: false },
  { text: "\n", bright: false },
  { text: "--scope=@phanatic", bright: false },
  { text: "  Successfully logged-in.", bright: false },
  { text: "\n\n", bright: false },
  { text: "npm publish", bright: true },
  { text: "\n", bright: false },
  { text: "Package published.", bright: false },
];

const CHAR_DELAY = 45;      // ms per character
const LINE_PAUSE = 350;     // pause after each segment
const END_PAUSE = 2800;     // pause before restarting loop
const CURSOR_BLINK = 530;   // ms cursor blink rate

export default function TerminalTyping() {
  const [displayed, setDisplayed] = useState([]); 
  // displayed = array of { text, bright } segments already typed
  const [currentSeg, setCurrentSeg] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [pausing, setPausing] = useState(false);
  const timeoutRef = useRef(null);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, CURSOR_BLINK);
    return () => clearInterval(interval);
  }, []);

  // Typing logic
  useEffect(() => {
    if (pausing) return;

    const seg = SEQUENCE[currentSeg];
    if (!seg) {
      // All segments done — pause then restart
      timeoutRef.current = setTimeout(() => {
        setDisplayed([]);
        setCurrentSeg(0);
        setCurrentChar(0);
        setPausing(false);
      }, END_PAUSE);
      return;
    }

    if (currentChar < seg.text.length) {
      // Type next character
      timeoutRef.current = setTimeout(() => {
        setCurrentChar((c) => c + 1);
      }, seg.text[currentChar] === "\n" ? LINE_PAUSE : CHAR_DELAY);
    } else {
      // Segment done — commit and move to next
      setPausing(true);
      timeoutRef.current = setTimeout(() => {
        setDisplayed((prev) => [...prev, { text: seg.text, bright: seg.bright }]);
        setCurrentSeg((s) => s + 1);
        setCurrentChar(0);
        setPausing(false);
      }, LINE_PAUSE);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [currentSeg, currentChar, pausing]);

  // Build display: committed segments + currently-typing segment partial
  const activeSeg = SEQUENCE[currentSeg];
  const activeText = activeSeg ? activeSeg.text.slice(0, currentChar) : "";
  const activeBright = activeSeg ? activeSeg.bright : false;

  const renderText = (text, bright, key) => {
    if (text === "\n" || text === "\n\n") {
      return text.split("").map((_, i) => <br key={`${key}-br-${i}`} />);
    }
    return (
      <span
        key={key}
        className={bright ? "text-gray-200" : "text-gray-500"}
      >
        {text}
      </span>
    );
  };

  return (
    <div className="font-mono text-sm leading-relaxed">
      {displayed.map((seg, i) => renderText(seg.text, seg.bright, `d-${i}`))}
      {activeText && renderText(activeText, activeBright, "active")}
      {/* Blinking cursor */}
      <span
        className="inline-block w-[2px] h-[14px] bg-blue-400 align-middle ml-[1px] translate-y-[-1px]"
        style={{ opacity: cursorVisible ? 1 : 0, transition: "opacity 0.1s" }}
      />
    </div>
  );
}
