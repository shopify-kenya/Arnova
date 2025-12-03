// Currency detection based on country
export const getCurrencyByCountry = (countryCode: string): string => {
  const currencyMap: Record<string, string> = {
    US: "USD",
    GB: "GBP",
    CA: "CAD",
    AU: "AUD",
    DE: "EUR",
    FR: "EUR",
    IT: "EUR",
    ES: "EUR",
    NL: "EUR",
    JP: "JPY",
    KR: "KRW",
    CN: "CNY",
    IN: "INR",
    BR: "BRL",
    MX: "MXN",
    KE: "KES",
    NG: "NGN",
    ZA: "ZAR",
    EG: "EGP",
    MA: "MAD",
    GH: "GHS",
    TZ: "TZS",
    UG: "UGX",
    RW: "RWF",
    ET: "ETB",
  }

  return currencyMap[countryCode] || "USD"
}

export const getCountryFromPhone = (phone: string): string => {
  // Extract country code from phone number
  const phoneCountryMap: Record<string, string> = {
    "+1": "US",
    "+44": "GB",
    "+49": "DE",
    "+33": "FR",
    "+39": "IT",
    "+34": "ES",
    "+31": "NL",
    "+81": "JP",
    "+82": "KR",
    "+86": "CN",
    "+91": "IN",
    "+55": "BR",
    "+52": "MX",
    "+254": "KE",
    "+234": "NG",
    "+27": "ZA",
    "+20": "EG",
    "+212": "MA",
    "+233": "GH",
    "+255": "TZ",
    "+256": "UG",
    "+250": "RW",
    "+251": "ET",
  }

  for (const [code, country] of Object.entries(phoneCountryMap)) {
    if (phone.startsWith(code)) {
      return country
    }
  }

  return "US" // Default
}
