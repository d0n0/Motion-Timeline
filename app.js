const fs = require('fs');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const config = require('config');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const auth = require('basic-auth');
const dataStore = require('nedb');


const PORT = config.get('Server.port') || 3000;
const WATCHDIR = config.get('Server.watchDir') || `${__dirname}/rec`;
const USERNAME = config.get('Server.username');
const PASSWORD = config.get('Server.password');


const tokenDB = new dataStore({ filename: `${__dirname}/token/token.db`, autoload: true });
// Set token expiration time to 3 days
tokenDB.ensureIndex({ fieldName: 'createdAt', expireAfterSeconds: 259200 });

const formatData = pathStr => {
  const pathArr = pathStr.split(path.sep),
        dirName = pathArr[pathArr.length - 2],
        fileName = pathArr[pathArr.length - 1],
        Data = { dirName, fileName};
  return Data;
}


try {

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(express.static(`${__dirname}/client/build`));

  app.post('/api/login', (req, res) => {
    if ((USERNAME === req.body.username) && (PASSWORD === req.body.password)) {
      tokenDB.insert({ createdAt: new Date() }, (err, newToken) => {
        if (err) {
          throw err;
        } else {
          res.send({ status: 'ok', token: newToken });
          res.end();
        }
      });
    } else {
      res.send({ status: 'ng' });
      res.end();
    }
  });

  // Receive client's initial request to get all img info
  app.post('/api/docs', (req, res) => {
    const date = req.body.date;
    const token = req.body.token;
    tokenDB.findOne({ _id: token }, (err, result) => {
      if (err) {
        throw err;
      } else if (result === null) {
        res.status(400).send('Invalid token');
      } else {
        fs.readdir(`${WATCHDIR}/${date}`, (err, fileNames) => {
          if (err) {
            // if the directory does not exist
            res.send([]);
          } else {
            const imgFileNames = fileNames.filter(ele => {
              if (path.extname(ele) === ('.jpg' || '.jpeg')) {
                return true;
              }
            });
            res.send(imgFileNames);
          }
        });
      }
    });
});

// Receive requrests from client's <img src="id"> tag
app.get('/api/img/:dirName/:fileName', (req, res) => {
    const token = req.cookies.token;
    tokenDB.findOne({ _id: token }, (err, result) => {
      if (err) {
        throw err;
      } else if (result === null) {
        res.cookie('token', '', { expires: new Date(Date.now() - 10000) });
        res.sendFile(`${__dirname}/client/build/index.html`);
      } else {
        const filePath = `${WATCHDIR}/${req.params.dirName}/${req.params.fileName}`;
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
            const dummyImgPath = `${__dirname}/dummy/dummy.jpg`;
            res.sendFile(dummyImgPath, options, err => {
              if (err) {
                throw err;
              }
            });
          }
        });
      }
    });
  });

  // Receive file addition notification from Motion
  app.get('/api/notify/*/:dirName/:fileName', (req, res) => {
    const user = auth(req);

    if (!user || user.name !== USERNAME || user.pass !== PASSWORD) {
      res.status(401).send('Authentication Failed');
    } else {
      res.status(200).send('Authentication Success');
      const date = req.params.dirName;
      io.to(date).emit('add', req.params.fileName);
    }
  });

  app.get('*', (req, res) => {
    res.sendFile(`${__dirname}/client/build/index.html`);
  });

  io.on('connection', socket => {
    socket.on('join', msg => {
      tokenDB.findOne({ _id: msg.token }, (err, result) => {
        if (err) {
          throw err;
        } else {
          if (result !== null) {
            // leave other room
            for (room in socket.rooms) {
              if (socket.id !== room) socket.leave(room);
            }
            socket.join(msg.date);
          }
        }
      });
    });
  });

  server.listen(PORT, (err) => {
    if (err) {
      throw err;
    } else {
      console.log(`Start listening on *:${PORT}`);
    }
  });

} catch (err) {
  console.log(err);
}