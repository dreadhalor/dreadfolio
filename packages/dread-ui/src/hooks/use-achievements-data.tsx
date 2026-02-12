import { useState, useEffect } from 'react';
import { useDB } from '@dread-ui/hooks/use-db';
import { BaseAchievement, UserAchievement } from '@dread-ui/types';
import { useAuth } from '..';

export function useAchievementsData() {
  const { uid } = useAuth();
  const { subscribeToUserAchievements, subscribeToGameAchievements } = useDB();
  const [gameAchievements, setGameAchievements] = useState<BaseAchievement[]>(
    [],
  );
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  useEffect(() => {
    setGameAchievements([]);
    setUserAchievements([]);
    setLoading(true);
    setUserDataLoaded(false);
  }, [uid]);

  useEffect(() => {
    const gameUnsubscribe = subscribeToGameAchievements(setGameAchievements);
    const userUnsubscribe = subscribeToUserAchievements(uid, (achievements) => {
      setUserAchievements(achievements);
      setUserDataLoaded(true);
    });

    return () => {
      gameUnsubscribe();
      userUnsubscribe();
    };
    // when I add the subscribe functions to the dependency array, the app crashes
  }, [uid, subscribeToGameAchievements, subscribeToUserAchievements]);

  // Set loading to false only after user data is loaded AND achievements have been combined
  useEffect(() => {
    if (userDataLoaded && gameAchievements.length > 0) {
      setLoading(false);
    }
  }, [userDataLoaded, gameAchievements]);

  return { gameAchievements, userAchievements, loading };
}
