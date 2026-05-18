// Google AI Studio (Gemini) Integration
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Initialize AI Configuration
function initializeAIConfig() {
  const savedApiKey = localStorage.getItem("geminiApiKey");
  if (savedApiKey) {
    document.getElementById("apiKeyStatus").textContent = "✅ API Key configured";
    document.getElementById("apiKeyStatus").className = "text-xs text-green-600 font-bold";
  }
}

// Save API Key
function saveGeminiApiKey() {
  const apiKey = document.getElementById("geminiApiKeyInput").value.trim();
  
  if (!apiKey) {
    alert("❌ Please enter a valid API key");
    return;
  }
  
  localStorage.setItem("geminiApiKey", apiKey);
  document.getElementById("apiKeyStatus").textContent = "✅ API Key saved successfully!";
  document.getElementById("apiKeyStatus").className = "text-xs text-green-600 font-bold";
  document.getElementById("geminiApiKeyInput").value = "";
}

// Generate Product Description using Gemini AI
async function generateProductDescription() {
  const productName = document.getElementById("productName").value.trim();
  const productCategory = document.getElementById("productCategory").value;
  const apiKey = localStorage.getItem("geminiApiKey");
  
  if (!productName) {
    alert("❌ Please enter a product name first");
    return;
  }
  
  if (!productCategory) {
    alert("❌ Please select a category first");
    return;
  }
  
  if (!apiKey) {
    alert("❌ Please configure your Google AI API key first");
    return;
  }
  
  const loadingEl = document.getElementById("aiLoadingSpinner");
  const generateBtn = document.getElementById("aiGenerateDescBtn");
  
  loadingEl.classList.remove("hidden");
  generateBtn.disabled = true;
  
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Write a compelling product description for agricultural equipment: "${productName}" (Category: ${productCategory}). 
                Requirements:
                - 2-3 sentences maximum
                - Highlight key features and farmer benefits
                - Professional e-commerce tone
                - Include durability/warranty mention if applicable
                Keep it concise and engaging.`,
              },
            ],
          },
        ],
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "API request failed");
    }
    
    const data = await response.json();
    const generatedDescription = data.candidates[0].content.parts[0].text;
    
    // Show description in a modal or alert
    const descriptionDisplay = document.getElementById("aiGeneratedDescription");
    descriptionDisplay.innerHTML = `
      <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p class="text-sm font-bold text-blue-900 mb-2">🤖 AI Generated Description:</p>
        <p class="text-sm text-blue-800">${generatedDescription}</p>
        <div class="mt-3 flex gap-2">
          <button onclick="useAIDescription(\`${generatedDescription.replace(/`/g, '\\`')}\`)" class="text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
            Use This Description
          </button>
          <button onclick="document.getElementById('aiGeneratedDescription').innerHTML=''" class="text-xs font-bold bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400">
            Dismiss
          </button>
        </div>
      </div>
    `;
    
  } catch (error) {
    console.error("AI Generation Error:", error);
    alert(`❌ Error: ${error.message}\n\nMake sure your API key is valid and you have internet connection.`);
  } finally {
    loadingEl.classList.add("hidden");
    generateBtn.disabled = false;
  }
}

// Use AI Generated Description
function useAIDescription(description) {
  // Store it temporarily or use it based on your needs
  document.getElementById("aiGeneratedDescription").innerHTML = `
    <div class="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
      <p class="text-xs text-green-700">✅ Description copied to clipboard</p>
    </div>
  `;
  
  // Copy to clipboard for easy pasting
  navigator.clipboard.writeText(description);
  
  console.log("Description ready to use:", description);
  setTimeout(() => {
    document.getElementById("aiGeneratedDescription").innerHTML = "";
  }, 2000);
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", initializeAIConfig);
