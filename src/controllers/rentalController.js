import connection from "../dbStrategy/postgres.js";

export async function getRentals(req,res){
    let { order } = req.query;
    const { customerId,gameId,offset,limit,desc,status } = req.query;
    let joinRentalCustomer = [];
    let ordernation = '';
    let config = 'ASC';
    if(desc){
        config = 'DESC';
    }
    if(order){
        if(!isNaN(order)){
            return res.status(409).send({message:'ordenação inválida!'});
        }
    }else{
        order = 'rentalId';
    }
    if(status === 'closed'){
      ordernation = 'WHERE r."returnDate" IS NOT NULL';
    }
    if(status === 'open'){
      ordernation = 'WHERE r."returnDate" IS NULL';
    } 
    try {
        if(customerId){
            const { rows:rentalsByCustomer } = await connection.query(`
                SELECT r.*,r.id as "rentalId",c.id,c.name as "customerName",g.id,g.name,g."categoryId",cat.name as "categoryName"
                FROM rentals r
                JOIN customers c
                ON r."customerId"=c.id
                JOIN games g
                ON r."gameId"=g.id
                JOIN categories cat
                ON g."categoryId"=cat.id
                WHERE r."customerId" = $1
                ${ordernation}
                ORDER BY "${order.split(';')}" ${config} 
                OFFSET $2 LIMIT $3`,[Number(customerId),offset,limit]);

                joinRentalCustomer = rentalsByCustomer.map((rental)=>({
                    id:rental.rentalId,
                    customerId:rental.customerId,
                    gameId:rental.gameId,
                    rentDate:rental.rentDate,
                    daysRented:rental.daysRented,
                    returnDate:rental.returnDate,
                    originalPrice:rental.originalPrice,
                    delayFee:rental.delayFee,
                    customer: {
                      id: rental.customerId,
                      name: rental.customerName
                    },
                    game: {
                      id: rental.gameId,
                      name: rental.name,
                      categoryId: rental.categoryId,
                      categoryName: rental.categoryName
                    }
                  }));
        }else if(gameId){
            const { rows:rentalsByGame } = await connection.query(`
                SELECT r.*,r.id as "rentalId",c.id,c.name as "customerName",g.id,g.name,g."categoryId",cat.name as "categoryName"
                FROM rentals r
                JOIN customers c
                ON r."customerId"=c.id
                JOIN games g
                ON r."gameId"=g.id
                JOIN categories cat
                ON g."categoryId"=cat.id
                WHERE r."gameId" = $1
                ${ordernation}
                ORDER BY "${order.split(';')}" ${config} 
                OFFSET $2 LIMIT $3`,[Number(gameId),offset,limit]);

                const joinRentalGame = rentalsByGame.map((rental)=>({
                    id:rental.rentalId,
                    customerId:rental.customerId,
                    gameId:rental.gameId,
                    rentDate:rental.rentDate,
                    daysRented:rental.daysRented,
                    returnDate:rental.returnDate,
                    originalPrice:rental.originalPrice,
                    delayFee:rental.delayFee,
                    customer: {
                      id: rental.customerId,
                      name: rental.customerName
                    },
                    game: {
                      id: rental.gameId,
                      name: rental.name,
                      categoryId: rental.categoryId,
                      categoryName: rental.categoryName
                    }
                  }));

            const joinRentals = [...joinRentalCustomer,...joinRentalGame];

            return res.status(200).send(joinRentals);
        }

        if(customerId) return res.status(200).send(joinRentalCustomer);
    
        const { rows:rentals } = await connection.query(`
        SELECT r.*,r.id as "rentalId",c.id,c.name as "customerName",g.id,g.name,g."categoryId",cat.name as "categoryName"
        FROM rentals r
        JOIN customers c
        ON r."customerId"=c.id
        JOIN games g
        ON r."gameId"=g.id
        JOIN categories cat
        ON g."categoryId"=cat.id
        ${ordernation}
        ORDER BY "${order.split(';')}" ${config} 
        OFFSET $1 LIMIT $2`,[offset,limit]);

        const joinRentals = rentals.map((rental)=>({
            id:rental.rentalId,
            customerId:rental.customerId,
            gameId:rental.gameId,
            rentDate:rental.rentDate,
            daysRented:rental.daysRented,
            returnDate:rental.returnDate,
            originalPrice:rental.originalPrice,
            delayFee:rental.delayFee,
            customer: {
              id: rental.customerId,
              name: rental.customerName
            },
            game: {
              id: rental.gameId,
              name: rental.name,
              categoryId: rental.categoryId,
              categoryName: rental.categoryName
            }
          }));
     
        res.status(200).send(joinRentals);
    } catch (error) {
        res.sendStatus(500);
    }
}

export async function addRental(req,res){
    const { customerId,gameId,daysRented } = req.body;
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    try {
        const { rows:game } = await connection.query(`
        SELECT * FROM games
        WHERE games.id = $1
        `,[gameId]);

        if(!game.length > 0) return res.status(400).send({message:'Jogo não cadastrado!'});

        const { rows:customer } = await connection.query(`
        SELECT * FROM customers 
        WHERE customers.id = $1
        `,[customerId]);

        if(!customer.length > 0) return res.status(400).send({message:'Consumidor não cadastrado!'});
        
        const price = game[0].pricePerDay * daysRented;

        await connection.query(`
        INSERT INTO rentals ("customerId","gameId",
        "daysRented","rentDate",
        "originalPrice","returnDate","delayFee")
        VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [customerId,gameId,daysRented,today.toISOString(),price,null,null]);

        res.status(201).send('Aluguel inserido!');
    } catch (error) {
        res.sendStatus(500);
    }
}

export async function endRent(req,res){
  const { id } = req.params;

  if(isNaN(parseInt(id))) return res.status(404).send({message:'Id inválido!'});
  try {
    const { rows:rent } = await connection.query(`
    SELECT r."rentDate",r."gameId",r."daysRented",r."delayFee" FROM rentals r
    WHERE id = $1`,[id]);
    
    if(!rent.length > 0) return res.status(404).send({message:'Id inválido!'});
    if(rent[0].delayFee !== null) return res.status(400).send({message:'Aluguel já foi finalizado!'});
    const rentedDays = parseInt((Date.now() - rent[0].rentDate.getTime())/(24*60*60*1000));

    let delayFee = 0;
    if(rentedDays > rent[0].daysRented){
      const { rows:game } = await connection.query(`
      SELECT g."pricePerDay" FROM games g
      WHERE id = $1`,[rent[0].gameId]);

      delayFee = game[0].pricePerDay * (rentedDays - rent[0].daysRented);
    }

    const todayDate = new Date().toISOString();

    await connection.query(`
    UPDATE rentals
    SET "returnDate"=$1,"delayFee"=$2
    WHERE id = $3`,[todayDate,delayFee,id]);
    
   res.sendStatus(200);
  } catch (error) {
      res.sendStatus(500);
  }
}

export async function deleteRent(req,res){
  const { id } = req.params;
  if(isNaN(parseInt(id))) return res.status(404).send({message:'Id inválido!'});
  try {
    const { rows:rent } = await connection.query(`
    SELECT r."returnDate",r."id"
    FROM rentals r
    WHERE r.id = $1`,[id]);

    if(rent[0].returnDate !== null){
      await connection.query(`
      DELETE FROM rentals r
      WHERE id = $1`,[id]);

      return res.sendStatus(200);
    }
    return res.status(400).send({message:'Esse aluguel ainda não foi finalizado!'});
  } catch (error) {
    res.sendStatus(500);
  }
}