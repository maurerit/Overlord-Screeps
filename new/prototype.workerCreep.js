const profiler = require('screeps-profiler');
let shib = require("shibBench");
borderCheck = function () {
    if (this.pos.x === 0 || this.pos.y === 0 || this.pos.x === 49 || this.pos.y === 49) {
        if (this.pos.x === 0 && this.pos.y === 0) {
            this.move(BOTTOM_RIGHT);
        }
        else if (this.pos.x === 0 && this.pos.y === 49) {
            this.move(TOP_RIGHT);
        }
        else if (this.pos.x === 49 && this.pos.y === 0) {
            this.move(BOTTOM_LEFT);
        }
        else if (this.pos.x === 49 && this.pos.y === 49) {
            this.move(TOP_LEFT);
        }
        else if (this.pos.x === 49) {
            if (Math.random() < .33) {
                this.move(LEFT)
            } else if (Math.random() < .33) {
                this.move(TOP_LEFT)
            } else {
                this.move(BOTTOM_LEFT)
            }
        }
        else if (this.pos.x === 0) {
            if (Math.random() < .33) {
                this.move(RIGHT)
            } else if (Math.random() < .33) {
                this.move(TOP_RIGHT)
            } else {
                this.move(BOTTOM_RIGHT)
            }
        }
        else if (this.pos.y === 0) {
            if (Math.random() < .33) {
                this.move(BOTTOM)
            } else if (Math.random() < .33) {
                this.move(BOTTOM_RIGHT)
            } else {
                this.move(BOTTOM_LEFT)
            }
        }
        else if (this.pos.y === 49) {
            if (Math.random() < .33) {
                this.move(TOP)
            } else if (Math.random() < .33) {
                this.move(TOP_RIGHT)
            } else {
                this.move(TOP_LEFT)
            }
        }
        return true;
    }
};
Creep.prototype.borderCheck = profiler.registerFN(borderCheck, 'borderCheck');

wrongRoom = function () {
    if (this.memory.overlord && this.pos.roomName !== this.memory.overlord) {
        this.shibMove(new RoomPosition(25, 25, this.memory.overlord), {range: 15});
        return true;
    }
};
Creep.prototype.wrongRoom = profiler.registerFN(wrongRoom, 'wrongRoomCheck');

findSource = function () {
    const source = _.filter(this.room._sources, (s) => _.filter(Game.creeps, (c) => c.memory.source === s.id).length === 0);
    if (source.length > 0) {
        this.memory.source = this.pos.findClosestByRange(source).id;
        return this.pos.findClosestByRange(source).id;
    }
    return null;
};
Creep.prototype.findSource = profiler.registerFN(findSource, 'findSourceCreepFunctions');

Creep.prototype.findMineral = function () {
    const source = this.room.find(FIND_MINERALS);
    if (source.length > 0) {
        for (let i = 0; i < source.length; i++) {
            if (_.filter(source[i].pos.findInRange(FIND_CREEPS, 2), (c) => c.memory && (c.memory.role === 'remoteHarvester' || c.memory.role === 'stationaryHarvester' || c.memory.role === 'SKworker' || c.memory.role === 'mineralHarvester')).length === 0) {
                if (this.shibMove(source[i]) !== ERR_NO_PATH) {
                    if (source[i].id) {
                        this.memory.source = source[i].id;
                        return source[i];
                    }
                }
            }
        }
    }
    return null;
};

findConstruction = function () {
    let construction = this.room.find(FIND_CONSTRUCTION_SITES);
    let site = _.filter(construction, (s) => s.structureType === STRUCTURE_SPAWN);
    if (site.length > 0) {
        site = this.pos.findClosestByRange(site);
        this.memory.constructionSite = site.id;
        this.memory.task = 'build';
        return true;
    }
    site = _.filter(construction, (s) => s.structureType === STRUCTURE_CONTAINER);
    if (site.length > 0) {
        site = this.pos.findClosestByRange(site);
        this.memory.constructionSite = site.id;
        this.memory.task = 'build';
        return true;
    }
    site = _.filter(construction, (s) => s.structureType === STRUCTURE_TOWER);
    if (site.length > 0) {
        site = this.pos.findClosestByRange(site);
        this.memory.constructionSite = site.id;
        this.memory.task = 'build';
        return true;
    }
    site = _.filter(construction, (s) => s.structureType === STRUCTURE_EXTENSION);
    if (site.length > 0) {
        site = this.pos.findClosestByRange(site);
        this.memory.constructionSite = site.id;
        this.memory.task = 'build';
        return true;
    }
    site = _.filter(construction, (s) => s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART);
    if (site.length > 0) {
        site = this.pos.findClosestByRange(site);
        this.memory.constructionSite = site.id;
        this.memory.task = 'build';
        return true;
    }
    site = _.filter(construction, (s) => s.structureType === STRUCTURE_WALL);
    if (site.length > 0) {
        site = this.pos.findClosestByRange(site);
        this.memory.constructionSite = site.id;
        this.memory.task = 'build';
        return true;
    }
    site = _.filter(construction, (s) => s.structureType === STRUCTURE_RAMPART);
    if (site.length > 0) {
        site = this.pos.findClosestByRange(site);
        this.memory.constructionSite = site.id;
        this.memory.task = 'build';
        return true;
    }
    this.memory.task = undefined;
    return null;
};
Creep.prototype.findConstruction = profiler.registerFN(findConstruction, 'findConstructionCreepFunctions');

