import {KeyEvent} from "./app"

interface StringGeneratorProps {
    length: number
}

const stringGenerator = ( {length}: StringGeneratorProps ) => {
    let outString = ""
    for (let i = 0; i<length; i++)
        outString += charGenerator([])
    return outString
}

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


const handleInputs = (char: string,inputs: string[]) => {
    return 
}

export interface Track {
    text: string;
    flags: string[];
    x: number;
    y: number;
}

export type Upgrade = {
    id: number;
    hotkey: string;
    baseCost: number;
    costMult: number;
    owned: number;
    description: string;
    buyUpgrade: (num:number) => void;
    costCalculation: (incr:number) => number;
}

export class Engine {
    tracks: Track[] = [];
    width: number;
    height: number;
    trackNum: number = 1;
    inputBuffer: KeyEvent[] = [];
    score: number = 0;
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
            id:0, 
            hotkey: "A", 
            baseCost:10, 
            costMult:1.8, 
            owned:0, 
            description:"[A]dd a track", 
            buyUpgrade: (num) => this.addTrack(num),
            costCalculation: function (incr) {
                if(this.owned === 0 || this.owned == 1)
                    return this.baseCost;
                return Math.round(this.baseCost + ((this.owned * this.baseCost * this.costMult) * incr));
            }
        }
    ]

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

    constructor(width: number, height: number, trackNum: number) {
        this.width = width;
        this.height = height;
        this.trackNum = trackNum;
        this.upgradeList[0].owned = trackNum;
        for(let i=0; i < trackNum; i++) {
            this.tracks.push({
                text: stringGenerator({length: 240}),
                flags: [],
                x: 10,
                y: 15 + (i * 25)
            });
        }
    }

    addInput(input: KeyEvent) {
        this.inputBuffer.push(input);
        this.dirty = true;
    }

    addTrack(num: number) {
        for(var i=0;i<num;i++) {
            console.log("Adding a track");
            var lastTrack = this.tracks[this.tracks.length - 1]
            var newTrack: Track = {text:stringGenerator({length: 240}), flags:[], x: lastTrack.x, y: lastTrack.y + 25}
            this.tracks.push(newTrack);
        }
        this.dirty = true;
    }

    update(delta: number) {
        while (this.inputBuffer.length > 0) {
            const event = this.inputBuffer.shift()!;
            for (const t of this.tracks) {
                if(event.target === 0 && t.text && t.text[0] == event.key) { // Handle events for tracks
                    t.text = t.text.slice(1);
                    t.text += charGenerator(t.flags);
                    this.score++;
                    this.onScoreChange?.(this.score);
                }
                else if(event.target === 1) {                                // Handle events for shop

                    if(event.key === "i") {
                        if(this.incrementNum === 5)
                            this.setIncrement(1)
                        else if (this.incrementNum > 1)
                            this.setIncrement(this.incrementNum - 5)
                        return;
                    }
                    if(event.key === "I") {
                        if(this.incrementNum === 1)
                            this.setIncrement(5)
                        else if(this.incrementNum < 100)
                            this.setIncrement(this.incrementNum + 5)
                        return;
                    }

                    if(event.key === "r") {
                        if(this.rangeNum - this.incrementNum < 0)
                            this.setRangeNum(0);
                        else
                            this.setRangeNum(this.rangeNum - this.incrementNum)
                        return
                    }
                    if(event.key === "R") {
                        if(this.rangeNum + this.incrementNum < 100)
                            this.setRangeNum(this.rangeNum + this.incrementNum)
                        else
                            this.setRangeNum(100);
                        return
                    }

                    if(event.key === "t") {
                        if(this.trackSelect - this.incrementNum > 0 )
                            this.setTrackSelect(this.trackSelect - this.incrementNum)
                        else
                            this.setTrackSelect(0)
                        return
                    }
                    if(event.key === "T") {
                        if(this.trackSelect + this.incrementNum < 999 )
                            this.setTrackSelect(this.trackSelect + this.incrementNum)
                        else
                            this.setTrackSelect(999);
                        return
                    }

                    // Item buying stuff starts here
                    for(const upg of this.upgradeList) {
                        if(event.key === upg.hotkey) {
                            const totalCost = (upg.baseCost + (upg.baseCost * upg.costMult * upg.owned)) * this.incrementNum;
                            if(this.score >= upg.costCalculation(this.incrementNum)) {
                                this.score -= upg.costCalculation(this.incrementNum);
                                this.onScoreChange?.(this.score);
                                upg.owned += this.incrementNum;
                                this.dirty = true;
                                upg.buyUpgrade(this.incrementNum);
                                if(this.onUpgradeChange) {
                                    this.onUpgradeChange([...this.upgradeList])
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