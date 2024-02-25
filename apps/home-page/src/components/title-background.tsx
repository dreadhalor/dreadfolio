import { Variants, motion } from 'framer-motion';
import { useHomePage } from '../providers/home-page-provider';

const TitleBackground = () => {
  const { animateBackground, retractBackground } = useHomePage();
  const variants: Variants = {
    initial: {
      width: '100%',
      height: '100%',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      transition: {
        duration: 0.5,
      },
    },
    animate: {
      width: 'min(95vw,95vh)',
      height: 'min(95vw,95vh)',
      borderRadius: '50%',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 100,
      },
    },
    retract: {
      width: 0,
      height: 0,
      borderRadius: '50%',
      transition: {
        type: 'spring',
        stiffness: 800,
        damping: 100,
      },
    },
  };

  return (
    <div
      className='absolute inset-0 bg-black'
      // variants={variants}
      // initial='initial'
      // animate={
      //   retractBackground
      //     ? 'retract'
      //     : animateBackground
      //       ? 'animate'
      //       : 'initial'
      // }
    />
  );
};

export { TitleBackground };
