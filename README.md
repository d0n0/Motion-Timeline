# Motion-Timeline

Motion-Timeline is a program that detects motion with a web camera, saves images, and provides Web UI.


## Description
Motion-Timeline consists of two programs.

### motion-detector
motion-detector detects motion with a web camera and send the images to the server.

### motion-server
motion-server saves images received from motion-detector and provides a Web UI for viewing images.


## Demo
![](https://user-images.githubusercontent.com/19512599/32275626-50e23842-bf4f-11e7-8f34-74fc52866f5f.gif)


## Requirement
- Webcam
- node.js ≧6.x
- python  2|3
- OpenCV  2|3

## Install
raspbian, debian, ubuntu

### If you don't have OpenCV installed.
```
$ sudo apt install libopencv-dev
$ sudo apt install python-opencv
```

### Install modules
```
$ pip install requrests
$ cd /path/to/project/dir
$ npm install
```

### Edit Configurations
#### motion-server
Edit `config/default.json`

#### motion-detector
Edit variable declaration in `motion-detector.py`

### Run scripts with pm2

```
$ npm install -g pm2
$ pm2 start motion-server.js
$ pm2 start motion-detector.py
```

### Run scripts with systemd
#### Edit and copy .service files
```
$ sudo cp ./motion-server.service /etc/systemd/system/
$ sudo cp ./motion-detector.service /etc/systemd/system/
$ sudo systemctl daemon-reload
```

#### Start daemon
```
$ sudo systemctl start motion-server
$ sudo systemctl start motion-detector
```

## License
[MIT](https://github.com/dono/Motion-Timeline/blob/master/LICENSE)