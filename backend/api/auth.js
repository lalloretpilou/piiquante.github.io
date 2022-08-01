const jwt = require('jsonwebtoken');
 
/*
// Permet de vérifier que l'utilisateur est connecté grâce au TOKEN
*/
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
       const userId = decodedToken.userId;
       req.auth = {
        userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};