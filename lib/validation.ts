export const validatePassword = (password: string) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const isValid =
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar

  return {
    isValid,
    minLength: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
  }
}

export const getPasswordValidationMessage = (password: string) => {
  if (!password) return ""

  const validation = validatePassword(password)
  if (validation.isValid) return ""

  const missing = []
  if (!validation.minLength) missing.push("8+ characters")
  if (!validation.hasUpperCase) missing.push("uppercase letter")
  if (!validation.hasLowerCase) missing.push("lowercase letter")
  if (!validation.hasNumbers) missing.push("number")
  if (!validation.hasSpecialChar) missing.push("special character")

  return `Password must contain: ${missing.join(", ")}`
}

export const getPasswordConfirmationMessage = (
  password: string,
  confirmation: string
) => {
  if (!confirmation) return ""
  return password !== confirmation ? "Passwords do not match" : ""
}

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string) => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ""))
}
