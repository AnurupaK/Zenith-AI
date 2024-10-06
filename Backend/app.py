from flask import Flask, request, jsonify, render_template
import sys
import os


sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'AI_Service')))
from AIResponse import get_whisper, get_gemini_response

app = Flask(__name__, template_folder="../Frontend/templates", static_folder="../Frontend/static")


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/get_voice_response_from_whisper', methods=['POST'])
def voice_response():

    if request.content_type == 'application/octet-stream':
        audio_data = request.data
        audio_file_path = 'temp_audio.wav'
        
       
        with open(audio_file_path, 'wb') as f:
            f.write(audio_data)
        

        transcription_text = get_whisper(audio_file_path)
        print("Transcription Text:", transcription_text)
        Bot_response = get_gemini_response(transcription_text)

        return jsonify({'User_Voice':transcription_text,"Bot_Voice":Bot_response})
    
    
@app.route('/api/aiResponse',methods=['POST'])
def text_response():
    data = request.get_json()
    input = data['Userinput']
    print("User Input",input)
    
    response = get_gemini_response(input)
    print(response)
    return jsonify({'botResponse':response})
    
if __name__ == "__main__":
    app.run(debug=True)