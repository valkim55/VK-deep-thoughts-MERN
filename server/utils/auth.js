const jwt = require('jsonwebtoken');

const secret = 'mysecretssshhh';
const expiration = '2h';

module.exports = {
    // adding this function to handle accessing headers to get logged-in user's token info
    authMiddleware: function({ req }) {
        
        // this will allow the token to be sent via req.body/req.query/headers
        let token = req.body.token || req.query.token || req.headers.authorization;

        // separate the 'bearer' from 'tokenvalue'
        if(req.headers.authorization) {
            token = token 
                .split(' ')
                .pop()
                .trim();
        }

        // if not token found, return a req object as it is
        if(!token) {
            return req;
        }

        /* the reason you use try ... catch method is because you don't need to throw an error every time unauthenticated user makes request.
        you still want them to be able to see all thoughts so this method will mute the error.
        and whenever unauthorized user is trying to post a thought you'll add error handling on resolvers side */
        try {
            //decode and attach user data to request object
            /* this is where secret comes into play, if the secret in jwt.sign() doesn't match the one in jwt.verify() 
            the object won't be decoded. and if JWT verification fails - the error is thrown*/
            const { data } = jwt.verify(token, secret, { maxAge: expiration });
            req.user = data;
        } catch {
            console.log('Invalid token');
        }

        // return an updated request object
        return req;
    },

    // this function expects a user object and will add that user's username, email and _id properties to the token
    // expiration and secret are optional
    signToken: function({ username, email, _id }) {
        const payload = { username, email, _id};
        return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
    }
};