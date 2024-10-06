let stopTyping = false;
let chatStarted = false;

document.addEventListener('DOMContentLoaded', async function () {
    let wallpaper = document.querySelector('.wallpaper_button');
    let wall_options = document.querySelector('.wall_options');
    let screen = document.querySelector('.mobile_screen');
    let chat = document.querySelector('.chat_button');
    let text = document.querySelector('.text_area');
    let send = document.querySelector('.send');
    let voiceBtn = document.querySelector('.voice');
    let stop = document.querySelector('.stop');
   

    if (wallpaper) {
        console.log("Wallpaper found");
        wallpaper.addEventListener('click', async function () {
            wallpaper.style.transform = 'scale(1.13)';
            wallpaper.classList.toggle('active');
            if (wallpaper.classList.contains('active')) {
                if (wall_options) {
                    wall_options.style.display = 'block';
                    let walls = document.querySelectorAll('.walls');
                    walls.forEach(wall => {
                        wall.addEventListener('click', async function () {
                            console.log(wall.innerHTML);
                            let choice_wall = wall.innerHTML;
                            // screen.style.backgroundImage = `url("images/${choice_wall}.jpeg")`;
                             screen.style.backgroundImage = `url("static/${choice_wall}.jpeg")`;
                            wall_options.style.display = "none";
                            wallpaper.style.transform = '';
                        });
                    });
                }
            } else {
                wall_options.style.display = "none";
            }
        });
    }

    
    function toggleButtons(showSend) {
        if (showSend) {
            send.style.display = 'block';
            stop.style.display = 'none';
        } else {
            send.style.display = 'none';
            stop.style.display = 'block';
        }
    }

    if (chat) {
        console.log("Chat button found");
        chat.addEventListener('click', async function () {
            wall_options.style.display = "none";
            screen.innerHTML = "";
            chatStarted = true;
            setTimeout(function () {
                alert("Chat started");
            }, 500);

            // Add event listener for text input to show send button
            text.addEventListener('input', () => {
                toggleButtons(true); // Show send button when user types
            });

            send.addEventListener('click', async function () {
                if (text.value) {
                    console.log("Text found");
                    let userInput = text.value;
                    let user_box = document.createElement('div');
                    user_box.className = 'user text_box';
                    user_box.innerHTML = "<span class='emoji' style='font-size: 30px;'>👩🏻‍🦰 </span> " + userInput;
                    screen.append(user_box);
                    scrollToBottom()
                    text.value = '';

                    toggleButtons(false); // Hide send button and show stop button when sending

                    let botResponse = await SendToAI(userInput);

                    let bot_box = document.createElement('div');
                    bot_box.className = 'AI text_box';
                    screen.append(bot_box);
                    
                    bot_box.innerHTML = "<span class='emoji' style='font-size: 30px;'>🐼 </span> ";
                    scrollToBottom()
                    stop.addEventListener('click', function () {
                        stopTyping = true;
                        toggleButtons(true); // Stop typing and re-enable send button
                    });

                    stopTyping = false;
                    await typeEffect(bot_box, botResponse);
                } else {
                    alert("Type in a message to send");
                }
            });
        });
    }

    let mediaRecorder;
    let audioChunks = [];

    if (voiceBtn) {
        console.log("Voice Btn found");
    
        voiceBtn.addEventListener('click', async () => {
            if (chatStarted) {
                if (!mediaRecorder || mediaRecorder.state === "inactive") {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        mediaRecorder = new MediaRecorder(stream);
    
                        mediaRecorder.onstart = () => {
                            audioChunks = [];
                            console.log("Recording started...");
                            voiceBtn.style.backgroundColor = "yellow";
    
                            // Hide send button, show stop button
                            send.style.display = 'none';
                            stop.style.display = 'block';
                        };
    
                        mediaRecorder.ondataavailable = event => {
                            audioChunks.push(event.data);
                        };
    
                        mediaRecorder.onstop = async () => {
                            console.log("Recording stopped.");
                            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                            voiceBtn.style.backgroundColor = "";
                            voiceBtn.textContent = "🎙️";  
    
                            const audioArrayBuffer = await audioBlob.arrayBuffer();
                            const audioBytes = new Uint8Array(audioArrayBuffer);
                            let { User_Voice, Bot_Voice } = await sendVoiceData(audioBytes);
    
                            // Append user voice transcription to screen
                            let user = document.createElement('div');
                            user.className = 'user text_box';
                            user.innerHTML = "<span class='emoji' style='font-size: 30px;'>👩🏻‍🦰 </span> " + User_Voice;
                            screen.appendChild(user);
                            scrollToBottom()
    
                            // Append bot response to screen
                            let bot = document.createElement('div');
                            bot.className = 'AI text_box';
                            bot.innerHTML = "<span class='emoji' style='font-size: 30px;'>🐼 </span> ";
                            screen.appendChild(bot);
                            scrollToBottom()
    
                            stop.addEventListener('click', function () {
                                stopTyping = true;
                            });
    
                            stopTyping = false;
                            await typeEffect(bot, Bot_Voice);
    
                            // Keep the stop button visible after bot responds
                            stop.style.display = 'block';
                            send.style.display = 'none';
                        };
    
                        mediaRecorder.start();
    
                    } catch (error) {
                        console.error("Error accessing microphone: ", error);
                    }
                } else if (mediaRecorder.state === "recording") {
                    mediaRecorder.stop();
                }
            } else {
                alert("Chat didn't start");
            }
        });
    }
});


async function SendToAI(input) {
    try {
        let response = await fetch('/api/aiResponse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'Userinput': input })
        });
        if (response.ok) {
            let data = await response.json();
            return data.botResponse;
        } else {
            return "Error: Unable to get response from AI.";
        }
    } catch (error) {
        console.error("Error in SendToAI:", error);
        return "Oops, something went wrong!";
    }
}



async function sendVoiceData(audioBytes) {
    console.log("Sending voice data to server...");
    try {
        const response = await fetch('/api/get_voice_response_from_whisper', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
            },
            body: audioBytes,
        });

        const data = await response.json();
        console.log("Server response:", data);
        return {
            User_Voice: data.User_Voice,
            Bot_Voice: data.Bot_Voice

        }
    } catch (error) {
        console.log("Error getting response:", error);
    }
}

async function typeEffect(element, text) {
    const typingSpeed = 50;
    let i = 0;
    while (i < text.length && !stopTyping) {
        element.innerHTML += text.charAt(i);
        i++;
        await new Promise((resolve) => setTimeout(resolve, typingSpeed));
    }
}

async function scrollToBottom() {
    screen.scrollTop = screen.scrollHeight;
}

text.addEventListener('input', () => {
    if (text.value.length > 0) {
        send.style.display = 'block';  // Show send button when user types
        stop.style.display = 'none';   // Hide stop button
    } else {
        send.style.display = 'none';   // Hide send button when no input
        stop.style.display = 'block';  // Keep stop button visible
    }
});
