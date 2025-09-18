import { useGame } from "./GameContext";
import { trackFontSize } from "./renderer";

interface FlagDisplayProps {}

export const FlagDisplay = () => {
  const { engineRef, score, trackSelect, rangeNum, incrementNum } = useGame();

  if (!engineRef.current) {
    return <div className="">... loading engine</div>;
  }

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
          key={"" + track.x + track.y}
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
              key={flag}
              style={{
                color: "white",
                fontSize: "1rem",
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
