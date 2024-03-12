const data = require('./achievements.json');
const fs = require('fs');

const randomizeData = async () => {
  const games = Object.keys(data);
  const allAchievements = games.map((gameId) => {
    const gameAchievements = data[gameId];
    return Object.keys(gameAchievements).map((achievementId) => {
      return {
        gameId,
        achievementId,
        ...gameAchievements[achievementId],
      };
    });
  });
  const flattenedAchievements = allAchievements.flat();
  const randomizedAchievements = flattenedAchievements.sort(
    () => Math.random() - 0.5,
  );
  randomizedAchievements.forEach((achievement, index) => {
    achievement.index = index;
  });
  const groupedByGame = randomizedAchievements.reduce((acc, achievement) => {
    if (!acc[achievement.gameId]) {
      acc[achievement.gameId] = {};
    }
    const { gameId, achievementId, ...rest } = achievement;

    acc[achievement.gameId][achievement.achievementId] = rest;
    return acc;
  }, {});
  const dataToWrite = JSON.stringify(groupedByGame, null, 2);
  fs.writeFileSync('./randomized-achievements.json', dataToWrite);
};

randomizeData();
