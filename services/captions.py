from youtube_transcript_api import YouTubeTranscriptApi


def extract_video_id(url):

    if "v=" in url:
        return url.split("v=")[1].split("&")[0]

    if "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]

    raise ValueError("Invalid URL")


def get_transcript(video_url):

    video_id = extract_video_id(video_url)

    ytt_api = YouTubeTranscriptApi()

    transcript = ytt_api.fetch(
        video_id,
        languages=["en", "hi"]
    )

    transcript_text = " ".join(
        snippet.text for snippet in transcript
    )

    return video_id, transcript_text