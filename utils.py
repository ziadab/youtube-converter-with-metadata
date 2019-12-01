def findTrackAndArtist(title):
    if "(" in title:
        text = title.split("(")[0]
        if "-" in text:
            return text.split("-")
        else:
            return None, None

    elif "[" in title:
        text = title.split("[")[0]
        if "-" in text:
            return text.split("-")
        else:
            return None, None

    elif "|" in title:
        text = title.split("|")[0]
        if "-" in text:
            return text.split("-")
        else:
            return None, None

    elif "{" in title:
        text = title.split("{")[0]
        if "-" in text:
            return text.split("-")
        else:
            return None, None

    elif "-" in title:
        return title.split("-")
    else:
        return None, None


def getType(title):
    if "album" in title.lower():
        return "album"
    else:
        return "track"
