Creep.prototype.scoutRoom = function () {
    if (this.room.name !== this.memory.targetRoom) return this.shibMove(new RoomPosition(25, 25, this.memory.targetRoom), {
        range: 23,
        offRoad: true
    });
    this.room.cacheRoomIntel(true);
    // Get current operations
    let totalCount = 0;
    if (_.size(Memory.targetRooms)) {
        totalCount = _.size(_.filter(Memory.targetRooms, (t) => t.type !== 'attack'));
    }
    // Get available rooms
    let totalRooms = Memory.ownedRooms.length;
    let surplusRooms = _.filter(Memory.ownedRooms, (r) => r.memory.energySurplus).length;
    let rcl8Rooms = _.filter(Memory.ownedRooms, (r) => r.controller.level === 8).length;
    // Get room details
    let towers = _.filter(this.room.structures, (s) => s.structureType === STRUCTURE_TOWER && s.isActive());
    let countableStructures = _.filter(this.room.structures, (s) => s.structureType !== STRUCTURE_ROAD && s.structureType !== STRUCTURE_CONTROLLER && s.structureType !== STRUCTURE_WALL);
    let controller = this.room.controller;
    if (controller && controller.owner && controller.owner.username === MY_USERNAME) return this.suicide();
    // Prioritize based on range
    let range = this.room.findClosestOwnedRoom(true);
    let closestOwned = this.room.findClosestOwnedRoom();
    let pathedRange = this.shibRoute(new RoomPosition(25, 25, closestOwned).roomName).length - 1;
    let priority = 4;
    if (range <= 2) {
        priority = 1;
    } else if (range <= 3 && pathedRange <= 3) {
        priority = 2;
    } else if (pathedRange <= 6) {
        priority = 3;
    } else {
        priority = 4;
    }
    // Plan op based on room comp
    let cache = Memory.targetRooms || {};
    let tick = Game.time;
    let terminal = this.room.terminal;
    let storage = this.room.storage;
    let armedHostiles = _.filter(this.room.creeps, (c) => c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0);
    if (!Memory.targetRooms[this.room.name]) return this.suicide();
    if (totalCount < surplusRooms || priority === 1 || Memory.targetRooms[this.room.name].local) {
        if (!controller) {
            let type = 'harass';
            cache[this.room.name] = {
                tick: tick,
                type: type,
                level: 1,
                priority: priority
            };
        } else if (controller.owner && controller.safeMode) {
            cache[this.room.name] = {
                tick: tick,
                type: 'pending',
                dDay: tick + this.room.controller.safeMode,
            };
        } else if (controller.owner && (!towers.length || _.max(towers, 'energy').energy <= 9)) {
            // Set room to be raided for loot if some is available
            if ((terminal && _.sum(terminal.store) > 1000) || (storage && _.sum(storage.store) > 1000)) {
                cache[this.room.name] = {
                    tick: tick,
                    type: 'robbery',
                    level: 1,
                    priority: 2
                };
            } else {
                cache[this.room.name] = {
                    tick: tick,
                    type: 'hold',
                    level: 2,
                    priority: 2
                };
            }
        } else if (controller.owner && towers.length) {
            if (!rcl8Rooms) {
                cache[this.room.name] = {
                    tick: tick,
                    type: 'drain',
                    level: towers.length,
                    priority: 2
                };
            } else {
                cache[this.room.name] = {
                    tick: tick,
                    type: 'siege',
                    level: towers.length,
                    priority: 1
                };
            }
        } else if (!controller.owner && countableStructures.length < 3) {
            // Set room to be raided for loot if some is available
            if ((terminal && _.sum(terminal.store) > 1000) || (storage && _.sum(storage.store) > 1000)) {
                cache[this.room.name] = {
                    tick: tick,
                    type: 'robbery',
                    level: 1,
                    priority: 2
                };
            } else if (!armedHostiles.length) {
                cache[this.room.name] = {
                    tick: tick,
                    type: 'harass',
                    level: 1,
                    annoy: true,
                    priority: priority
                };
            } else {
                cache[this.room.name] = {
                    tick: tick,
                    type: 'harass',
                    level: 1,
                    priority: priority
                };
            }
        } else if (!controller.owner && countableStructures.length > 2) {
            // Set room to be raided for loot if some is available
            if ((terminal && _.sum(terminal.store) > 1000) || (storage && _.sum(storage.store) > 1000)) {
                cache[this.room.name] = {
                    tick: tick,
                    type: 'robbery',
                    level: 1,
                    priority: 2
                };
            } else {
                cache[this.room.name] = {
                    tick: tick,
                    type: 'clean',
                    level: 1,
                    priority: priority
                };
            }
        } else {
            delete Memory.targetRooms[this.room.name];
        }
    } else {
        cache[this.room.name] = {
            tick: tick,
            type: 'pending',
            dDay: tick + 2500,
        };
    }
    Memory.targetRooms = cache;
    return this.suicide();
};