findRepair = function (level) {
    let structures = this.room.find(FIND_STRUCTURES, {filter: (s) => s.hits < s.hitsMax});
    let site = _.filter(structures, (s) => s.structureType === STRUCTURE_ROAD && s.hits < s.hitsMax / 2);
    if (site.length > 0) {
        site = this.pos.findClosestByRange(site);
        this.memory.constructionSite = site.id;
        this.memory.task = 'repair';
        return;
    }
    site = _.filter(structures, (s) => s.structureType === STRUCTURE_CONTAINER && s.hits < 75000);
    if (site.length > 0) {
        site = this.pos.findClosestByRange(site);
        this.memory.constructionSite = site.id;
        this.memory.task = 'repair';
        return;
    }
    site = _.filter(structures, (s) => s.structureType === STRUCTURE_SPAWN && s.hits < s.hitsMax);
    if (site.length > 0) {
        site = this.pos.findClosestByRange(site);
        this.memory.constructionSite = site.id;
        this.memory.task = 'repair';
        return;
    }
    site = _.filter(structures, (s) => s.structureType === STRUCTURE_RAMPART && s.hits < 10000);
    if (site.length > 0) {
        site = this.pos.findClosestByRange(site);
        this.memory.constructionSite = site.id;
        this.memory.task = 'repair';
        return;
    }
    site = _.filter(structures, (s) => s.structureType === STRUCTURE_WALL && s.hits < 500000 * level);
    if (site.length > 0) {
        site = this.pos.findClosestByRange(site);
        this.memory.constructionSite = site.id;
        this.memory.task = 'repair';
        return;
    }
    site = _.filter(structures, (s) => s.structureType === STRUCTURE_RAMPART && s.hits < 500000 * level);
    if (site.length > 0) {
        site = this.pos.findClosestByRange(site);
        this.memory.constructionSite = site.id;
        this.memory.task = 'repair';
        return;
    }
    site = _.filter(structures, (s) => s.structureType === STRUCTURE_EXTENSION && s.hits < s.hitsMax);
    if (site.length > 0) {
        site = this.pos.findClosestByRange(site);
        this.memory.constructionSite = site.id;
        this.memory.task = 'repair';
        return;
    }
    site = _.filter(structures, (s) => s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_ROAD && s.structureType !== STRUCTURE_CONTAINER && s.structureType !== STRUCTURE_RAMPART && s.hits < s.hitsMax);
    if (site.length > 0) {
        site = this.pos.findClosestByRange(site);
        this.memory.constructionSite = site.id;
        this.memory.task = 'repair';
        return;
    }
    this.memory.task = undefined;
};
Creep.prototype.findRepair = profiler.registerFN(findRepair, 'findRepairCreepFunctions');

containerBuilding = function () {
    let site = this.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => s.structureType === STRUCTURE_CONTAINER});
    if (site !== null && site !== undefined) {
        if (this.pos.getRangeTo(site) <= 1) {
            return site.id;
        }
    }
};
Creep.prototype.containerBuilding = profiler.registerFN(containerBuilding, 'containerBuildingCreepFunctions');

harvestDepositContainer = function () {
    let container = this.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.structureType === STRUCTURE_CONTAINER});
    if (container) {
        if (this.pos.getRangeTo(container) <= 1) {
            return container.id;
        } else if (this.pos.getRangeTo(container) <= 3) {
            this.shibMove(container);
            return container.id;
        }
    }
    return null;
};
Creep.prototype.harvestDepositContainer = profiler.registerFN(harvestDepositContainer, 'harvestDepositContainerCreepFunctions');

harvesterContainerBuild = function () {
    if (this.memory.source && this.pos.getRangeTo(Game.getObjectById(this.memory.source)) <= 1){
        if (this.pos.createConstructionSite(STRUCTURE_CONTAINER) !== OK) {
            return null;
        }
    }
};
Creep.prototype.harvesterContainerBuild = profiler.registerFN(harvesterContainerBuild, 'harvesterContainerBuildCreepFunctions');

