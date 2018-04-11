#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cv2
import numpy as np
import time
import datetime
import os
import sys
import logging
import threading
import requests


device = 0                    # Device number of webcam. Numbers are assigned from 0.
threshold = 30                # Threshold of mask image. The higher the value, the lower the sensitivity becomes.
size = (640, 480)             # Image size to be saved; (width, height).
fps = 3                       # FPS when capturing images within event.
url = 'http://localhost:3001' # motion-server.js URL.
auth = ('user', 'pass')       # Login username and password; (user, pass).



def event():
    now = datetime.datetime.now()
    dt = now.strftime('%Y-%m-%d')
    tm = now.strftime('%H-%M-%S')

    for i in range(fps):
        _, image = cam.read()

        file_name = '{}_{}.jpg'.format(tm, str(i+1)) # hh-mm-ss_frame.png

        _, image_enc = cv2.imencode('.jpg', cv2.resize(image, size))

        post_url = os.path.join(url, 'api', 'upload', dt, file_name)
        files = {'image': ('filename', image_enc.tostring(), 'image/jpeg')}

        def post_image():
            try:
                requests.post(post_url, files=files, auth=auth)
            except:
                # logging.error(sys.exc_info())
                logging.error('Request error')

        t = threading.Thread(target=post_image)
        t.setDaemon(True)
        t.start()

        time.sleep(1/fps)


# frame_diff() use Frame Difference Method and return True when moving objects are detected.
def frame_diff(images):
    # Grayscale image list.
    gray_images = [cv2.cvtColor(im, cv2.COLOR_RGB2GRAY) for im in images]

    diff1 = cv2.absdiff(gray_images[0], gray_images[1])
    diff2 = cv2.absdiff(gray_images[1], gray_images[2])

    intersection = cv2.bitwise_and(diff1, diff2)

    # Binarization.
    _, mask = cv2.threshold(intersection, threshold, 255, cv2.THRESH_BINARY)

    # Remove salt-and-pepper noize; kernel size is 7.
    mask = cv2.medianBlur(mask, 7)

    if np.any(mask):
        return True

    return False


if __name__ == '__main__':

    logging.basicConfig(format='%(asctime)s %(levelname)s: %(message)s',
                        datefmt='%Y/%m/%d %H:%M:%S')
    logging.getLogger().setLevel(logging.INFO)

    cam = cv2.VideoCapture(device)

    if not cam.isOpened():
        logging.error('Camera device[{}] not found.'.format(device))
        sys.exit(1)
    
    logging.info('Start motion detection...')

    images = [cam.read()[1] for _ in range(3)]

    while cam.isOpened():
        if frame_diff(images):
            event()

        images[0] = images[1]
        images[1] = images[2]
        _, images[2] = cam.read()
