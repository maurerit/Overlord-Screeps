let borderChecks = require('inUse/module.borderChecks');
var roleDefender = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if(borderChecks.isOnBorder(creep) === true){
            borderChecks.nextStepIntoRoom(creep);
        }

        var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            creep.say('ATTACKING');
            if (creep.attack(closestHostile) === ERR_NOT_IN_RANGE) {
                creep.moveTo(closestHostile, {reusePath: 20}, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            creep.moveTo(Game.flags.defender1, {reusePath: 20}, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }

};

module.exports = roleDefender;
/**
 * Created by rober on 5/15/2017.
 */
