import { useState } from 'react';
import { useEffect } from 'react';
import Select from 'react-select'
import '../styles.css';
export function ChefView() {
    const [error,setError] = useState()
    const [pizzas,setPizzas] = useState([])
    const [validToppings,setValidToppings] = useState([])
    const [toppings,setToppings] = useState([])
    const [pizzaName,setPizzaName] = useState(``)
    const [renamingPizza,setRenamingPizza] = useState()

    useEffect(() => {
        (async () => {
            const toppings = await (await fetch(`/getToppings`)).json()
            setValidToppings(toppings.map(({id,name}) => ({value:id,label:name})))
            const pizzas = await (await fetch(`/getPizzas`)).json()
            console.log({pizzas})
            setPizzas(pizzas)
        })()
    },[])

    const createPizza = async () => {
        if (toppings.length && pizzaName) {
            const response = await (await fetch(`/createPizza`,{method: `POST`, headers:{'Content-Type': 'application/json'},body: JSON.stringify({
                name:pizzaName,
                toppings: toppings.map(({value}) => value)
            })})).json()
            const {error} = response
            if (error) {
                setError(response.error)
            } else {
                setPizzas(response)
            }
        } else {
            setError(`Must specify pizza name and add at least one topping`)
        }
        setPizzaName(``)
        setToppings([])
        console.log({toppings})
    }

    const addTopping = async (id,toppingId) => {
        if (id && toppingId) {
            const pizza = pizzas.find(pizza => pizza.id == id)
            const response = await (await fetch(`/updatePizza`, {method: `PUT`, headers:{'Content-Type': 'application/json'},body: JSON.stringify({
                pizza_id: id,
                name: pizza.name,
                toppings: [...pizza.toppings.map(({id}) => id),toppingId]
            })})).json()
            if (response.error) {
                setError(response.error)
            } else {
                setPizzas(response)
            }
        }
    }

    const renamePizza = async (id) => {
        const pizza = pizzas.find(pizza => pizza.id == id)
        setRenamingPizza({id,name:pizza.name})
    }

    const saveRenamePizza = async (id) => {
        const pizza = pizzas.find(pizza => pizza.id == id)
        const response = await (await fetch(`/updatePizza`, {method: `PUT`, headers:{'Content-Type': 'application/json'},body: JSON.stringify({
            pizza_id: id,
            name: renamingPizza.name,
            toppings: pizza.toppings.map(({id}) => id)
        })})).json()
        if (response.error) {
            setError(response.error)
        } else {
            setPizzas(response)
            setRenamingPizza()
        }
    }

    const deletePizza = async (id) => {
        const response = await (await fetch(`/deletePizza`, {method: `DELETE`, headers:{'Content-Type': 'application/json'},body: JSON.stringify({
            pizza_id: id
        })})).json()
        if (response.error) {
            setError(response.error)
        } else {
            setPizzas(response)
        }
    }

    const deleteTopping = async (id, toppingId) => {
        const pizza = pizzas.find(pizza => pizza.id == id)
        const response = await (await fetch(`/updatePizza`, {method: `PUT`, headers:{'Content-Type': 'application/json'},body: JSON.stringify({
            pizza_id: id,
            name: pizza.name,
            toppings: pizza.toppings.filter(({id}) => id != toppingId ).map(({id}) => id)
        })})).json()
        if (response.error) {
            setError(response.error)
        } else {
            setPizzas(response)
        }
    }

    return <div style={{width:'100vw',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',position:'relative',flexDirection:'column'}}>
        <h1>ChefView</h1>
        
        <div className='toolbar' style={{display:'flex'}}>
            <input onChange={(e) => {setError();setPizzaName(e.target.value)}} value={pizzaName} placeholder='Pizza Name' name='name'></input>
            <Select value={toppings} options={validToppings} className="react-select" classNamePrefix="react-select" isMulti='true' onChange={(selectedItems) => setToppings(selectedItems)}/>
            <button onClick={() => createPizza()}>Create New Pizza</button>
        </div>
        {error ? <div className='error'>Error: {error}</div> : <></> }
        <div className='pizzas'>
            {pizzas.map(({id,toppings,name}) => <div className='pizza' key={id}>
                <div>
                    {
                        renamingPizza?.id == id ? <input value={renamingPizza.name} onChange={(e) => setRenamingPizza({...renamingPizza,name:e.target.value})}/> : <h2>{name}</h2>
                    }
                    <div className='columnRight'>
                        {
                            renamingPizza?.id == id ? <div className='edit' onClick={() => saveRenamePizza(id)}>Save</div> : <><div className='edit' onClick={() => renamePizza(id)}>Rename Pizza</div>
                            <div className='delete' onClick={() => deletePizza(id)}>Delete Pizza</div></>
                        }
                        
                    </div>
                </div>
                {toppings.map((topping) => <div key={topping.id}>
                    <div className='pizzaTopping' key={topping.id}>{topping.name}</div>
                    <div className='columnRight delete' onClick={() => deleteTopping(id,topping.id)}>Delete Topping</div>
                </div>)}
                <div className='noHover'>
                    <div className='columnRight'>
                        Add Topping: <Select options={validToppings} className="react-select columnRight" classNamePrefix="react-select" onChange={(selectedItems) => addTopping(id,selectedItems.value)}/>
                    </div>
                </div>
            </div>)}
        </div>
    </div>
}