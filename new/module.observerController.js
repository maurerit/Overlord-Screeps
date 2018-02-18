/**
 * Created by rober on 5/16/2017.
 */
let _ = require('lodash');
const profiler = require('screeps-profiler');

function observerControl() {
    for (let observer of _.values(Game.structures)) {
        if (observer.structureType === STRUCTURE_OBSERVER) {
            if (Game.time % 2 === 0) {
                let target;
                if (observer.room.memory.responseNeeded === true) {
                    let targets = _.filter(Game.rooms, (r) => Game.map.getRoomLinearDistance(r.name, observer.room.name) === 1);
                    target = targets[_.random(0, targets.length - 1)];
                } else {
                    let targets = _.filter(Game.rooms, (r) => Game.map.getRoomLinearDistance(r.name, observer.room.name) <= 10);
                    target = targets[_.random(0, targets.length - 1)];
                }
                observer.observeRoom(target.name);
                observer.room.memory.observerTarget = target.name;
            } else {
                if (observer.room.memory.observerTarget) Game.rooms[observer.room.memory.observerTarget].cacheRoomIntel();
            }
        }
    }
}

module.exports.observerControl = profiler.registerFN(observerControl, 'observerControl');
