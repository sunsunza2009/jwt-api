const jwt = require("jsonwebtoken") 
const { key } = require("./config")

const auth = async (req,res,next)=>{
	let token = req.header("Authorization")
	let decode = null;
	try
	{
		decode = await jwt.verify(token,key)
		req.decode = decode
		next()
	} catch (err){
		console.error("Cannot verify token:\n"+err)
		res.status(401).send({error:err})
		return
	}
}
module.exports = auth