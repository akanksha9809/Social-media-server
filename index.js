const express = require('express');
const dotenv = require('dotenv');
const dbConnect = require('./dbConnect');
const authRouter = require('./routers/authRouter');
const postRouter = require('./routers/postRouter');
const morgan = require('morgan');

dotenv.config('./env');

const app = express();

//middlewares
app.use(express.json());
app.use(morgan('common'));

app.use('/auth', authRouter);
app.use('/posts', postRouter);
app.get("/", (req,res) => {
    res.status(200).send('OK from server');
})

const PORT = process.env.PORT || 4001;

dbConnect();
app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});




