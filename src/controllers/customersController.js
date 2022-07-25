import connection from "../dbStrategy/postgres.js";

export async function getCustomers(req,res){
    let { cpf,order } = req.query;
    const { offset,limit,desc } = req.query;
    let config = 'ASC';
    if(desc){
        config = 'DESC'
    }
    if(order){
        if(!isNaN(order)){
            return res.status(409).send({message:'ordenação inválida!'})
        }
    }else{
        order = 'id';
    }
    try {

        if(cpf){
            if(/[a-zA-Z]/.test(cpf)){
                return res.status(409).send({message:'cpf inválido!'})
            }
            const { rows:customers } = await connection.query(
                `SELECT * FROM customers 
                WHERE cpf LIKE '%${cpf}%'
                ORDER BY ${order} ${config} 
                OFFSET $1 LIMIT $2`,[offset,limit]);
            return res.status(200).send(customers);
        }

        const { rows:customers } = await connection.query(`
        SELECT * FROM customers
        ORDER BY ${order} ${config}
        OFFSET $1 LIMIT $2`,[offset,limit]);

        res.status(200).send(customers);
    } catch (error) {
        res.sendStatus(500);
    }
}

export async function getCustomersById(req,res){
    const { id } = req.params;
    if(isNaN(parseInt(id))){
        return res.status(409).send({message:'id inválido!'});
    }
    try {
        const { rows:customers } = await connection.query(
            `SELECT * FROM customers WHERE id = $1`,[id]);
        if(!customers) return res.status(404).send({message:'Cliente não cadastrado!'})    
        res.status(200).send(...customers);
    } catch (error) {
        res.sendStatus(500);
    }
}

export async function addCustomers(req,res){
    const { name,cpf,phone,birthday } = req.body;
    try {
        const { rows:checkCPF } = await connection.query(`
        SELECT * FROM customers WHERE cpf=$1`,[cpf]);

        if(checkCPF.length > 0) return res.status(409).send({message:'CPF já cadastrado!'});

        await connection.query(`
        INSERT INTO customers (name,cpf,phone,birthday) 
        VALUES ($1,$2,$3,$4)`,[name,cpf,phone,birthday]);
      
        res.status(200).send('OK');
    } catch (error) {
        res.sendStatus(500);
    }
}

export async function updateCustomer(req,res){
    const { id } = req.params;
    const { name,cpf,phone,birthday } = req.body;

    try {
        await connection.query(`
        UPDATE customers 
        SET name=$1,cpf=$2,phone=$3,birthday=$4
        WHERE id=$5`,[name,cpf,phone,birthday,id]);

        res.status(200).send('OK');
    } catch (error) {
        res.sendStatus(500);
    }
}