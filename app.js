const fs = require('fs');
const converter = require('json-2-csv');
const LeagueOfLegendsAPI = require('lol-api');
var app_key = 'RGAPI-7a98398a-4b5a-46c9-bcfd-4c42774bccfa';
var test = new LeagueOfLegendsAPI(app_key);
let nicknames = ["푸치생"]
// let nicknames = ["Hide on Bush"]
async function nodap() {
    let matchIdArray = [];
    let matchArray = [];
    let matchCSV = [];
    // nickname 배열에 해당하는 닉네임을 가진 유저의 매치 파싱
    for(let nickname of nicknames) {
        console.log(nickname, '의 데이터 수집중');
        let accountId = await test.getEncryptedAccountIdFromName(nickname);
        let matchList = await test.getMatchListFromAccountId(accountId, 420);
        matchIdArray = [...matchIdArray, ...matchList];
    }

    let index = 0;
    for(let matchObject of matchIdArray) {

        console.log('current matchIDn is :', matchObject.gameId)
        let match = await test.getMatchByMatchID(matchObject.gameId);
        if(typeof match === 'undefined') break;
        matchArray.push(match);
        // index ++;                              
    
    }
    
    // matchIdArray.map(async matchObject => {
    //     if(index === 5) return;
    //     console.log('current matchID is :', matchObject.gameId)
    //     let match = await test.getMatchByMatchID(matchObject.gameId);
    //     matchArray.push(match);
    //     index ++;                              
    // })

    matchArray.map((match, index) => {
        let { champion } = matchIdArray[index];
        let { teamId } = match.participants.filter(participant => participant.championId === champion)[0];
        console.log('user\'s team is...', teamId === 100 ? 'blue' : 'red');

        let { gameId, gameDuration } = match,
            allyTeam = match.teams.filter(team => team.teamId === teamId)[0],
            enemyTeam = match.teams.filter(team => team.teamId !== teamId)[0],
            win = allyTeam.win === 'Win' ? 1 : 0,
            allyTowerKills = allyTeam.towerKills,
            enemyTowerKills = enemyTeam.towerKills,
            allyBaronKills = allyTeam.baronKills,
            enemyBaronKills = enemyTeam.baronKills,
            allyInhibitorKills = allyTeam.inhibitorKills,
            enemyInhibitorKills = enemyTeam.inhibitorKills,
            allyDragonKills = allyTeam.dragonKills,
            enemyDragonKills = enemyTeam.dragonKills,
            firstBlood = allyTeam.firstBlood ? 1 : 0,
            firstTower = allyTeam.firstTower ? 1 : 0,
            firstInhibitor = allyTeam.firstInhibitor ? 1 : 0,
            firstBaron = allyTeam.firstBaron ? 1 : 0,
            firstDragon = allyTeam.firstDragon ? 1 : 0,
            firstRiftHerald = allyTeam.firstRiftHerald ? 1 : 0,
            allyParticipant = match.participants.filter(participant => participant.teamId === teamId),
            enemyParticipant = match.participants.filter(participant => participant.teamId !== teamId),
            allyKill = allyParticipant.map(item => item.stats.kills).reduce(reducer),
            enemyKill = enemyParticipant.map(item => item.stats.kills).reduce(reducer),
            allyGold = allyParticipant.map(item => item.stats.goldEarned).reduce(reducer),
            enemyGold = enemyParticipant.map(item => item.stats.goldEarned).reduce(reducer),
            allyDeal = allyParticipant.map(item => item.stats.totalDamageDealt).reduce(reducer),
            enemyDeal = enemyParticipant.map(item => item.stats.totalDamageDealt).reduce(reducer),
            allyWard = allyParticipant.map(item => item.stats.wardsPlaced).reduce(reducer),
            enemyWard = enemyParticipant.map(item => item.stats.wardsPlaced).reduce(reducer);

        let tuple = {
            gameId,
            gameDuration,
            win,
            teamId,
            allyTowerKills,
            enemyTowerKills,
            allyBaronKills,
            enemyBaronKills,
            allyInhibitorKills,
            enemyInhibitorKills,
            allyDragonKills,
            enemyDragonKills,
            allyKill,
            enemyKill,
            allyGold,
            enemyGold,
            allyDeal,
            enemyDeal,
            allyWard,
            enemyWard,
            firstBlood,
            firstTower,
            firstDragon,
            firstInhibitor,
            firstBaron,
            firstRiftHerald
        }

        matchCSV.push(tuple);
    });

    console.log(matchCSV.length);

    converter.json2csv(matchCSV, (err, csv) => {
        if(err) {
            console.error(err);
            return;
        }

        fs.writeFileSync('./csv_test.csv', csv);
        console.log(csv);
    }, { checkSchemaDifferences: true });
}

const reducer = (accumulator, item) => accumulator + item;
nodap();
