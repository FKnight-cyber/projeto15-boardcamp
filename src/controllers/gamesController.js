import connection from "../dbStrategy/postgres.js";

export async function addGame(req,res){
    const { name,categoryId,image,stockTotal,pricePerDay } = req.body;
    try {
        const { rows:checkCategory } = await connection.query(`
        SELECT * FROM categories WHERE id=$1`,[categoryId]);

        if(!checkCategory.length > 0) return res.status(400).send({message:'Categoria não cadastrada!'});

        const { rows:checkGame } = await connection.query(`
        SELECT * FROM games WHERE name=$1`,[name]);

        if(checkGame.length > 0) return res.status(400).send({message:'Este jogo já está cadastrado!'});

        await connection.query(
            `INSERT INTO games (name,image,"stockTotal","categoryId","pricePerDay")
            VALUES ($1,$2,$3,$4,$5)`,
            [name,image,stockTotal,categoryId,pricePerDay]);

        res.status(201).send('Jogo Cadastrado!')
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }
}

export async function getGames(req,res){
    let { name,order } = req.query;
    const { offset,limit,desc } = req.query;
    let config = 'ASC';
    if(desc){
        config = 'DESC';
    }
    if(order){
        if(!isNaN(order)){
            return res.status(409).send({message:'ordenação inválida!'})
        }
    }else{
        order = 'id';
    }
    try {   
        if(name){
            if(!isNaN(name)) return res.status(409).send({message:'Nome inválido!'})
            const { rows:games } = await connection.query(
                `SELECT g.*,c.name as "categoryName" FROM games g
                JOIN categories c
                ON c.id = g."categoryId" 
                WHERE g.name ILIKE '%${name}%'
                ORDER BY ${order.split(';')} ${config}
                OFFSET $1 LIMIT $2
                `,[offset,limit]);
            return res.status(200).send(games);
        }

        const { rows:games } = await connection.query(
            `SELECT g.*,c.name as "categoryName" FROM games g
            JOIN categories c
            ON c.id = g."categoryId"
            ORDER BY ${order} ${config}
            OFFSET $1 LIMIT $2`
            ,[offset,limit]);

        res.status(200).send(games);
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }
}