import React, { useEffect, useState } from 'react';
import './taskbar.scss';

const TaskbarTime: React.FC = () => {
  const getTime = () => {
    const date = new Date();
    let hour = date.getHours();
    let hourPostFix = 'AM';
    let min: string | number = date.getMinutes();
    if (hour >= 12) {
      hour -= 12;
      hourPostFix = 'PM';
    }
    if (hour === 0) {
      hour = 12;
    }
    if (min < 10) {
      min = '0' + min;
    }
    return `${hour}:${min} ${hourPostFix}`;
  };

  const [time, setTime] = useState<string>(getTime);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = getTime();
      newTime !== time && setTime(newTime);
    }, 1000);
    return () => clearInterval(timer);
  }, [time]);

  return (
    <div className='footer__right'>
      <div className='footer__time'>{time}</div>
    </div>
  );
};

export default TaskbarTime;