withdrawEnergy = function () {
    let start = Game.cpu.getUsed();
    if (!this.memory.energyDestination) {
        return null;
    } else {
        let energyItem = Game.getObjectById(this.memory.energyDestination);
        if (energyItem) {
            if (this.withdraw(energyItem, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.shibMove(energyItem);
            } else {
                this.memory.energyDestination = null;
            }
        } else {
            this.memory.energyDestination = undefined;
        }
    }
    shib.shibBench('withdrawEnergy', start, Game.cpu.getUsed());
};
Creep.prototype.withdrawEnergy = profiler.registerFN(withdrawEnergy, 'withdrawEnergyCreepFunctions');

findEnergy = function (range = 250, hauler = false) {
    let energy = [];
    //Container
    let container = _.pluck(_.filter(this.room.memory.structureCache, 'type', 'container'), 'id');
    if (container.length > 0) {
        let containers = [];
        for (let i = 0; i < container.length; i++) {
            const object = Game.getObjectById(container[i]);
            if (object) {
                if (this.room.memory.controllerContainer === object.id) continue;
                let numberOfUsers = _.filter(Game.creeps, (c) => c.memory.energyDestination === object.id).length;
                if (object.store[RESOURCE_ENERGY] < 20 || (numberOfUsers >= 4 && this.pos.getRangeTo(object) > 1) || (object.room.controller.level >= 4 && object.store[RESOURCE_ENERGY] < 1200)) {
                    continue;
                }
                let itemRange = object.pos.rangeToTarget(this);
                if (itemRange > range) continue;
                let containerAmountWeighted = (object.store[RESOURCE_ENERGY] / object.storeCapacity);
                let containerDistWeighted = itemRange * (2 - containerAmountWeighted) + (numberOfUsers / 2);
                containers.push({
                    id: container[i],
                    distWeighted: containerDistWeighted,
                    harvest: false
                });
            }
        }
        let bestContainer = _.min(containers, 'distWeighted');
        energy.push({
            id: bestContainer.id,
            distWeighted: bestContainer.distWeighted,
            harvest: false
        });
    }
    //storages
    let useStorage = _.pluck(_.filter(this.room.memory.structureCache, 'type', 'storage'), 'id');
    if (useStorage.length > 0) {
        let useStorages = [];
        for (let i = 0; i < useStorage.length; i++) {
            const object = Game.getObjectById(useStorage[i]);
            if (object) {
                if (object.store[RESOURCE_ENERGY] <= 1000) {
                    continue;
                }
                let itemRange = object.pos.rangeToTarget(this);
                if (itemRange > range) continue;
                const useStorageDistWeighted = _.round(itemRange * 0.3, 0) + 1;
                useStorages.push({
                    id: useStorage[i],
                    distWeighted: useStorageDistWeighted,
                    harvest: false
                });
            }
        }
        let bestStorage = _.min(useStorages, 'distWeighted');
        energy.push({
            id: bestStorage.id,
            distWeighted: bestStorage.distWeighted,
            harvest: false
        });
    }
    //Links
    let storageLink = Game.getObjectById(this.room.memory.storageLink);
    if (storageLink) {
        let linkDistWeighted;
        const object = storageLink;
        let numberOfUsers = _.filter(Game.creeps, (c) => c.memory.energyDestination === object.id).length;
        let itemRange = object.pos.rangeToTarget(this);
        if (itemRange < range) {
            if (object && object.energy > 0 && numberOfUsers.length === 0) {
                linkDistWeighted = _.round(object.pos.rangeToTarget(this) * 0.3, 0) + 1;
            }
            energy.push({
                id: storageLink.id,
                distWeighted: linkDistWeighted,
                harvest: false
            });
        }
    }
    //Terminal
    let terminal = _.pluck(_.filter(this.room.memory.structureCache, 'type', 'terminal'), 'id');
    if (terminal.length > 0) {
        let terminals = [];
        for (let i = 0; i < terminal.length; i++) {
            const object = Game.getObjectById(terminal[i]);
            let itemRange = object.pos.rangeToTarget(this);
            if (object) {
                if (object.store[RESOURCE_ENERGY] <= 5000 || itemRange > range) {
                    continue;
                }
                const terminalDistWeighted = _.round(object.pos.rangeToTarget(this) * 0.3, 0) + 1;
                terminals.push({
                    id: terminal[i],
                    distWeighted: terminalDistWeighted,
                    harvest: false
                });
            }
        }
        let bestTerminal = _.min(terminals, 'distWeighted');
        energy.push({
            id: bestTerminal.id,
            distWeighted: bestTerminal.distWeighted,
            harvest: false
        });
    }

    let sorted = _.min(energy, 'distWeighted');

    if (sorted) {
        if (sorted.harvest === false) {
            let energyItem = Game.getObjectById(sorted.id);
            if (energyItem) {
                this.memory.energyDestination = energyItem.id;
            } else {
                return null;
            }
        }
    }
};
Creep.prototype.findEnergy = profiler.registerFN(findEnergy, 'findEnergyCreepFunctions');

getEnergy = function (range = 250, hauler = false) {
    let energy = [];
    //Container
    let container = _.pluck(_.filter(this.room.memory.structureCache, 'type', 'container'), 'id');
    if (container.length > 0) {
        let containers = [];
        for (let i = 0; i < container.length; i++) {
            const object = Game.getObjectById(container[i]);
            if (object) {
                if (object.id === this.room.controllerContainer) continue;
                let numberOfUsers = _.filter(Game.creeps, (c) => c.memory.energyDestination === object.id).length;
                if (object.store[RESOURCE_ENERGY] < 20 || object.pos.rangeToTarget(this) > range || (numberOfUsers >= 4 && this.pos.getRangeTo(object) > 1)) {
                    continue;
                }
                const containerAmountWeighted = (object.store[RESOURCE_ENERGY] / object.storeCapacity);
                const containerDistWeighted = object.pos.rangeToTarget(this) * (2 - containerAmountWeighted) + (numberOfUsers / 2);
                containers.push({
                    id: container[i],
                    distWeighted: containerDistWeighted,
                    harvest: false
                });
            }
        }
        let bestContainer = _.min(containers, 'distWeighted');
        energy.push({
            id: bestContainer.id,
            distWeighted: bestContainer.distWeighted,
            harvest: false
        });
    }
    //Links
    let storageLink = Game.getObjectById(this.room.memory.storageLink);
    if (storageLink) {
        let linkDistWeighted;
        const object = storageLink;
        let numberOfUsers = _.filter(Game.creeps, (c) => c.memory.energyDestination === object.id).length;
        if (object && object.energy > 0 && numberOfUsers < 2) {
            linkDistWeighted = _.round(object.pos.rangeToTarget(this) * 0.3, 0) + 1;
        }
        energy.push({
            id: storageLink.id,
            distWeighted: linkDistWeighted,
            harvest: false
        });
    }
    //Terminal
    let terminal = _.pluck(_.filter(this.room.memory.structureCache, 'type', 'terminal'), 'id');
    if (terminal.length > 0) {
        let terminals = [];
        for (let i = 0; i < terminal.length; i++) {
            const object = Game.getObjectById(terminal[i]);
            if (object) {
                let numberOfUsers = _.filter(Game.creeps, (c) => c.memory.energyDestination === object.id).length;
                if (object.store[RESOURCE_ENERGY] <= ENERGY_AMOUNT * 0.5 || object.pos.rangeToTarget(this) > range) {
                    continue;
                }
                const terminalDistWeighted = _.round(object.pos.rangeToTarget(this) * 0.3, 0) + 1 + (numberOfUsers / 2);
                terminals.push({
                    id: terminal[i],
                    distWeighted: terminalDistWeighted,
                    harvest: false
                });
            }
        }
        let bestTerminal = _.min(terminals, 'distWeighted');
        energy.push({
            id: bestTerminal.id,
            distWeighted: bestTerminal.distWeighted,
            harvest: false
        });
    }
    //Storage
    let sStorage = _.pluck(_.filter(this.room.memory.structureCache, 'type', 'storage'), 'id');
    if (sStorage.length > 0) {
        let storages = [];
        for (let i = 0; i < sStorage.length; i++) {
            const object = Game.getObjectById(sStorage[i]);
            if (object) {
                let weight;
                weight = 0;
                if (object.store[RESOURCE_ENERGY] > 50000) {
                    weight = 0.3;
                }
                if (this.room.memory.responseNeeded) {
                    weight = 0.8;
                }
                if (object.pos.getRangeTo(this) > 1) {
                    const storageDistWeighted = _.round(object.pos.rangeToTarget(this) * weight, 0) + 1;
                    storages.push({
                        id: sStorage[i],
                        distWeighted: storageDistWeighted,
                        harvest: false
                    });
                }
            }
        }
        let bestStorage = _.min(storages, 'distWeighted');
        energy.push({
            id: bestStorage.id,
            distWeighted: bestStorage.distWeighted,
            harvest: false
        });
    }
    /**
     //Dropped Energy
     let dropped = creep.room.find(FIND_DROPPED_RESOURCES, {filter: (e) => e.resourceType === RESOURCE_ENERGY});
     if (dropped.length > 0) {
        let droppedEnergy = [];
        for (let i = 0; i < dropped.length; i++) {
            if (dropped[i]) {
                const droppedDistWeighted = _.round(dropped[i].pos.getRangeTo(creep) * 0.3, 0) + 1;
                droppedEnergy.push({
                    id: dropped[i].id,
                    distWeighted: droppedDistWeighted,
                    harvest: false
                });
            }
        }
        let bestDropped = _.min(droppedEnergy, 'distWeighted');
        energy.push({
            id: bestDropped.id,
            distWeighted: bestDropped.distWeighted,
            harvest: false
        });
    }**/

    let sorted = _.min(energy, 'distWeighted');

    if (sorted) {
        if (sorted.harvest === false) {
            let energyItem = Game.getObjectById(sorted.id);
            if (energyItem) {
                this.memory.energyDestination = energyItem.id;
            }
        }
        return true;
    } else {
        return undefined;
    }
};
Creep.prototype.getEnergy = profiler.registerFN(getEnergy, 'getEnergyCreepFunctions');

findStorage = function () {
    let storage = [];
    let haulingEnergy;
    if (this.carry[RESOURCE_ENERGY] === _.sum(this.carry)) haulingEnergy = true;
    //Spawn
    let spawn = _.pluck(_.filter(this.room.memory.structureCache, 'type', 'spawn'), 'id');
    if (spawn.length > 0 && haulingEnergy) {
        let spawns = [];
        for (let i = 0; i < spawn.length; i++) {
            const object = Game.getObjectById(spawn[i]);
            if (object) {
                if (object.energy === object.energyCapacity || _.filter(Game.creeps, (c) => c.memory.storageDestination === object.id).length > 0) {
                    continue;
                }
                const spawnDistWeighted = _.round(object.pos.rangeToTarget(this) * 0.8, 0) + 1;
                spawns.push({
                    id: spawn[i],
                    distWeighted: spawnDistWeighted,
                    harvest: false
                });
            }
        }
        let bestSpawn = _.min(spawns, 'distWeighted');
        storage.push({
            id: bestSpawn.id,
            distWeighted: bestSpawn.distWeighted,
            harvest: false
        });
    }
    //Extension
    let extension = _.pluck(_.filter(this.room.memory.structureCache, 'type', 'extension'), 'id');
    if (extension.length > 0 && haulingEnergy) {
        let extensions = [];
        for (let i = 0; i < extension.length; i++) {
            const object = Game.getObjectById(extension[i]);
            if (object) {
                if (object.energy === object.energyCapacity || _.filter(Game.creeps, (c) => c.memory.storageDestination === object.id).length > 0) {
                    continue;
                }
                const extensionDistWeighted = _.round(object.pos.rangeToTarget(this) * 0.8, 0) + 1;
                extensions.push({
                    id: extension[i],
                    distWeighted: extensionDistWeighted,
                    harvest: false
                });
            }
        }
        let bestExtension = _.min(extensions, 'distWeighted');
        storage.push({
            id: bestExtension.id,
            distWeighted: bestExtension.distWeighted,
            harvest: false
        });
    }
    //Storage
    let sStorage = _.pluck(_.filter(this.room.memory.structureCache, 'type', 'storage'), 'id');
    if (sStorage.length > 0) {
        let storages = [];
        for (let i = 0; i < sStorage.length; i++) {
            const object = Game.getObjectById(sStorage[i]);
            if (object) {
                let weight;
                weight = 0.25;
                if (object.store[RESOURCE_ENERGY] < 1500) {
                    weight = 0.98;
                }
                if (object.pos.getRangeTo(this) > 1) {
                    const storageDistWeighted = _.round(object.pos.rangeToTarget(this) * weight, 0) + 1;
                    storages.push({
                        id: sStorage[i],
                        distWeighted: storageDistWeighted,
                        harvest: false
                    });
                }
            }
        }
        let bestStorage = _.min(storages, 'distWeighted');
        storage.push({
            id: bestStorage.id,
            distWeighted: bestStorage.distWeighted,
            harvest: false
        });
    }
    //Tower
    let tower = _.pluck(_.filter(this.room.memory.structureCache, 'type', 'tower'), 'id');
    let harvester = _.filter(Game.creeps, (h) => h.memory.assignedSpawn === this.memory.assignedSpawn && h.memory.role === 'stationaryHarvester');
    if (tower.length > 0 && harvester.length >= 2 && haulingEnergy) {
        let towers = [];
        for (let i = 0; i < tower.length; i++) {
            const object = Game.getObjectById(tower[i]);
            if (object) {
                if (object.energy === object.energyCapacity) {
                    continue;
                }
                if (object.pos.getRangeTo(this) > 1) {
                    if (object.room.memory.responseNeeded === true) {
                        const towerDistWeighted = _.round(object.pos.rangeToTarget(this) * 0.3, 0);
                        towers.push({
                            id: tower[i],
                            distWeighted: towerDistWeighted,
                            harvest: false
                        });
                    } else {
                        const towerAmountWeighted = 1.01 - (object.energy / object.energyCapacity);
                        const towerDistWeighted = _.round(object.pos.rangeToTarget(this) * 1.2, 0) + 1 - towerAmountWeighted;
                        towers.push({
                            id: tower[i],
                            distWeighted: towerDistWeighted,
                            harvest: false
                        });
                    }
                }
            }
        }
        let bestTower = _.min(towers, 'distWeighted');
        storage.push({
            id: bestTower.id,
            distWeighted: bestTower.distWeighted,
            harvest: false
        });
    }
    //Links
    let controllerLink = Game.getObjectById(this.room.memory.controllerLink);
    if (controllerLink && haulingEnergy) {
        let linkDistWeighted;
        const object = controllerLink;
        let numberOfUsers = _.filter(Game.creeps, (c) => c.memory.energyDestination === object.id).length;
        if (object && object.energy < object.energyCapacity / 2 && numberOfUsers === 0) {
            linkDistWeighted = _.round(object.pos.rangeToTarget(this) * 0.4, 0) + 1;
        }
        storage.push({
            id: controllerLink.id,
            distWeighted: linkDistWeighted,
            harvest: false
        });
    }
    //Terminal
    let terminal = Game.getObjectById(_.pluck(_.filter(this.room.memory.structureCache, 'type', 'terminal'), 'id')[0]);
    if (terminal) {
        if (terminal.pos.getRangeTo(this) > 1) {
            const terminalDistWeighted = _.round(terminal.pos.rangeToTarget(this) * 0.3, 0) + 1;
            storage.push({
                id: terminal.id,
                distWeighted: terminalDistWeighted,
                harvest: false
            });
        }
    }
    //Nuker
    let nuker = Game.getObjectById(_.pluck(_.filter(this.room.memory.structureCache, 'type', 'nuker'), 'id')[0]);
    if (nuker) {
        if (nuker.pos.getRangeTo(this) > 1) {
            const nukerDistWeighted = _.round(nuker.pos.rangeToTarget(this) * 0.1, 0) + 1;
            storage.push({
                id: nuker.id,
                distWeighted: nukerDistWeighted,
                harvest: false
            });
        }
    }
    //Sort
    let sorted = _.min(storage, 'distWeighted');
    if (sorted) {
        let storageItem = Game.getObjectById(sorted.id);
        if (storageItem) {
            if (this.transfer(storageItem, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                if (storageItem.memory) {
                    storageItem.memory.deliveryIncoming = true;
                }
                this.memory.storageDestination = storageItem.id;
                return this.shibMove(storageItem);
            }
        }
    }
};
Creep.prototype.findStorage = profiler.registerFN(findStorage, 'findStorageCreepFunctions');

findEssentials = function () {
    let storage = [];
    let roomSpawnQueue = this.room.memory.creepBuildQueue;
    //Spawn
    let spawn = _.pluck(_.filter(this.room.memory.structureCache, 'type', 'spawn'), 'id');
    if (spawn.length > 0) {
        let spawns = [];
        for (let i = 0; i < spawn.length; i++) {
            const object = Game.getObjectById(spawn[i]);
            if (object) {
                if (object.energy === object.energyCapacity || _.filter(Game.creeps, (c) => c.memory.storageDestination === object.id).length > 0) {
                    continue;
                }
                const spawnDistWeighted = _.round(object.pos.rangeToTarget(this) * 0.3, 0) + 1;
                spawns.push({
                    id: spawn[i],
                    distWeighted: spawnDistWeighted,
                    harvest: false
                });
            }
        }
        let bestSpawn = _.min(spawns, 'distWeighted');
        storage.push({
            id: bestSpawn.id,
            distWeighted: bestSpawn.distWeighted,
            harvest: false
        });
    }
    //Extension
    let extension = _.pluck(_.filter(this.room.memory.structureCache, 'type', 'extension'), 'id');
    if (extension.length > 0) {
        let extensions = [];
        for (let i = 0; i < extension.length; i++) {
            const object = Game.getObjectById(extension[i]);
            if (object) {
                if (object.energy === object.energyCapacity || _.filter(Game.creeps, (c) => c.memory.storageDestination === object.id).length > 0) {
                    continue;
                }
                const extensionDistWeighted = _.round(object.pos.rangeToTarget(this) * 0.4, 0) + 1;
                extensions.push({
                    id: extension[i],
                    distWeighted: extensionDistWeighted,
                    harvest: false
                });
            }
        }
        let bestExtension = _.min(extensions, 'distWeighted');
        storage.push({
            id: bestExtension.id,
            distWeighted: bestExtension.distWeighted,
            harvest: false
        });
    }
    //Controller Container
    let controllerContainer = Game.getObjectById(this.room.memory.controllerContainer);
    if (controllerContainer && !_.includes(roomSpawnQueue, 'responder')) {
        let containerDistWeighted;
        const object = controllerContainer;
        let numberOfUsers = _.filter(Game.creeps, (c) => c.memory.energyDestination === object.id).length;
        if (object && numberOfUsers === 0) {
            let weight;
            weight = 0.1;
            if (object.store[RESOURCE_ENERGY] < 1000) {
                weight = 0.7;
            }
            containerDistWeighted = _.round(object.pos.rangeToTarget(this) * weight, 0) + 1;
        }
        storage.push({
            id: controllerContainer.id,
            distWeighted: containerDistWeighted,
            harvest: false
        });
    }
    //Storage
    let sStorage = _.pluck(_.filter(this.room.memory.structureCache, 'type', 'storage'), 'id');
    if (sStorage.length > 0) {
        let storages = [];
        for (let i = 0; i < sStorage.length; i++) {
            const object = Game.getObjectById(sStorage[i]);
            if (object) {
                let weight;
                weight = 0.25;
                if (object.store[RESOURCE_ENERGY] < 1500) {
                    weight = 0.98;
                }
                if (object.pos.getRangeTo(this) > 1) {
                    const storageDistWeighted = _.round(object.pos.rangeToTarget(this) * weight, 0) + 1;
                    storages.push({
                        id: sStorage[i],
                        distWeighted: storageDistWeighted,
                        harvest: false
                    });
                }
            }
        }
        let bestStorage = _.min(storages, 'distWeighted');
        storage.push({
            id: bestStorage.id,
            distWeighted: bestStorage.distWeighted,
            harvest: false
        });
    }
    //Links
    let controllerLink = Game.getObjectById(this.room.memory.controllerLink);
    if (controllerLink && !_.includes(roomSpawnQueue, 'responder')) {
        let linkDistWeighted;
        const object = controllerLink;
        let numberOfUsers = _.filter(Game.creeps, (c) => c.memory.energyDestination === object.id).length;
        if (object && object.energy < object.energyCapacity / 2 && numberOfUsers === 0) {
            linkDistWeighted = _.round(object.pos.rangeToTarget(this) * 0.4, 0) + 1;
        }
        storage.push({
            id: controllerLink.id,
            distWeighted: linkDistWeighted,
            harvest: false
        });
    }
    //Worker Deliveries
    let workers = _.filter(Game.creeps, (h) => h.memory.overlord === this.room.name && (h.memory.role === 'worker' && h.memory.deliveryRequestTime > Game.time - 10 && !h.memory.deliveryIncoming));
    if (workers.length > 0 && this.ticksToLive > 30 && !_.includes(roomSpawnQueue, 'responder')) {
        let workerWeighted;
        const object = workers[0];
        if (object) {
            workerWeighted = _.round(object.pos.rangeToTarget(this) * 0.2, 0) + 1;
        }
        storage.push({
            id: object.id,
            distWeighted: workerWeighted,
            harvest: false
        });
    }
    //Tower
    let tower = _.pluck(_.filter(this.room.memory.structureCache, 'type', 'tower'), 'id');
    let harvester = _.filter(Game.creeps, (h) => h.memory.assignedSpawn === this.memory.assignedSpawn && (h.memory.role === 'stationaryHarvester' || h.memory.role === 'basicHarvester'));
    if (tower.length > 0 && harvester.length >= 2 && !_.includes(roomSpawnQueue, 'responder')) {
        let towers = [];
        for (let i = 0; i < tower.length; i++) {
            const object = Game.getObjectById(tower[i]);
            if (object) {
                if (object.pos.getRangeTo(this) > 1) {
                    if (object.room.memory.responseNeeded === true && object.energy < object.energyCapacity * 0.85) {
                        const towerDistWeighted = _.round(object.pos.rangeToTarget(this) * 0.01, 0);
                        towers.push({
                            id: tower[i],
                            distWeighted: towerDistWeighted,
                            harvest: false
                        });
                    } else if (object.energy < object.energyCapacity / 2) {
                        const towerDistWeighted = _.round(object.pos.rangeToTarget(this) * 0.1, 0);
                        towers.push({
                            id: tower[i],
                            distWeighted: towerDistWeighted,
                            harvest: false
                        });
                    } else {
                        const towerAmountWeighted = 1.01 - (object.energy / object.energyCapacity);
                        const towerDistWeighted = _.round(object.pos.rangeToTarget(this) * 1, 0) + 1 - towerAmountWeighted;
                        towers.push({
                            id: tower[i],
                            distWeighted: towerDistWeighted,
                            harvest: false
                        });
                    }
                }
            }
        }
        let bestTower = _.min(towers, 'distWeighted');
        storage.push({
            id: bestTower.id,
            distWeighted: bestTower.distWeighted,
            harvest: false
        });
    }
    //Terminal room.memory.energySurplus
    let terminal = Game.getObjectById(_.pluck(_.filter(this.room.memory.structureCache, 'type', 'terminal'), 'id')[0]);
    if (terminal) {
        if (terminal.pos.getRangeTo(this) > 1) {
            if (terminal.room.memory.energySurplus && terminal.store[RESOURCE_ENERGY] < ENERGY_AMOUNT * 0.5) {
                const terminalDistWeighted = _.round(terminal.pos.rangeToTarget(this) * 0.1, 0) + 1;
                storage.push({
                    id: terminal.id,
                    distWeighted: terminalDistWeighted,
                    harvest: false
                });
            } else {
                const terminalDistWeighted = _.round(terminal.pos.rangeToTarget(this) * 1.1, 0) + 1;
                storage.push({
                    id: terminal.id,
                    distWeighted: terminalDistWeighted,
                    harvest: false
                });
            }
        }
    }
    //Nuker
    let nuker = Game.getObjectById(_.pluck(_.filter(this.room.memory.structureCache, 'type', 'nuker'), 'id')[0]);
    if (nuker) {
        if (nuker.pos.getRangeTo(this) > 1) {
            const nukerDistWeighted = _.round(nuker.pos.rangeToTarget(this) * 0.1, 0) + 1;
            storage.push({
                id: nuker.id,
                distWeighted: nukerDistWeighted,
                harvest: false
            });
        }
    }
    //Sort
    let sorted = _.min(storage, 'distWeighted');
    if (sorted) {
        let storageItem = Game.getObjectById(sorted.id);
        if (storageItem) {
            if (this.transfer(storageItem, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                if (storageItem.memory) {
                    storageItem.memory.deliveryIncoming = true;
                }
                this.memory.storageDestination = storageItem.id;
                this.shibMove(storageItem);
            }
            return true;
        } else {
            return undefined;
        }
    }
};
Creep.prototype.findEssentials = profiler.registerFN(findEssentials, 'findEssentialsCreepFunctions');

findDeliveries = function () {
    //Deliveries
    let deliver = _.filter(Game.creeps, (c) => c.memory.deliveryRequested === true && !c.memory.deliveryIncoming && c.pos.roomName === this.pos.roomName);
    if (deliver.length > 0) {
        let deliveries = [];
        for (let i = 0; i < deliver.length; i++) {
            if (deliver[i].pos.getRangeTo(this) > 1) {
                if (this.carry[RESOURCE_ENERGY] < deliver.carryCapacity - _.sum(deliver.carry)) {
                    continue;
                }
                const deliverDistWeighted = _.round(deliver[i].pos.rangeToTarget(this) * 0.3, 0) + 1;
                deliveries.push({
                    id: deliver[i].id,
                    distWeighted: deliverDistWeighted,
                    harvest: false
                });
            }
        }
        if (Game.getObjectById(_.min(deliveries, 'distWeighted').id)) {
            this.memory.storageDestination = _.min(deliveries, 'distWeighted').id;
            Game.getObjectById(_.min(deliveries, 'distWeighted').id).memory.deliveryIncoming = true;
            return true;
        }
    }
};
Creep.prototype.findDeliveries = profiler.registerFN(findDeliveries, 'findDeliveriesCreepFunctions');

/**
 * Globally patch creep actions to log error codes.
['attack', 'attackController', 'build', 'claimController', 'dismantle', 'drop',
    'generateSafeMode', 'harvest', 'heal', 'move', 'moveByPath', 'moveTo', 'pickup',
    'rangedAttack', 'rangedHeal', 'rangedMassAttack', 'repair', 'reserveController',
    'signController', 'suicide', 'transfer', 'upgradeController', 'withdraw'].forEach(function (method) {
    let original = Creep.prototype[method];
    // Magic
    Creep.prototype[method] = function () {
        let status = original.apply(this, arguments);
        if (typeof status === 'number' && status < 0 && status !== -9) {
            console.log(`Creep ${this.name} action ${method} failed with status ${status} at ${this.pos}`);
        }
        return status;
    }
});
 */
