from flask import Flask, request, jsonify # type: ignore
from flask_cors import CORS # type: ignore
from youtube_transcript_api import YouTubeTranscriptApi # type: ignore
import requests # type: ignore
import os # type: ignore
from typing import Optional # type: ignore
from dotenv import load_dotenv # type: ignore
from openai import OpenAI # type: ignore
import re # type: ignore

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=os.getenv('OPENROUTER_API_KEY', ''), # type: ignore
)

# OpenRouter API configuration
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '')
OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

# Gemini API configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

@app.route('/transcript/<video_id>', methods=['GET'])
def get_transcript(video_id):
    """
    Get YouTube transcript for a given video ID
    Returns JSON with transcript data or error message
    """
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        
        # Format the transcript data
        formatted_transcript = []
        full_text = ""
        
        for entry in transcript:
            formatted_entry = {
                'text': entry['text'],
                'start': entry['start'],
                'duration': entry['duration']
            }
            formatted_transcript.append(formatted_entry)
            full_text += entry['text'] + " "
        
        return jsonify({
            'success': True,
            'video_id': video_id,
            'transcript': formatted_transcript,
            'full_text': full_text.strip()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'video_id': video_id
        }), 400

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'YouTube Transcript API is running'})

@app.route('/', methods=['GET'])
def home():
    """Home endpoint with API documentation"""
    return jsonify({
        'message': 'YouTube Transcript API with AI Summarization',
        'endpoints': {
            '/health': 'GET - Health check',
            '/transcript/<video_id>': 'GET - Get transcript for YouTube video',
            '/summary/<video_id>': 'GET - Get AI summary of YouTube video transcript (Gemini primary, DeepSeek fallback)'
        },
        'examples': {
            'transcript': '/transcript/CRraHg4Ks_g',
            'summary': '/summary/CRraHg4Ks_g'
        },
        'ai_models': {
            'primary': 'Google Gemini 2.0 Flash',
            'fallback': 'Microsoft Phi-4 Reasoning (via OpenRouter)'
        }
    })

def summarize_with_gemini(text: str) -> Optional[str]:
    """
    Summarize text using Gemini API
    """
    if not GEMINI_API_KEY:
        return None
    
    try:
        url = f"{GEMINI_BASE_URL}/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": f"You are a helpful assistant that creates concise, well-structured summaries of YouTube video transcripts. Focus on the main points, key insights, and important details. Format your response in a clear, readable way with bullet points or short paragraphs as appropriate.\n\nPlease summarize this YouTube video transcript:\n\n{text}"
                        }
                    ]
                }
            ]
        }
        
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'candidates' in data and len(data['candidates']) > 0:
                parts = data['candidates'][0].get('content', {}).get('parts', [])
                if parts and len(parts) > 0:
                    return parts[0].get('text', '')
        
        return None
        
    except Exception as e:
        print(f"Error summarizing with Gemini: {e}")
        return None

