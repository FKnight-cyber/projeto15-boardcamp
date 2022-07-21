import connection from "../dbStrategy/postgres.js";

export async function addGame(req,res){
    try {
        const checkCategory = await connection.query(`
        SELECT * FROM categories WHERE id=${req.body.categoryId}`);

        if(!checkCategory) return res.status(400).send({message:'Categoria não cadastrada!'});

        const checkGame = await connection.query(`
        SELECT * FROM games WHERE name=${req.body.name}`);

        if(!checkGame) return res.status(400).send({message:'Este jogo já está cadastrado!'});

        await connection.query(
            `INSERT INTO games (name,image,stockTotal,categoryId,pricePerDay,categoryName)
            VALUES ('Banco Imobiliário','http://',3,1,1500,${checkCategory.name})`);

        res.status(201).send('Jogo Cadastrado!')
    } catch (error) {
        res.sendStatus(500);
    }
}

export async function getGames(req,res){
    let { name } = req.query;
    try {
        
        if(name){
            const { rows:games } = await connection.query(
                `SELECT * FROM games WHERE name=${name}`);
            return res.status(200).send(games);
        }

        const { rows:games } = await connection.query(`SELECT * FROM games`);
        res.status(200).send(games);
    } catch (error) {
        res.sendStatus(500);
    }
}