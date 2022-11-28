import '../styles.css';
export function ModeSelector({setMode}) {
    return <div style={{marginTop:'10%',width:'100vw',display:'flex',justifyContent:'center'}}>
        <div style={{borderRadius:'10px',padding:'20px',background:'#595959'}}>
            <div className='modeSelectorText'>I am:</div>
            <div style={{display:'flex'}}>
                <button className='modeButton' onClick={() => setMode(`Pizza Chef`)}>A Chef</button>
                <button className='modeButton' onClick={() => setMode(`Store Owner`)}>An Owner</button>
            </div>
        </div>
    </div>
}