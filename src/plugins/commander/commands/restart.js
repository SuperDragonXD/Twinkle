const { spawn } = require('child_process');
const OPCommand = require('../structs/opcommand.js');

class RestartCommand extends OPCommand {
    constructor(bot) {
        super(bot);
        this.aliases = ['restart', 'r'];
        this.hidden = true;
        this.heroku = this.bot._globalConfig.HEROKU == 'true';
        console.log(this.bot._globalConfig.HEROKU, typeof this.bot._globalConfig.HEROKU)
    }

    async call(message) {
        await message.channel.send('Restarting...');

        if (this.heroku) {
            this.restartHeroku();
        } else {
            this.restartProc();
        }
    }

    async restartHeroku() {
        const config = this.bot._globalConfig;
        const name = config.IS_BACKUP ? config.APP_NAME : config.BACKUP_APP_NAME;
        const token = config.HEROKU_TOKEN;

        const { body } = await got(`https://api.heroku.com/teams/apps/${name}`, {
            json: true,
            headers: {
                Accept: `application/vnd.heroku+json; version=3`,
                Authorization: `Bearer ${token}`
            }
        });

        await got.delete(`https://api.heroku.com/apps/${body.id}/dynos`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    restartProc() {
        const subprocess = spawn(process.argv0, process.argv.slice(1), {
            detached: true,
            stdio: 'ignore'
        });
        subprocess.unref();

        process.exit(0);
    }
}

module.exports = RestartCommand;