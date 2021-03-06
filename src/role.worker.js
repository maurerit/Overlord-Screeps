/**
 * Created by Bob on 7/12/2017.
 */

let _ = require('lodash');
const profiler = require('screeps-profiler');


/**
 * @return {null}
 */
function role(creep) {
    //INITIAL CHECKS
    if (creep.tryToBoost(['build'])) return;
    if (creep.borderCheck()) return null;
    if (creep.wrongRoom()) return null;
    if (creep.carry.energy === 0) {
        creep.memory.working = null;
        creep.memory.constructionSite = undefined;
        creep.memory.task = undefined;
    }
    if (creep.isFull) creep.memory.working = true;
    if (creep.memory.working === true) {
        creep.memory.source = undefined;
        if (!creep.memory.constructionSite || !Game.getObjectById(creep.memory.constructionSite)) {
            creep.memory.constructionSite = undefined;
            creep.memory.task = undefined;
            creep.findConstruction();
        }
        if (creep.memory.task === 'build') {
            let construction = Game.getObjectById(creep.memory.constructionSite);
            switch (creep.build(construction)) {
                case OK:
                    return null;
                case ERR_NOT_IN_RANGE:
                    creep.shibMove(construction, {range: 3});
                    break;
                case ERR_RCL_NOT_ENOUGH:
                    creep.memory.constructionSite = undefined;
                    creep.memory.task = undefined;
                    break;
                case ERR_INVALID_TARGET:
                    creep.memory.constructionSite = undefined;
                    creep.memory.task = undefined;
                    break;
            }
        } else {
            creep.findRepair(creep.room.controller.level);
            if (creep.memory.task === 'repair' && creep.memory.constructionSite) {
                let repairNeeded = Game.getObjectById(creep.memory.constructionSite);
                switch (creep.repair(repairNeeded)) {
                    case OK:
                        return null;
                    case ERR_NOT_IN_RANGE:
                        creep.shibMove(repairNeeded, {range: 3});
                        break;
                    case ERR_RCL_NOT_ENOUGH:
                        delete creep.memory.constructionSite;
                }
            } else if (creep.upgradeController(Game.rooms[creep.memory.overlord].controller) === ERR_NOT_IN_RANGE) {
                creep.shibMove(Game.rooms[creep.memory.overlord].controller);
                creep.memory.constructionSite = undefined;
                creep.memory.task = undefined;
            }
        }
    } else {
        if (creep.memory.energyDestination) {
            creep.withdrawEnergy();
        } else {
            if (!creep.findEnergy()) {
                if (creep.pos.checkForRoad()) {
                    creep.moveRandom();
                } else {
                    return creep.idleFor(15);
                }
            }
        }
    }
}

module.exports.role = profiler.registerFN(role, 'workerRole');