'use strict';
const cheerio = require('cheerio');
const request = require('request');
const fs = require('fs');

const playerObjects = {};
const factionObjects = {};
const claimObjects = {};

const oldFactions = require('./factions.json');
const oldClaims = require('./claims.json');

async function main() {
    console.log("working");
    for (let faction in oldFactions) {
        faction = await convertFaction(oldFactions[faction]);
        factionObjects[String(faction.id)] = faction;
    }
    for (let claim in oldClaims) {
        convertClaims(claim);
    }


    fs.writeFile('./factions.json', JSON.stringify(factionObjects, null, 4), 'utf8');
    fs.writeFile('./players.json', JSON.stringify(playerObjects, null, 4), 'utf8');
    fs.writeFile('./board.json', JSON.stringify(claimObjects, null, 4), 'utf8');

    console.log("DONE!!");
};

function convertClaims(claim) {
    const coords = claim.split(',').splice(1).join(',');
    const world = claim.split(',')[0];
    if (claimObjects[world] === undefined || claimObjects[world] === null) {
        claimObjects[world] = {};
    }
    claimObjects[world][coords] = oldClaims[claim];
}

function convertFaction(newFactions) {
    return new Promise(async (resolve) => {
        let self = {};
        self.id = newFactions.id;
        self.tag = newFactions.name;
        self.warps = {};
        self.warpPasswords = {};
        self.maxVaults = 0;
        self.defaultRole = "RECRUIT";
        self.home = newFactions.home;
        self.open = false;
        self.peaceful = false;
        self.permanent = false;
        self.peacefulExplosionsEnabled = false;
        self.upgrades = {};
        self.tnt = 0;
        self.rules = {};
        self.description = newFactions.description;
        self.foundDate = 1553983052959;
        self.money = 0.0;
        self.powerBoost = 100;
        self.claimOwnership = {};
        self.invites = [];
        self.relationWish = {};
        self.announcements = {};
        self.bans = [];
        self.lastDeath = newFactions.lastDeath;
        self.permissions = require('./help.json');

        for (let player in newFactions.members.memberRoles) {
            player = await convertPlayer(player, newFactions);
            playerObjects[String(player.id)] = player;
        }
        resolve(self);
    });
};

function convertPlayer(currentPlayer, newFaction) {
    return new Promise(async (resolve) => {
        const body = await httpGet(currentPlayer);
        const $ = cheerio.load(body);
        let self = {};
        console.log("finding text");
        console.log($('h3').text().replace('Useful Minecraft Resources', ''));
        self.inVault = false;
        self.factionId = newFaction.id;
        self.role = newFaction.members.roles[newFaction.members.memberRoles[currentPlayer]].name.toUpperCase();
        self.title = "";
        self.power = 10.0;
        self.powerBoost = 0.0;
        self.lastPowerUpdateTime = 1562542658410;
        self.lastLoginTime = 1562542658410;
        self.chatMode = "PUBLIC";
        self.ignoreAllianceChat = false;
        self.id = currentPlayer;
        self.name = $('h3').text();
        self.monitorJoins = false;
        self.spyingChat = false;
        self.showScoreboard = false;
        self.warmupTask = 0;
        self.kills = 0;
        self.deaths = 0;
        self.willAutoLeave = true;
        self.mapHeight = 17;
        self.isFlying = false;
        self.enteringPassword = false;
        self.enteringPasswordWarp = "";
        self.isStealthEnabled = false;
        self.playerAlerts = false;
        self.inspectMode = false;
        console.log(self);
        resolve(self);
    });
};

function httpGet(id) {
    return new Promise((resolve, reject) => {
        request(`https://mcuuid.net/?q=${id}`, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                resolve(body);
            }
            else {
                reject(error);
            }
        });
    });
};

main();