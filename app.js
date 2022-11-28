const { Pizzas, Toppings_to_pizzas, Toppings, Sequelize } = require(`./models`)
const express = require(`express`)
const bodyParser = require(`body-parser`)
const app = express()
const port = 8100
const path = require(`path`)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, `react-app`, `build`)))

const getAllPizzas = async () => {
    return Promise.all(
        (await Pizzas.findAll()).map(async pizza => {
            const toppings = (await Toppings_to_pizzas.findAll({
                where: {
                    pizza_id: pizza.id
                },
                include: Toppings
            })).map(topping => ({id: topping.Topping.id,name:topping.Topping.name}))
            return {toppings,name:pizza.name,id:pizza.id}
        })
    )
}

app.get(`/getPizzas`, async (req, res) => {
    try {
        res.json(await getAllPizzas())
    } catch (err) {
        res.json({error:err.message})
    }
})

app.post(`/createPizza`, async (req, res) => {
    try {
        const { name, toppings } = req.body

        const allPizzas = await getAllPizzas()

        if (allPizzas.find(pizza => pizza.name == name)) throw new Error(`Pizza already exists with that name`)

        const allToppings = (await Toppings.findAll()).map(({id}) => id)
        const validToppings = [...new Set(toppings.filter(toppingId => allToppings.includes(toppingId)))]
        console.log(JSON.stringify(validToppings.sort()),`VALID TOPPINGS\n\n`)


        const toppingStrings = allPizzas.map(({toppings}) => JSON.stringify(toppings.map(({id}) => id).sort()))
        if (toppingStrings.includes(JSON.stringify(validToppings.sort()))) throw new Error(`toppings create a duplicate pizza`)

        if (!name) throw new Error(`invalid input`)
        const {id} = await Pizzas.create({name})
        if (validToppings.length) await Toppings_to_pizzas.bulkCreate(validToppings.map(topping_id => ({pizza_id: id, topping_id})))
        res.json(await getAllPizzas())
    } catch (err) {
        res.json({error:err.message})
    }
})

app.delete(`/deletePizza`, async (req, res) => {
    try {
        const {pizza_id} = req.body
        await Pizzas.destroy({
            where: {
                id: pizza_id
            }
        })
        await Toppings_to_pizzas.destroy({
            where: {
                pizza_id
            }
        })
        res.json(await getAllPizzas())
    } catch (err) {
        res.json({error:err.message})
    }
})

app.put(`/updatePizza`, async (req, res) => {
    try {
        const { pizza_id, name, toppings } = req.body
        const pizza = await Pizzas.findOne({where: { id: pizza_id }})
        if (!pizza) throw new Error(`invalid pizza id`)
        
        if (name) {
            pizza.name = name
            await pizza.save()
        }
        if (toppings) {

            const allPizzas = await getAllPizzas()
            if (allPizzas.find(pizza => pizza.name == name && pizza.id != pizza_id)) throw new Error(`Pizza already exists with that name`)
            const allToppings = (await Toppings.findAll()).map(({id}) => id)

            const currentPizza = allPizzas.find(({id}) => id == pizza_id)
            const currentToppings = currentPizza.toppings.map(({id}) => id)

            const toppingStrings = allPizzas.flatMap(({toppings,id}) => id == pizza_id ? [] : [JSON.stringify(toppings.map(({id}) => id).sort())])
            if (toppingStrings.includes(JSON.stringify([... new Set(toppings.filter(toppingId => allToppings.includes(toppingId)))].sort()))) throw new Error(`toppings create a duplicate pizza`)

            const toppingsToRemove = currentToppings.filter(toppingId => !toppings.includes(toppingId))
            if (toppingsToRemove.length) {
                Toppings_to_pizzas.destroy({
                    where: {
                        pizza_id,
                        topping_id: toppingsToRemove
                    }
                })
            }
            
            const toppingsToAdd = [... new Set(toppings.filter(toppingId => !currentToppings.includes(toppingId) && allToppings.includes(toppingId)))]
            if (toppingsToAdd.length) {
                Toppings_to_pizzas.bulkCreate(toppingsToAdd.map(topping_id => ({
                    topping_id,
                    pizza_id
                })))
            }
        }
        res.json(await getAllPizzas())
    } catch (err) {
        res.json({error:err.message})
    }
})

app.get(`/getToppings`, async (req,res) => {
    try {
        res.json(await Toppings.findAll())
    } catch (err) {
        res.json({error:err.message})
    }
})

app.post(`/addTopping`, async (req, res) => {
    try {
        const {name} = req.body
        const existingTopping = await Toppings.findOne({where: {name}})
        if (existingTopping) throw new Error(`duplicate record`)
        await Toppings.create({name})
        res.json(await Toppings.findAll())
    } catch (err) {
        res.json({error:err.message})
    }
})

app.delete(`/deleteTopping`, async (req, res) => {
    try {
        const {toppingId} = req.body
        await Toppings.destroy({where: {id: toppingId}})
        await Toppings_to_pizzas.destroy({where: {topping_id:toppingId}})
        res.json(await Toppings.findAll())
    } catch (err) {
        res.json({error:err.message})
    }
})

app.put(`/updateTopping`, async (req, res) => {
    try {
        const {toppingId, name} = req.body
        
        const existingTopping = await Toppings.findOne({where: {name,id:{[Sequelize.Op.not]:toppingId}}})
        if (existingTopping) throw new Error(`duplicate record`)

        const matchingTopping = await Toppings.findOne({where: {id:toppingId}})
        if (matchingTopping) {
            matchingTopping.name = name
            await matchingTopping.save()
            res.json(await Toppings.findAll())
        } else throw new Error(`invalid topping id`)
    } catch (err) {
        res.json({error:err.message})
    }
})

app.get(`/`, (req, res) => {
    res.sendFile(path.join(__dirname, `react-app`,`build`, `index.html`))
})


const server = app.listen(port, () => { console.log(`Started Server`) })

module.exports = server