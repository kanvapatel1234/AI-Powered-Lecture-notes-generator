import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


def generate_notes(video_id, transcript, mode):

    prompts = {

        "interview": """
You are an expert technical interviewer.

Create:

1. Important Concepts
2. Interview Questions
3. Answers
4. Follow-up Questions
5. Real World Use Cases

Keep answers concise and practical.
""",

        "short": """
Create concise revision notes.

Format:

# Key Concepts
# Important Points
# Quick Revision

Use bullet points.
Keep notes short and easy to revise.
""",

        "exam": """
Create exam-oriented notes.

Format:

1. Definitions
2. Important Concepts
3. Short Answer Questions
4. Long Answer Questions
5. Revision Notes

Suitable for semester exams.
"""
    }

    response = client.responses.create(
        model="gpt-4o-mini",
        input=f"""
{prompts[mode]}

Transcript:

{transcript}
"""
    )

    notes = response.output_text

    return notes