const Discord = require('discord.js')
const moon = new Discord.Client();
const lyricsFinder = require('lyrics-finder');
const config = require('./config/config.json');
const { license } = require('./package.json');

moon.on('ready', () => {
    console.log(license)
    console.log(`Logged In As ${moon.user.tag}`)
})

moon.on('message', async message => {
    if(message.content.startsWith(config.prefix+"가사")) {
    const args = message.content.slice(config.prefix.length).trim().split(' ');
      let pages = []
      let current = 0
      let name = args.slice(2).join(" ")
      let artist = args[1]
      if(!name) return message.reply("사용법 : !가사 <아티스트> <노래제목>")
      let res = await lyricsFinder(artist,name) || "찾을 수 없는 노래입니다."
      for(let i = 0; i < res.length; i += 2048) {
        let lyrics = res.substring(i, Math.min(res.length, i + 2048))
        let page = new Discord.MessageEmbed()
        .setTitle(`"${artist} - ${name}" 가사`)
        .setDescription(lyrics)
        .setColor('#8b00ff')
        .setFooter(message.author.tag, message.author.displayAvatarURL({dynamic: true}))
        pages.push(page)
    }

    const filter2 = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && (message.author.id == user.id)
    const Embed = await message.channel.send(` ${current+1}/${pages.length} 페이지`, pages[current])
    await Embed.react('⬅️')
    await Embed.react('➡️')

    let ReactionCol = Embed.createReactionCollector(filter2)

    ReactionCol.on("collect", (reaction) => {
        reaction.users.remove(reaction.users.cache.get(message.author.id))

        if(reaction.emoji.name == '➡️') {
            if(current < pages.length - 1) {
                current += 1
                Embed.edit(`${current+1}/${pages.length} 페이지`, pages[current])
            }
        } else {
            if(reaction.emoji.name === '⬅️') {
                if(current !== 0) {
                    current -= 1
                    Embed.edit(`${current+1}/${pages.length} 페이지`, pages[current])
                }
            }
        }
    })
}
});

moon.login(config.token)