import { useEffect } from 'react';
import { useHomePage } from '../providers/home-page-provider';
import { cn } from '@repo/utils';

const Page = () => {
  const { step } = useHomePage();

  const removeLogo = () => {
    const splineViewer = document.getElementsByTagName('spline-viewer')[0];
    if (!splineViewer) return;
    const shadowRoot = splineViewer.shadowRoot;
    if (!shadowRoot) return;
    const logo = shadowRoot.getElementById('logo');
    if (!logo) return;
    logo.style.visibility = 'hidden';
  };

  useEffect(() => {
    removeLogo();
  }, []);

  return (
    <div
      className={cn(
        'bg-primary/60 pointer-events-none relative flex h-full w-full opacity-0',
        step === 'homepage' && 'pointer-events-auto opacity-100',
      )}
    >
      <div className='mx-auto flex h-full w-full max-w-[1280px] overflow-auto'>
        <div className='sticky left-0 top-0 flex flex-1'>
          <div
            className='text-primary-foreground relative flex flex-1 flex-col items-center justify-center border'
            style={{ textShadow: '0px 0px 20px #000000' }}
          >
            <span className='w-full text-[100px]'>Scott Hetrick</span>
            <span className='w-full text-[24px]'>
              Programming. Pizza. Punchlines.
            </span>
            <span className='w-full text-[24px]'>
              Not necessarily in that order.
            </span>
            {/* <div className='flex'>
            <span>-----</span>
          </div> */}
          </div>
        </div>
        <div className='text-primary-foreground relative flex flex-1 shrink-0 flex-col border'>
          <spline-viewer
            class='absolute inset-0'
            events-target='global'
            loading-anim-type='spinner-small-dark'
            url='https://prod.spline.design/8KeIdzt7Hi8smpDE/scene.splinecode'
          ></spline-viewer>
        </div>
      </div>
    </div>
  );
};

export { Page };
