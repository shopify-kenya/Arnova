// Custom Toast Notification System
class Toast {
  constructor() {
    this.container = null
    this.init()
  }

  init() {
    if (!this.container) {
      this.container = document.createElement("div")
      this.container.id = "toast-container"
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      `
      document.body.appendChild(this.container)
    }
  }

  show(message, type = "info", duration = 3000) {
    const toast = document.createElement("div")
    toast.className = `toast toast-${type}`

    const colors = {
      success: "bg-green-500/90",
      error: "bg-red-500/90",
      warning: "bg-yellow-500/90",
      info: "bg-blue-500/90",
    }

    toast.style.cssText = `
      padding: 16px 20px;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      animation: slideIn 0.3s ease-out;
      display: flex;
      align-items: center;
      gap: 10px;
    `

    toast.className = `${colors[type] || colors.info} ${toast.className}`

    const icon =
      {
        success: "✓",
        error: "✕",
        warning: "⚠",
        info: "ℹ",
      }[type] || "ℹ"

    toast.innerHTML = `
      <span style="font-size: 18px; font-weight: bold;">${icon}</span>
      <span style="flex: 1;">${message}</span>
      <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px; padding: 0; line-height: 1;">×</button>
    `

    this.container.appendChild(toast)

    if (duration > 0) {
      setTimeout(() => {
        toast.style.animation = "slideOut 0.3s ease-in"
        setTimeout(() => toast.remove(), 300)
      }, duration)
    }
  }

  success(message, duration) {
    this.show(message, "success", duration)
  }

  error(message, duration) {
    this.show(message, "error", duration)
  }

  warning(message, duration) {
    this.show(message, "warning", duration)
  }

  info(message, duration) {
    this.show(message, "info", duration)
  }
}

// Custom Confirm Dialog
class ConfirmDialog {
  show(message, onConfirm, onCancel) {
    const overlay = document.createElement("div")
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease-out;
    `

    const dialog = document.createElement("div")
    dialog.style.cssText = `
      background: rgba(30, 30, 30, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
      animation: scaleIn 0.2s ease-out;
    `

    dialog.innerHTML = `
      <h3 style="color: white; font-size: 18px; font-weight: 600; margin-bottom: 12px;">Confirm Action</h3>
      <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 20px; line-height: 1.5;">${message}</p>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="cancel-btn" style="padding: 8px 16px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.2); background: transparent; color: white; cursor: pointer; font-size: 14px;">Cancel</button>
        <button id="confirm-btn" style="padding: 8px 16px; border-radius: 6px; border: none; background: #ef4444; color: white; cursor: pointer; font-size: 14px; font-weight: 500;">Confirm</button>
      </div>
    `

    overlay.appendChild(dialog)
    document.body.appendChild(overlay)

    const remove = () => {
      overlay.style.animation = "fadeOut 0.2s ease-in"
      setTimeout(() => overlay.remove(), 200)
    }

    dialog.querySelector("#confirm-btn").onclick = () => {
      remove()
      if (onConfirm) onConfirm()
    }

    dialog.querySelector("#cancel-btn").onclick = () => {
      remove()
      if (onCancel) onCancel()
    }

    overlay.onclick = e => {
      if (e.target === overlay) {
        remove()
        if (onCancel) onCancel()
      }
    }
  }
}

// Add animations
const style = document.createElement("style")
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  @keyframes scaleIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`
document.head.appendChild(style)

// Initialize global instances
window.toast = new Toast()
window.confirmDialog = new ConfirmDialog()

// Override native alert and confirm
window.alert = message => window.toast.info(message)
window.confirm = message => {
  return new Promise(resolve => {
    window.confirmDialog.show(
      message,
      () => resolve(true),
      () => resolve(false)
    )
  })
}
