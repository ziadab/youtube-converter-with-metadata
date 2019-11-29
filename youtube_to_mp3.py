from __future__ import unicode_literals
from youtube_dl import YoutubeDL
from pprint import pprint
import requests
import json
import os
from utils import *


options = {
    'format': 'bestaudio/best',
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
        'preferredquality': '192',
    }],     # convert to mp3
    'outtmpl': '%(id)s.%(ext)s',        # name the file the ID of the video
    'noplaylist': True,
}

ydl = YoutubeDL(options)
r = None
url = "https://www.youtube.com/watch?v=XbGs_qK2PQA"
with ydl:
    r = ydl.extract_info(url, download=False)
    artist, track = findTrackAndArtist(r.get("title"))
    if artist == None or track == None:
        print("Sorry I couldn't find artist and track in title")
        print("So please can u give me it to put the data on it ?")
        artist = input("Artist Name: ")
        track = input('Track Name: ')
        os.system(
            'node index.js --artist="{}" --track="{}" --file="{}".mp3 --id="{}"'.format(artist, track, r.get("id"), r.get("id")))
    else:
        os.system(
            'node index.js --artist="{}" --track="{}" --file="{}".mp3 --id="{}"'.format(artist, track, r.get("id"), r.get("id")))
