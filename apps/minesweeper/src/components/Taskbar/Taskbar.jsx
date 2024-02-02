import "./Taskbar.scss";
import TaskbarTime from "./TaskbarTime";
import TaskbarWindow from "./TaskbarWindow";
import Start from "../../assets/start.png";

const Taskbar = ({ apps, focusedApp, taskbarWindowClicked }) => {
  return (
    <div className="taskbar taskbar-gradient z-10 flex h-[30px] flex-row">
      <img src={Start} alt="start" className="mr-[10px] h-full" />
      {apps.map((app) => (
        <TaskbarWindow
          app={app}
          focusedApp={focusedApp}
          taskbarWindowClicked={taskbarWindowClicked}
          key={app.id}
        />
      ))}
      <TaskbarTime />
    </div>
  );
};

export default Taskbar;
