
import {OwnerView} from './Components/OwnerView'
import {ChefView} from './Components/ChefView'
import {ModeSelector} from './Components/ModeSelector'
import './styles.css';
import { useState } from 'react';

function App() {
  const [mode,setMode] = useState()
  return (
    <div className='App'>
      {mode ? <div className='button' style={{padding:'20px',position:'fixed',zIndex:1}} onClick={() => setMode()}>Back</div> : <></>}
      {
        {
          'Store Owner': <OwnerView />,
          'Pizza Chef': <ChefView />,
        }[mode] || <ModeSelector setMode={setMode}/>
      }
    </div>
  );
}

export default App;
