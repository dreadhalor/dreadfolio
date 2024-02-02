const TaskbarWindow = ({ app, focusedApp, taskbarWindowClicked }) => {
  const focused = focusedApp === app.id;

  return (
    <div
      onPointerDown={(e) => {
        e.preventDefault();
        taskbarWindowClicked(app.id);
      }}
      className={`footer__window ${focused ? 'focus' : 'cover'}`}
    >
      <img className='footer__icon' src={app.icon} alt={app.title} />
      <div className='footer__text'>{app.title}</div>
    </div>
  );
};

export default TaskbarWindow;
