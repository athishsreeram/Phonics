// Mute toggle — persists via localStorage
(function() {
  const btn = document.createElement('button');
  btn.id = 'muteBtn';
  btn.style.cssText = 'position:fixed;top:12px;right:12px;z-index:9999;font-size:1.5rem;background:rgba(255,255,255,0.85);border:none;border-radius:50%;width:44px;height:44px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2)';
  btn.textContent = localStorage.getItem('muted') === '1' ? '🔇' : '🔊';
  btn.onclick = () => {
    const muted = localStorage.getItem('muted') === '1';
    localStorage.setItem('muted', muted ? '0' : '1');
    btn.textContent = muted ? '🔊' : '🔇';
  };
  document.body.appendChild(btn);
})();
