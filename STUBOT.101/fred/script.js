const fetchFredData = async (seriesId) => {
    const FRED_API_KEY = "cb6e4d290fd42ec82c7d07eb0110f757"; // Replace with your actual FRED API key
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const latestData = data.observations[data.observations.length - 1];
      return `${seriesId} as of ${latestData.date} is ${latestData.value}`;
    } catch (error) {
      console.error("Failed to fetch data from FRED:", error);
      return "Failed to fetch data from FRED.";
    }
};
const generateResponse = (chatElement, retryCount = 0) => {
    const messageElement = chatElement.querySelector("p");
    let requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{"role": "system", "content": userMessage}],
        })
    };

    // Check if the message is about macroeconomic data
    if (userMessage.toLowerCase().includes("inflation")) {
        fetchFredData("CPIAUCSL").then(fredResponse => {
            requestOptions.body = JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{"role": "system", "content": `The latest inflation rate ${fredResponse}. How does this affect my savings?`}],
            });
            
            // Proceed with fetching from OpenAI as before, but with modified requestOptions
            fetch("https://api.openai.com/v1/completions", requestOptions)
                .then(res => res.json())
                .then(data => {
                    messageElement.textContent = data.choices[0].message.content.trim();
                })
                .catch(error => {
                    messageElement.classList.add("error");
                    messageElement.textContent = "Failed to generate response.";
                    console.error("Error:", error);
                })
                .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
        });
    } else {
        // Existing logic to handle non-FRED related queries
        fetch("https://api.openai.com/v1/completions", requestOptions)
            .then(res => res.json())
            .then(data => {
                messageElement.textContent = data.choices[0].message.content.trim();
            })
            .catch(error => {
                messageElement.classList.add("error");
                messageElement.textContent = "Failed to generate response.";
                console.error("Error:", error);
            })
            .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
    }
};
