
require('./config/db')
const app=require('express')();

const port =process.env.PORT || 3000;

const bodyParser=require('express').json;
app.use(bodyParser());

const UserRouter=require('./api/User');

app.use('/user',UserRouter)
app.listen(port,()=>{
    console.log(`server running on port ${port}`)
})
