#!/usr/bin/env node

const fs           = require('fs'),
      express      = require('express'),
      app          = express(),
      server       = require('http').Server(app),
      io           = require('socket.io')(server),
      log4js       = require('log4js'),
      config       = require('config'),
      path         = require('path'),
      dataStore    = require('nedb'),
      bodyParser   = require('body-parser'),
      cookieParser = require('cookie-parser'),
      multer       = require('multer'),
      auth         = require('basic-auth');


const logger = log4js.getLogger();

// Global config.
const PORT     = config.get('Server.port') || 3001,
      SAVEDIR  = config.get('Server.saveDir'),
      USERNAME = config.get('Server.username'),
      PASSWORD = config.get('Server.password');


// Check config.
if (!path.isAbsolute(SAVEDIR)) {
  console.error(`saveDir '${SAVEDIR}' : Not absolute path.`);
  process.exit(1);
}
if (!fs.existsSync(SAVEDIR)) {
  console.error(`saveDir '${SAVEDIR}' : No such directory.`);
  process.exit(1);
}

// Store login token on nedb. Set token expiration time to 3 days.
const tokenDB = new dataStore({filename: path.join(__dirname, 'token.db'), autoload: true});
tokenDB.ensureIndex({fieldName: 'createdAt', expireAfterSeconds: 259200});


// Express Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client', 'build')));


// Handle login requests.
app.post('/api/login', (req, res) => {
  if ((USERNAME === req.body.username) && (PASSWORD === req.body.password)) {
    tokenDB.insert({createdAt: new Date()}, (err, newToken) => {
      if (err) {
        logger.error(err);
      } else {
        res.send({status: 'ok', token: newToken});
        res.end();
      }
    });
  } else {
    res.send({status: 'ng'});
    res.end();
  }
});

// Handle requests for file names with specific dates.
app.post('/api/docs', (req, res) => {
  const date = req.body.date;
  const token = req.body.token;
  tokenDB.findOne({_id: token}, (err, result) => {
    if (err) {
      logger.error(err);
    } else if (result === null) {
      res.status(400).send('Invalid token');
    } else {
      fs.readdir(path.join(SAVEDIR, date), (err, fileNames) => {
        if (err) {
          res.send([]); // if the directory does not exist.
        } else {
          const imgFileNames = fileNames.filter(ele => path.extname(ele) === ('.jpg' || '.jpeg'));
          res.send(imgFileNames);
        }
      });
    }
  });
});

// Handle image binary data request.
app.get('/api/img/:dirName/:fileName', (req, res) => {
  const token = req.cookies.token;
  tokenDB.findOne({_id: token}, (err, result) => {
    if (err) {
      logger.error(err);
    } else if (result === null) {
      res.cookie('token', '', {expires: new Date(Date.now() - 10000)});
      res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
    } else {
      const filePath = path.join(SAVEDIR, req.params.dirName, req.params.fileName);
      const options = {
        root: '/',
        dotfiles: 'deny',
        headers: {
          'Content-Type': 'image/jpeg'
        }
      };
      res.sendFile(filePath, options, err => {
        if (err) {
          // when file can not be found
          const dummyImgPath = path.join(__dirname, 'dummy', 'dummy.jpg');
          res.sendFile(dummyImgPath, options, err => {
            if (err) {
              logger.error(err);
            }
          });
        }
      });
    }
  });
});

// Handle authentication when images are uploaded from motion.py.
const uploadAuth = (req, res, next) => {
  const user = auth(req);
  if (!user || user.name !== USERNAME || user.pass !== PASSWORD) {
    res.status(401).send('Authorization Failed');
  } else {
    res.status(200).send('Authorization Success');
    next()
  }
}

// Handle saving of uploaded images from motion.py.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir_path = path.join(SAVEDIR, req.params.dirName);
    if (!fs.existsSync(dir_path)) {
      fs.mkdirSync(dir_path);
    }
    cb(null, dir_path);
  },
  filename: (req, file, cb) => {
    cb(null, req.params.fileName);
  },
});
const upload = multer({storage: storage});

// Handle image upload requests.
app.post('/api/upload/:dirName/:fileName', uploadAuth, upload.single('image'), (req, res) => {

  const date = req.params.dirName;
  io.to(date).emit('add', req.params.fileName);
});

// Handle other request.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Handle socket.io room entry /exit request.
io.on('connection', socket => {
  socket.on('join', msg => {
    tokenDB.findOne({_id: msg.token}, (err, result) => {
      if (err) {
        logger.error(err);
      } else {
        if (result !== null) {
          // leave other room
          for (room in socket.rooms) {
            if (socket.id !== room) {
              socket.leave(room);
            }
          }
          socket.join(msg.date);
        }
      }
    });
  });
});

server.listen(PORT, err => {
  if (err) {
    logger.error(err);
  } else {
    console.log(`Start listening on *:${PORT}`);
  }
});