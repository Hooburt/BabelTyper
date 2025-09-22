import { KeyEvent } from "./app";

interface StringGeneratorProps {
  length: number;
}

const flagLookup = (flag: string) => {
    if(flag === 'l') return 0;
    if(flag === 'n') return 1;
    if(flag === 's') return 2;
    return -1;
}

const stringGenerator = ({ length }: StringGeneratorProps, flags:string[]=[]) => {
  let outString = "";
  for (let i = 0; i < length; i++) outString += charGenerator(flags);
  return outString;
};

const charGenerator = (modeFlags: string[]): string => {
  function isAlphaNumeric(str: string) {
    var code;
    code = str.charCodeAt(0);
    if (
      !(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)
    ) {
      // lower alpha (a-z)
      return false;
    }
    return true;
  }
  // Range 33 - 126
  let selectedChar = 0;
  if(modeFlags[flagLookup("s")] != null && modeFlags[flagLookup("n")] != null) {
    const snCandidateOne = Math.floor(Math.random() * 25 + 65) // Candidates [A-Z]
    const snCandidateTwo = Math.floor(Math.random() * 25 + 97) // Candidates [a-z]
    Math.floor(Math.random() * 2) === 0 ? selectedChar = snCandidateOne : selectedChar = snCandidateTwo;
  }
  else if(modeFlags[flagLookup("n")] != null) {
    const nCandidateOne = Math.floor(Math.random() * 69 + 58); // Candidates [:-~]
    const nCandidateTwo = Math.floor(Math.random() * 15 + 33); // Candidates [!-/]
    Math.floor(Math.random() * 2) === 0 ? selectedChar = nCandidateOne : selectedChar = nCandidateTwo;
  }
  else {
    selectedChar = Math.floor(Math.random() * 93 + 33); // Candidates [!-~]
  }


  const charOut = String.fromCharCode(selectedChar);
  if (modeFlags.includes("l") && isAlphaNumeric(charOut)) {
    return charOut.toLowerCase();
  }
  return charOut;
};

class Track {
  text: string;
  flags: string[];
  x: number;
  y: number;
  dirty: boolean;

  constructor(text: string, x: number, y: number, flags: string[] = []) {
    this.flags = flags;
    this.text = text;
    this.x = x;
    this.y = y;
    this.dirty = true;
  }

  addFlag(flag: string) {
    const lookUp = flagLookup(flag);
    if(lookUp === -1) return false;
    if (this.flags[lookUp] === flag) return false;
    this.flags[lookUp] = flag;
    this.dirty = true;
    return true; // TODO: penis
  }
}

export type Upgrade = {
  id: number;
  hotkey: string;
  baseCost: number;
  costMult: number;
  owned: number;
  description: string;
  buyUpgrade: (
    increment: number,
    trackNum: number,
    followingCount: number
  ) => void;
  costCalculation: (incr: number) => number;
};

export class Engine {
  tracks: Track[] = [];
  width: number;
  height: number;
  trackNum: number = 1;
  inputBuffer: KeyEvent[] = [];
  score: number = 1000;
  onScoreChange?: (score: number) => void;
  dirty: boolean = true;
  focused: number = 0;
  trackSelect: number = 0;
  onTrackSelectChange?: (row: number) => void;
  rangeNum: number = 0;
  onRangeNumChange?: (range: number) => void;
  incrementNum: number = 1;
  onIncrementNumChange?: (inc: number) => void;

  onUpgradeChange?: (upgrades: Upgrade[]) => void;

  upgradeList: Upgrade[] = [
    {
      id: 0,
      hotkey: "A",
      baseCost: 10,
      costMult: 1.8,
      owned: 0,
      description: "[A]dd a track",
      buyUpgrade: (num) => this.addTrack(num),
      costCalculation: function (incr) {
        if (this.owned === 0 || this.owned == 1) return this.baseCost;
        return Math.round(
          this.baseCost + this.owned * this.baseCost * this.costMult * incr
        );
      },
    },
    {
      id: 1,
      hotkey: "l",
      baseCost: 10,
      costMult: 1.8,
      owned: 0,
      description: "to [l]ower case",
      buyUpgrade: (increment, trackFrom, following) => {
        this.tracks
          .filter((_, index) => index >= trackFrom && index <= trackFrom + following)
          .forEach((track) => {
            if (track.addFlag("l")) {
                track.text = stringGenerator({length: 240}, track.flags);
            }
        })
      },
      costCalculation: function (incr) {
        if (this.owned === 0 || this.owned == 1) return this.baseCost;
        return Math.round(
          this.baseCost + this.owned * this.baseCost * this.costMult * incr
        );
      },
    },
    {
      id: 2,
      hotkey: "n",
      baseCost: 10,
      costMult: 1.8,
      owned: 0,
      description: "remove [n]numbers",
      buyUpgrade: (increment, trackFrom, following) => {
        this.tracks
          .filter((_, index) => index >= trackFrom && index <= trackFrom + following)
          .forEach((track) => {
            if (track.addFlag("n")) {
                track.text = stringGenerator({length: 240}, track.flags);
                }
            })
      },
      costCalculation: function (incr) {
        if (this.owned === 0 || this.owned == 1) return this.baseCost;
        return Math.round(
          this.baseCost + this.owned * this.baseCost * this.costMult * incr
        );
      },
    },
    {
        id: 3,
        hotkey: "s",
        baseCost: 10,
        costMult: 1.8,
        owned: 0,
        description: "remove [s]ymbols non-alphanumeric",
        buyUpgrade: (increment, trackFrom, following) => {
          this.tracks
            .filter((_, index) => index >= trackFrom && index <= trackFrom + following)
            .forEach((track) => {
                if(track.addFlag("s")) {
                    track.text = stringGenerator({length: 240}, track.flags);
                }
        })
        },
        costCalculation: function (incr) {
          if (this.owned === 0 || this.owned == 1) return this.baseCost;
          return Math.round(
            this.baseCost + this.owned * this.baseCost * this.costMult * incr
          );
        },
      },
  ];

