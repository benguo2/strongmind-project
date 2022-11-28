import { useState } from 'react';
import { useEffect } from 'react';
import '../styles.css';
export function OwnerView() {
    const [error,setError] = useState()
    const [toppings,setToppings] = useState([])
    const [toppingName,setToppingName] = useState(``)
    const [renamingTopping,setRenamingTopping] = useState()
    useEffect(() => {
        (async () => {
            const toppings = await (await fetch(`/getToppings`)).json()
            setToppings(toppings)
        })()
    },[])

    const saveRenameTopping = async () => {
        setError()
        const response = await (await fetch(`/updateTopping`,{method: `PUT`, headers:{'Content-Type': 'application/json'},body: JSON.stringify({
            toppingId:renamingTopping.id,
            name: renamingTopping.name
        })})).json()
        const {error} = response
        if (error) {
            setError(response.error)
        } else {
            setToppings(response)
            setRenamingTopping()
        }
    }

    const submitTopping = async () => {
        if (toppingName) {
            console.log({toppingName,toppings})
            const response = await (await fetch(`/addTopping`,{method: `POST`, headers:{'Content-Type': 'application/json'},body: JSON.stringify({
                name:toppingName
            })})).json()
            const {error} = response
            if (error) {
                setError(response.error)
            } else {
                setToppings(response)
            }
        }
        setToppingName(``)
    }

    const deleteTopping = async (id) => {
        const response = await (await fetch(`/deleteTopping`,{method: `DELETE`, headers:{'Content-Type': 'application/json'},body: JSON.stringify({
            toppingId:id
        })})).json()
        if (error) {
            setError(response.error)
        } else {
            setToppings(response)
        }
    }
    return <div style={{width:'100vw',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',position:'relative',flexDirection:'column'}}>
        <h1>OwnerView</h1>
        <div style={{display:'flex'}}>
            <input onChange={(e) => {setError();setToppingName(e.target.value)}} value={toppingName} placeholder='Topping Name' name='name'></input>
            <button onClick={(e) => submitTopping(e)}>Create New Topping</button>
        </div>
        {error ? <div className='error'>Error: {error}</div> : <></> }
        <div className='toppings'>
            {toppings.map(({id,name}) => <div className='topping' key={id}>
                {
                    renamingTopping?.id == id ? <input value={renamingTopping.name} onChange={(e) => setRenamingTopping({...renamingTopping,name:e.target.value})}/> : <div>{name}</div>
                }
                <div className='columnRight' style={{display:'flex'}}>
                    {
                        renamingTopping?.id == id ? <div className='edit' onClick={() => saveRenameTopping(id)}>Save</div> : <>
                            <div className='delete' onClick={() => deleteTopping(id)}>Delete</div>
                            <div className='edit' onClick={() => setRenamingTopping({id,name})}>Rename Topping</div>
                        </>
                    }
                   
                </div>
            </div>)}
        </div>
    </div>
}