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
  // Run both fetches in parallel for faster load
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

  return `${monthNames[monthIndex]} ${year}`
}

async function getImage(query) {
  try {
    const response = await fetch(
      `https://apis.scrimba.com/unsplash/photos/random/?count=1&query=${query}`
    )
    if (response.ok) {
      const data = await response.json()
      return data[0].urls.full
    } else {
      console.error(`Image fetch error: ${response.status}`)
      return ""
    }
  } catch (err) {
    console.error("Image fetch failed:", err)
    return ""
  }
}

async function getQuote(favActivity, favPlace, temperature) {
  const quotePrompt = `Create a poetic phrase about ${favActivity} and ${favPlace} in the insightful, witty and satirical style of Oscar Wilde. Omit Oscar Wilde's name.`

  const body = {
    model: "gpt-3.5-turbo-instruct",
    prompt: quotePrompt,
    temperature: temperature,
    max_tokens: 256,
  }

  try {
    const res = await fetch("https://apis.scrimba.com/openai/v1/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      console.error(`Quote API error: ${res.status}`)
      return "In the dance of words and wonder, beauty reveals itself."
    }

    const response = await res.json()
    return response?.choices?.[0]?.text?.trim() || "In the dance of words and wonder, beauty reveals itself."
  } catch (err) {
    console.error("Quote fetch failed:", err)
    return "In the dance of words and wonder, beauty reveals itself."
  }
}
