const path = require('path');
const exclusions = [47957, 50601, 50602, 50603];

class Heartwood
{
    constructor(mod)
    {
        this.mod = mod;
        
        // are there other regions outside EU?
        if (mod.region !== 'eu')
        {
            mod.log('This mod only supports EU version of the game.');
            return;
        }

        // add def for p88 until it's added to tera-data
        mod.dispatch.addDefinition('S_COMPLETED_MISSION_INFO', 1, path.join(mod.rootFolder, 'S_COMPLETED_MISSION_INFO.1.def'));
        mod.dispatch.addOpcode('S_COMPLETED_MISSION_INFO', 43612);

        // fuck JS man
        this.onCompletedMissionInfo = function(ev)
        {
            if (!mod.settings.enabled) return true;
            let abort = false;
            // check that all the quests to exclude are already completed
            exclusions.forEach(ex =>
            {
                if (ev.quests.findIndex(q => q.questId === ex) === -1)
                    abort = true;
            });
    
            // abort if any of them is missing, to avoid quest progression issues
            if (abort)
                return true;
    
            // build new array with only the quests which are not in exclusions
            const newQuests = [];
            ev.quests.forEach(q =>
            {
                if (exclusions.includes(q.questId))
                    return;
                newQuests.push(q);
            });
    
            // send the modified array to the client
            mod.send('S_COMPLETED_MISSION_INFO', 1, {
                quests: newQuests
            });
    
            // block full list
            return false;
        }

        // check status
        this.onEnabledChanged();

        // add toggle command
        mod.command.add('heartwood', () =>
        {
            mod.settings.enabled = !mod.settings.enabled;
            mod.command.message(`<font color="#cccccc">Mod </font><font color="#${(mod.settings.enabled ? '42F5AD' : 'F05164')}">${(mod.settings.enabled ? 'en' : 'dis')}abled</font><font color="#cccccc">. Relog to character selection and back to apply the change.</font>`);
            this.onEnabledChanged();
        });
    }

    onEnabledChanged()
    {
        if (this.mod.settings.enabled)
            this.mod.hook('S_COMPLETED_MISSION_INFO', 1, this.onCompletedMissionInfo);
        else
            this.mod.unhook('S_COMPLETED_MISSION_INFO', 1, this.onCompletedMissionInfo);
    }

}

module.exports = Heartwood;