def summarize_with_deepseek(text: str) -> Optional[str]:
    """
    Summarize text using DeepSeek through OpenRouter API
    """
    if not OPENROUTER_API_KEY:
        return None
    
    try:
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "http://localhost:5123",
                "X-Title": "YouTube Transcript Summarizer",
            },
            model="microsoft/phi-4-reasoning:free",
            messages=[
                {
                    'role': 'system',
                    'content': 'You are a helpful assistant that creates concise, well-structured summaries of YouTube video transcripts. Focus on the main points, key insights, and important details. Format your response in a clear, readable way with bullet points or short paragraphs as appropriate.'
                },
                {
                    'role': 'user',
                    'content': f'Please summarize this YouTube video transcript:\n\n{text}'
                }
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        if completion.choices and len(completion.choices) > 0:
            return completion.choices[0].message.content
        
        return None
        
    except Exception as e:
        print(f"Error summarizing with DeepSeek: {e}")
        return None

def parse_and_format_markdown(text: str) -> dict:
    """
    Parse markdown-formatted text and return structured data for frontend rendering
    """
    if not text:
        return {'formatted_text': '', 'has_formatting': False}
    
    # Check if the text contains markdown formatting
    has_formatting = bool(
        re.search(r'\*\*.*?\*\*', text) or  # Bold text
        re.search(r'\*.*?\*', text) or      # Italic text
        re.search(r'^[\*\-\+]\s', text, re.MULTILINE) or  # Bullet points
        re.search(r'^\d+\.\s', text, re.MULTILINE) or     # Numbered lists
        re.search(r'^#+\s', text, re.MULTILINE) or        # Headers
        re.search(r'```.*?```', text, re.DOTALL)          # Code blocks
    )
    
    if not has_formatting:
        return {'formatted_text': text, 'has_formatting': False}
    
    # Parse different markdown elements
    sections = []
    current_section = {'type': 'paragraph', 'content': ''}
    
    lines = text.split('\n')
    in_list = False
    list_items = []
    
    for line in lines:
        line = line.strip()
        
        if not line:
            if current_section['content']:
                sections.append(current_section)
                current_section = {'type': 'paragraph', 'content': ''}
            if in_list and list_items:
                sections.append({'type': 'list', 'items': list_items})
                list_items = []
                in_list = False
            continue
        
        # Headers
        if re.match(r'^#+\s', line):
            if current_section['content']:
                sections.append(current_section)
            level = len(re.match(r'^(#+)', line).group(1))
            content = re.sub(r'^#+\s', '', line)
            sections.append({'type': 'header', 'level': level, 'content': content})
            current_section = {'type': 'paragraph', 'content': ''}
            continue
        
        # Bullet points
        if re.match(r'^[\*\-\+]\s', line):
            if current_section['content']:
                sections.append(current_section)
                current_section = {'type': 'paragraph', 'content': ''}
            
            if not in_list:
                in_list = True
                list_items = []
            
            content = re.sub(r'^[\*\-\+]\s', '', line)
            # Process inline formatting
            content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', content)
            content = re.sub(r'\*(.*?)\*', r'<em>\1</em>', content)
            list_items.append(content)
            continue
        
        # Numbered lists
        if re.match(r'^\d+\.\s', line):
            if current_section['content']:
                sections.append(current_section)
                current_section = {'type': 'paragraph', 'content': ''}
            
            if not in_list:
                in_list = True
                list_items = []
            
            content = re.sub(r'^\d+\.\s', '', line)
            # Process inline formatting
            content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', content)
            content = re.sub(r'\*(.*?)\*', r'<em>\1</em>', content)
            list_items.append(content)
            continue
        
        # Regular paragraph text
        if in_list and list_items:
            sections.append({'type': 'list', 'items': list_items})
            list_items = []
            in_list = False
        
        # Process inline formatting for paragraphs
        formatted_line = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', line)
        formatted_line = re.sub(r'\*(.*?)\*', r'<em>\1</em>', formatted_line)
        
        if current_section['content']:
            current_section['content'] += ' ' + formatted_line
        else:
            current_section['content'] = formatted_line
    
    # Add remaining content
    if in_list and list_items:
        sections.append({'type': 'list', 'items': list_items})
    elif current_section['content']:
        sections.append(current_section)
    
    return {
        'formatted_text': text,  # Keep original for fallback
        'has_formatting': True,
        'sections': sections
    }

@app.route('/summary/<video_id>', methods=['GET'])
def get_summary(video_id):
    """
    Get YouTube transcript summary for a given video ID using Gemini (first choice) or DeepSeek (fallback)
    Returns JSON with summary data or error message
    """
    try:
        # First get the transcript
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en', 'hi'])
        
        # Combine all transcript text
        full_text = " ".join([entry['text'] for entry in transcript])
        
        # Try Gemini first
        summary = summarize_with_gemini(full_text)
        print(f"Summary from Gemini: {jsonify(summary)}")
        
        # If Gemini fails, fallback to DeepSeek
        if not summary:
            print("Gemini API failed or unavailable, trying DeepSeek...")
            summary = summarize_with_deepseek(full_text)
        
        if summary:
            # Parse and format the summary if it contains markdown
            parsed_summary = parse_and_format_markdown(summary)
            return jsonify({
                'success': True,
                'video_id': video_id,
                'summary': parsed_summary,
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to generate summary. Please check API key configuration for both Gemini and OpenRouter.',
                'video_id': video_id
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'video_id': video_id
        }), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5123)