export const handleApiError = (error: any, modelProvider: string): string => {
    console.error("API Error:", error);
    let errorMsg = "Something went wrong. Please try again.";
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data?.error || "Unknown error";
      if (status === 500) {
        errorMsg = `Server error: The AI model encountered an issue (${errorData}).`;
      } else if (status === 403) {
        errorMsg = `Access denied: Your request was blocked (${errorData}).`;
      } else if (status === 429) {
        errorMsg = "Too many requests. Slow down!";
      } else {
        errorMsg = `Error ${status}: ${errorData}`;
      }
    } else if (error.request) {
      errorMsg = "No response from the AI model. Check your connection.";
    } else {
      errorMsg = "An unexpected error occurred. Please try again.";
    }
    if (modelProvider.includes("deepseek")) {
      errorMsg = "DeepSeek API is unavailable or requires payment. Try a different model.";
    } else if (modelProvider.includes("ollama")) {
      errorMsg = "Ollama local model not responding. Ensure the server is running.";
    } else if (modelProvider.includes("openai")) {
      errorMsg = "OpenAI API issue detected. Check your API key or usage limits.";
    } else if (modelProvider.includes("claude")) {
      errorMsg = "Claude model is unreachable. Verify API access.";
    }
    return errorMsg;
  };
  