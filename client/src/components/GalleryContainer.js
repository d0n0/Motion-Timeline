import { compose } from 'react-komposer';
import React from 'react';
import io from 'socket.io-client';
import Gallery from './Gallery.js';
import Cookies from 'js-cookie';

const socket = io.connect();

const receiveDocs = (props, onData) => {

  let buffer;
  const token = Cookies.get('token');
  const date = props.date;

  console.time('fetch list');

  fetch('/api/docs', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ date, token })
  })
  .then(res => {
    if (res.ok) {
      return res.json();
    } else {
      throw new Error('fetch error');
    }
  })
  .then(fileNames => {
    // Descending sort
    fileNames.sort();
    fileNames.reverse();

    onData(null, { dirName: date, fileNames: fileNames });

    console.log(`${fileNames.length} imgs`);
    console.timeEnd('fetch list');

    buffer = fileNames;
  })
  .catch(err => {
    console.log(err);
  });
  
  socket.emit('join', { date: props.date, token: token });

  socket.on('connect', (msg) => {
    console.log('(socket.io) connected');
  });
  
  socket.on('add', fileName => {
    if (props.autoUpdate === true) {
      const newFileNames = [ fileName, ...buffer ];
      onData(null, { dirName: date, fileNames: newFileNames });
      buffer = newFileNames;
    }
  });
}

const options = {
  loadingHandler: () => <div className="message">Loading...</div>
}

export default compose(receiveDocs, options)(Gallery);