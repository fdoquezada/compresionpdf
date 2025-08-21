// Intenta inferir un código de error desde la query (opcional, por si lo pasas via CDN)
function getErrorCode() {
	const params = new URLSearchParams(window.location.search);
	const raw = params.get('code');
	const asNumber = raw ? Number(raw) : NaN;
	if (!Number.isNaN(asNumber) && asNumber >= 400 && asNumber < 600) return String(asNumber);
	// Sin parámetro, usamos 404 por defecto en sitios estáticos
	return '404';
}

document.addEventListener('DOMContentLoaded', function () {
	const code = getErrorCode();
	const codeEls = document.querySelectorAll('[data-error-code]');
	codeEls.forEach(function (el) { el.textContent = code; });
	const pathEl = document.getElementById('path');
	if (pathEl) pathEl.textContent = window.location.pathname + window.location.search;
});
