// Bug #5 fix: removed dead imagePromptFromLocalStorage (was never used)
// imageQueryFromLocalStorage and imageUrlFromLocalStorage will be used for image caching (Bug #6)
const imageQueryFromLocalStorage = localStorage.getItem("imageQuery")
const imageUrlFromLocalStorage = localStorage.getItem("imageUrl")
const quotePromptFromLocalStorage = localStorage.getItem("quotePrompt")
const quoteFromLocalStorage = localStorage.getItem("quote")
const quoteSpan = document.querySelector(".quote-span")
const quoteWrapper = document.querySelector(".quote-wrapper")
const nameSpan = document.querySelector(".name-span")
const loader = document.getElementById("loader")

function startLoading() {
  nameSpan.style.display = "none"
  quoteWrapper.style.display = "none"
  loader.style.display = "block"
  document.body.style.backgroundImage = ""
}

function stopLoading(name, url, quote) {
  nameSpan.style.display = "inline"
  quoteWrapper.style.display = "block"
  loader.style.display = "none"
  nameSpan.textContent = `${name} - ${getDate()}`
  document.body.style.backgroundImage = `url(${url})`
  quoteSpan.textContent = quote
}

export async function generateTextAndImage(
  name,
  favActivity,
  favPlace,
  temperature
) {
  startLoading()
  // Bug #7 fix: run both fetches in parallel instead of sequentially
  const [url, quote] = await Promise.all([
    getImage(favPlace),
    getQuote(favActivity, favPlace, temperature)
  ])
  stopLoading(name, url, quote)
}

function getDate() {
  const date = new Date()
  const monthIndex = date.getMonth()
  const year = date.getFullYear()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const monthName = monthNames[monthIndex]

  return `${monthName} ${year}`
}

async function getImage(query) {
  // Bug #6 fix: return cached image if same place was already loaded
  if (query === imageQueryFromLocalStorage && imageUrlFromLocalStorage) {
    return imageUrlFromLocalStorage
  }

  try {
    const response = await fetch(
      `https://apis.scrimba.com/unsplash/photos/random/?count=1&query=${query}`
    )

    if (response.ok) {
      const data = await response.json()
      const imageUrl = data[0].urls.full
      // Bug #6 fix: persist image URL so the same photo shows on reload
      localStorage.setItem("imageQuery", query)
      localStorage.setItem("imageUrl", imageUrl)
      return imageUrl
    } else {
      console.error(`Image fetch error: ${response.status}`)
      return imageUrlFromLocalStorage || ""  // Bug #2 fix: never return undefined
    }
  } catch (err) {
    console.error("Image fetch failed:", err)
    return imageUrlFromLocalStorage || ""  // Bug #2 fix: handle network failures gracefully
  }
}

async function getQuote(favActivity, favPlace, temperature) {
  let quotePrompt = `Create a poetic phrase about ${favActivity} and ${favPlace} in the insightful, witty and satirical style of Oscar Wilde. Omit Oscar Wilde's name.`

  if (quotePrompt === quotePromptFromLocalStorage && quoteFromLocalStorage) {
    return quoteFromLocalStorage
  }

  localStorage.setItem("quotePrompt", quotePrompt)
  // Bug #4 fix: text-davinci-003 was shut down Jan 2024 — use gpt-3.5-turbo via chat completions
  let body = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: quotePrompt }],
    temperature: temperature,
    max_tokens: 256,
  }

  try {
    // Bug #4 fix: switch endpoint to chat completions
    let res = await fetch("https://apis.scrimba.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    // Bug #3 fix: check HTTP status before attempting to parse
    if (!res.ok) {
      console.error(`Quote API error: ${res.status}`)
      return quoteFromLocalStorage || "In the dance of words and wonder, beauty reveals itself."
    }

    let response = await res.json()
    // Bug #3 fix: use optional chaining to safely access nested fields
    // Bug #4 fix: chat completions use .message.content instead of .text
    let newQuote = response?.choices?.[0]?.message?.content || "In the dance of words and wonder, beauty reveals itself."
    localStorage.setItem("quote", newQuote)
    return newQuote
  } catch (err) {
    // Bug #3 fix: catch network failures and return graceful fallback
    console.error("Quote fetch failed:", err)
    return quoteFromLocalStorage || "In the dance of words and wonder, beauty reveals itself."
  }
}
