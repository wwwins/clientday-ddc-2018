# -*- coding: utf-8 -*-
import cv2
import sys
import time
import urllib2
import subprocess
from ticket import ticket
import dlib


HOST = 'http://localhost:8080'
TYPE_GIRL = '2608663075';
TYPE_MAN = '3483355998';
TYPE_WOMAN = '4256377746';
TYPE_DAD = '3483394798';

DEBUG = False
VOICE = True
HTTP = True
FRAME_WIDTH = 320*2
FRAME_HEIGHT = 240*2

#detector_path = sys.argv[1]
#detector = dlib.simple_object_detector("detector-dad.svm")

detectors = []
svm_filenames = ["detector-dad.svm", "detector-girl.svm", "detector-woman.svm", "detector-man.svm"]
for f in svm_filenames:
    obj_detector = dlib.fhog_object_detector(f)
    detectors.append(obj_detector)

video_capture = cv2.VideoCapture(0)
video_capture.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_WIDTH)
video_capture.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT)

time.sleep(1)
t = ticket()
startTime = time.time()

def httpGet(contents):
    if HTTP:
        urllib2.urlopen(HOST+'/id/'+contents)

def sayit(contents):
    if VOICE:
        subprocess.Popen(['say', contents])
    if DEBUG:
        print('say:'+contents)

def dlibCardDetect(gray):

    global startTime
    [boxes, confidences, detector_idxs] = dlib.fhog_object_detector.run_multiple(detectors, gray, upsample_num_times=0, adjust_threshold=0.0)
    # Drawing a rectangle
    #boxes = detector(gray)
    if len(detector_idxs)>0:
        if DEBUG:
            print(boxes, detector_idxs)
        if (time.time()-startTime)>2:
            startTime = time.time()
            if detector_idxs[0]==0.0:
                httpGet(TYPE_DAD)
                sayit('爸爸')
            if detector_idxs[0]==1.0:
                httpGet(TYPE_GIRL)
                sayit('哈韓')
            if detector_idxs[0]==2.0:
                httpGet(TYPE_WOMAN)
                sayit('單身熟女')
            if detector_idxs[0]==3.0:
                httpGet(TYPE_MAN)
                sayit('型男')
    
    for i, d in enumerate(boxes):
        if DEBUG:
            print("Detection {}: Left: {} Top: {} Right: {} Bottom: {}".format(i, d.left(), d.top(), d.right(), d.bottom()))
        cv2.rectangle(frame, (d.left(), d.top()), (d.right(), d.bottom()), (0, 255, 0), 2)
    return frame

while True:
    # Capture frame-by-frame
    _,frame = video_capture.read()
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    result = dlibCardDetect(gray)
    t.display()
    cv2.imshow('Video', result)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# When everything is done, release the capture
video_capture.release()
cv2.destroyAllWindows()
