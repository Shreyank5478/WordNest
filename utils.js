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
  const quote = getQuote()           // sync — instant, no API call
  const url = await getImage(favPlace) // async — still fetches from Unsplash
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

function getQuote() {
  // Scrimba's OpenAI proxy is CORS-blocked from external domains like GitHub Pages.
  // Using a curated local collection of Oscar Wilde quotes instead —
  // randomly selected each call so the quote always changes on refresh.
  const quotes = [
    "To live is the rarest thing in the world. Most people exist, that is all.",
    "Be yourself; everyone else is already taken.",
    "We are all in the gutter, but some of us are looking at the stars.",
    "The truth is rarely pure and never simple.",
    "Always forgive your enemies; nothing annoys them so much.",
    "I can resist everything except temptation.",
    "A cynic is a man who knows the price of everything and the value of nothing.",
    "Experience is simply the name we give our mistakes.",
    "Every saint has a past, and every sinner has a future.",
    "To love oneself is the beginning of a lifelong romance.",
    "Memory is the diary we all carry about with us.",
    "The only way to get rid of a temptation is to yield to it.",
    "I am not young enough to know everything.",
    "The books that the world calls immoral are books that show the world its own shame.",
    "With age comes wisdom, but sometimes age comes alone.",
    "To define is to limit.",
    "Fashion is a form of ugliness so intolerable that we have to alter it every six months.",
    "The imagination imitates. It is the critical spirit that creates.",
    "A little sincerity is a dangerous thing, and a great deal of it is absolutely fatal.",
    "One should always be in love. That is the reason one should never marry.",
    "The only difference between a caprice and a lifelong passion is that the caprice lasts a little longer.",
    "Life is far too important a thing ever to talk seriously about.",
    "Conversation about the weather is the last refuge of the unimaginative.",
    "The public is wonderfully tolerant. It forgives everything except genius.",
    "Nothing is so dangerous as being too modern; one is apt to grow old-fashioned quite suddenly.",
  ]

  return quotes[Math.floor(Math.random() * quotes.length)]
}
