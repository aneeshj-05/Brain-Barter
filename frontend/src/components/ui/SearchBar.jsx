import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, CircleDot } from "lucide-react";

const SUGGESTIONS = [
  "React",
  "Vue",
  "Angular",
  "Next.js",
  "Svelte",
  "TailwindCSS",
  "TypeScript",
  "JavaScript",
  "Node.js",
];

const GooeyFilter = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
    <defs>
      <filter id="gooey-effect">
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" result="goo" />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
);

const SearchBar = ({ placeholder = "Search...", onSearch, value, onChange }) => {
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(value || "");
  const [isAnimating, setIsAnimating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isClicked, setIsClicked] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [animationFrame, setAnimationFrame] = useState(0);

  // Sync with external value prop
  useEffect(() => {
    if (value !== undefined && value !== localSearchQuery) {
      setLocalSearchQuery(value);
    }
  }, [value]);

  const isUnsupportedBrowser = useMemo(() => {
    if (typeof window === "undefined") return false;
    const ua = navigator.userAgent.toLowerCase();
    const isSafari = ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium");
    const isChromeOniOS = ua.includes("crios");
    return isSafari || isChromeOniOS;
  }, []);

  const handleSearch = (e) => {
    const newValue = e.target.value;
    setLocalSearchQuery(newValue);
    
    // Call external onChange if provided
    if (onChange) {
      onChange(e);
    }

    if (newValue.trim()) {
      const filtered = SUGGESTIONS.filter((item) => item.toLowerCase().includes(newValue.toLowerCase()));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && localSearchQuery.trim()) {
      onSearch(localSearchQuery);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  const handleMouseMove = (e) => {
    if (isFocused) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 800);
  };

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame((prev) => prev + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const particles = Array.from({ length: isFocused ? 18 : 0 }, (_, i) => {
    const time = (animationFrame + i * 10) / 30;
    const x = (Math.sin(time * 0.5 + i) * 20);
    const y = (Math.cos(time * 0.3 + i) * 20);
    const scale = 0.4 + Math.sin(time + i) * 0.4;
    const opacity = 0.4 + Math.sin(time * 0.8 + i) * 0.4;
    
    return (
      <div
        key={i}
        className="absolute w-3 h-3 rounded-full pointer-events-none"
        style={{
          left: `${10 + (i * 5) % 80}%`,
          top: `${20 + (i * 7) % 60}%`,
          filter: "blur(2px)",
          background: "linear-gradient(135deg, #8B7355 0%, #6B5D4F 100%)",
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
          opacity: opacity,
          transition: "transform 0.1s linear, opacity 0.1s linear",
        }}
      />
    );
  });

  const clickParticles = isClicked
    ? Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        const distance = 60 + Math.random() * 40;
        const x = mousePosition.x + Math.cos(angle) * distance;
        const y = mousePosition.y + Math.sin(angle) * distance;
        
        return (
          <div
            key={`click-${i}`}
            className="absolute w-3 h-3 rounded-full pointer-events-none"
            style={{
              left: mousePosition.x,
              top: mousePosition.y,
              background: `rgba(${Math.floor(139 + Math.random() * 50)}, ${Math.floor(93 + Math.random() * 50)}, ${Math.floor(79 + Math.random() * 30)}, 0.8)`,
              boxShadow: "0 0 8px rgba(139, 115, 85, 0.8)",
              transform: `translate(${x - mousePosition.x}px, ${y - mousePosition.y}px) scale(${0.2 + Math.random() * 0.6})`,
              opacity: 0,
              transition: `all ${0.5 + Math.random() * 0.3}s ease-out`,
            }}
          />
        );
      })
    : null;

  const formWidth = isFocused ? "100%" : "100%";
  const formScale = isFocused ? 1.02 : 1;

  return (
    <div className="relative w-full">
      <GooeyFilter />
      <div
        onSubmit={handleSubmit}
        className="relative flex items-center justify-center mx-auto"
        style={{
          width: formWidth,
          transform: `scale(${formScale})`,
          transition: "width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onMouseMove={handleMouseMove}
      >
        <div
          className={`flex items-center w-full rounded-full border relative overflow-hidden backdrop-blur-md ${
            isFocused ? "border-transparent shadow-xl" : "border-gray-300 bg-white/50"
          }`}
          style={{
            boxShadow: isClicked
              ? "0 0 40px rgba(139, 115, 85, 0.5), 0 0 15px rgba(107, 93, 79, 0.7) inset"
              : isFocused
              ? "0 15px 35px rgba(0, 0, 0, 0.15)"
              : "0 0 0 rgba(0, 0, 0, 0)",
            transition: "box-shadow 0.3s ease, border 0.3s ease",
          }}
          onClick={handleClick}
        >
          {isFocused && (
            <div
              className="absolute inset-0 -z-10"
              style={{
                opacity: 0.12,
                background: "linear-gradient(90deg, #8B7355 0%, #6B5D4F 100%)",
              }}
            />
          )}

          <div
            className="absolute inset-0 overflow-hidden rounded-full -z-5"
            style={{ filter: isUnsupportedBrowser ? "none" : "url(#gooey-effect)" }}
          >
            {particles}
          </div>

          {isClicked && (
            <>
              <div
                className="absolute inset-0 -z-5 rounded-full bg-amber-600/10 pointer-events-none"
                style={{
                  transform: "scale(2)",
                  opacity: 0,
                  transition: "all 0.8s ease-out",
                }}
              />
              <div
                className="absolute inset-0 -z-5 rounded-full bg-white pointer-events-none"
                style={{
                  opacity: 0,
                  transition: "opacity 0.3s ease-out",
                }}
              />
            </>
          )}

          {clickParticles}

          <div className="pl-4 py-3">
            <Search
              size={20}
              strokeWidth={isFocused ? 2.5 : 2}
              className={`transition-all duration-300 ${
                isAnimating ? "text-amber-700" : isFocused ? "text-amber-800" : "text-gray-500"
              }`}
              style={{
                transform: isAnimating ? "rotate(15deg) scale(1.3)" : "rotate(0deg) scale(1)",
                transition: "all 0.6s ease-in-out",
              }}
            />
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={localSearchQuery}
            onChange={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className={`w-full py-3 bg-transparent outline-none placeholder:text-gray-400 font-medium text-base relative z-10 ${
              isFocused ? "text-gray-800 tracking-wide" : "text-gray-600"
            }`}
          />

          {localSearchQuery && (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 mr-2 text-sm font-medium rounded-full text-white backdrop-blur-sm transition-all shadow-lg hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #8B7355 0%, #6B5D4F 100%)",
                opacity: localSearchQuery ? 1 : 0,
                transform: `scale(${localSearchQuery ? 1 : 0.8})`,
                transition: "all 0.3s ease",
              }}
            >
              Search
            </button>
          )}

          {isFocused && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                opacity: 0.1,
                background: "radial-gradient(circle at 50% 0%, rgba(139, 115, 85, 0.3) 0%, transparent 70%)",
              }}
            />
          )}
        </div>
      </div>

      {isFocused && suggestions.length > 0 && (
        <div
          className="absolute z-10 w-full mt-2 overflow-hidden bg-white/90 backdrop-blur-md rounded-lg shadow-xl border border-gray-100"
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            filter: isUnsupportedBrowser ? "none" : "drop-shadow(0 15px 15px rgba(0,0,0,0.1))",
            opacity: 1,
            transition: "opacity 0.2s ease",
          }}
        >
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                onClick={() => {
                  setLocalSearchQuery(suggestion);
                  if (onChange) {
                    // Create synthetic event
                    onChange({ target: { value: suggestion } });
                  }
                  if (onSearch) onSearch(suggestion);
                  setIsFocused(false);
                }}
                className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-md hover:bg-amber-50 group"
                style={{
                  opacity: 1,
                  transform: "translateY(0)",
                  transition: `all 0.2s ease ${index * 0.05}s`,
                }}
              >
                <CircleDot size={16} className="text-amber-600 group-hover:text-amber-800" />
                <span className="text-gray-700 group-hover:text-amber-900">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;