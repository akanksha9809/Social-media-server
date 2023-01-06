const mongoose = require('mongoose');

module.exports = async() => {
    const mongoUri = 'mongodb+srv://akanksha:q9r2ZJLTS6VmJAZN@cluster0.scmyfrl.mongodb.net/?retryWrites=true&w=majority';
    
    try {
        const connect = await mongoose.connect(
            mongoUri,
            {
                useNewUrlParser: true, 
                useUnifiedTopology: true
            });
        console.log(`MongoDB connected: ${connect.connection.host}`);    
    } catch (error) {
        console.log(error);
        process.exit(1);
    }

    
}