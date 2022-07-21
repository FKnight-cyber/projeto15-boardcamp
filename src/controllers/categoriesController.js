import connection from "../dbStrategy/postgres.js";

export async function getCategories(req,res){
    try {
        const {rows: categories} = await connection.query('SELECT * FROM categories');
        res.status(200).send(categories);
    } catch (error) {
        res.sendStatus(500);
    }
}

export async function addCategory(req,res){
    try {
        const check = await connection.query(`SELECT * FROM categories WHERE name=${req.body}`);
        if(check) return res.status(409).send({message:'Categoria já cadastrada!'});
        await connection.query(`INSERT INTO categories (name) VALUES ('Terror')`);
        res.status(201).send('Inserido');
    } catch (error) {
        res.sendStatus(500);
    }
}