const express = require('express')
//-----//
const app = express()

app.listen(3000)

app.use(express.static('public'))

app.get('/', (req, res)=>{
  console.log(req)
  res.send('index.html')
})
