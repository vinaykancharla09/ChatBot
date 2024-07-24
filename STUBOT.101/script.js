
  

const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message
const API_KEY = ""; // Paste your API key here
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">person</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; // return chat <li> element
}




const generateResponse = (chatElement, retryCount = 0) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const messageElement = chatElement.querySelector("p");

    // Define the properties and message for the API request
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            messages: [{"role": "system", "content": userMessage}],
            
        model: "gpt-3.5-turbo",
        })
    };

    // Send POST request to API, get response and set the response as paragraph text
    fetch(API_URL, requestOptions)
        .then(res => {
            if (res.status === 429) {
                // If rate limited, retry the request after a delay
                const retryAfter = parseInt(res.headers.get('Retry-After')) || 5; // Default to 5 seconds if Retry-After header is not provided
                throw new Error(`Rate limited. Retrying after ${retryAfter} seconds.`);
            } else if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            messageElement.textContent = data.choices[0].message.content.trim();
        })
        .catch(error => {
            messageElement.classList.add("error");
            messageElement.textContent = error.message;

            // Retry the request if it was rate-limited
            if (error.message.includes('Rate limited') && retryCount < 3) {
                setTimeout(() => generateResponse(chatElement, retryCount + 1), retryAfter * 1000);
            }
        })
        .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
};


const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    if(!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    setTimeout(() => {
        // Display "Thinking..." message while waiting for the response
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}


chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window 
    
    if(e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChat();
    }
});



sendChatBtn.addEventListener("click", handleChat);
