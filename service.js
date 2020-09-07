const path = require('path')
const express = require('express')
const MongoClient = require('mongodb').MongoClient
const multer = require('multer')
const marked = require('marked')
const cors = require('cors');
const ObjectID = require('mongodb').ObjectID

const app = express()
const port = process.env.PORT || 3001
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/dev'

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

async function initMongo() {
  console.log('Initialising MongoDB...')
  let success = false
  while (!success) {
    try {
      client = await MongoClient.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      success = true
    } catch {
      console.log('Error connecting to MongoDB, retrying in 1 second')
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  console.log('MongoDB initialised')
  return client.db(client.s.options.dbName).collection('notes')
}

async function start() {
  const db = await initMongo()

  // app.set('view engine', 'pug')
  // app.set('views', path.join(__dirname, 'views'))
  app.use(express.static(path.join(__dirname, 'public')))

  app.get('/notes', async (req, res) => {
    let x = { notes: await retrieveNotes(db) }

    res.json(x);
    //res.render('index', { notes: await retrieveNotes(db) })
  })

  app.post('/note', async (req, res) => {
    await saveNote(db, { description: req.body.description })
    res.json({ notes: await retrieveNotes(db) })
  })

  app.delete('/note/:id', async (req, res) => {
    try{
    
      await db.deleteOne({_id:ObjectID(req.params.id)}, (err, obj) => {
        if(err) 
          throw err;
        //console.log(db.result.n + " Record(s) deleted successfully");
      })
      res.send('Got a DELETE request at /note')
    }catch(e){
      console.log(e)
    }
  })

  app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`)
  })
}

async function saveNote(db, note) {
  await db.insertOne(note)
}

async function retrieveNotes(db) {
  const notes = (await db.find().toArray()).reverse()
  let r = notes.map(it => {
    return { ...it, description: marked(it.description) }
  })

  return r;
}

start()
