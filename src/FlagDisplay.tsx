import { useGame } from "./GameContext";
import { trackFontSize } from "./renderer";

interface FlagDisplayProps {}

export const FlagDisplay = () => {
  const { engineRef, score, trackSelect, rangeNum, incrementNum } = useGame();

  if (!engineRef.current) {
    return <div className="">... loading engine</div>;
  }

  console.log(engineRef.current.tracks);

  return (
    <div
      style={{
        padding: "0 1rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {engineRef.current.tracks.map((track) => (
        <div
          className=""
          style={{
            height: trackFontSize + "px",
            border: "1px solid red",
            display: "flex",
            flexDirection: "row",
            gap: "1rem",
            padding: "3.53px 6px",
          }}
        >
          {track.flags.map((flag) => (
            <span
              style={{
                fontSize: "1rem",
                // fontSize: trackFontSize - 1 + "px",
              }}
            >
              {flag}
            </span>
          ))}
          {track.flags.length == 0 && <span>/</span>}
        </div>
      ))}
    </div>
  );
};
