async function pingu(client) {
  const channelId = "1089967329498112131";
  const channel = await client.channels.cache.get(channelId);
  await channel.send({ content: `Pingu is here` });
}

module.exports = pingu;
