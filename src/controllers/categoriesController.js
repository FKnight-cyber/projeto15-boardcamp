import connection from "../dbStrategy/postgres.js";

export async function getCategories(req,res){
    let { order } = req.query;
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
        order= 'id';
    }
    try {
        const {rows: categories} = await connection.query(
            `SELECT * FROM categories 
            ORDER BY ${order.split(';')} ${config} 
            OFFSET $1 LIMIT $2 `,
            [offset,limit]);

        res.status(200).send(categories);
    } catch (error) {
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