  setTrackSelect(newRow: number) {
    this.trackSelect = newRow;
    this.onTrackSelectChange?.(newRow);
  }

  setRangeNum(newRange: number) {
    this.rangeNum = newRange;
    this.onRangeNumChange?.(newRange);
  }

  setIncrement(newInc: number) {
    this.incrementNum = newInc;
    this.onIncrementNumChange?.(newInc);
  }

  getUpgradeList() {
    return this.upgradeList;
  }

  dirtyTo(num: number) {
    for(let i=0;i<num;i++) {
        this.tracks[i].dirty = true;
        console.log("i: ", this.tracks[i]);
    }
  }

  constructor(width: number, height: number, trackNum: number) {
    this.width = width;
    this.height = height;
    this.trackNum = trackNum;
    this.upgradeList[0].owned = trackNum;
    for (let i = 0; i < trackNum; i++) {
      this.tracks.push(
        new Track(stringGenerator({ length: 240 }), 10, 15 + i * 25)
      );
      //console.log("Created track at: x: ", 10, " y:", 15+i*25 )
    }
  }

  addInput(input: KeyEvent) {
    this.inputBuffer.push(input);
    this.dirty = true;
  }

  addTrack(num: number) {
    for (var i = 0; i < num; i++) {
      console.log("Adding a track");
      var lastTrack = this.tracks[this.tracks.length - 1];
      this.tracks.push(
        new Track(
          stringGenerator({ length: 240 }),
          lastTrack.x,
          lastTrack.y + 25
        )
      );
    }
    this.dirty = true;
  }

  update(delta: number) {
    while (this.inputBuffer.length > 0) {
      const event = this.inputBuffer.shift()!;

      for (const t of this.tracks) {
        if (event.target === 0 && t.text && t.text[0] == event.key) {
          // Handle events for tracks
          t.text = t.text.slice(1);
          t.text += charGenerator(t.flags);
          t.dirty = true;
          this.score++;
          this.onScoreChange?.(this.score);
        } else if (event.target === 1) {
          // Handle events for shop

          if (event.key === "i") {
            if (this.incrementNum === 5) this.setIncrement(1);
            else if (this.incrementNum > 1)
              this.setIncrement(this.incrementNum - 5);
            return;
          }
          if (event.key === "I") {
            if (this.incrementNum === 1) this.setIncrement(5);
            else if (this.incrementNum < 100)
              this.setIncrement(this.incrementNum + 5);
            return;
          }

          if (event.key === "r") {
            if (this.rangeNum - this.incrementNum < 0) this.setRangeNum(0);
            else this.setRangeNum(this.rangeNum - this.incrementNum);
            return;
          }
          if (event.key === "R") {
            if (this.rangeNum + this.incrementNum < 100)
              this.setRangeNum(this.rangeNum + this.incrementNum);
            else this.setRangeNum(100);
            return;
          }

          if (event.key === "t") {
            if (this.trackSelect - this.incrementNum > 0)
              this.setTrackSelect(this.trackSelect - this.incrementNum);
            else this.setTrackSelect(0);
            return;
          }
          if (event.key === "T") {
            if (this.trackSelect + this.incrementNum < 999)
              this.setTrackSelect(this.trackSelect + this.incrementNum);
            else this.setTrackSelect(999);
            return;
          }

          // Item buying stuff starts here
          for (const upg of this.upgradeList) {
            if (event.key === upg.hotkey) {
              console.log("detected key for", upg.description, this.score);

              // const totalCost =
              //   (upg.baseCost + upg.baseCost * upg.costMult * upg.owned) *
              //   this.incrementNum;
              if (this.score >= upg.costCalculation(this.incrementNum)) {
                this.score -= upg.costCalculation(this.incrementNum);
                this.onScoreChange?.(this.score);
                upg.owned += this.incrementNum;
                this.dirty = true;
                upg.buyUpgrade(
                  this.incrementNum,
                  this.trackSelect,
                  this.rangeNum
                );
                if (this.onUpgradeChange) {
                  this.onUpgradeChange([...this.upgradeList]);
                }
              }
              return;
            }
          }
        }
      }
    }
    // rest
  }
}
