import { AnimatePresence, motion } from 'framer-motion';
import { useIntro } from '@frontend/providers/intro-provider';
import { Button } from 'dread-ui';

const StartButton = () => {
  const { step, startAnimating, setStartAnimating } = useIntro();
  return (
    <AnimatePresence>
      {!startAnimating && step === 'init' && (
        <motion.div
          className='absolute inset-0 z-20'
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
        >
          <Button
            onClick={() => setStartAnimating(true)}
            variant='outline'
            className='absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 text-white transition-colors'
          >
            Start
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { StartButton };
