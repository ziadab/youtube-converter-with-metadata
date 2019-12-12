from __future__ import unicode_literals
from youtube_dl import YoutubeDL
from pprint import pprint
from utils import *
import sys
import os


options = {
    'format': 'bestaudio/best',
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
        'preferredquality': '192',
    }],
    'outtmpl': '%(id)s.%(ext)s',        # name the file the ID of the video
    'noplaylist': True,
}

ydl = YoutubeDL(options)
r = None
url = str(sys.argv[1:][0])
with ydl:
    r = ydl.extract_info(url, download=True)
    try:
        artist, track = findTrackAndArtist(r.get("title"))
    except:
        artist, track = None, None
    if artist == None or track == None:
        print("Sorry I couldn't find artist and track in title")
        print("So please can u give me it to put the data on it ?")
        artist = input("Artist Name: ")
        track = input('Track Name: ')
        os.system(
            'node index.js --youtubeTitle="{}" --artist="{}" --track="{}" --file="{}.mp3" --type={}'.format(r.get("title"), artist, track, r.get("id"), getType(r.get('title'))))
    else:
        if "," in artist:
            print("I couldn't get the main artist")
            print("So please can you give it to me ^_^")
            artist = input("Artist name: ")
        else:
            os.system(
                'node index.js --youtubeTitle="{}" --artist="{}" --track="{}" --file="{}.mp3" --type={}'.format(r.get("title"), artist, track, r.get("id"), getType(r.get('title'))))
