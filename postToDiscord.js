const apiEndpoint = 'https://discord.com/api/v8/applications/781132408476794890/commands'
const commandData = {
  "name": "test",
  "description": "Slash Commandsのテスト",
  "options": []
}

async function main () {
  const fetch = require('node-fetch')

  const response = await fetch(apiEndpoint, {
    method: 'post',
    body: JSON.stringify(commandData),
    headers: {
      'Authorization': 'Bot ' + process.env.DISCORD_BOT_TOKEN,
      'Content-Type': 'application/json'
    }
  })
  const json = await response.json()

  console.log(json)
}
main()