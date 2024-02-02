import { Button, Button2 } from "test-ui";

function App() {
  return (
    <div className="flex h-full w-full items-center justify-center border-8 border-black">
      {/* HI */}
      <Button label="Button" />
      <Button2>Button2</Button2>
      <button className="bg-red-500">button</button>
    </div>
  );
}

export { App };
