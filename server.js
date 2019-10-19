const express = require("express")
const bcrypt = require("bcryptjs") 
const mongodb = require("mongodb")
const jwt = require("jsonwebtoken") 
const auth = require("./auth")
const app = express()
const { port, key } = require("./config")
app.use(express.json())


app.post("/register", async(req,res)=>{
	let name = req.body.name
	let email = req.body.email
	let stuId = req.body.stuId
	let pass = await bcrypt.hash(req.body.password, 8)

	let user = {
		name:name,
		email:email,
		studentId: stuId,
		password: pass
	}

	const client = await require("./db.js")
	const db = client.db('BUU')
	const r = await db.collection("User").insertOne(user).catch((err)=>{
		console.error("Cannot insert to db:\n"+err)
		res.status(500).send({error:err})
		return
	})
	let result = {
		id: user._id,
		name:user.name,
		email:user.email,
		studentId: user.studentId
	}
	res.status(201).send(result)
})

app.post("/signin", async(req,res)=>{
	let email = req.body.email
	let pass = req.body.password

	const client = await require("./db.js")
	const db = client.db('BUU')
	let user = await db.collection("User").findOne({email:email}).catch((err)=>{
		console.error("Cannot find user in db:\n"+err)
		res.status(500).send({error:err})
		return
	})

	if(!user)
	{
		res.status(401).send({error:"Username or Password is not match"})
		return
	}

	let isvaild = await bcrypt.compare(pass,user.password)

	if(!isvaild)
	{
		res.status(401).send({error:"Username or Password is not match"})
		return
	}
	const expir = 15
	let token = await jwt.sign({email:user.email,id:user._id},key,{expiresIn:expir})

	res.status(200).send({token:token})
})

app.get("/me",auth,async (req,res)=>{	
	const client = await require("./db.js")
	const db = client.db('BUU')
	let user = await db.collection("User").findOne({_id:mongodb.ObjectId(req.decode.id)}).catch((err)=>{
		console.error("Cannot find user in db:\n"+err)
		res.status(500).send({error:err})
		return
	})
	if(!user)
	{
		res.status(401).send({error:"Username or Password is not match"})
		return
	}
	delete user.password
	res.send(user)
})

app.put("/me",auth, async(req,res)=>{
	let email = req.body.email
	if(email == null || email == ""){
		res.status(400).send({message:"Email should not be null"})
	}
	const client = await require("./db.js")
	const db = client.db('BUU')
	let user = await db.collection("User").findOne({_id:mongodb.ObjectId(req.decode.id)}).catch((err)=>{
		console.error("Cannot find user in db:\n"+err)
		res.status(500).send({error:err})
		return
	})
	if(!user)
	{
		res.status(401).send({error:"Username or Password is not match"})
		return
	}
	let p = {email:email}
	var result = await db.collection("User").updateOne({_id:mongodb.ObjectID(req.decode.id)},{ $set: p})
	if(result)
		res.send({message:"Update is successful"})
	else
		res.status(500).send({message:"Update is unsuccessful"})
})

app.listen(port,()=>{console.log("Running on port "+port)})