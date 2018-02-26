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
    if (creep.borderCheck()) return null;
    if (creep.wrongRoom()) return null;
    if (_.sum(creep.carry) === 0) creep.memory.hauling = false;
    if (creep.isFull) creep.memory.hauling = true;
    if (!creep.getSafe()) {
        if (!terminalWorker(creep) && !mineralHauler(creep)) {
            if (creep.memory.hauling === false) {
                if (creep.memory.energyDestination) {
                    creep.withdrawEnergy();
                } else {
                    creep.getEnergy();
                    if (!creep.memory.energyDestination) {
                        let energy = creep.room.find(FIND_DROPPED_RESOURCES, {filter: (s) => s.amount > 100 && s.resourceType === RESOURCE_ENERGY});
                        if (energy.length > 0) {
                            if (creep.pickup(energy[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                                creep.shibMove(energy[0]);
                            }
                        }
                    }
                }
            } else {
                if (creep.memory.storageDestination) {
                    let storageItem = Game.getObjectById(creep.memory.storageDestination);
                    if (!storageItem) {
                        creep.memory.storageDestination = undefined;
                        creep.findEssentials();
                    }
                    switch (creep.transfer(storageItem, RESOURCE_ENERGY)) {
                        case OK:
                            creep.memory.storageDestination = undefined;
                            break;
                        case ERR_NOT_IN_RANGE:
                            let adjacentStructure = creep.pos.findInRange(FIND_STRUCTURES, 1);
                            let opportunity = _.filter(adjacentStructure, (s) => (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) && s.energy < s.energyCapacity);
                            if (opportunity.length > 0) creep.transfer(opportunity[0], RESOURCE_ENERGY);
                            let refillChance = _.filter(adjacentStructure, (s) => (s.structureType === STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > ENERGY_AMOUNT / 2);
                            if (refillChance.length > 0) creep.withdraw(refillChance[0], RESOURCE_ENERGY);
                            creep.shibMove(storageItem);
                            break;
                        case ERR_FULL:
                            creep.memory.storageDestination = undefined;
                            if (storageItem.memory) {
                                storageItem.memory.deliveryIncoming = undefined;
                            }
                            creep.findEssentials();
                            break;
                    }
                } else {
                    let spawn = _.pluck(_.filter(creep.room.memory.structureCache, 'type', 'spawn'), 'id');
                    if (spawn.energy < 300) {
                        if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                            creep.shibMove(spawn);
                        }
                    } else if (!creep.findEssentials()) {
                        creep.idleFor(10);
                    }
                }
            }
        }
    }
}

module.exports.role = profiler.registerFN(role, 'basicHaulerRole');

function mineralHauler(creep) {
    let mineralHauler = _.filter(Game.creeps, (creep) => creep.memory.mineralHauling && creep.memory.overlord === creep.room.name)[0];
    if (!creep.memory.mineralHauling || !Game.getObjectById(creep.room.memory.mineralContainer) || !mineralHauler) return undefined;
    if (creep.memory.hauling === false) {
        if (_.sum(Game.getObjectById(creep.room.memory.mineralContainer).store) > 1000) {
            creep.memory.mineralHauling = true;
            let mineralContainer = Game.getObjectById(creep.room.memory.mineralContainer);
            for (const resourceType in mineralContainer.store) {
                switch (creep.withdraw(mineralContainer, resourceType)) {
                    case OK:
                        break;
                    case ERR_NOT_IN_RANGE:
                        creep.shibMove(mineralContainer);
                }
            }
            return true;
        }
    } else {
        let terminal = Game.getObjectById(_.pluck(_.filter(creep.room.memory.structureCache, 'type', 'terminal'), 'id'));
        for (let resourceType in creep.carry) {
            switch (creep.transfer(terminal, resourceType)) {
                case OK:
                    creep.memory.mineralHauling = undefined;
                    return undefined;
                case ERR_NOT_IN_RANGE:
                    creep.shibMove(terminal);
            }
        }
        return true;
    }
}

function terminalWorker(creep) {
    let terminal = Game.getObjectById(_.pluck(_.filter(creep.room.memory.structureCache, 'type', 'terminal'), 'id'));
    let terminalWorker = _.filter(Game.creeps, (creep) => creep.memory.terminalWorker && creep.memory.overlord === creep.room.name)[0];
    if (!creep.memory.terminalWorker && (!terminal || terminalWorker)) return undefined;
    if (creep.memory.hauling === false) {
        if (_.sum(terminal.store) > 0.9 * terminal.storeCapacity) {
            creep.memory.terminalWorker = true;
            switch (creep.withdraw(terminal, _.max(Object.keys(terminal.store), key => terminal.store[key]))) {
                case OK:
                    break;
                case ERR_NOT_IN_RANGE:
                    return creep.shibMove(terminal);
            }
            return true;
        }
    } else {
        let storage = Game.getObjectById(_.pluck(_.filter(creep.room.memory.structureCache, 'type', 'storage'), 'id'));
        for (let resourceType in creep.carry) {
            switch (creep.transfer(storage, resourceType)) {
                case OK:
                    creep.memory.terminalWorker = undefined;
                    return undefined;
                case ERR_NOT_IN_RANGE:
                    return creep.shibMove(storage);
            }
        }
        return true;
    }
}