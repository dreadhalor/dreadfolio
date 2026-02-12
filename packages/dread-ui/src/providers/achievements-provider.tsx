import {
  query,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
  collectionGroup,
  Timestamp,
} from 'firebase/firestore';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  Achievement,
  BaseAchievement,
  BaseAchievementData,
  UserAchievement,
} from '@dread-ui/types';
import { useAuth, toast, AchievementsDialog, Toaster } from '@dread-ui/index';
import { useDB } from '@dread-ui/hooks/use-db';
import { useFullAchievements } from '@dread-ui/hooks/use-full-achievements';
import { useMergeAccounts } from '@dread-ui/hooks/use-merge-accounts';
import { useUserPreferences } from '@dread-ui/hooks/use-user-preferences';
import { GiLaurelCrown } from 'react-icons/gi';

const convertDBGameAchievement = (doc: QueryDocumentSnapshot<DocumentData>) => {
  const data = doc.data() as BaseAchievementData;
  return {
    id: doc.id,
    gameId: '',
    ...data,
  } satisfies BaseAchievement;
};

export interface AchievementsContextValue {
  allAchievements: BaseAchievement[];
  achievements: Achievement[];
  toggleAchievement: (achievement: Achievement) => Promise<void>;
  unlockAchievementById: (id: string, gameId?: string) => Promise<void>;
  saveAchievement: (achievement: Achievement) => Promise<void>;
  isUnlockable: (achievementId: string, gameId: string) => boolean;
  loading: boolean;
  showAchievementDialog: boolean;
  setShowAchievementDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const AchievementsContext = createContext({} as AchievementsContextValue);

// eslint-disable-next-line react-refresh/only-export-components
export const useAchievements = (): AchievementsContextValue => {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error(
      'useAchievements must be used within an AchievementsProvider',
    );
  }
  return context;
};

