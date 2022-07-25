import connection from "../dbStrategy/postgres.js";

export async function getCategories(req,res){
    const { offset,limit } = req.query;
    try {
        const {rows: categories} = await connection.query(
            'SELECT * FROM categories OFFSET $1 LIMIT $2',
            [offset,limit]);

        res.status(200).send(categories);
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }
}

export async function addCategory(req,res){
    const { name } = req.body;
    try {
        const {rows:check} = await connection.query(`SELECT * FROM categories WHERE name=$1`,[name]);
        if(check.length > 0) return res.status(409).send({message:'Categoria já cadastrada!'});
        await connection.query(`INSERT INTO categories (name) VALUES ($1)`,[name]);
        res.status(201).send('Inserido');
    } catch (error) {
        res.sendStatus(500);
    }
}