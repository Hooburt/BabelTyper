import React, { FunctionComponent, useState, useEffect, useRef } from "react";
import { Engine } from "./engine";
import ReactDOM from "react-dom/client";
import TrackCanvas from "./track_canvas";
import ShopMenu from "./shop";
import './app.css';

const GlobalKeyListener = ({ onKey }: { onKey: (key: string) => void }) => {

    useEffect(() => {
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if(e.key === "Tab") {
                e.preventDefault();
                console.log("Tabby");
            }
            onKey(e.key);
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };

    }, [onKey]);

    return null;
};

const charGenerator = (modeFlags: string[]): string => {

    function isAlphaNumeric(str: string) {
        var code
        code = str.charCodeAt(0);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
        return false;
        }
        return true;
      };

    // Range 33 - 126
    const randomChar = Math.floor(Math.random() * 93 + 33);
    const charOut = String.fromCharCode(randomChar);
    if(modeFlags.includes("l") && isAlphaNumeric(charOut)) {
        return charOut.toLowerCase();
    }
    return charOut
}

interface StringGeneratorProps {
    length: number
}
 
interface StringGeneratorState {
    
}
 
const stringGenerator = ( {length}: StringGeneratorProps ) => {
    let outString = ""
    for (let i = 0; i<length; i++)
        outString += charGenerator([])
    return outString
}

type StringTrackProps = {
    lastKey: KeyEvent | null;
}
 
const StringTrack: React.FC<StringTrackProps> = ({ lastKey }) => {
    const currentStringRef = useRef(stringGenerator({length:100}));
    const flagHolderRef = useRef<string[]>([]);
    const trackRef = useRef<HTMLDivElement>(null);

    const [currentString, setCurrentString] = useState(() => stringGenerator({length: 100}))
    const [flagHolder, setFlagHolder] = useState<string[]>([]);
    
    const frontChar = currentStringRef.current[0];

    const popChar = () => {
        const nextString = currentStringRef.current.slice(1) + charGenerator(flagHolderRef.current);
        currentStringRef.current = nextString;

        if (trackRef.current) {
            trackRef.current.textContent = nextString;
        }
    };

    useEffect(() => {
        if (lastKey && lastKey.key === frontChar) {
            popChar();
        }
    }, [lastKey]);

    const doTick = (input: string[]) => {
        if(frontChar in input)
            popChar();
    }

    const setFlag = (flag: string) => {
        //setFlagHolder(prev => {
        //    const updated = [...prev, flag];
        //    console.log("Updated flagHolder: " + updated.toString());
        //    return updated;
        //});

        if(!flagHolderRef.current.includes(flag)) {
            flagHolderRef.current.push(flag);
            console.log("Updated flagHolder:", flagHolderRef.current.toString());
        }
    }

    return ( // stringtrack
    <div>
    <p ref={trackRef}>Track: {currentStringRef.current}</p>
    <button onClick={() =>
        setFlag("l")
    }>Lowercase</button>
    </div>
    );
}

type StringTrackHolderProps = {
    numOfTracks: number;
    lastKey: KeyEvent | null;
}

const StringTrackHolder: React.FC<StringTrackHolderProps> = ( {numOfTracks, lastKey}: StringTrackHolderProps ) => {
    const [trackCount, setTrackCount] = useState(numOfTracks);

    const tracks = Array.from({ length: trackCount }).map((_, i) => (
        <StringTrack key={i} lastKey={lastKey} />
    ));

    const addTrack = () => {
        setTrackCount(prev => prev + 1);
    }

    return (
        <div>
            {tracks}
            <button onClick={addTrack}>Add Track</button>
        </div>
    );
}

function getWindowDimensions() {
    const {innerWidth: width, innerHeight: height} = window
    return {
        width,
        height
    };
};

const TextArt = (label: string, text: string) => {
    return (
      <pre
        aria-label={label}
        className="text-art"
      >{text}</pre>
    );
};

let gameCanvasClasses = "game-canvas selected"
let shopClasses = "shop-div notselected"
let curTarget = 0;

export type KeyEvent = { key: string; target: number; time: number };
function App(): React.JSX.Element {
    const [lastKey, setLastKey] = useState<KeyEvent | null>(null);
    const inputBufferRef = useRef<KeyEvent[]>([]);
    const [score, setScore] = useState(0);
    const logo = "                                ___                           \r\n_-_ _,,         ,,          ,, -   ---___-                    \r\n   -/  )    _   ||          ||    (' ||                       \r\n  ~||_<    < \\, ||/|,  _-_  ||   ((  ||    '\\\\/\\\\ -_-_   _-_  \r\n   || \\\\   /-|| || || || \\\\ ||  ((   ||     || ;' || \\\\ || \\\\ \r\n   ,/--|| (( || || |' ||/   ||   (( //      ||/   || || ||/   \r\n  _--_-'   \\/\\\\ \\\\/   \\\\,/  \\\\     -____-   |/    ||-'  \\\\,/  \r\n (                                         (      |/          \r\n                                            -_-   '           "
    const {height, width} = getWindowDimensions();
    const [trackNum, setTrackNum] = useState(0);
    const [rangeNum, setRangeNum] = useState(0);
    const [incrementNum, setIncrementNum] = useState(1);



    const engineRef = useRef<Engine | null>(null);

    const handleKey = (key: KeyEvent) => {
        setLastKey(key);
        engineRef.current?.addInput(key);
    }

    useEffect(() => {
        if(!engineRef.current) {
            engineRef.current = new Engine(width, height, 1);
            engineRef.current.onScoreChange = (newScore) => {
                setScore(newScore);
            };
        }
    }, [width, height])

    useEffect(() => {
        if(engineRef.current) {
            engineRef.current.onTrackSelectChange = (newRow) => setTrackNum(newRow);
            engineRef.current.onRangeNumChange = (newRange) => setRangeNum(newRange);
            engineRef.current.onIncrementNumChange = (newIncr) => setIncrementNum(newIncr);
        }
    }, [trackNum, rangeNum])

    return (
    <div>
        <GlobalKeyListener onKey={(key) => {
            if(key === "Tab" && curTarget === 0) {
                curTarget = 1;
                gameCanvasClasses = "game-canvas notselected"
                shopClasses = "shop-div selected"
                console.log("Changing target to 1")
            }
            else if (key === "Tab" && curTarget === 1) {
                curTarget = 0;
                gameCanvasClasses = "game-canvas selected"
                shopClasses = "shop-div notselected"
                console.log("Changing target to 0")
            }
            const event: KeyEvent = {key, target: curTarget, time: Date.now()};
            handleKey(event)
        }}/>
        <div>{TextArt("Yep",logo)}</div>
        <div>
        <p>Key: {lastKey?.key}</p>
        <p>Score: {score}</p>
        </div>
        <div className="row">
        <TrackCanvas width={800} height={15} engineRef={engineRef} lastKey={lastKey} className={gameCanvasClasses}/>
        <ShopMenu className={shopClasses} trackSelectNum={trackNum} rangeNum={rangeNum} incrNum={incrementNum} engineRef={engineRef}/>
        </div>
    </div>
    );
}

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}