interface Props {
  children: React.ReactNode;
}
export const AchievementsProvider = ({ children }: Props) => {
  const [allAchievements, setAllAchievements] = useState<BaseAchievement[]>([]);
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [unlockingAchievements, setUnlockingAchievements] = useState<Set<string>>(new Set());
  const [queuedUnlocks, setQueuedUnlocks] = useState<Array<{ id: string; gameId: string }>>([]);

  const { uid, signedIn } = useAuth();
  const { db, saveAchievement: _saveAchievement, deleteAchievement } = useDB();
  const { achievements, loading } = useFullAchievements();
  const { userPreferences } = useUserPreferences(uid);
  useMergeAccounts();

  const saveAchievement = async (achievement: Achievement) => {
    if (!uid) return;

    const userAchievement = extractUserAchievement(achievement);
    await _saveAchievement(userAchievement);
  };

  const extractUserAchievement = (
    achievement: Achievement,
  ): UserAchievement => {
    return {
      id: achievement.id,
      gameId: achievement.gameId,
      uid: achievement.uid,
      unlockedAt: achievement.unlockedAt ?? null,
      state: achievement.state,
    };
  };

  const changeAchievementState = async (
    achievement: Achievement,
    state: 'locked' | 'unlocked',
  ) => {
    const achievementKey = `${achievement.gameId}:${achievement.id}`;

    if (!uid) return;
    
    // Prevent unlocking if already in progress
    if (state === 'unlocked' && unlockingAchievements.has(achievementKey)) {
      return;
    }
    
    if (achievement.state === state) return;
    
    // Prevent unlocking an achievement that's already been unlocked
    if (state === 'unlocked' && achievement.state === 'newly_unlocked') return;

    if (state === 'unlocked' && achievement.state === 'locked') {
      // Mark as in-flight
      setUnlockingAchievements(prev => new Set(prev).add(achievementKey));
      
      achievement.state = 'newly_unlocked';
      achievement.unlockedAt = Timestamp.now();
      if (userPreferences.showNotifications) {
        toast(achievement.title, {
          description: achievement.description,
          icon: <GiLaurelCrown className='h-12 w-12' />,
          action: {
            label: 'Open',
            onClick: () => setShowAchievementDialog(true),
          },
          classNames: {
            description: 'ml-8',
            title: 'ml-8',
          },
        });
      }
    }

    try {
      state === 'unlocked'
        ? await saveAchievement(achievement)
        : await deleteAchievement(
            achievement.id,
            achievement.gameId,
            achievement.uid,
          );
    } finally {
      // Remove from in-flight tracking
      if (state === 'unlocked') {
        const achievementKey = `${achievement.gameId}:${achievement.id}`;
        setUnlockingAchievements(prev => {
          const next = new Set(prev);
          next.delete(achievementKey);
          return next;
        });
      }
    }
  };

  const unlockAchievementById = async (id: string, gameId = '') => {
    // If still loading, queue the unlock for later
    if (loading) {
      setQueuedUnlocks(prev => [...prev, { id, gameId }]);
      return;
    }
    
    const achievement = achievements.find(
      (achievement) => achievement.id === id && achievement.gameId === gameId,
    );
    if (!achievement)
      throw new Error(
        `Achievement ${id} in ${gameId} not found! Available achievements: ${
          achievements.length > 0
            ? achievements.map((achievement) => achievement.id).join(', ')
            : 'none'
        }`,
      );

    await unlockAchievement(achievement);
  };
  const unlockAchievement = (achievement: Achievement) =>
    changeAchievementState(achievement, 'unlocked');
  const lockAchievement = (achievement: Achievement) =>
    changeAchievementState(achievement, 'locked');

  const toggleAchievement = async (achievement: Achievement) => {
    const userAchievement = extractUserAchievement(achievement);
    userAchievement.state === 'locked'
      ? await unlockAchievement(achievement)
      : await lockAchievement(achievement);
  };

  const isUnlockable = useCallback(
    (achievementId: string, gameId: string) => {
      // Don't allow unlocking while data is still loading
      if (loading) return false;

      const achievement = achievements.find(
        (achievement) =>
          achievement.uid === uid &&
          achievement.gameId === gameId &&
          achievement.id === achievementId,
      );
      
      return achievement?.state === 'locked';
    },
    [achievements, uid, loading],
  );

  useEffect(() => {
    const fetchAllGameAchievements = async (): Promise<BaseAchievement[]> => {
      if (!db) return [];
      const q = query(collectionGroup(db, 'achievements'));
      const res = getDocs(q)
        .then((querySnapshot) =>
          querySnapshot.docs.map((doc) => convertDBGameAchievement(doc)),
        )
        .catch((error) => {
          console.log('Error getting documents: ', error);
          return [];
        });
      return res;
    };

    fetchAllGameAchievements().then((achievements) => {
      setAllAchievements(achievements);
    });
  }, [setAllAchievements, db]);

  // Process queued unlocks when loading completes
  useEffect(() => {
    if (!loading && queuedUnlocks.length > 0) {
      queuedUnlocks.forEach(({ id, gameId }) => {
        unlockAchievementById(id, gameId);
      });
      setQueuedUnlocks([]);
    }
  }, [loading, queuedUnlocks, unlockAchievementById]);

  useEffect(() => {
    if (signedIn && !loading) {
      if (isUnlockable('login', 'home')) unlockAchievementById('login', 'home');
    }
    // I know unlockAchievementById should be here but I don't want to throw a bunch of chained functions into useCallbacks
  }, [signedIn, loading, isUnlockable]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AchievementsContext.Provider
      value={{
        allAchievements,
        achievements,
        toggleAchievement,
        unlockAchievementById,
        saveAchievement,
        isUnlockable,
        loading,
        showAchievementDialog,
        setShowAchievementDialog,
      }}
    >
      {children}
      <AchievementsDialog />
      <Toaster closeButton />
    </AchievementsContext.Provider>
  );
};
