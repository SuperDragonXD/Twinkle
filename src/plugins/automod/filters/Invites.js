const Filter = require('../structs/filter.js');

class InvitesFilter extends Filter {
    constructor(automod) {
        super(automod);

        this.whitelist = automod.config.INVITES.WHITELIST;
    }

    matchInvites(text) {
        return text.match(/discord\.gg\/[\w\d]+/g);
    }

    async interested(message) {
        if (message.member.permissions.has('MANAGE_MESSAGES')) return false;

        const inviteCodes = this.matchInvites(message.content);
        if (!inviteCodes.length) return false;

        let invites;
        try {
            invites = await Promise.all(inviteCodes.map(invite => message.client.fetchInvite(invite)));
        } catch(e) {
            return false;
        }

        let i = invites.length;
        while (i--) {
            const invite = invites[i];
            if (
                invite.guild.id != message.guild.id &&
                !this.whitelist.includes(invite.guild.id)
            ) {
                return true;
            }
        }

        return false;
    }

    handle(message) {
        message.author.send(`Hey! Please don't link outside servers in ${message.guild.name}.`); // TODO # of offenses
        message.author.send(`Here's a copy of your message:\`\`\`${message.content}\`\`\``);
        message.delete();

        (this.automod.logchan() || message.channel).send({
            embed: {
                author: {
                    name: `${message.author.username}#${message.author.discriminator} has been warned`,
                    icon_url: message.author.displayAvatarURL
                },
                color: message.guild.me.displayColor,
                description: `**Reason**: Zalgo usage\n<@${message.author.id}>`, // TODO: # of offenses
            }
        });
    }
}

module.exports = InvitesFilter;