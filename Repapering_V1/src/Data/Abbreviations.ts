import {ActList} from "./Data"

const findAbb = () => {
    var abbMap = {};
    for (let i = 0; i < ActList.length; i++) {
        // use regex to starting character of each word in the act name
        var abbr = ActList[i].match(/[A-Z]/g).join('');
        abbMap[ActList[i]] = abbr;
    }
    return abbMap
}

const Abbreviations = findAbb();

export {Abbreviations}