import { useState } from 'react';
// import { getScenario } from './client';
import { Navbar } from './components/navbar';
import { Outlet } from 'react-router-dom';

function App() {
  const [currentSituation, setCurrentSituation] = useState<any | null>(null);

  // const [response, setResponse] = useState<any | null>(null);
  // const [definition, setDefinition] = useState<string | null>(null);
  // const [situation, setSituation] = useState<string | null>(null);

  // useEffect(() => {
  //   if (currentTerm) {
  //     getScenario(currentTerm).then((response) => {
  //       const situation = response.content[0].text;
  //       setSituation(situation);
  //       console.log(response);
  //       // setResponse(response);
  //     });
  //   }
  // }, [currentTerm]);

  return (
    <div className='flex h-full w-full flex-col'>
      <Navbar />
      <Outlet />
    </div>
  );
}

export { App };
